# nate makes grain

Source for [natemakesgrain.com](https://natemakesgrain.com) — a fine-art photography portfolio.

```
Photo archive/      original JPGs (source of truth, never modified)
src/photos/         cropped, renamed JPGs that the gallery actually displays
photos.json         manifest: which photos to show, their titles, features, skips
scripts/            survey.mjs · buildManifest.mjs · process.mjs
src/                Astro site (layouts, pages, styles, data)
```

---

## Adding a new photo

1. **Drop the original JPG into `Photo archive/`.** Any filename works.
2. **Add a manifest entry** in [scripts/buildManifest.mjs](scripts/buildManifest.mjs) keyed by the original filename. Minimum:
   ```js
   "MY_NEW_FILE.jpg": {
     name: "kebab-case-slug",      // becomes src/photos/kebab-case-slug.jpg
     title: "Title, In Fine Art Style",
     // optional:
     feature: true,                 // tile spans 2 columns in the gallery
     note: "Internal description for alt text"
   },
   ```
3. **Run the pipeline** (one shot):
   ```powershell
   npm run survey
   node scripts/buildManifest.mjs
   npm run process
   ```
   - `survey` scans every JPG in `Photo archive/`, picks the closest of the five allowed aspect ratios (2:3, 3:2, 4:3, 3:4, 1:1), detects monochrome vs. color, and writes `survey.json`.
   - `buildManifest` merges the survey with your `PROPOSALS` and writes `photos.json`.
   - `process` reads `photos.json` and writes a cropped, renamed copy of each kept photo into `src/photos/`. Originals are **never** modified.
4. **Restart the dev server** (`npm run dev`). Vite caches the photo glob at startup, so newly-added files in `src/photos/` need a restart to appear.
5. **Deploy:** `git push`. Netlify rebuilds and ships.

## Removing a photo

Set `skip: true` on its entry in `buildManifest.mjs`, then re-run `node scripts/buildManifest.mjs`. The photo disappears from the gallery on next build. The cropped JPG in `src/photos/` becomes orphaned but doesn't break anything; you can delete it manually if you want a clean directory.

To remove the original entirely, delete it from `Photo archive/` AND remove its key from `PROPOSALS`.

## Featuring / unfeaturing a photo

Toggle `feature: true | false` on the entry in `buildManifest.mjs`, re-run the manifest step, restart dev. Featured tiles span 2 columns on the gallery grid.

## Replacing a photo with a re-edit

When you re-scan or re-edit and want to swap the JPG that the site uses (keeping the same title and slug):
1. Drop the new file into `Photo archive/`.
2. In `buildManifest.mjs`, set `skip: true` on the OLD entry; add a NEW entry pointing at the new filename, reusing the same `title` (and `feature` if applicable) and a fresh `name` slug.
3. Run `buildManifest` + `process`. Optionally delete the now-orphaned JPG from `src/photos/`.
4. Restart dev server, deploy.

## Local development

```powershell
npm run dev      # starts http://localhost:4321
npm run build    # produces dist/ for deploy
npm run preview  # serves the built dist/
```

## Deploying

Netlify is wired up via [netlify.toml](netlify.toml). Push to the connected branch and a build kicks off automatically. Form submissions on `/contact/` flow into the Netlify dashboard and the email configured there.

## Where things live

| Concern                        | File |
| ------------------------------ | ---- |
| Site title, nav, footer        | [src/layouts/Base.astro](src/layouts/Base.astro) |
| Gallery layout & filters       | [src/pages/index.astro](src/pages/index.astro) |
| About-page copy                | [src/pages/about.astro](src/pages/about.astro) |
| Contact form                   | [src/pages/contact.astro](src/pages/contact.astro) |
| All visual styling             | [src/styles/global.css](src/styles/global.css) |
| Photo manifest (titles, flags) | [scripts/buildManifest.mjs](scripts/buildManifest.mjs) → produces [photos.json](photos.json) |
| Photo metadata for the site    | [src/data/photos.js](src/data/photos.js) |
