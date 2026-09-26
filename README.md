# Let's Sort It Out — website

Public site and free tools for [Let's Sort It Out](https://github.com/jakelangford430-del/letsotitoutweb).

Static HTML/CSS/JS, deployed via Netlify (`netlify.toml`, `_redirects`, `_headers`).

## Local

Open `index.html` or serve the repo root. No required build step.

## Notes

- Interactive tools live in their own folders (`business-sort-out-map`, `people-hub`, `brand-colour-picker`, …).
- Open PR #3 wires analytics + member save + welcome dialog, but it currently conflicts with `main`. Rebase before merging.
- After that PR lands, put a real GA4 measurement ID in `assets/analytics.js`.
