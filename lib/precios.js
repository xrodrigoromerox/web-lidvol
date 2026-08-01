/* ============================================================================
   AUTOESCUELA LIDVOL — lib/precios.js

   ⚠️  PRECIOS CENTRALIZADOS — ESTE ES EL ÚNICO LUGAR DONDE SE EDITAN.
       Los precios solo se muestran en la página de Inscripción.

   Cómo editar:
     - "precio" es el monto en bolivianos (número entero, sin puntos).
     - "referencial: true" agrega la etiqueta "(referencial)" junto al precio.
       Cuando tengan el precio oficial: cambien el monto y pongan
       referencial: false.
     - "duracion" es el texto que se muestra debajo del precio.
   ============================================================================ */
(function () {
  "use strict";

  window.__LIDVOL__ = window.__LIDVOL__ || {};

  window.__LIDVOL__.PRECIOS = {

    /* ------------------ 1. CURSOS DESDE CERO ------------------ */
    "cero-JM": {
      nombre: "Categoría JM — Motos (menores 16–18)",
      precio: 500, referencial: false,
      duracion: "6 h prácticas + 2 h teóricas · 1 semana y media",
      menor: true   // muestra el aviso de autorización de padres
    },
    "cero-JP": {
      nombre: "Categoría JP — Autos particulares (menores 16–18)",
      precio: 850, referencial: false,
      duracion: "10 h prácticas + 2 h teóricas · 2 semanas y media",
      menor: true
    },
    "cero-M": {
      nombre: "Categoría M — Motocicletas",
      precio: 500, referencial: false,
      duracion: "6 h prácticas + 2 h teóricas · 1 semana y media"
    },
    "cero-P": {
      nombre: "Categoría P — Particular (autos, vagonetas, jeeps)",
      precio: 850, referencial: false,
      duracion: "10 h prácticas + 2 h teóricas · 2 semanas y media"
    },
    "cero-A": {
      nombre: "Categoría A — Transporte público liviano",
      precio: 850, referencial: false,
      duracion: "10 h prácticas + 2 h teóricas · 2 semanas y media"
    },
    "cero-B": {
      nombre: "Categoría B — Medianos (micros, buses, camiones ligeros)",
      precio: 1200, referencial: true,
      duracion: "10 h prácticas + 4 h teóricas · 3 semanas (referencial)"
    },
    "cero-C": {
      nombre: "Categoría C — Pesados de alto tonelaje",
      precio: 1600, referencial: true,
      duracion: "12 h prácticas + 4 h teóricas · 3–4 semanas (referencial)"
    },
    "cero-T-retro": {
      nombre: "Categoría T — Maquinaria pesada (solo retroexcavadora)",
      precio: 4000, referencial: false,
      duracion: "10 h teóricas + 6 h prácticas"
    },
    "cero-T-retro-volqueta": {
      nombre: "Categoría T — Maquinaria pesada (retro + volqueta)",
      precio: 4500, referencial: false,
      duracion: "10 h teóricas + 6 h prácticas"
    },

    /* ------------------ 2. CURSOS INTENSIVOS ------------------ */
    "int-JM": {
      nombre: "Intensivo JM — Motos (menores 16–18)",
      precio: 300, referencial: true,
      duracion: "3 h prácticas",
      menor: true
    },
    "int-JP": {
      nombre: "Intensivo JP — Autos particulares (menores 16–18)",
      precio: 450, referencial: true,
      duracion: "6 h prácticas",
      menor: true
    },
    "int-M": {
      nombre: "Intensivo M — Motocicletas",
      precio: 300, referencial: false,
      duracion: "3 h prácticas"
    },
    "int-P": {
      nombre: "Intensivo P — Particular",
      precio: 450, referencial: false,
      duracion: "6 h prácticas"
    },
    "int-A": {
      nombre: "Intensivo A — Transporte público liviano",
      precio: 450, referencial: false,
      duracion: "6 h prácticas"
    },
    "int-B": {
      nombre: "Intensivo B — Medianos",
      precio: 250, referencial: false,
      duracion: "3 h prácticas"
    },
    "int-C": {
      nombre: "Intensivo C — Pesados",
      precio: 350, referencial: false,
      duracion: "3 h prácticas"
    },
    "int-T": {
      nombre: "Intensivo T — Maquinaria pesada",
      precio: 1000, referencial: true,
      duracion: "3 h prácticas + 2 h teóricas en aula + 1 h en taller"
    },

    /* ------------------ 3. OBTENCIÓN DE LICENCIA ------------------ */
    "licencia": {
      nombre: "Obtención de licencia (para quienes ya manejan)",
      precio: 200, referencial: true,
      duracion: "1 h de capacitación + banco de preguntas + acompañamiento al SEGIP"
    },

    /* ------------------ 4. FORMACIÓN TÉCNICA ------------------ */
    "tec-mecanica": {
      nombre: "Mecánica automotriz básica",
      precio: 800, referencial: false,
      duracion: "10 h prácticas + 2 h teóricas · pasantía en Fénix Cars"
    },
    "tec-electricidad": {
      nombre: "Electricidad automotriz básica",
      precio: 800, referencial: false,
      duracion: "10 h prácticas + 2 h teóricas · pasantía en Fénix Cars"
    }
  };

  /* Formatea 1200 → "Bs 1.200" (formato boliviano con punto de miles) */
  window.__LIDVOL__.formatoBs = function (monto) {
    return "Bs " + String(monto).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
})();
