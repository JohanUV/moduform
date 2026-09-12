# ModuForm — sitio web

Sitio estático (HTML + CSS + JS, sin frameworks) para ModuForm, muebles modulares a medida en Latacunga, Ecuador.

## Estructura

```
moduform-web/
├── index.html      Página única con todas las secciones
├── css/style.css   Estilos (tema oscuro, acento ámbar, tarjetas redondeadas)
├── js/main.js      Menú, antes/después, galería, lightbox, videos y enlaces de WhatsApp
├── img/            Fotos optimizadas: *-800 (galería) y *-1600 (ampliadas), en .webp y .jpg
└── video/          Cinco videos de obras terminadas (MP4 720p, 1 a 2 MB) con su poster .jpg
```

## Antes de publicar

1. **Número de WhatsApp.** Ya está configurado en `js/main.js` como `593990393473` (+593 99 039 3473).
   Si cambia, edita solo esa constante: todos los botones la usan.
2. **Revisa los textos** con Freddy: el proceso de trabajo ("Cómo trabajamos") está escrito de forma
   general; ajústalo si él trabaja distinto. No hay testimonios, años de experiencia ni cifras: no se inventó ninguno.
3. **Redes sociales.** Si ModuForm tiene Instagram, Facebook o TikTok, agrégalas en el pie de página (`<footer>`).
4. **Dominio en `og:image`.** Si publicas en un dominio propio, cambia `img/cocina-negra-1-1600.jpg` por la URL absoluta.

## Cómo probarlo

Abre `index.html` con doble clic, o desde VS Code con la extensión Live Server.

## Cómo publicarlo gratis

- **Netlify Drop:** entra a app.netlify.com/drop y arrastra la carpeta `moduform-web`. Listo en segundos.
- **GitHub Pages:** sube la carpeta a un repositorio y activa Pages en Settings.
- **Framer:** Framer no importa HTML directamente. Puedes usar este sitio como referencia visual y de contenido,
  o publicarlo tal cual en Netlify y conectar el dominio.

## Fotos

Las fotos vienen de la carpeta `~/Documents/Codex/2026-09-11/ayud/outputs/moduform-material-final` (versiones
corregidas en formato 4:5 de los trabajos reales). Cinco imágenes (paneles LED, pared de TV con listones y
cocina blanca) son fotogramas extraídos de los videos, porque no había foto de esos trabajos.

**No se usaron** las dos imágenes generadas por IA (`11cc6035-….png` y `ChatGPT Image ….png`): son
versiones digitales del mueble de baño negro y del escritorio blanco, no fotos de trabajos terminados.
Tampoco se usó la foto del mueble gris acostado en el taller ni la del mueble negro en armado con el taladro encima.

Para agregar una foto nueva a la galería: guarda una versión de 800 px y otra de 1600 px en `img/` y copia
uno de los bloques `<a class="tile" …>` en `index.html` cambiando rutas, `data-cat` y textos.
