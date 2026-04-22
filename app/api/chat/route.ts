import { NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";
import { ads as defaultAds } from "@/lib/mockAds";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Msg = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const messages: Msg[] = Array.isArray(body?.messages) ? body.messages : [];
    const ads = Array.isArray(body?.ads) && body.ads.length ? body.ads : defaultAds;

    const history = messages
      .slice(-8)
      .map((m) => `${m.role === "user" ? "USER" : "ASSISTANT"}: ${m.content}`)
      .join("\n");

    const prompt = `You are Ad Brain Copilot — a senior performance marketer embedded in an ad manager dashboard.
Be direct, concrete, and brutally honest. No fluff, no disclaimers, no intros.
Refer to ads by name. Keep answers under 120 words unless the user explicitly asks for more.
If the user asks what to do, give a specific, prioritized action.

CURRENT ADS (live synced):
${JSON.stringify(ads, null, 2)}

CONVERSATION:
${history}

Respond as plain text (no markdown headers, no JSON).`;

    const text = await callGeminiPlain(prompt);
    return NextResponse.json({ reply: text.trim() });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function callGeminiPlain(prompt: string) {
  // Reuse the JSON helper but strip forcing JSON mime type by calling Gemini directly.
  const key = process.env.GEMINI_API_KEY!;
  const models = [
    "gemini-2.5-flash",
    "gemini-flash-latest",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
  ];
  let lastErr = "";
  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7 },
      }),
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      return (
        data?.candidates?.[0]?.content?.parts
          ?.map((p: { text?: string }) => p.text ?? "")
          .join("") ?? ""
      );
    }
    lastErr = `${res.status} ${await res.text()}`;
    if (res.status !== 429 && res.status !== 503 && res.status !== 500) break;
  }
  // Fallback: use JSON path (will return stringified JSON but still usable)
  return callGemini(prompt);
}
