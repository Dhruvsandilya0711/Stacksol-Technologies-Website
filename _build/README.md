# Page build

The site is plain static HTML — open any `.html` file in the repo root or serve the folder with any static server.

The shared chrome (head, header, mobile menu, footer, WhatsApp button) lives in `build.py`, and page content lives in `pages/*.html`. After editing either, regenerate the root pages:

```bash
python3 _build/build.py
```

- `{{icon:name}}` inserts an inline SVG from `icons.py`.
- `{{PHONE}}`, `{{PHONE_TEL}}`, `{{EMAIL}}`, `{{ADDRESS}}`, `{{GSTIN}}` insert company details defined at the top of `build.py`.

Front-end stack: `css/styles.css` (design system), `css/fonts.css` + `fonts/` (self-hosted Syne, Manrope, Instrument Serif, JetBrains Mono), `js/main.js` (motion and interactions), `js/vendor/` (GSAP + ScrollTrigger, Lenis).
