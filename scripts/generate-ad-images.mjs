// Prebuild ad creative images via Gemini 2.5 Flash Image.
// Usage:  GEMINI_API_KEY=... node scripts/generate-ad-images.mjs
//   or   load from .env.local automatically.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "public", "ads");

function loadEnvLocal() {
  const p = join(ROOT, ".env.local");
  if (!existsSync(p)) return;
  const raw = readFileSync(p, "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
loadEnvLocal();

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) {
  console.error("GEMINI_API_KEY missing. Set it in .env.local or env.");
  process.exit(1);
}

const ADS = [
  {
    id: 1,
    slug: "gym-transformation",
    platform: "Facebook",
    prompt:
      "Editorial fitness photography. Athletic man in his 30s, mid workout, kettlebell swing in a moody black-gym, single warm rim-light, sweat highlights, shallow depth of field, cinematic color grade, shot on 85mm. No text, no logos.",
  },
  {
    id: 2,
    slug: "luxury-watch-angle",
    platform: "Pinterest",
    prompt:
      "Luxury product photography of a mechanical chronograph watch. Macro shot at 45 degree angle on dark brushed metal surface, dramatic single-source light, deep shadows, reflective caseback, exposed movement, high-end catalogue feel. No text, no logos.",
  },
  {
    id: 3,
    slug: "before-after-fitness",
    platform: "Facebook",
    prompt:
      "Split-frame before/after fitness transformation photograph. Same person left side heavier and unmotivated, right side lean and confident, natural studio lighting, neutral grey backdrop, realistic skin, editorial magazine style. No text, no logos, no watermarks.",
  },
  {
    id: 4,
    slug: "travel-lifestyle",
    platform: "Instagram",
    prompt:
      "Aspirational travel lifestyle photograph. Young woman in linen outfit sitting on an infinity-pool edge overlooking Santorini caldera at golden hour, soft warm light, pastel sky, cinematic, influencer-core. No text, no logos.",
  },
  {
    id: 5,
    slug: "unboxing-hook",
    platform: "TikTok",
    prompt:
      "TikTok-style product unboxing shot from above. Hands opening a premium matte black subscription box on a pastel pink table, confetti bursting out, bright soft light, vertical 9:16 composition adapted, high-energy, Gen-Z aesthetic. No text, no logos.",
  },
  {
    id: 6,
    slug: "generic-product-shot",
    platform: "Google",
    prompt:
      "Deliberately boring ecommerce product photograph of a plain white ceramic mug on a white seamless background, flat overhead lighting, no styling, stock-catalogue feel — purposely unengaging. No text, no logos.",
  },
];

const MODELS = ["gemini-2.5-flash-image", "gemini-3-pro-image-preview"];

async function generate(ad) {
  const prompt = `${ad.prompt}
Platform: ${ad.platform}.
Style: photorealistic, professional ad creative, strong focal point, shallow depth of field, vibrant but tasteful color grading, 4:3 aspect ratio. No text, no logos, no watermark.`;

  let lastErr = "";
  for (const model of MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${KEY}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }),
    });
    if (!res.ok) {
      lastErr = `${res.status} ${await res.text().catch(() => "")}`;
      if (![429, 500, 503].includes(res.status)) break;
      continue;
    }
    const data = await res.json();
    const parts = data?.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p) => p?.inlineData?.data);
    if (imagePart) {
      const ext = (imagePart.inlineData.mimeType ?? "image/png").split("/")[1];
      return { buf: Buffer.from(imagePart.inlineData.data, "base64"), ext };
    }
    lastErr = "no image part";
  }
  throw new Error(lastErr);
}

async function main() {
  const force = process.argv.includes("--force");
  const results = [];
  for (const ad of ADS) {
    const dest = join(OUT, `${ad.slug}.png`);
    if (!force && existsSync(dest)) {
      console.log(`✓ skip ${ad.slug} (already exists)`);
      results.push({ id: ad.id, slug: ad.slug, ok: true, skipped: true });
      continue;
    }
    process.stdout.write(`→ ${ad.slug}... `);
    try {
      const t0 = Date.now();
      const { buf, ext } = await generate(ad);
      const finalPath = join(OUT, `${ad.slug}.${ext === "jpeg" ? "jpg" : ext}`);
      writeFileSync(finalPath, buf);
      console.log(`ok (${(buf.length / 1024).toFixed(0)}KB, ${Date.now() - t0}ms)`);
      results.push({ id: ad.id, slug: ad.slug, ok: true });
    } catch (e) {
      console.log(`FAIL: ${e.message?.slice(0, 160)}`);
      results.push({ id: ad.id, slug: ad.slug, ok: false, error: e.message });
    }
  }
  const ok = results.filter((r) => r.ok).length;
  console.log(`\n${ok}/${results.length} generated · saved to public/ads/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
