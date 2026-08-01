# ============================================================================
#  Autoescuela Lidvol — optimizador de imágenes
#  Genera assets/img/ a partir de assets/photos/source/ con el peso justo
#  para que la web cargue rápido con datos móviles.
#
#  Cómo usarlo:  clic derecho > "Ejecutar con PowerShell"
#                (o en una terminal:  .\tools\optimizar-imagenes.ps1 )
# ============================================================================
Add-Type -AssemblyName System.Drawing

$proj = Split-Path -Parent $PSScriptRoot
if (-not $proj) { $proj = 'C:\Users\BUILDING_CORP\Documents\web-lidvol' }
$src  = "$proj\assets\photos\source"
$amb  = "$src\ambientes"
$out  = "$proj\assets\img"
New-Item -ItemType Directory -Force $out | Out-Null

function Optimize-Image {
    param([string]$InPath, [string]$OutPath, [int]$MaxDim = 900, [int]$Quality = 76)
    if (-not (Test-Path $InPath)) { "  (falta) $InPath"; return }
    $img = [System.Drawing.Image]::FromFile($InPath)
    try {
        # Aplica la orientación EXIF para que la foto quede derecha
        if ($img.PropertyIdList -contains 274) {
            $o = $img.GetPropertyItem(274).Value[0]
            switch ($o) {
                3 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipNone) }
                6 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone) }
                8 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipNone) }
            }
            $img.RemovePropertyItem(274)
        }
        $w = $img.Width; $h = $img.Height
        $scale = [Math]::Min(1.0, $MaxDim / [double][Math]::Max($w, $h))
        $nw = [int]($w * $scale); $nh = [int]($h * $scale)
        $bmp = New-Object System.Drawing.Bitmap($nw, $nh)
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.SmoothingMode     = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.PixelOffsetMode   = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $g.DrawImage($img, 0, 0, $nw, $nh)
        $g.Dispose()
        $enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
        $ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$Quality)
        if (Test-Path $OutPath) { Remove-Item $OutPath -Force }
        $bmp.Save($OutPath, $enc, $ep)
        $bmp.Dispose()
        "{0,-30} {1}x{2}  {3:N0} KB" -f (Split-Path $OutPath -Leaf), $nw, $nh, ((Get-Item $OutPath).Length/1KB)
    } finally { $img.Dispose() }
}

function Optimize-Png {
    # $Trim   = recorta el margen blanco alrededor del logo antes de redimensionar
    # $Square = centra el resultado en un lienzo cuadrado (para el favicon)
    param([string]$InPath, [string]$OutPath, [int]$MaxDim = 600, [switch]$Trim, [switch]$Square)
    if (-not (Test-Path $InPath)) { "  (falta) $InPath"; return }
    $img = [System.Drawing.Image]::FromFile($InPath)
    try {
        $srcBmp = New-Object System.Drawing.Bitmap($img)
        $x0 = 0; $y0 = 0; $x1 = $srcBmp.Width - 1; $y1 = $srcBmp.Height - 1

        if ($Trim) {
            # Busca el rectángulo que contiene píxeles NO blancos (tolerancia 244)
            $minX = $srcBmp.Width; $minY = $srcBmp.Height; $maxX = -1; $maxY = -1
            $paso = [Math]::Max(1, [int]($srcBmp.Width / 500))
            for ($y = 0; $y -lt $srcBmp.Height; $y += $paso) {
                for ($x = 0; $x -lt $srcBmp.Width; $x += $paso) {
                    $p = $srcBmp.GetPixel($x, $y)
                    if ($p.A -gt 20 -and ($p.R -lt 244 -or $p.G -lt 244 -or $p.B -lt 244)) {
                        if ($x -lt $minX) { $minX = $x }
                        if ($x -gt $maxX) { $maxX = $x }
                        if ($y -lt $minY) { $minY = $y }
                        if ($y -gt $maxY) { $maxY = $y }
                    }
                }
            }
            if ($maxX -gt $minX -and $maxY -gt $minY) {
                $margen = [int]($srcBmp.Width * 0.015)
                $x0 = [Math]::Max(0, $minX - $margen)
                $y0 = [Math]::Max(0, $minY - $margen)
                $x1 = [Math]::Min($srcBmp.Width - 1,  $maxX + $margen)
                $y1 = [Math]::Min($srcBmp.Height - 1, $maxY + $margen)
            }
        }

        $cw = $x1 - $x0 + 1; $ch = $y1 - $y0 + 1
        $scale = [Math]::Min(1.0, $MaxDim / [double][Math]::Max($cw, $ch))
        $nw = [int]($cw * $scale); $nh = [int]($ch * $scale)
        $bmp = New-Object System.Drawing.Bitmap($nw, $nh)
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.PixelOffsetMode   = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $destRect = New-Object System.Drawing.Rectangle(0, 0, $nw, $nh)
        $g.DrawImage($srcBmp, $destRect, $x0, $y0, $cw, $ch, [System.Drawing.GraphicsUnit]::Pixel)
        $g.Dispose()

        if ($Square) {
            $lado = [Math]::Max($nw, $nh)
            $sq = New-Object System.Drawing.Bitmap($lado, $lado)
            $gs = [System.Drawing.Graphics]::FromImage($sq)
            $gs.Clear([System.Drawing.Color]::White)
            $gs.DrawImage($bmp, [int](($lado - $nw)/2), [int](($lado - $nh)/2), $nw, $nh)
            $gs.Dispose()
            $bmp.Dispose(); $bmp = $sq; $nw = $lado; $nh = $lado
        }

        if (Test-Path $OutPath) { Remove-Item $OutPath -Force }
        $bmp.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $bmp.Dispose(); $srcBmp.Dispose()
        "{0,-30} {1}x{2}  {3:N0} KB" -f (Split-Path $OutPath -Leaf), $nw, $nh, ((Get-Item $OutPath).Length/1KB)
    } finally { $img.Dispose() }
}

