# Portfolio Website

Static portfolio site for Swaminathan Sankaran — <https://www.swaminathansankaran.com>

No build step, no dependencies. Plain HTML, CSS, and vanilla JS.

## Local preview

From this folder:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy

The live site is hosted on **Vercel**, connected to this GitHub repository.
Pushing to `main` triggers a deploy automatically — there is no build command
and the output directory is the repo root.

## Files

- `index.html`: page structure and content
- `styles.css`: visual design and responsive layout
- `script.js`: scroll progress, scroll-spy nav, smooth scrolling, reveal animations
- `theme-switcher.js`: dev-only palette explorer, disabled in production via
  `window.ENABLE_THEME_SWITCHER` in `index.html`
- `assets/`: resume PDF, profile photo, institution logos, and skill icons

## Keeping content in sync

Site content mirrors `assets/swaminathan_resume.pdf`. When the resume changes,
update the matching sections in `index.html` (projects, experience, education,
skills, awards) and bump the `?v=` cache-buster on both resume links.
