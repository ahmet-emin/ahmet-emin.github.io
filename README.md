# Ahmet Emin — Portfolio

Static GitHub Pages portfolio for Ahmet Emin Cansızoğlu.

## Local preview

Run `python -m http.server 8765 --bind 127.0.0.1` from the repository root, then open `http://127.0.0.1:8765/`.

## Gameplay images

The game cards currently use the existing app icons. To add screenshots later, put the images in `assets/images/` and insert one or more figures at the beginning of the relevant `.game-card` in `index.html`:

```html
<figure class="project-media">
    <a data-gallery href="assets/images/your-game-screenshot.webp">
        <img src="assets/images/your-game-screenshot.webp" alt="Describe the gameplay shown" width="1080" height="1920" loading="lazy">
    </a>
    <figcaption>Describe this screenshot.</figcaption>
</figure>
```

Use the actual image dimensions. Each card's `data-gallery` links form a gallery with previous/next controls, arrow-key navigation, Escape to close, and focus returned to the opener. Without JavaScript, the links still open the original files. Until figures are added, the gallery stays hidden.

For a gameplay video, use the same link structure with `data-media-type="video"`, a video file as `href`, and a thumbnail image inside the link. An optional `data-poster="assets/images/your-poster.webp"` supplies the video poster. Videos show playback controls and never autoplay; they pause when the gallery closes or the selected item changes. Alternatively, a regular `<video controls playsinline preload="none">` can be placed inside `.project-media` for inline playback.

## Motion and navigation

Sections and cards animate once as they enter the viewport. Content is visible by default, and animations are skipped when reduced motion is enabled. Card staggering and reveal timing live in `assets/js/script.js`; hover motion and the sticky header are styled in `assets/css/styles.css`. The navigation highlights the current section and accounts for the sticky header when jumping to anchors.

Keep privacy-policy pages and `app-ads.txt` at their existing root paths. Local CV files in `CVLER/` are excluded from Git.

## Project structure

```text
.
├── index.html                  # Portfolio home page
├── app-ads.txt                 # Advertising verification; must stay at root
├── ppcolormerge.html           # Public privacy-policy pages
├── ppcubequeue.html
├── ppletterhex.html
├── ppmf.html
├── ppnpbg.html
├── ppwh.html
├── assets/
│   ├── css/styles.css
│   ├── js/script.js
│   └── images/
└── docs/
    └── privacy/                # Editable source documents
```
