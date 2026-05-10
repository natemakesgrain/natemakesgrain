// Single source of truth for the gallery: merge photos.json metadata
// with the actual ImageMetadata objects Astro produces from src/photos/*.jpg.

import manifest from "../../photos.json" with { type: "json" };

const images = import.meta.glob("/src/photos/*.{jpg,jpeg}", { eager: true });

export const photos = manifest
  .filter(p => !p.skip && p.descriptiveName)
  .map(p => {
    const path = `/src/photos/${p.descriptiveName}.jpg`;
    const mod = images[path];
    if (!mod) throw new Error(`Image file missing for ${p.descriptiveName} (looked for ${path})`);
    return {
      id: p.descriptiveName,
      src: mod.default,
      title: p.title || p.descriptiveName,
      alt: p.note || p.title || p.descriptiveName,
      tone: p.monochrome ? "monochrome" : "color",
      feature: !!p.feature,
      ratio: p.targetLabel,
    };
  });
