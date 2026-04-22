import { NextResponse } from "next/server";
import { ads as defaultAds, statusFor, type Ad } from "@/lib/mockAds";
import { callGemini, safeParseJson } from "@/lib/gemini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type Campaign = {
  replaces: string;
  name: string;
  platform: string;
  headline: string;
  primaryText: string;
  cta: string;
  targeting: string;
  hook: string;
  expectedLift: string;
};

type Payload = { campaigns: Campaign[] };

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const incoming: Ad[] = Array.isArray(body?.ads) && body.ads.length ? body.ads : defaultAds;
    const weak = incoming.filter((a) => {
      const s = statusFor(a);
      return s === "weak" || s === "needs-work";
    });

    const target = weak.length ? weak : incoming;

    const prompt = `You are a senior performance-marketing strategist + direct-response copywriter.

For each underperforming ad below, produce an improved replacement campaign designed to beat it.
Return strict JSON:

{
  "campaigns": [
    {
      "replaces": "<exact name of the weak ad being replaced>",
      "name": "<new campaign name, punchy, max 6 words>",
      "platform": "<best-fit platform>",
      "headline": "<stop-the-scroll headline, max 8 words>",
      "primaryText": "<ad body, 2-3 short sentences, direct, benefit-first>",
      "cta": "<CTA label, max 3 words>",
      "targeting": "<audience + interests, 1 sentence>",
      "hook": "<the core psychological hook, 1 sentence>",
      "expectedLift": "<realistic CTR/CPC/conversion lift estimate, 1 short line>"
    }
  ]
}

Rules:
- One campaign per weak ad. No duplicates.
- Fix the actual weakness (creative angle, targeting, hook, platform fit).
- Plain, punchy copy. No emojis, no hashtags, no fluff, no disclaimers.

WEAK ADS:
${JSON.stringify(target, null, 2)}`;

    const text = await callGemini(prompt);
    const payload = safeParseJson<Payload>(text, { campaigns: [] });
    return NextResponse.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