"--- Foto principal (fondo del inicio) ---"
# Usa la foto de la flota completa si existe; si no, la anterior.
$flota = @("$src\flota-completa-vehículos.png", "$src\flota-completa.jpg", "$src\IMG_20260625_142302.jpg") |
         Where-Object { Test-Path $_ } | Select-Object -First 1
"  origen: $(Split-Path $flota -Leaf)"
Optimize-Image $flota "$out\flota-panoramica.jpg" 1500 72

"--- Fondos de página (ancho completo) ---"
Optimize-Image "$src\IMG_20260625_143457.jpg" "$out\van-practicas.jpg"      1400 74
Optimize-Image "$src\IMG_20260625_143918.jpg" "$out\retroexcavadora.jpg"    1400 74
Optimize-Image "$amb\hall-01.jpg"             "$out\banner-cursos.jpg"      1400 74
Optimize-Image "$amb\portada.jpg"             "$out\fachada-mural.jpg"      1400 74
Optimize-Image "$amb\fachada-02.jpg"          "$out\hall-ingreso.jpg"       1400 74
Optimize-Image "$amb\taller-06.jpg"           "$out\taller-panoramica.jpg"  1400 74
Optimize-Image "$amb\aula-conduccion-01.jpg"  "$out\aula-conduccion.jpg"    1400 74

"--- Vehículos (galería) ---"
Optimize-Image "$src\IMG_20260625_143407.jpg" "$out\moto-practicas.jpg"           900 76
Optimize-Image "$src\IMG_20260625_143427.jpg" "$out\camioneta-doble-comando.jpg"  900 76
Optimize-Image "$src\IMG_20260625_143523.jpg" "$out\minibus-categoria-a.jpg"      900 76
Optimize-Image "$src\IMG_20260625_143558.jpg" "$out\volqueta-hino.jpg"            900 76

"--- Ambientes y taller (galería) ---"
Optimize-Image "$amb\fachada-01.jpg"           "$out\sala-espera.jpg"          900 76
Optimize-Image "$amb\secretaria-01.jpg"        "$out\secretaria.jpg"           900 76
Optimize-Image "$amb\aula-mecanica-01.jpg"     "$out\aula-mecanica.jpg"        900 76
Optimize-Image "$amb\aula-electricidad-01.jpg" "$out\aula-electricidad.jpg"    900 76
Optimize-Image "$amb\taller-02.jpg"            "$out\taller-herramientas.jpg"  900 76
Optimize-Image "$amb\taller-04.jpg"            "$out\taller-soldadura.jpg"     900 76
Optimize-Image "$amb\taller-07.jpg"            "$out\taller-mecanica.jpg"      900 76

"--- QR y logo (no se comprimen: deben verse nítidos) ---"
# QR: se usa el renovado si existe (el anterior venció).
$qr = @("$src\qr-pago-renovado.jpeg", "$src\qr-pago.png.jpg") |
      Where-Object { Test-Path $_ } | Select-Object -First 1
"  QR origen: $(Split-Path $qr -Leaf)"
Optimize-Image $qr "$out\qr-pago.jpg" 900 92

# Logo: se usa el actualizado si existe. -Trim recorta el margen blanco sobrante.
$logo = @("$src\logo-lidvol-actualizado.png", "$src\logo-lidvol.png") |
        Where-Object { Test-Path $_ } | Select-Object -First 1
"  logo origen: $(Split-Path $logo -Leaf)"
Optimize-Png $logo "$out\logo-lidvol.png" 260 -Trim
Optimize-Png $logo "$out\favicon.png" 64 -Trim -Square

""
$total = (Get-ChildItem $out | Measure-Object Length -Sum).Sum / 1MB
"TOTAL assets/img: {0:N2} MB" -f $total
