// Survey every photo in `Photo archive/`:
//   - dimensions + aspect ratio
//   - monochrome vs color (mean per-pixel chroma over a 100px thumb)
//   - nearest target ratio (2:3, 3:2, 4:3, 3:4, 1:1) and crop box if needed
// Writes survey.json. Originals are never modified.

import { readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const SOURCE_DIR = "Photo archive";
const OUT_PATH = "survey.json";

const TARGETS = [
  { label: "2:3",  ratio: 2/3  },  // portrait
  { label: "3:2",  ratio: 3/2  },  // landscape
  { label: "4:3",  ratio: 4/3  },  // landscape
  { label: "3:4",  ratio: 3/4  },  // portrait
  { label: "1:1",  ratio: 1    },
];

const RATIO_TOLERANCE = 0.01;       // within 1% of a target = no crop
const MONO_CHROMA_THRESHOLD = 6;    // mean (max-min) across R,G,B on 0..255 scale

function nearestTarget(actual) {
  let best = TARGETS[0], bestDiff = Infinity;
  for (const t of TARGETS) {
    const d = Math.abs(actual - t.ratio);
    if (d < bestDiff) { best = t; bestDiff = d; }
  }
  return { target: best, diff: bestDiff };
}

// Center-crop to hit the target ratio with the smallest possible cut.
function cropBoxFor(width, height, targetRatio) {
  const currentRatio = width / height;
  if (currentRatio > targetRatio) {
    // too wide → reduce width
    const newW = Math.round(height * targetRatio);
    const left = Math.round((width - newW) / 2);
    return { left, top: 0, width: newW, height };
  } else {
    // too tall → reduce height
    const newH = Math.round(width / targetRatio);
    const top = Math.round((height - newH) / 2);
    return { left: 0, top, width, height: newH };
  }
}

async function detectMonochrome(img) {
  // Resize to a small thumb, read raw RGB, compute mean per-pixel chroma (max-min).
  const { data, info } = await img
    .clone()
    .resize(100, 100, { fit: "inside" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let total = 0;
  const pixels = info.width * info.height;
  for (let i = 0; i < data.length; i += 3) {
    const r = data[i], g = data[i+1], b = data[i+2];
    total += Math.max(r, g, b) - Math.min(r, g, b);
  }
  const meanChroma = total / pixels;
  return { monochrome: meanChroma < MONO_CHROMA_THRESHOLD, meanChroma: +meanChroma.toFixed(2) };
}

async function main() {
  const entries = await readdir(SOURCE_DIR);
  const jpegs = entries.filter(f => /\.(jpe?g)$/i.test(f)).sort();
  const results = [];

  for (const file of jpegs) {
    const path = join(SOURCE_DIR, file);
    try {
      const img = sharp(path);
      const meta = await img.metadata();
      const w = meta.width, h = meta.height;
      const actualRatio = w / h;
      const { target, diff } = nearestTarget(actualRatio);
      const needsCrop = diff > RATIO_TOLERANCE;
      const crop = needsCrop ? cropBoxFor(w, h, target.ratio) : null;
      const cropPctLost = needsCrop
        ? +(100 * (1 - (crop.width * crop.height) / (w * h))).toFixed(1)
        : 0;
      const { monochrome, meanChroma } = await detectMonochrome(img);

      results.push({
        original: file,
        width: w,
        height: h,
        currentRatio: +actualRatio.toFixed(3),
        targetLabel: target.label,
        targetRatio: +target.ratio.toFixed(3),
        ratioDiff: +diff.toFixed(3),
        needsCrop,
        cropBox: crop,
        cropPctLost,
        meanChroma,
        monochrome,
        // To be filled in by Claude after viewing each image:
        descriptiveName: null,
        tags: [],
      });
      process.stdout.write(`✓ ${file} ${w}x${h} ${target.label}${needsCrop ? ` (-${cropPctLost}%)` : ""} ${monochrome ? "B&W" : "color"}\n`);
    } catch (err) {
      process.stdout.write(`✗ ${file}: ${err.message}\n`);
      results.push({ original: file, error: err.message });
    }
  }

  await writeFile(OUT_PATH, JSON.stringify(results, null, 2));
  process.stdout.write(`\nWrote ${OUT_PATH} (${results.length} entries)\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
