# Sitio web Autoescuela Lidvol — guía rápida

## Cómo publicar en Hostinger
1. Entra al Administrador de archivos de Hostinger (carpeta `public_html`).
2. Sube TODO el contenido de esta carpeta (incluido el archivo oculto `.htaccess`).
   Puedes excluir: `assets/photos/source/` (fotos originales), `LEEME-PUBLICACION.md` y la carpeta `.claude`.
3. Listo. No hay nada que instalar ni configurar.

## Cómo editar los PRECIOS
Todos los precios están en **un solo archivo**: `lib/precios.js`.
- Cambia el número de `precio` (sin puntos: 1200, no 1.200).
- Cuando un precio deje de ser referencial, pon `referencial: false`.
- Después de editar, en los 7 archivos `.html` cambia `?v=20260731` por la fecha
  del día (ej. `?v=20260801`) para que los visitantes vean el cambio de inmediato.
  (Buscar y reemplazar en todos los archivos toma 1 minuto).

## Antes del lanzamiento público
- ✅ **Testimonios**: ya no hay contenido de muestra. Los visitantes envían el
  suyo desde la web y solo se publica lo que el equipo aprueba.
  Falta conectar la hoja de Google: ver **`LEEME-TESTIMONIOS.md`** (~15 minutos).
  Mientras no esté conectada, el formulario envía los testimonios por WhatsApp.
- **Videos de maquinaria pesada**: cuando existan, hay instrucciones marcadas con
  `TODO VIDEOS` dentro de `galeria.html` y `cursos.html`.

## Cómo editar qué incluye cada curso
En `cursos.html`, la sección "Cursos desde cero" tiene un desplegable por
categoría (JM, JP, M, P, A, B, C, T). **Cada uno tiene su propia lista
"Qué incluye"**: busca el comentario `EDITAR AQUÍ` y modifica solo la lista de
la categoría que cambie. Las 8 empiezan con el mismo contenido; ajústalas
cuando difieran.

## Cómo cambiar o agregar fotos
1. Deja la foto original (grande, sin comprimir) en `assets/photos/source/`.
2. Ejecuta `tools/optimizar-imagenes.ps1` (clic derecho > Ejecutar con PowerShell).
   Genera automáticamente las versiones livianas en `assets/img/`.
- La foto principal del inicio sale de `assets/photos/source/flota-completa.jpg`
  si ese archivo existe; si no, usa la anterior.

## Otros datos editables
- Teléfono, dirección, horarios y redes: `lib/manifest.js`.
- Mensajes prellenados de WhatsApp por página: `lib/manifest.js`.
- QR de pago: reemplazar `assets/img/qr-pago.jpg`.

## Fase 2 (pasarela de pago)
El bloque del QR en `inscripcion.html` está envuelto en
`<div data-component="pago-qr">`: es el componente a reemplazar por la pasarela
(Libélula / Veripagos / PagoFácil) sin tocar el resto del flujo.

## Nota técnica
Las imágenes están optimizadas en JPEG (no había herramientas WebP en esta
máquina). Si más adelante quieren WebP: convertir las imágenes de `assets/img/`
y actualizar las extensiones en los HTML — todas las referencias están en
`assets/img/`.
