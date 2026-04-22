import { NextResponse } from "next/server";
import { ads as defaultAds } from "@/lib/mockAds";
import { callGemini, safeParseJson } from "@/lib/gemini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type InsightPayload = {
  scale: string[];
  fix: string[];
  kill: string[];
  opportunities: string[];
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const ads = Array.isArray(body?.ads) && body.ads.length ? body.ads : defaultAds;

    const prompt = `You are a senior performance-marketing expert. Be brutally honest.
Analyze these ads and their metrics (CTR in %, CPC in USD, conversions, spend in USD).

Return a JSON object with exactly these keys, each an array of short, sharp, actionable bullet strings.
Reference ads by NAME. No fluff, no intros, no disclaimers.

{
  "scale": [ "..." ],       // best performers — what to pour more budget into
  "fix": [ "..." ],         // salvageable ads with specific fixes
  "kill": [ "..." ],        // kill them now and why
  "opportunities": [ "..." ] // quick improvements, new angles, platform shifts
}

Keep every bullet under 22 words. 2-4 bullets per section.

ADS:
${JSON.stringify(ads, null, 2)}`;

    const text = await callGemini(prompt);
    const payload = safeParseJson<InsightPayload>(text, {
      scale: [],
      fix: [],
      kill: [],
      opportunities: [],
    });

    return NextResponse.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
