/* ============================================================================
   AUTOESCUELA LIDVOL — main.js
   Patrón IIFE, sin módulos, sin dependencias. El contenido crítico vive en el
   HTML; este archivo solo añade comportamiento y animación.
   ============================================================================ */
(function () {
  "use strict";

  var DATA = window.__LIDVOL__ || {};
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(sel, scope) { return (scope || document).querySelector(sel); }
  function $$(sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); }
  function safe(fn, name) { try { fn(); } catch (e) { console.warn("[" + name + "]", e); } }

  document.documentElement.classList.remove("no-js");

  /* -----------------------------------------------------------
     Navegación: fondo sólido al hacer scroll + menú móvil
     ----------------------------------------------------------- */
  function initNav() {
    var nav = $("[data-nav]");
    if (!nav) return;

    var onScroll = function () {
      nav.classList.toggle("is-scrolled", window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    var burger = $("[data-burger]");
    var panel = $("[data-nav-panel]");
    if (!burger || !panel) return;

    var setOpen = function (open) {
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      panel.classList.toggle("is-open", open);
    };
    burger.addEventListener("click", function () {
      setOpen(burger.getAttribute("aria-expanded") !== "true");
    });
    panel.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }

  /* -----------------------------------------------------------
     Reveals al hacer scroll (IntersectionObserver + red de seguridad)
     ----------------------------------------------------------- */
  function initReveals() {
    var targets = $$(".reveal");
    if (!targets.length) return;

    if (!("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -4% 0px" });

    targets.forEach(function (el) { io.observe(el); });

    /* Red de seguridad: a los 6 s, revelar lo que siga oculto en pantalla */
    setTimeout(function () {
      $$(".reveal:not(.is-visible)").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add("is-visible");
        }
      });
    }, 6000);
  }

  /* -----------------------------------------------------------
     Contadores animados [data-count-to]
     ----------------------------------------------------------- */
  function initCounters() {
    var els = $$("[data-count-to]");
    if (!els.length) return;

    var animate = function (el) {
      var target = parseInt(el.getAttribute("data-count-to"), 10);
      if (isNaN(target)) return;
      var suffix = el.getAttribute("data-count-suffix") || "";
      var dur = 1600;
      var t0 = null;
      var step = function (t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) {
        el.textContent = el.getAttribute("data-count-to") + (el.getAttribute("data-count-suffix") || "");
      });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.01 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* El carrusel de testimonios corre siempre, sin pausas.
     (Se quitó la pausa por toque y por cursor a pedido del cliente.) */

  /* -----------------------------------------------------------
     Botón flotante de WhatsApp: mensaje prellenado según página
     ----------------------------------------------------------- */
  function initWhatsAppFloat() {
    var botones = $$("[data-wa-float], [data-bar-wa]");
    if (!botones.length || !DATA.marca) return;
    var page = document.body.getAttribute("data-page") || "_default";
    var msgs = DATA.mensajesWhatsApp || {};
    var msg = msgs[page] || msgs._default || "";
    var url = "https://wa.me/" + DATA.marca.whatsappNumero +
      (msg ? "?text=" + encodeURIComponent(msg) : "");
    botones.forEach(function (b) { b.href = url; });
  }

  /* -----------------------------------------------------------
     Visor de imágenes de la galería (abrir, cerrar, anterior/siguiente)
     ----------------------------------------------------------- */
  function initLightbox() {
    var grid = $(".gallery-grid");
    if (!grid) return;

    var caja = document.createElement("div");
    caja.className = "lightbox";
    caja.setAttribute("role", "dialog");
    caja.setAttribute("aria-modal", "true");
    caja.setAttribute("aria-label", "Foto ampliada");
    caja.innerHTML =
      '<button class="lightbox__close" type="button" aria-label="Cerrar">&times;</button>' +
      '<button class="lightbox__nav lightbox__nav--prev" type="button" aria-label="Foto anterior">&#8249;</button>' +
      '<button class="lightbox__nav lightbox__nav--next" type="button" aria-label="Foto siguiente">&#8250;</button>' +
      '<figure class="lightbox__fig"><img alt=""><figcaption></figcaption></figure>';
    document.body.appendChild(caja);

    var img = caja.querySelector("img");
    var cap = caja.querySelector("figcaption");
    var actual = -1;

    function visibles() {
      return $$(".gallery-item").filter(function (el) {
        return !el.classList.contains("is-hidden");
      });
    }
    function mostrar(i) {
      var lista = visibles();
      if (!lista.length) return;
      if (i < 0) i = lista.length - 1;
      if (i >= lista.length) i = 0;
      actual = i;
      var item = lista[i];
      var foto = item.querySelector("img");
      var texto = item.querySelector("figcaption");
      img.src = foto.getAttribute("src");
      img.alt = foto.getAttribute("alt") || "";
      cap.textContent = texto ? texto.textContent : "";
    }
    function abrir(item) {
      mostrar(visibles().indexOf(item));
      caja.classList.add("is-open");
      document.body.classList.add("lb-abierto");
      caja.querySelector(".lightbox__close").focus();
    }
    function cerrar() {
      caja.classList.remove("is-open");
      document.body.classList.remove("lb-abierto");
    }

    grid.addEventListener("click", function (e) {
      var item = e.target.closest(".gallery-item");
      if (item) abrir(item);
    });
    grid.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      var item = e.target.closest(".gallery-item");
      if (item) { e.preventDefault(); abrir(item); }
    });

    caja.addEventListener("click", function (e) {
      if (e.target.closest(".lightbox__close")) return cerrar();
      if (e.target.closest(".lightbox__nav--prev")) return mostrar(actual - 1);
      if (e.target.closest(".lightbox__nav--next")) return mostrar(actual + 1);
      if (e.target === caja) cerrar();
    });
    document.addEventListener("keydown", function (e) {
      if (!caja.classList.contains("is-open")) return;
      if (e.key === "Escape") cerrar();
      if (e.key === "ArrowLeft") mostrar(actual - 1);
      if (e.key === "ArrowRight") mostrar(actual + 1);
    });
  }

  /* -----------------------------------------------------------
     Filtros de la galería
     ----------------------------------------------------------- */
  function initGalleryFilters() {
    var btns = $$("[data-filter]");
    var items = $$("[data-cat]");
    if (!btns.length || !items.length) return;

    btns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var f = btn.getAttribute("data-filter");
        btns.forEach(function (b) {
          b.classList.toggle("is-active", b === btn);
          b.setAttribute("aria-pressed", b === btn ? "true" : "false");
        });
        items.forEach(function (item) {
          var show = f === "todos" || item.getAttribute("data-cat") === f;
          item.classList.toggle("is-hidden", !show);
        });
      });
    });
  }

  /* -----------------------------------------------------------
     Página de Inscripción:
     curso → precio (desde lib/precios.js) → formulario → WhatsApp
     ----------------------------------------------------------- */
  function initEnrollForm() {
    var form = $("[data-enroll-form]");
    if (!form) return;

    var PRECIOS = DATA.PRECIOS || {};
    var fmt = DATA.formatoBs || function (n) { return "Bs " + n; };

    var selCurso = $("#f-curso");

    /* Si llegan desde "Inscribirme" de una categoría (inscripcion.html?curso=cero-JM),
       el curso queda elegido y la página baja hasta el formulario. */
    (function preseleccionarCurso() {
      if (!selCurso) return;
      var m = /[?&]curso=([^&#]+)/.exec(location.search);
      if (!m) return;
      var clave = decodeURIComponent(m[1]);
      if (!PRECIOS[clave]) return;
      selCurso.value = clave;
      setTimeout(function () {
        var panel = selCurso.closest(".panel") || selCurso;
        window.scrollTo({
          top: panel.getBoundingClientRect().top + window.scrollY - 90,
          behavior: "smooth"
        });
      }, 120);
    })();
    var priceBox = $("[data-price-box]");
    var priceAmount = $("[data-price-amount]");
    var priceDetail = $("[data-price-detail]");
    var minorNote = $("[data-minor-note]");

    /* Mostrar el precio SOLO cuando hay un curso elegido (brief §7) */
    function updatePrice() {
      var info = PRECIOS[selCurso.value];
      if (!info) {
        if (priceBox) priceBox.classList.remove("is-visible");
        if (minorNote) minorNote.classList.remove("is-visible");
        return;
      }
      if (priceAmount) {
        priceAmount.innerHTML = fmt(info.precio) +
          (info.referencial ? ' <small>(referencial)</small>' : "");
      }
      if (priceDetail) priceDetail.textContent = info.duracion || "";
      if (priceBox) priceBox.classList.add("is-visible");
      if (minorNote) minorNote.classList.toggle("is-visible", !!info.menor);
    }
    if (selCurso) {
      selCurso.addEventListener("change", updatePrice);
      updatePrice();
    }

    /* Validación ligera + envío por WhatsApp */
    function fieldValue(id) {
      var el = $("#" + id);
      return el ? el.value.trim() : "";
    }
    function markInvalid(id, invalid) {
      var el = $("#" + id);
      if (!el) return;
      el.classList.toggle("is-invalid", invalid);
      var wrap = el.closest(".field");
      if (wrap) wrap.classList.toggle("has-error", invalid);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var required = ["f-nombre", "f-ci", "f-telefono", "f-curso"];
      var firstBad = null;
      required.forEach(function (id) {
        var bad = !fieldValue(id);
        markInvalid(id, bad);
        if (bad && !firstBad) firstBad = $("#" + id);
      });
      if (firstBad) { firstBad.focus(); return; }

      var info = PRECIOS[fieldValue("f-curso")] || {};
      var nombreCurso = info.nombre || $("#f-curso").selectedOptions[0].textContent.trim();
      var precioTxt = info.precio
        ? fmt(info.precio) + (info.referencial ? " (referencial)" : "")
        : "a confirmar";

      var lineas = [
        "Hola Lidvol 👋 Quiero inscribirme. Estos son mis datos:",
        "",
        "📘 Curso: " + nombreCurso,
        "💰 Precio: " + precioTxt,
        "👤 Nombre: " + fieldValue("f-nombre"),
        "🪪 CI: " + fieldValue("f-ci"),
        "📱 Teléfono/WhatsApp: " + fieldValue("f-telefono")
      ];
      var correo = fieldValue("f-correo");
      if (correo) lineas.push("✉️ Correo: " + correo);
      var horario = fieldValue("f-horario");
      if (horario) lineas.push("🕒 Horario preferido: " + horario);
      var referido = fieldValue("f-referido");
      if (referido) lineas.push("🎟️ Código de referido: " + referido);
      if (info.menor) lineas.push("⚠️ Curso para menores: presentaré la autorización de mis padres o tutores.");
      lineas.push("");
      lineas.push("A continuación envío la foto de mi comprobante de pago del QR. ✅");

      var num = (DATA.marca && DATA.marca.whatsappNumero) || "59169309068";
      var url = "https://wa.me/" + num + "?text=" + encodeURIComponent(lineas.join("\n"));
      window.open(url, "_blank", "noopener");
    });
  }

  /* -----------------------------------------------------------
     Testimonios de alumnos
     - Muestra en el carrusel solo los testimonios ya APROBADOS.
     - Permite a cualquier visitante enviar el suyo, que queda pendiente
       de revisión hasta que el equipo lo apruebe.
     Configuración: lib/manifest.js -> testimonios
     ----------------------------------------------------------- */
  function initTestimonios() {
    var seccion = $("[data-tsl]");
    var modal = $("[data-tsl-modal]");
    if (!seccion && !modal) return;

    var cfg = DATA.testimonios || {};
    var minCar = cfg.minCaracteres || 30;
    var maxCar = cfg.maxCaracteres || 400;

    /* ---------- Pintar el carrusel ---------- */

    function repetir(txt, veces) {
      var salida = "";
      for (var i = 0; i < veces; i++) salida += txt;
      return salida;
    }

    /* En la tarjeta el curso se muestra sin el paréntesis explicativo, para
       que el pie no quede larguísimo. Ejemplo:
         guardado: "Categoría P — Particular (autos, vagonetas, jeeps)"
         mostrado: "Categoría P — Particular"
       En la hoja de Google siempre queda el nombre completo. */
    function nombreCorto(curso) {
      return String(curso || "").replace(/\s*\([^)]*\)\s*$/, "").trim();
    }

    /* Se construye con textContent (nunca innerHTML): el texto viene de
       formularios públicos y así no puede inyectar HTML en la página. */
    function tarjeta(t, esCopia) {
      var fig = document.createElement("figure");
      fig.className = "tsl-card";
      if (esCopia) fig.setAttribute("aria-hidden", "true");

      var cita = document.createElement("blockquote");
      cita.textContent = "“" + String(t.texto || "") + "”";
      fig.appendChild(cita);

      var pie = document.createElement("figcaption");
      var nombre = String(t.nombre || "Alumno");
      pie.textContent = t.curso ? nombre + " · " + nombreCorto(t.curso) : nombre;
      fig.appendChild(pie);

      var n = Math.max(1, Math.min(5, parseInt(t.estrellas, 10) || 5));
      var estrellas = document.createElement("p");
      estrellas.className = "stars";
      estrellas.textContent = repetir("★", n) + repetir("☆", 5 - n);
      if (!esCopia) estrellas.setAttribute("aria-label", n + " de 5 estrellas");
      fig.appendChild(estrellas);

      return fig;
    }

    function pintar(lista) {
      var track = $("[data-tsl-track]");
      var vacio = $("[data-tsl-empty]");
      if (!track) return;

      if (!lista || !lista.length) {
        if (seccion) seccion.hidden = true;
        if (vacio) vacio.hidden = false;
        return;
      }

      /* El carrusel repite el contenido dos veces para que el bucle sea
         continuo (la animación desplaza justo el 50% del ancho). Si hay
         pocos testimonios se repiten hasta llenar la pantalla. */
      var base = lista.slice();
      while (base.length < 4) base = base.concat(lista);

      track.textContent = "";
      for (var copia = 0; copia < 2; copia++) {
        for (var i = 0; i < base.length; i++) {
          track.appendChild(tarjeta(base[i], copia === 1));
        }
      }

      if (vacio) vacio.hidden = true;
      if (seccion) seccion.hidden = false;
    }

    function cargarAprobados() {
      /* Sin hoja configurada todavía (o navegador muy antiguo): se muestra el
         mensaje de sección vacía en vez de dejar el hueco sin explicación. */
      if (!cfg.endpoint || !window.fetch) { pintar([]); return; }

      var sep = cfg.endpoint.indexOf("?") >= 0 ? "&" : "?";
      var url = cfg.endpoint + sep + "accion=listar&max=" + (cfg.maxEnPagina || 12);

      fetch(url)
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (data) {
          if (!data || !data.ok || !data.testimonios) return;
          pintar(data.testimonios.slice(0, cfg.maxEnPagina || 12));
        })
        .catch(function () {
          /* Sin conexión con la hoja: se muestra el mensaje de sección vacía
             en vez de romper la página. */
          pintar([]);
        });
    }

    cargarAprobados();

    /* ---------- Formulario para enviar un testimonio ---------- */

    if (!modal) return;

    var form = $("[data-tsl-form]", modal);
    var estado = $("[data-tsl-estado]", modal);
    var gracias = $("[data-tsl-gracias]", modal);
    var contador = $("[data-tsl-contador]", modal);
    var areaTexto = $("#t-texto", modal);
    var selCurso = $("#t-curso", modal);
    var cajaEstrellas = $("[data-tsl-estrellas]", modal);
    var ultimoFoco = null;

    /* Opciones del desplegable de cursos: se arman con la lista de
       lib/precios.js, la misma que usa la página de Inscripción, para que
       las dos nunca queden desincronizadas. */
    function llenarCursos() {
      var precios = DATA.PRECIOS || {};
      var claves = Object.keys(precios);

      (cfg.gruposCursos || []).forEach(function (grupo) {
        var delGrupo = claves.filter(function (clave) {
          return clave.indexOf(grupo.prefijo) === 0;
        });
        if (!delGrupo.length) return;

        var og = document.createElement("optgroup");
        og.label = grupo.etiqueta;
        delGrupo.forEach(function (clave) {
          var op = document.createElement("option");
          // Se guarda el nombre legible, no la clave interna
          op.value = precios[clave].nombre;
          op.textContent = precios[clave].nombre;
          og.appendChild(op);
        });
        selCurso.appendChild(og);
      });

      if (cfg.incluirOtro !== false) {
        var otro = document.createElement("option");
        otro.value = "Otro";
        otro.textContent = "Otro";
        selCurso.appendChild(otro);
      }
    }
    llenarCursos();

    // Estrellas: cinco radios accesibles, 5 marcada por defecto
    for (var e = 1; e <= 5; e++) {
      var id = "t-estrella-" + e;
      var lab = document.createElement("label");
      lab.className = "tstars__item";
      lab.setAttribute("for", id);

      var radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "estrellas";
      radio.id = id;
      radio.value = String(e);
      if (e === 5) radio.checked = true;

      var icono = document.createElement("span");
      icono.setAttribute("aria-hidden", "true");
      icono.textContent = "★";

      var texto = document.createElement("span");
      texto.className = "sr-only";
      texto.textContent = e + (e === 1 ? " estrella" : " estrellas");

      lab.appendChild(radio);
      lab.appendChild(icono);
      lab.appendChild(texto);
      cajaEstrellas.appendChild(lab);
    }

    // Pintar de dorado la estrella elegida y todas las anteriores
    function pintarEstrellas() {
      var marcada = $("input[name='estrellas']:checked", cajaEstrellas);
      var hasta = marcada ? parseInt(marcada.value, 10) : 0;
      $$(".tstars__item", cajaEstrellas).forEach(function (lab, i) {
        lab.classList.toggle("is-on", i < hasta);
      });
    }
    cajaEstrellas.addEventListener("change", pintarEstrellas);
    pintarEstrellas();

    function actualizarContador() {
      if (!contador || !areaTexto) return;
      var n = areaTexto.value.trim().length;
      contador.textContent = n + " / " + maxCar;
      contador.classList.toggle("is-corto", n > 0 && n < minCar);
    }
    if (areaTexto) {
      areaTexto.setAttribute("maxlength", String(maxCar));
      areaTexto.addEventListener("input", actualizarContador);
      actualizarContador();
    }

    function abrir() {
      ultimoFoco = document.activeElement;
      modal.hidden = false;
      document.body.classList.add("has-modal");
      var primero = $("#t-nombre", modal);
      if (primero) primero.focus();
    }

    function cerrar() {
      modal.hidden = true;
      document.body.classList.remove("has-modal");
      if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus();
    }

    $$("[data-tsl-open]").forEach(function (b) {
      b.addEventListener("click", abrir);
    });
    $$("[data-tsl-close]", modal).forEach(function (b) {
      b.addEventListener("click", cerrar);
    });

    document.addEventListener("keydown", function (ev) {
      if (modal.hidden) return;
      if (ev.key === "Escape") { cerrar(); return; }

      // Mantener el tabulador dentro del cuadro mientras esté abierto
      if (ev.key !== "Tab") return;
      var foco = $$("a[href], button, input, select, textarea", modal).filter(function (el) {
        return !el.disabled && el.offsetParent !== null;
      });
      if (!foco.length) return;
      var primero = foco[0];
      var ultimo = foco[foco.length - 1];
      if (ev.shiftKey && document.activeElement === primero) {
        ev.preventDefault(); ultimo.focus();
      } else if (!ev.shiftKey && document.activeElement === ultimo) {
        ev.preventDefault(); primero.focus();
      }
    });

    function marcarError(campo, hayError) {
      var cont = campo.closest(".field");
      if (cont) cont.classList.toggle("has-error", hayError);
      return !hayError;
    }

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (estado) { estado.textContent = ""; estado.className = "tmodal__estado"; }

      var nombre = form.nombre.value.trim();
      var curso = selCurso.value;
      var texto = areaTexto.value.trim();
      var consiente = form.consentimiento.checked;
      var marcada = $("input[name='estrellas']:checked", modal);
      var estrellas = marcada ? parseInt(marcada.value, 10) : 5;

      var ok = true;
      ok = marcarError(form.nombre, nombre.length < 2) && ok;
      ok = marcarError(selCurso, !curso) && ok;
      ok = marcarError(areaTexto, texto.length < minCar) && ok;

      var errCheck = $(".err--check", modal);
      if (errCheck) errCheck.style.display = consiente ? "none" : "block";
      if (!consiente) ok = false;

      if (!ok) {
        var fallo = $(".field.has-error input, .field.has-error select, .field.has-error textarea", modal);
        if (fallo) fallo.focus();
        return;
      }

      var datos = {
        nombre: nombre,
        curso: curso,
        estrellas: estrellas,
        texto: texto,
        consentimiento: true,
        sitio_web: form.sitio_web.value,   // trampa anti-spam
        origen: location.hostname
      };

      var boton = $("[data-tsl-enviar]", form);

      /* Sin hoja configurada todavía: el testimonio se envía por WhatsApp
         para que no se pierda. Igual queda pendiente de aprobación manual. */
      if (!cfg.endpoint || !window.fetch) {
        var lineas = [
          "Hola Lidvol 👋 Quiero dejar mi testimonio para la página web:",
          "",
          "👤 Nombre: " + nombre,
          "📚 Curso: " + curso,
          "⭐ Calificación: " + estrellas + "/5",
          "",
          "💬 " + texto,
          "",
          "Autorizo que se publique en su sitio web. ✅"
        ];
        var num = (DATA.marca && DATA.marca.whatsappNumero) || "59169309068";
        window.open("https://wa.me/" + num + "?text=" + encodeURIComponent(lineas.join("\n")),
          "_blank", "noopener");
        form.hidden = true;
        if (gracias) gracias.hidden = false;
        return;
      }

      if (boton) { boton.disabled = true; boton.textContent = "Enviando…"; }

      /* Se envía como text/plain a propósito: así el navegador no hace la
         petición previa (preflight) que Apps Script no sabe responder. */
      fetch(cfg.endpoint, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(datos)
      })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (!res || !res.ok) throw new Error((res && res.error) || "error");
          form.hidden = true;
          if (gracias) gracias.hidden = false;
        })
        .catch(function () {
          if (boton) { boton.disabled = false; boton.textContent = "Enviar testimonio"; }
          if (estado) {
            estado.className = "tmodal__estado is-error";
            estado.textContent = "No pudimos enviar tu testimonio. Revisa tu conexión " +
              "e inténtalo de nuevo, o escríbenos por WhatsApp.";
          }
        });
    });
  }

  /* -----------------------------------------------------------
     Año dinámico del footer
     ----------------------------------------------------------- */
  function initYear() {
    var el = $("[data-year]");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* -----------------------------------------------------------
     Arranque
     ----------------------------------------------------------- */
  function boot() {
    safe(initNav, "initNav");
    safe(initReveals, "initReveals");
    safe(initCounters, "initCounters");
    safe(initWhatsAppFloat, "initWhatsAppFloat");
    safe(initLightbox, "initLightbox");
    safe(initGalleryFilters, "initGalleryFilters");
    safe(initEnrollForm, "initEnrollForm");
    safe(initTestimonios, "initTestimonios");
    safe(initYear, "initYear");
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
