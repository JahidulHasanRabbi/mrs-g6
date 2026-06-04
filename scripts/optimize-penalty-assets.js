// One-off asset optimizer for the Penalty Kick game.
//
// Why: the keeper is a flipbook of separate images swapped every 130ms during
// the dive. The source PNGs are 6–13x larger (in pixels) than they ever render
// and total ~5.8MB, so on a cold cache over slow 4G the dive frames can't
// download inside their 130ms window — the keeper appears to freeze/skip.
// We downscale each sprite to ~2–3x its on-screen size and re-encode as WebP
// (alpha preserved), cutting the payload ~10x. Combined with the preload pass
// in assets.js, every dive frame is a warm cache hit before the first kick.
//
// Run from repo root:  node scripts/optimize-penalty-assets.js
// Idempotent — re-running just regenerates the .webp files from the PNGs.

const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..", "public", "assets", "penalty-kick");

// target = max width in px (aspect ratio preserved, never upscaled).
// Sized to ~2–3x the largest rendered width so it stays crisp on high-DPR
// phones while shedding the wasted pixels.
const JOBS = [
  // Background photo — no alpha, displayed up to the 475px layout clamp.
  { in: "bg/stadium.png", out: "bg/stadium.webp", width: 950, quality: 70, alpha: false },
  // Goal frame — wide, displayed at ~400px. Has transparency (net/posts).
  { in: "goalpost.png", out: "goalpost.webp", width: 880, quality: 80, alpha: true },
  // Ball — rendered at ~100px; 1254px source is wildly oversized.
  { in: "ball/Football.png", out: "ball/Football.webp", width: 320, quality: 82, alpha: true },
];

// Keeper sprite atlas. Landscape dive frames render in a ~220px-wide box;
// portrait idle/centre frames in a ~120px-wide box. 720 / 480 give 2–3x DPR.
const KEEPER = [
  ["jump-left.png", 720], ["jump-left-1.png", 720], ["jump-left-2.png", 720],
  ["jump-left-3.png", 720], ["jump-left-4.png", 720],
  ["jump-right-1.png", 720], ["jump-right-2.png", 720], ["jump-right-3.png", 720],
  ["jump-right-4.png", 720],
  ["no-move.png", 480], ["save-center.png", 480],
  ["still-pose-1.png", 380], ["still-pose-2.png", 380],
];
for (const [file, width] of KEEPER) {
  JOBS.push({
    in: `keeper/${file}`,
    out: `keeper/${file.replace(/\.png$/, ".webp")}`,
    width,
    quality: 82,
    alpha: true,
  });
}

(async () => {
  let before = 0;
  let after = 0;
  for (const job of JOBS) {
    const inPath = path.join(ROOT, job.in);
    const outPath = path.join(ROOT, job.out);
    const img = sharp(inPath).resize({ width: job.width, withoutEnlargement: true });
    const info = await img
      .webp({ quality: job.quality, alphaQuality: 90, effort: 5 })
      .toFile(outPath);
    const inSize = (await sharp(inPath).metadata()).size || 0;
    before += inSize;
    after += info.size;
    const pct = inSize ? ((1 - info.size / inSize) * 100).toFixed(0) : "?";
    console.log(
      `${job.in.padEnd(28)} ${(inSize / 1024).toFixed(0)}KB -> ${(info.size / 1024).toFixed(0)}KB  (-${pct}%)`,
    );
  }
  console.log(
    `\nTOTAL ${(before / 1024 / 1024).toFixed(2)}MB -> ${(after / 1024 / 1024).toFixed(2)}MB`,
  );
})();
