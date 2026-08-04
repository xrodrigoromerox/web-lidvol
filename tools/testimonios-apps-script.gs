/* ============================================================================
   AUTOESCUELA LIDVOL — Testimonios de la página web
   Google Apps Script conectado a una hoja de cálculo de Google.

   Qué hace:
   - doPost : recibe el testimonio del formulario y lo guarda como PENDIENTE.
   - doGet  : entrega a la web únicamente los testimonios APROBADOS.

   Nada se publica solo. Un testimonio aparece en la página web recién cuando
   alguien del equipo escribe SI en la columna "Aprobado" de la hoja.

   Instrucciones de instalación paso a paso: LEEME-TESTIMONIOS.md
   ============================================================================ */

/* ----------------------------- Configuración ----------------------------- */

// Nombre de la pestaña dentro de la hoja de cálculo.
var HOJA = 'Testimonios';

// Correo que recibe un aviso cuando llega un testimonio nuevo.
// Dejar vacío ('') si no se quiere recibir avisos.
var AVISAR_A = '';

// Límites del texto (deben coincidir con lib/manifest.js)
var MIN_TEXTO = 30;
var MAX_TEXTO = 400;
var MAX_NOMBRE = 60;

// Máximo de testimonios que se entregan a la web de una sola vez.
var MAX_PUBLICADOS = 12;

// Encabezados de la hoja, en este orden.
var COLUMNAS = ['Fecha', 'Nombre', 'Curso', 'Estrellas', 'Testimonio', 'Aprobado', 'Origen'];


/* ------------------------- Recibir un testimonio ------------------------- */

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return responder({ ok: false, error: 'sin_datos' });
    }

    var datos = JSON.parse(e.postData.contents);

    /* Trampa anti-spam: es un campo invisible para las personas. Si viene
       lleno, quien envió el formulario es un robot. Se responde "ok" a
       propósito para que el robot crea que funcionó y no vuelva a intentar. */
    if (datos.sitio_web) {
      return responder({ ok: true });
    }

    var nombre = limpiar(datos.nombre, MAX_NOMBRE);
    var curso = limpiar(datos.curso, MAX_NOMBRE);
    var texto = limpiar(datos.texto, MAX_TEXTO);
    var estrellas = Math.max(1, Math.min(5, parseInt(datos.estrellas, 10) || 5));

    if (nombre.length < 2) return responder({ ok: false, error: 'nombre' });
    if (texto.length < MIN_TEXTO) return responder({ ok: false, error: 'texto_corto' });
    if (datos.consentimiento !== true) return responder({ ok: false, error: 'sin_consentimiento' });

    var hoja = obtenerHoja();
    hoja.appendRow([
      new Date(),
      nombre,
      curso,
      estrellas,
      texto,
      'NO',                          // Pendiente de aprobación
      limpiar(datos.origen, 80)
    ]);

    avisarPorCorreo(nombre, curso, estrellas, texto);

    return responder({ ok: true });

  } catch (err) {
    return responder({ ok: false, error: 'servidor' });
  }
}


/* --------------------- Entregar los ya aprobados a la web --------------------- */

function doGet(e) {
  try {
    var hoja = obtenerHoja();
    var filas = hoja.getDataRange().getValues();
    var salida = [];

    // Se arranca en 1 para saltar la fila de encabezados.
    for (var i = 1; i < filas.length; i++) {
      var fila = filas[i];
      if (!esAprobado(fila[5])) continue;

      salida.push({
        nombre: String(fila[1] || ''),
        curso: String(fila[2] || ''),
        estrellas: Math.max(1, Math.min(5, parseInt(fila[3], 10) || 5)),
        texto: String(fila[4] || '')
      });
    }

    // Los más recientes primero
    salida.reverse();

    var tope = MAX_PUBLICADOS;
    if (e && e.parameter && e.parameter.max) {
      tope = Math.max(1, Math.min(MAX_PUBLICADOS, parseInt(e.parameter.max, 10) || MAX_PUBLICADOS));
    }

    return responder({ ok: true, testimonios: salida.slice(0, tope) });

  } catch (err) {
    return responder({ ok: false, error: 'servidor' });
  }
}


/* ------------------------------- Auxiliares ------------------------------- */

/* Se acepta SI, SÍ, S, X, TRUE o VERDADERO (en cualquier combinación de
   mayúsculas). Así el equipo puede marcar la casilla como le resulte natural. */
function esAprobado(valor) {
  if (valor === true) return true;
  var v = String(valor || '').trim().toUpperCase();
  return v === 'SI' || v === 'SÍ' || v === 'S' || v === 'X' ||
         v === 'TRUE' || v === 'VERDADERO';
}

/* Recorta el texto y quita etiquetas HTML por precaución. La web además
   inserta todo con textContent, así que nunca se interpreta como código. */
function limpiar(valor, maximo) {
  return String(valor == null ? '' : valor)
    .replace(/<[^>]*>/g, '')
    .trim()
    .slice(0, maximo);
}

function obtenerHoja() {
  var libro = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = libro.getSheetByName(HOJA);

  if (!hoja) {
    hoja = libro.insertSheet(HOJA);
    hoja.appendRow(COLUMNAS);
    hoja.getRange(1, 1, 1, COLUMNAS.length).setFontWeight('bold');
    hoja.setFrozenRows(1);
  }
  return hoja;
}

function avisarPorCorreo(nombre, curso, estrellas, texto) {
  if (!AVISAR_A) return;
  try {
    MailApp.sendEmail({
      to: AVISAR_A,
      subject: 'Nuevo testimonio pendiente de aprobar — ' + nombre,
      body: [
        'Llegó un testimonio nuevo desde la página web.',
        '',
        'Nombre: ' + nombre,
        'Curso: ' + curso,
        'Calificación: ' + estrellas + '/5',
        '',
        'Testimonio:',
        texto,
        '',
        '-----',
        'Para publicarlo, abre la hoja de cálculo y escribe SI en la',
        'columna "Aprobado". Aparecerá en la web en pocos minutos.',
        'Si no quieres publicarlo, deja la columna en NO o borra la fila.'
      ].join('\n')
    });
  } catch (err) {
    // Si falla el aviso, el testimonio igual quedó guardado en la hoja.
  }
}

function responder(objeto) {
  return ContentService
    .createTextOutput(JSON.stringify(objeto))
    .setMimeType(ContentService.MimeType.JSON);
}


/* -------------------------------------------------------------------------
   Utilidad opcional: crea la hoja con sus encabezados sin esperar al primer
   testimonio. Se ejecuta una sola vez desde el menú "Ejecutar" del editor.
   ------------------------------------------------------------------------- */
function prepararHoja() {
  obtenerHoja();
}
