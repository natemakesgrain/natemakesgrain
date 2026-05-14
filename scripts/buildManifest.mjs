// Merge survey.json with my proposed names + fine-art titles + feature flags
// to produce photos.json, the artifact driving the gallery.
//
//   name     - kebab-case basename for the JPG file in src/photos/
//   title    - short fine-art title shown to viewers
//   feature  - true => tile spans 2 columns in the gallery
//   skip     - true => excluded from gallery and from process.mjs

import { readFile, writeFile } from "node:fs/promises";

const SURVEY_PATH = "survey.json";
const OUT_PATH = "photos.json";

const PROPOSALS = {
  "69718211_1093933_93f1af7696bdabe37db49d4548fcee97_full.jpeg": {
    name: "red-sandstone-cliff-canyon-sunset",
    title: "Sandstone, Last Light",
    note: "Red sandstone cliff lit by late sun, Zion area"
  },
  "69718256_1093933_64dafd12cca474381a8393ba34beb2d5_full.jpeg": {
    name: "bit-and-spur-saloon-springdale-dusk",
    title: "Bit & Spur, Springdale",
    note: "Bit & Spur Saloon sign with light trails, Springdale UT"
  },
  "69718324_1093933_b3f5dfddde397bb5e9671c79880d73eb_full.jpeg": {
    name: "red-phone-booths-bermuda",
    title: "Four Phones, Bermuda",
    note: "Red phone booths with palms"
  },
  "69718353_1093933_0981e26c609d77ea0ef0b6cec600ddd3_full.jpeg": {
    name: "white-telephone-booth-dock",
    title: "Telephone, Dockside",
    note: "Lone white telephone booth on dock"
  },
  "69718357_1093933_d3128f8a8e0d78ba3aba17ab4de86648_full.jpeg": {
    name: "circus-circus-clown-las-vegas",
    title: "Two Clowns, Las Vegas",
    note: "Circus Circus clown signs, Las Vegas"
  },
  "69718401_1093933_66c4df788775913b664c039165006400_full.jpeg": {
    name: "zion-canyon-overlook",
    title: "Zion, Overlook",
    note: "Zion sandstone walls under cirrus"
  },
  "69867525_1099431_47f7f1a3eba771f969d707f3faace0dc_full.jpeg": {
    name: "outstretched-branch-mountain-overlook",
    title: "Branch and Distance",
    note: "Bare branch reaching over distant valley"
  },
  "70337828_1105568_477d858233af4fe267a1ca4c84dc4fe1_full.jpeg": {
    name: "kings-sandwich-shop-durham",
    title: "King's Sandwich Shop",
    feature: true,
    note: "King's Sandwich Shop, Durham NC"
  },
  "70337832_1105568_2805b80b4e4b5ca159be319bed78f939_full.jpeg": {
    name: "domed-classical-auditorium",
    title: "Auditorium, Sunday Morning",
    note: "Classical-revival domed auditorium"
  },
  "70337833_1105568_3e5f39505d5f8fc36c8233bc12c52f75_full.jpeg": {
    name: "cherub-fountain-twilight",
    title: "Cherub, Twilight",
    note: "Cherub statue in fountain, twilight blue"
  },
  "70424420_1108394_f976d7bdc9a70b6f811969a066ade0b6_full.jpeg": {
    name: "old-north-durham-open-sign",
    title: "Open, Old North",
    note: "Storefront with OPEN sign at night, Durham NC"
  },
  "70424481_1108394_446a6a58cdc993349164c8d9f2c81dc0_full.jpeg": {
    name: "carolina-cinema-neon",
    title: "Carolina Cinema",
    note: "The Carolina Cinema neon sign"
  },
  "70424542_1108394_af868997a16500bf0aabc3dc8a3c5447_full.jpeg": {
    name: "wooded-pond-radio-tower",
    title: "Pond and Tower",
    note: "Pond framed by trees, radio tower in distance"
  },
  "70424549_1108394_45fc94baa77d33077347ea4ee18b2937_full.jpeg": {
    name: "de-young-museum-tower",
    title: "de Young, Tower",
    feature: true,
    note: "de Young Museum twisted tower, San Francisco"
  },
  "70424635_1108394_ee4ab37adf5cf414f305fd7fc90419bc_full.jpeg": {
    name: "houseplant-shop-interior",
    title: "Houseplants, Afternoon",
    note: "Plant shop interior with dramatic light"
  },
  "70424662_1108394_811246630843e0a27b4c5f2f0644214f_full.jpeg": {
    name: "coffee-shop-interior",
    title: "Coffee, Morning",
    note: "Coffee shop with pendant lights"
  },
  "70424743_1108394_72eb58562ccad23bd26bc6ceef4d1f5f_full.jpeg": {
    name: "san-francisco-victorians-yellow-blue",
    title: "Yellow, Blue, White",
    note: "San Francisco Victorian row"
  },
  "70424749_1108394_c13e31d6f310863fdc1b3ca4382f3534_full.jpeg": {
    name: "san-francisco-victorian-dusk-OLD",
    title: "—",
    skip: true,
    note: "Replaced by higher-res scan in _DSC1517.jpg (Painted Lady, Dusk)"
  },
  "70652507_1112326_3521db39f7338e5b875829f981a586e3_full.jpeg": {
    name: "elderly-man-deck-chair",
    title: "Father, Deck",
    note: "Older man seated on deck"
  },
  "70652511_1112326_9c12535d433c08eb6abc46f51d037589_full.jpeg": {
    name: "bull-city-car-wash-durham",
    title: "Bull City Car Wash",
    note: "Bull City Car Wash, Durham NC"
  },
  "70652563_1112326_4cf3a78b93b53807418fecbaf18933ec_full.jpeg": {
    name: "two-figures-living-room",
    title: "—",
    skip: true,
    note: "Removed at user request"
  },
  "70652567_1112326_653ca8c347ee5e501df890485dffc63a_full.jpeg": {
    name: "morning-coffee-table-still-life",
    title: "First Cup",
    note: "Single cup on wooden table, morning light"
  },
  "71029912_1117848_ba95e7184017ab4aa24d02898b270ae2_full.jpeg": {
    name: "texas-neon-adv-co-sign",
    title: "Texas Neon Adv. Co.",
    note: "Vertical TEXAS sign, overcast"
  },
  "71029937_1117848_e3b437ca0f6b33f497c1a0707e3ccf97_full.jpeg": {
    name: "mission-doorway-san-antonio",
    title: "Doorway, Mission",
    feature: true,
    note: "Mission doorway opening to courtyard"
  },
  "71029938_1117848_eb37732084c7c1104811ed95bc14688d_full.jpeg": {
    name: "mission-vaulted-interior",
    title: "Vault, Mission",
    note: "Vaulted mission interior, chandeliers"
  },
  "71029944_1117848_a79fc8dbfdc0a43a0b59adba1748b6c2_full.jpeg": {
    name: "sprawling-mesquite-tree-pavilion",
    title: "Mesquite, Hill Country",
    note: "Sprawling mesquite framed by pavilion"
  },
  "71029965_1117848_300c4ee2ff965550e950135575f815a8_full.jpeg": {
    name: "industrial-funnel-water-feature",
    title: "Funnel",
    note: "Concrete funnel pouring water"
  },
  "71029967_1117848_d0f431efb7e3156e04e16d017966be0d_full.jpeg": {
    name: "brutalist-concrete-beams",
    title: "Concrete and Sky",
    note: "Crisscrossing concrete beams"
  },
  "71234534_1120763_ff7fb2c80f4c79837d7e81c29bdd20be_full.jpeg": {
    name: "architectural-cutout-smokestack",
    title: "Smokestack, Cutout",
    note: "Black canopy cutout framing a smokestack"
  },
  "IMG_5153.jpeg": {
    name: "nyc-subway-tile-wall",
    title: "Subway, T",
    note: "NYC subway station tile wall"
  },
  "IMG_5204.jpeg": {
    name: "richmond-chesterfield-warehouse",
    title: "Chesterfield, Richmond",
    note: "Warehouse with Chesterfield sign behind"
  },
  "IMG_5205.jpeg": {
    name: "kingfisher-bar-neon-night",
    title: "Kingfisher",
    note: "Kingfisher 'bar' neon at dusk, Durham NC"
  },
  "IMG_5208 (1).jpeg": {
    name: "geerhouse-tow-away-durham-DUPLICATE",
    title: "—",
    skip: true,
    note: "Duplicate of IMG_5208.jpeg"
  },
  "IMG_5208.jpeg": {
    name: "geerhouse-tow-away-durham",
    title: "GeerHouse, Tow Away",
    note: "GeerHouse storefront with Tow Away Zone sign, Durham NC"
  },
  "KP3A5186 (1).jpeg": {
    name: "snowy-tennis-court-lamppost-night",
    title: "Lamppost, First Snow",
    note: "Tennis court fence and lamppost in snow"
  },
  "KP3A5230 (1).jpeg": {
    name: "guaranteed-shorter-hair-barbershop",
    title: "Guaranteed Shorter Hair",
    note: "Barbershop sign with CUTS arrow"
  },
  "KP3A5246.jpeg": {
    name: "snow-day-dog-walk",
    title: "Snow Day",
    note: "Person walking dog in snow"
  },
  "_DSC0773 (1).jpeg": {
    name: "woman-brick-wall-piedras-building",
    title: "Piedras, Brick Wall",
    note: "Woman against brick wall with painted lettering"
  },
  "_DSC0779 (2).jpeg": {
    name: "tennessee-theatre-knoxville",
    title: "Tennessee Theatre",
    note: "Tennessee Theatre vertical sign, Knoxville"
  },
  "_DSC1168 (1).jpeg": {
    name: "old-north-bar-sign",
    title: "Old North Bar",
    note: "Round 'Old North Bar' hanging sign"
  },
  "_DSC1286 (1).jpeg": {
    name: "stucco-storefront-shadows",
    title: "Stucco and Shadow",
    note: "White stucco storefront with deep shadows"
  },
  "_DSC1523.jpg": {
    name: "country-road-walker-and-dog",
    title: "Road, with Dog",
    feature: true,
    note: "Figure walking up a curving country road with a small dog"
  },
  "_DSC1516.jpg": {
    name: "one-window-twilight",
    title: "One Window, Twilight",
    note: "Apartment building at blue hour, single lit upstairs window"
  },
  "_DSC1517.jpg": {
    name: "painted-lady-dusk",
    title: "Painted Lady, Dusk",
    feature: true,
    note: "San Francisco Painted Lady at twilight (Ektachrome, replaces earlier scan)"
  },
  "71466742_1125348_c6750295fbebf35533f8aad4a5d6e2eb_full.jpeg": {
    name: "rouses-french-quarter",
    title: "Rouses, French Quarter",
    note: "French Quarter alley, iron balconies, Rouses Market sign, B&W"
  },
  "71466744_1125348_7b0ba2555a868cfadbc7be58cda0e3a0_full (1).jpeg": {
    name: "manhattan-looking-downtown",
    title: "Manhattan, Looking Downtown",
    note: "Midtown towers framing One World Trade in the distance, B&W"
  },
  "71466745_1125348_7b0ba2555a868cfadbc7be58cda0e3a0_full.jpeg": {
    name: "entrecote-late",
    title: "Entrecôte, Late",
    note: "Le Relais de Venise neon at night, NYC"
  },
  "71466753_1125348_77d395cd7ae957e5ed3fd2f73468d22e_full.jpeg": {
    name: "concourse-grand-central",
    title: "Concourse, Grand Central",
    note: "Grand Central main concourse, slow shutter, motion-blurred crowd"
  },
  "71466762_1125348_b1583f038b9cbf8d60535759d4b623cd_full.jpeg": {
    name: "boutique-du-vampyre",
    title: "Boutique du Vampyre",
    note: "Wrought-iron sign with dramatic shadow on terracotta stucco, French Quarter"
  },
  "71466767_1125348_2c10cde154eebb7cccc6976cc3bfe49a_full.jpeg": {
    name: "boogie-woogie-bourbon",
    title: "Boogie Woogie, Bourbon",
    note: "Boogie Woogie neon on Bourbon Street, layered signage at dusk"
  },
  "71466769_1125348_7364b15cb9b9b266ddc1e467310f4ae6_full.jpeg": {
    name: "drummers-bourbon",
    title: "Drummers, Bourbon",
    note: "Street drummers mid-performance, Bourbon Street, neon and flag behind"
  },
  "71466778_1125348_9c6f0c8cdb9edc2292851ff5f701d07b_full.jpeg": {
    name: "city-of-new-orleans",
    title: "City of New Orleans",
    note: "Red paddlewheel of riverboat City of New Orleans with cargo ship on the Mississippi"
  },
  "_DSC0437_VSCO (2).jpeg": {
    name: "park-first-snow",
    title: "Park, First Snow",
    note: "Two figures walking a snowy park path under bare trees, golden light"
  },
  "_DSC0584 (1).jpeg": {
    name: "pink-wall-houston",
    title: "Pink Wall, Houston",
    note: "Couple on a red scooter against a pink wall, Houston skyline behind"
  },
  "_DSC1078 (1).jpeg": {
    name: "old-and-new",
    title: "Old and New",
    note: "Brick low-rises in foreground, glass tower behind, B&W"
  },
  "71466772_1125348_d7770d73cb96d278cac4ac236864c929_full.jpeg": {
    name: "tracks-crossing",
    title: "Tracks, Crossing",
    feature: true,
    note: "Painted RR crossing post with caution signage, streetcar tracks leading to modern facade, New Orleans"
  },
  "71466759_1125348_09d96cffe3399f19810c08bfac7c319e_full.jpeg": {
    name: "plaza-mist",
    title: "Plaza, Mist",
    note: "Cooling-mist canopies with figure crouched in the steam, parked bicycle in foreground"
  },
};

