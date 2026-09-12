/* ModuForm — interacción del sitio
   Para cambiar el número de WhatsApp, edita solo la constante WHATSAPP
   (código de país + número, sin espacios ni signo +). Ejemplo Ecuador: "593991234567". */

const WHATSAPP = "593990393473";
const WA_MENSAJE = "Hola Freddy, vi la página de ModuForm y quiero cotizar un mueble.";

(function () {
  document.documentElement.classList.add("js");

  /* Aparición de secciones al hacer scroll */
  const reveals = document.querySelectorAll(".reveal");
  let io = null;
  if ("IntersectionObserver" in window) {
    io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  /* Índices para animaciones escalonadas */
  document.querySelectorAll(".gallery .tile").forEach((t, i) => t.style.setProperty("--i", i % 8));
  document.querySelectorAll(".reel .vcard").forEach((v, i) => { v.classList.add("reveal"); v.style.setProperty("--i", i); if (io) io.observe(v); });

  /* Barra de navegación, progreso de lectura y parallax del hero */
  const navEl = document.querySelector(".nav");
  const progress = document.querySelector(".progress span");
  const hcards = document.querySelectorAll(".hcard");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let ticking = false;
  function onScroll() {
    const y = window.scrollY;
    navEl.classList.toggle("is-scrolled", y > 24);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.setProperty("--p", max > 0 ? Math.min(1, y / max) : 0);
    if (!reducedMotion && y < window.innerHeight * 1.2) {
      hcards.forEach((c, i) => { c.style.transform = "translateY(" + (y * (i === 0 ? 0.06 : 0.12)) + "px)"; });
    }
    ticking = false;
  }
  onScroll();
  window.addEventListener("scroll", () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });

  /* Sección activa en el menú */
  const navLinks = Array.from(document.querySelectorAll(".nav__links a"));
  const sections = navLinks.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id));
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach((sec) => spy.observe(sec));
  }

  /* Servicios: lista con vista previa */
  const svcItems = Array.from(document.querySelectorAll(".svc__item"));
  const svcImgs = Array.from(document.querySelectorAll(".svc__img"));
  function activar(i) {
    svcItems.forEach((it) => it.classList.toggle("is-active", Number(it.dataset.idx) === i));
    svcImgs.forEach((im) => im.classList.toggle("is-active", Number(im.dataset.idx) === i));
  }
  svcItems.forEach((it) => {
    const i = Number(it.dataset.idx);
    it.addEventListener("mouseenter", () => activar(i));
    it.addEventListener("focus", () => activar(i));
  });

  const numeroValido = /^\d{8,15}$/.test(WHATSAPP);
  const waLink = (texto) => "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(texto);

  /* Enlaces de WhatsApp */
  document.querySelectorAll(".js-wa").forEach((a) => {
    if (numeroValido) {
      a.href = waLink(WA_MENSAJE);
      a.target = "_blank";
      a.rel = "noopener";
      if (a.classList.contains("js-wa-number")) a.textContent = "+" + WHATSAPP;
    }
    /* Evento de analítica: qué botón de WhatsApp se tocó */
    a.addEventListener("click", () => {
      if (window.va) window.va("event", { name: "whatsapp_click", data: { origen: a.closest("section, header, footer")?.id || a.className.split(" ")[0] } });
    });
  });

  /* Menú móvil */
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav__toggle");
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  });
  document.querySelectorAll(".nav__links a").forEach((a) =>
    a.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );

  /* Antes / después (con una pista de movimiento la primera vez que se ve) */
  document.querySelectorAll("[data-compare]").forEach((fig) => {
    const frame = fig.querySelector(".compare__frame");
    const range = fig.querySelector(".compare__range");
    let touched = false;
    const set = (v) => frame.style.setProperty("--pos", v + "%");
    range.addEventListener("input", () => { touched = true; frame.classList.remove("is-hint"); set(range.value); });
    set(range.value);
    if ("IntersectionObserver" in window && !reducedMotion) {
      const hint = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting || touched) return;
          let t0 = null;
          const dur = 1600;
          const anim = (ts) => {
            if (touched) return;
            if (!t0) t0 = ts;
            const p = Math.min(1, (ts - t0) / dur);
            const off = Math.sin(p * Math.PI * 2) * 10;
            set(50 + off);
            if (p < 1) requestAnimationFrame(anim); else set(50);
          };
          requestAnimationFrame(anim);
          hint.unobserve(en.target);
        });
      }, { threshold: 0.6 });
      hint.observe(fig);
    }
  });

  /* Galería: filtros */
  const tiles = Array.from(document.querySelectorAll(".tile"));

  const botones = document.querySelectorAll(".filters button");
  const vacio = document.querySelector(".gallery__empty");
  function filtrar(cat) {
    let visibles = 0;
    tiles.forEach((t) => {
      const show = cat === "todos" || t.dataset.cat === cat;
      t.classList.toggle("is-hidden", !show);
      if (show) visibles++;
    });
    botones.forEach((b) => b.classList.toggle("is-active", b.dataset.filter === cat));
    vacio.hidden = visibles > 0;
  }
  botones.forEach((b) => b.addEventListener("click", () => filtrar(b.dataset.filter)));
  document.querySelectorAll(".svc__item[data-filter]").forEach((s) =>
    s.addEventListener("click", () => filtrar(s.dataset.filter))
  );

  /* Lightbox */
  const lb = document.getElementById("lightbox");
  const lbImg = lb.querySelector("img");
  const lbCap = lb.querySelector(".lightbox__cap");
  const lbCount = lb.querySelector(".lightbox__count");
  const soportaWebp = document.createElement("canvas").toDataURL("image/webp").indexOf("data:image/webp") === 0;
  let actual = -1;
  let ultimoFoco = null;

  function visibles() { return tiles.filter((t) => !t.classList.contains("is-hidden")); }
  function mostrar(i) {
    const lista = visibles();
    if (!lista.length) return;
    actual = (i + lista.length) % lista.length;
    const t = lista[actual];
    lbImg.src = soportaWebp && t.dataset.full ? t.dataset.full : t.getAttribute("href");
    lbImg.alt = t.querySelector("img").alt;
    lbCap.textContent = t.dataset.caption || "";
    lbCount.textContent = (actual + 1) + " / " + lista.length;
    lbImg.style.animation = "none"; void lbImg.offsetWidth; lbImg.style.animation = "";
  }
  function abrir(t) {
    ultimoFoco = t;
    lb.hidden = false;
    document.body.classList.add("has-lightbox");
    mostrar(visibles().indexOf(t));
    lb.querySelector(".lightbox__close").focus();
  }
  function cerrar() {
    lb.hidden = true;
    document.body.classList.remove("has-lightbox");
    lbImg.src = "";
    if (ultimoFoco) ultimoFoco.focus();
  }
  tiles.forEach((t) => t.addEventListener("click", (e) => { e.preventDefault(); abrir(t); }));
  lb.querySelector(".lightbox__close").addEventListener("click", cerrar);
  lb.querySelector(".lightbox__nav--prev").addEventListener("click", () => mostrar(actual - 1));
  lb.querySelector(".lightbox__nav--next").addEventListener("click", () => mostrar(actual + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) cerrar(); });
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") cerrar();
    if (e.key === "ArrowLeft") mostrar(actual - 1);
    if (e.key === "ArrowRight") mostrar(actual + 1);
  });
  let x0 = null;
  lb.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) mostrar(actual + (dx < 0 ? 1 : -1));
    x0 = null;
  });

  /* Videos: se reproducen solos al entrar en pantalla y se pausan al salir */
  const vcards = Array.from(document.querySelectorAll(".vcard"));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function setState(card) { card.classList.toggle("is-playing", !card.querySelector("video").paused); }
  vcards.forEach((card) => {
    const v = card.querySelector("video");
    v.addEventListener("play", () => setState(card));
    v.addEventListener("pause", () => setState(card));
    card.querySelector(".vcard__play").addEventListener("click", () => { if (v.paused) v.play(); else v.pause(); });
  });
  if ("IntersectionObserver" in window && !reduced) {
    const vio = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        const v = en.target.querySelector("video");
        if (en.isIntersecting) { v.play().catch(() => {}); } else { v.pause(); }
      });
    }, { threshold: 0.35 });
    vcards.forEach((c) => vio.observe(c));
  }
})();
