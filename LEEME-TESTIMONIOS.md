# Testimonios de la página web — guía de instalación y uso

Los visitantes pueden dejar su testimonio desde la página de Inicio con el botón
**"Comparte tu experiencia"**.

**Nada se publica automáticamente.** Cada testimonio queda guardado como
*pendiente* en una hoja de cálculo de Google. Aparece en la web recién cuando
alguien del equipo lo aprueba.

---

## Cómo funciona (resumen)

```
Visitante llena el formulario en la web
              ↓
Se guarda en la hoja de Google como PENDIENTE  →  llega un correo de aviso
              ↓
Alguien del equipo escribe SI en la columna "Aprobado"
              ↓
El testimonio aparece en la página web ✅
```

Para rechazar un testimonio: dejar la columna en `NO` o borrar la fila.
Para despublicar uno ya publicado: cambiar el `SI` por `NO`.

---

## Instalación (una sola vez, ~15 minutos)

Hay que hacerlo con la **cuenta de Google de la autoescuela**, no con una personal.

### 1. Crear la hoja de cálculo

1. Entra a [sheets.google.com](https://sheets.google.com) y crea una hoja nueva.
2. Ponle de nombre **Testimonios Lidvol**.

### 2. Pegar el programa

1. En esa hoja, menú **Extensiones → Apps Script**.
2. Borra todo lo que aparezca en el editor.
3. Abre el archivo `tools/testimonios-apps-script.gs` de este proyecto,
   copia **todo** su contenido y pégalo ahí.
4. Si quieres recibir un correo cada vez que llegue un testimonio, busca la
   línea `var AVISAR_A = '';` y pon el correo entre las comillas.
   Por ejemplo: `var AVISAR_A = 'autoescuelalidvol@gmail.com';`
5. Guarda con el ícono del disquete 💾.

### 3. Publicar el programa

1. Arriba a la derecha, botón azul **Implementar → Nueva implementación**.
2. En el engranaje ⚙️ elige **Aplicación web**.
3. Completa así:
   - **Descripción**: `Testimonios web`
   - **Ejecutar como**: `Yo`
   - **Quién tiene acceso**: **`Cualquier usuario`** ← importante
4. Botón **Implementar**.
5. Google va a pedir permisos la primera vez:
   - *Autorizar acceso* → elige la cuenta → aparece una advertencia
     ("Google no ha verificado esta aplicación") → **Configuración avanzada**
     → **Ir a Testimonios Lidvol (no seguro)** → **Permitir**.

   Esa advertencia es normal: aparece porque el programa lo escribieron ustedes
   y no una empresa registrada ante Google. No significa que haya un problema.
6. Copia la **URL de la aplicación web** que aparece al final.
   Termina en `/exec`.

### 4. Pegar la URL en el sitio

1. Abre `lib/manifest.js`.
2. Busca el bloque `window.__LIDVOL__.testimonios` y pega la URL:

   ```js
   endpoint: "https://script.google.com/macros/s/AKfy...../exec",
   ```

3. Sube el archivo al hosting.

Listo. El formulario ya guarda en la hoja.

---

## Uso diario: aprobar un testimonio

1. Abre la hoja **Testimonios Lidvol**.
2. Cada fila nueva llega con `NO` en la columna **Aprobado**.
3. Lee el testimonio. Si está bien, cambia ese `NO` por **`SI`**.
4. En pocos minutos aparece en la página web.

También se acepta `SÍ`, `S`, `X` o `VERDADERO`, por si alguien lo escribe distinto.

### Columnas de la hoja

| Columna | Para qué sirve |
|---|---|
| Fecha | Cuándo lo enviaron (automático) |
| Nombre | Cómo aparecerá publicado |
| Curso | Curso que hizo |
| Estrellas | Calificación del 1 al 5 |
| Testimonio | El texto que escribió |
| **Aprobado** | **`NO` = oculto · `SI` = publicado** ← la única que se edita |
| Origen | Desde qué dominio se envió |

Se puede **corregir la ortografía** del texto o acortar el nombre antes de
aprobarlo. Lo que se publica es exactamente lo que dice la hoja.

---

## Preguntas frecuentes

**¿Qué pasa mientras no esté instalado?**
El botón igual funciona: envía el testimonio por WhatsApp al número de la
autoescuela para que no se pierda ninguno. La sección muestra el mensaje
"Todavía no publicamos testimonios" hasta que haya alguno aprobado.

**¿Y si alguien escribe una grosería o hace spam?**
No llega a verse en la web: nada se publica sin aprobación. Además el
formulario tiene una trampa invisible que descarta a los robots
automáticamente. Lo peor que puede pasar es que quede una fila fea en la hoja,
que se borra y listo.

**¿Cuesta algo?**
No. La hoja de cálculo y el Apps Script son gratuitos con cualquier cuenta de
Google. Los límites diarios de Google están muy por encima de lo que una
autoescuela puede recibir.

**¿Hay que pedir permiso a la persona para publicar su nombre?**
El formulario ya lo hace: incluye una casilla obligatoria donde autoriza la
publicación de su nombre y comentario. Sin marcarla no se puede enviar, y el
programa además vuelve a verificarlo antes de guardar.

**¿Se pueden cambiar los cursos del desplegable?**
Sí, en `lib/manifest.js`, dentro de `testimonios.cursos`.

**¿Cuántos testimonios se muestran?**
Los 12 más recientes que estén aprobados. Se cambia con `maxEnPagina` en
`lib/manifest.js`.

**Cambié el programa en Apps Script y no pasa nada en la web.**
Hay que volver a publicarlo: **Implementar → Administrar implementaciones →**
ícono del lápiz ✏️ **→ Versión: Nueva versión → Implementar**. La URL no cambia.
