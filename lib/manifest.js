/* ============================================================================
   AUTOESCUELA LIDVOL — lib/manifest.js
   Datos generales de la marca. Editar aquí teléfonos, redes y textos cortos.
   (Los PRECIOS se editan en lib/precios.js)
   ============================================================================ */
(function () {
  "use strict";

  window.__LIDVOL__ = window.__LIDVOL__ || {};

  window.__LIDVOL__.marca = {
    nombre: "Autoescuela Lidvol S.R.L.",
    descripcion: "Centro de Capacitación Técnica Privado",
    ciudad: "Tarija, Bolivia",
    direccion: "Avenida Integración, esquina Emaus, Edificio Fénix Cars, Tarija, Bolivia",
    horarios: "Lunes a viernes, 8:00–12:00 y 14:30–18:30; sábados, 8:00–12:00",

    // WhatsApp oficial (solo dígitos para el enlace wa.me)
    whatsappNumero: "59169309068",
    whatsappMostrar: "+591 69309068",

    redes: {
      facebook:  { usuario: "Autoescuela Lidvol",          url: "https://www.facebook.com/share/18v52NrKSS/" },
      tiktok:    { usuario: "@lidvolautoescuelaoficial",   url: "https://www.tiktok.com/@lidvolautoescuelaoficial" },
      instagram: { usuario: "@lidvolautoescuelaoficial",   url: "https://www.instagram.com/lidvolautoescuelaoficial?igsh=MnQ4dWZoNGxzc2Yw" },
      pinterest: { usuario: "Lidvol",                      url: "https://pin.it/5EhYht23X" },
      whatsapp:  { usuario: "+591 69309068",               url: "https://wa.me/59169309068" }
    }
  };

  /* Testimonios enviados por los visitantes.
     El formulario guarda cada testimonio como PENDIENTE en una hoja de Google;
     solo se publica cuando alguien del equipo lo aprueba. Las instrucciones para
     obtener la URL están en LEEME-TESTIMONIOS.md (en la raíz del proyecto).

     Mientras "endpoint" esté vacío, el formulario sigue funcionando: envía el
     testimonio por WhatsApp para que no se pierda ningún mensaje. */
  window.__LIDVOL__.testimonios = {
    endpoint: "",

    // Límites del texto que puede escribir el visitante
    minCaracteres: 30,
    maxCaracteres: 400,

    // Cuántos testimonios aprobados se muestran como máximo en el carrusel
    maxEnPagina: 12,

    /* El desplegable "Curso que hiciste" se arma solo con los cursos de
       lib/precios.js — la misma lista que usa la página de Inscripción.
       Si agregan un curso allá, aparece aquí automáticamente.

       Aquí solo se define en qué grupo entra cada curso, según cómo empieza
       su clave en precios.js (por ejemplo "cero-P" empieza con "cero-"). */
    gruposCursos: [
      { etiqueta: "Cursos desde cero",     prefijo: "cero-" },
      { etiqueta: "Cursos intensivos",     prefijo: "int-" },
      { etiqueta: "Obtención de licencia", prefijo: "licencia" },
      { etiqueta: "Formación técnica",     prefijo: "tec-" }
    ],

    // Agrega una opción "Otro" al final, por si hicieron algo fuera de la lista
    incluirOtro: true
  };

  /* Mensajes prellenados del botón flotante de WhatsApp, por página.
     La página se identifica con el atributo data-page del <body>. */
  window.__LIDVOL__.mensajesWhatsApp = {
    inicio:      "Hola Lidvol 👋 Vi su página web y quiero más información sobre los cursos.",
    cursos:      "Hola Lidvol 👋 Estoy viendo el catálogo de cursos en su web y tengo una consulta.",
    inscripcion: "Hola Lidvol 👋 Estoy en el proceso de inscripción en la web y tengo una duda.",
    nosotros:    "Hola Lidvol 👋 Conocí su historia en la web y quiero más información.",
    galeria:     "Hola Lidvol 👋 Vi las fotos de sus instalaciones y vehículos. Quiero más información.",
    faq:         "Hola Lidvol 👋 Leí las preguntas frecuentes de su web y tengo otra consulta.",
    contacto:    "Hola Lidvol 👋 Vengo de la página de contacto de su web. Quiero comunicarme con un asesor.",
    _default:    "Hola Lidvol 👋 Vi su página web y quiero más información."
  };
})();
