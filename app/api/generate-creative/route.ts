import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const IMAGE_MODELS = ["gemini-2.5-flash-image", "gemini-3-pro-image-preview"];

export async function POST(req: Request) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ error: "GEMINI_API_KEY missing" }, { status: 500 });

  const body = await req.json().catch(() => ({}));
  const c = body?.campaign ?? {};

  const prompt = `Photorealistic, professional ad creative for a social media ad.
Headline context: "${c.headline ?? ""}"
Hook: "${c.hook ?? ""}"
Platform: ${c.platform ?? "Instagram"}.
Style: modern, editorial, cinematic lighting, strong focal point, shallow depth of field, vibrant but tasteful color grading, no text, no logos, no watermark.`;

  let lastErr = "";
  for (const model of IMAGE_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      lastErr = `${res.status} ${await res.text()}`;
      if (res.status !== 429 && res.status !== 503 && res.status !== 500) break;
      continue;
    }

    const data = await res.json();
    const parts = data?.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find(
      (p: { inlineData?: { data?: string; mimeType?: string } }) => p?.inlineData?.data
    );
    if (imagePart?.inlineData?.data) {
      const mime = imagePart.inlineData.mimeType ?? "image/png";
      return NextResponse.json({
        image: `data:${mime};base64,${imagePart.inlineData.data}`,
      });
    }
    lastErr = "No image part returned";
  }

  return NextResponse.json({ error: lastErr || "Image generation failed" }, { status: 500 });
}
