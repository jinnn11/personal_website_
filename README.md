# Portfolio Website

Static portfolio site for Swaminathan Sankaran.

## Local preview

From this folder:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy free

### Vercel

1. Push this folder to a GitHub repository.
2. Import the repo into Vercel.
3. Framework preset: `Other`.
4. Deploy with the default settings.

### GitHub Pages

1. Push this folder to a public GitHub repository.
2. In the repository settings, enable GitHub Pages.
3. Set the source to deploy from the default branch root.

### Cloudflare Pages

1. Connect the GitHub repository.
2. Use no build command.
3. Set the output directory to `/`.

## Files

- `index.html`: page structure and content
- `styles.css`: visual design and responsive layout
- `script.js`: small footer enhancement
- `assets/`: resume and project images