const survey = JSON.parse(await readFile(SURVEY_PATH, "utf8"));
const merged = survey.map(s => {
  const p = PROPOSALS[s.original];
  if (!p) {
    return { ...s, descriptiveName: null, title: null, feature: false, skip: false, note: "NO PROPOSAL — please name manually" };
  }
  return {
    ...s,
    descriptiveName: p.name,
    title: p.title,
    feature: !!p.feature,
    skip: !!p.skip,
    note: p.note,
  };
});

await writeFile(OUT_PATH, JSON.stringify(merged, null, 2));

const c = (s, n) => String(s).padEnd(n);
const kept = merged.filter(m => !m.skip);
const featured = kept.filter(m => m.feature);
process.stdout.write(`\n${c("#", 3)} ${c("title", 28)} ${c("ratio", 5)} ${c("tone", 5)} ${c("feat", 5)} note\n`);
process.stdout.write("-".repeat(110) + "\n");
merged.forEach((m, i) => {
  if (m.skip) return;
  process.stdout.write(`${c(i+1, 3)} ${c(m.title || "?", 28)} ${c(m.targetLabel, 5)} ${c(m.monochrome ? "B&W" : "color", 5)} ${c(m.feature ? "★" : "", 5)} ${m.note}\n`);
});
process.stdout.write(`\nTotal kept: ${kept.length}, featured: ${featured.length}, skipped: ${merged.length - kept.length}\n`);
process.stdout.write(`Wrote ${OUT_PATH}\n`);
