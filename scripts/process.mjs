// Read photos.json, copy each non-skipped photo to photos/<descriptiveName>.jpg
// applying the crop box if one is set. Originals are never touched.

import { readFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const SOURCE_DIR = "Photo archive";
const OUT_DIR = "src/photos";
const MANIFEST = "photos.json";
const JPEG_QUALITY = 92;

const entries = JSON.parse(await readFile(MANIFEST, "utf8"));
await mkdir(OUT_DIR, { recursive: true });

let processed = 0, skipped = 0, failed = 0;
const written = [];

for (const e of entries) {
  if (e.skip) { skipped++; continue; }
  if (!e.descriptiveName) {
    process.stdout.write(`✗ ${e.original}: missing descriptiveName\n`);
    failed++; continue;
  }
  const src = join(SOURCE_DIR, e.original);
  const dst = join(OUT_DIR, `${e.descriptiveName}.jpg`);
  try {
    let img = sharp(src).rotate();   // .rotate() respects EXIF orientation
    if (e.needsCrop && e.cropBox) {
      img = img.extract(e.cropBox);
    }
    const info = await img
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
      .toFile(dst);
    written.push({
      file: `${e.descriptiveName}.jpg`,
      width: info.width,
      height: info.height,
      tags: e.tags,
      monochrome: e.monochrome,
      ratio: e.targetLabel,
      note: e.note,
    });
    process.stdout.write(`✓ ${e.descriptiveName}.jpg ${info.width}x${info.height}\n`);
    processed++;
  } catch (err) {
    process.stdout.write(`✗ ${e.original}: ${err.message}\n`);
    failed++;
  }
}

process.stdout.write(`\nProcessed: ${processed}, skipped: ${skipped}, failed: ${failed}\n`);
process.stdout.write(`Output: ${OUT_DIR}/\n`);
