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
    safe(initYear, "initYear");
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
