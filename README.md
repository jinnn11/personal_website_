# Portfolio Website

Personal site for Swaminathan Sankaran — <https://www.swaminathansankaran.com>

No build step, no dependencies: plain HTML, CSS and vanilla JavaScript.

This is the editorial design: a light "day edition" by default and a dark
"night edition", set in Fraunces, Schibsted Grotesk and IBM Plex Mono. Each
project is written up as a finding, with a figure drawn from its published
results.

## Local preview

From this folder:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy

The live site is hosted on **Vercel**, connected to this GitHub repository.
Pushing to `main` deploys to production; pushing any other branch creates a
preview deployment. There is no build command and the output directory is the
repo root.

## Files

- `index.html`: page structure and all written content
- `styles.css`: design tokens (day and night editions), layout and components
- `script.js`:
  - Fig. 1: every grid operator's 2025 forecast skill, as published and
    corrected, with a toggle, tooltips and arrow-key navigation
  - Fig. 2: the scroll-driven chart for the grid audit (five steps)
  - Figs. 3–6: waffles, the retraining loop, the CT dot plot and the SEC
    scorecard
  - the skills matrix, the index menu, the day/night toggle, the copy-email
    button and scroll effects
- `assets/`: resume PDF, profile photo, institution logos and skill icons

## Data behind the charts

Chart data lives at the top of `script.js` and mirrors the project
repositories:

- Grid audit ([jinnn11/grid-forecast-audit](https://github.com/jinnn11/grid-forecast-audit)):
  national error from `results/figures/national_by_year.csv`; 2025 MAPE, naive
  MAPE and skill per operator from `results/figures/q1_mape_2025.csv`;
  California ISO and Southwest Power Pool by year from
  `results/figures/q2_mape_by_year.csv`. Their corrected values come from the
  audit's "All corrections" variant, computed with the repository's own code
  (`grid_audit.audit`); California ISO's 2025 values match `results/audit.md`.
- The other projects: the numbers in each project's README.

## Keeping content in sync

When a result changes:

1. Update the project's text and ledger in `index.html`.
2. Update its chart data in `script.js` (the constants near the top).
3. If the resume changes, replace `assets/swaminathan_resume.pdf` and bump the
   `?v=` query on every link to it in `index.html`.
4. After editing `styles.css` or `script.js`, bump their `?v=` query in
   `index.html` so browsers fetch the new files.

Chart colors use a two-series palette (vermilion for "as published", blue for
"corrected") validated for color-vision deficiency on both paper colors; series
identity is always carried by a legend or a direct label, not color alone.
