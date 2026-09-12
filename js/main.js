/* ModuForm — interacción del sitio
   Para cambiar el número de WhatsApp, edita solo la constante WHATSAPP
   (código de país + número, sin espacios ni signo +). */

const WHATSAPP = "593990393473";
const WA_MENSAJE = "Hola Freddy, vi la página de ModuForm y quiero información sobre un mueble.";

(function () {
  const numeroValido = /^\d{8,15}$/.test(WHATSAPP);
  const waLink = (texto) => "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(texto);
  const track = (name, data) => { if (window.va) window.va("event", { name: name, data: data || {} }); };

  /* Enlaces directos a WhatsApp */
  document.querySelectorAll(".js-wa").forEach((a) => {
    if (numeroValido) { a.href = waLink(WA_MENSAJE); a.target = "_blank"; a.rel = "noopener"; }
    a.addEventListener("click", () => track("whatsapp_click", { origen: (a.closest("section, header, footer") || {}).id || "flotante" }));
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
    a.addEventListener("click", () => { nav.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); })
  );

  /* Sección activa en el menú */
  const navLinks = Array.from(document.querySelectorAll(".nav__links a"));
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id));
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    navLinks.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean).forEach((s) => spy.observe(s));
  }

  /* ---------- Cotizador guiado ---------- */
  const form = document.getElementById("quote");
  const panels = Array.from(form.querySelectorAll(".quote__panel"));
  const stepsUI = Array.from(form.querySelectorAll(".quote__steps li"));
  const summary = document.getElementById("summary");
  let paso = 1;

  function irA(n) {
    paso = Math.max(1, Math.min(panels.length, n));
    panels.forEach((p) => p.classList.toggle("is-active", Number(p.dataset.panel) === paso));
    stepsUI.forEach((li) => {
      const s = Number(li.dataset.step);
      li.classList.toggle("is-active", s === paso);
      li.classList.toggle("is-done", s < paso);
    });
    if (paso === 3) renderResumen();
    const top = form.getBoundingClientRect().top + window.scrollY - 90;
    if (Math.abs(window.scrollY - top) > 40) window.scrollTo({ top: top, behavior: "smooth" });
    track("cotizador_paso", { paso: paso });
  }

  const val = (name) => { const el = form.elements[name]; return el ? (el.value || "").trim() : ""; };

  function datos() {
    return {
      tipo: val("tipo"),
      lugar: val("lugar"),
      medidas: val("medidas"),
      sector: val("sector"),
      foto: val("foto"),
      acabado: val("acabado"),
      presupuesto: val("presupuesto"),
      plazo: val("plazo"),
      nombre: val("nombre"),
      detalle: val("detalle"),
    };
  }

  function renderResumen() {
    const d = datos();
    const filas = [
      ["Mueble", d.tipo],
      ["Lugar", d.lugar + (d.sector ? " · " + d.sector : "")],
      ["Medidas", d.medidas || "Se toman en la visita"],
      ["Foto del espacio", d.foto],
      ["Acabado", d.acabado],
      ["Presupuesto", d.presupuesto],
      ["Plazo", d.plazo],
    ];
    summary.innerHTML = filas.map(([k, v]) => "<dt>" + k + "</dt><dd>" + escapar(v) + "</dd>").join("");
  }
  function escapar(s) { return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

  form.querySelectorAll(".js-next").forEach((b) => b.addEventListener("click", () => {
    if (paso === 1 && !val("tipo")) {
      form.querySelector(".quote__error").hidden = false;
      return;
    }
    form.querySelector(".quote__error").hidden = true;
    irA(paso + 1);
  }));
  form.querySelectorAll(".js-prev").forEach((b) => b.addEventListener("click", () => irA(paso - 1)));
  form.addEventListener("change", () => { if (paso === 3) renderResumen(); });
  form.addEventListener("input", () => { if (paso === 3) renderResumen(); });

  /* Botones del catálogo: preseleccionan el tipo y llevan al cotizador */
  document.querySelectorAll(".js-cotizar").forEach((a) => a.addEventListener("click", (e) => {
    const tipo = a.dataset.tipo;
    const radio = form.querySelector('input[name="tipo"][value="' + tipo + '"]');
    if (radio) { radio.checked = true; form.querySelector(".quote__error").hidden = true; }
    e.preventDefault();
    irA(2);
    track("catalogo_click", { tipo: tipo });
  }));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!val("tipo")) { irA(1); form.querySelector(".quote__error").hidden = false; return; }
    const d = datos();
    const lineas = [
      "Hola Freddy, quiero cotizar un mueble con ModuForm." + (d.nombre ? " Soy " + d.nombre + "." : ""),
      "",
      "• Mueble: " + d.tipo,
      "• Lugar: " + d.lugar + (d.sector ? " (" + d.sector + ")" : ""),
      "• Medidas aproximadas: " + (d.medidas || "no las tengo, prefiero que las tomen en la visita"),
      "• Foto del espacio: " + d.foto,
      "• Acabado: " + d.acabado,
      "• Presupuesto: " + d.presupuesto,
      "• Para cuándo: " + d.plazo,
    ];
    if (d.detalle) lineas.push("• Detalles: " + d.detalle);
    lineas.push("", "(Enviado desde el cotizador de moduform.vercel.app)");
    const texto = lineas.join("\n");
    track("cotizador_enviado", { tipo: d.tipo, presupuesto: d.presupuesto });
    if (!numeroValido) { alert("Falta configurar el número de WhatsApp.\n\n" + texto); return; }
    window.open(waLink(texto), "_blank", "noopener");
  });

  /* ---------- Antes / después ---------- */
  document.querySelectorAll("[data-compare]").forEach((fig) => {
    const frame = fig.querySelector(".compare__frame");
    const range = fig.querySelector(".compare__range");
    const set = (v) => frame.style.setProperty("--pos", v + "%");
    range.addEventListener("input", () => set(range.value));
    set(range.value);
  });

  /* ---------- Galería: filtros y visor ---------- */
  const tiles = Array.from(document.querySelectorAll(".tile"));
  const botones = document.querySelectorAll(".filters button");
  const vacio = document.querySelector(".gallery__empty");
  function filtrar(cat) {
    let visibles = 0;
    tiles.forEach((t) => { const show = cat === "todos" || t.dataset.cat === cat; t.classList.toggle("is-hidden", !show); if (show) visibles++; });
    botones.forEach((b) => b.classList.toggle("is-active", b.dataset.filter === cat));
    vacio.hidden = visibles > 0;
  }
  botones.forEach((b) => b.addEventListener("click", () => filtrar(b.dataset.filter)));

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
  }
  function abrir(t) { ultimoFoco = t; lb.hidden = false; document.body.classList.add("has-lightbox"); mostrar(visibles().indexOf(t)); lb.querySelector(".lightbox__close").focus(); }
  function cerrar() { lb.hidden = true; document.body.classList.remove("has-lightbox"); lbImg.src = ""; if (ultimoFoco) ultimoFoco.focus(); }
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
})();
