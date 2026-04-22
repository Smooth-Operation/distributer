import { NextResponse } from "next/server";
import { ads as defaultAds } from "@/lib/mockAds";
import { callGemini, safeParseJson } from "@/lib/gemini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ideas = { ideas: { headline: string; angle: string; platform?: string }[] };

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const ads = Array.isArray(body?.ads) && body.ads.length ? body.ads : defaultAds;

    const prompt = `You are a senior direct-response copywriter.
Based on these existing ads and their performance, propose 3 NEW high-performing ad concepts.
Lean into what's working, fix what isn't.

Return JSON in this exact shape:
{
  "ideas": [
    { "headline": "...", "angle": "...", "platform": "Facebook | Instagram | TikTok | Pinterest | Google" }
  ]
}

Rules:
- headline: max 8 words, punchy, stop-the-scroll
- angle: 1-2 sentences explaining the hook and who it's for
- platform: best-fit platform for this angle

ADS:
${JSON.stringify(ads, null, 2)}`;

    const text = await callGemini(prompt);
    const payload = safeParseJson<Ideas>(text, { ideas: [] });
    return NextResponse.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
