import type { Ad } from "@/lib/mockAds";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODELS = [
  "gemini-2.5-flash",
  "gemini-flash-latest",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
];

type Variant = {
  tone: string;
  headline: string;
  primaryText: string;
  cta: string;
  score: number;
  hook: string;
};

type Payload = {
  before: { score: number; issues: string[] };
  after: { score: number; wins: string[] };
  variants: Variant[];
};

export async function POST(req: Request) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return new Response("GEMINI_API_KEY missing", { status: 500 });

  const body = await req.json().catch(() => ({}));
  const ad: Ad | null = body?.ad ?? null;
  if (!ad) return new Response("Missing ad", { status: 400 });

  const prompt = `You are a senior direct-response copywriter diagnosing a weak ad.

WEAK AD:
${JSON.stringify(ad, null, 2)}

Task: diagnose why it's weak, then rewrite it three ways with different tones.

Return ONLY valid JSON in this exact shape:

{
  "before": { "score": <0-100>, "issues": ["...", "..."] },
  "after": { "score": <0-100>, "wins": ["...", "..."] },
  "variants": [
    {
      "tone": "Direct",
      "headline": "<max 8 words>",
      "primaryText": "<2-3 punchy sentences>",
      "cta": "<max 3 words>",
      "score": <0-100>,
      "hook": "<the core psychological hook, 1 sentence>"
    },
    { "tone": "Curiosity", ... },
    { "tone": "Urgency", ... }
  ]
}

Rules:
- "before.score" must be low (15-45) matching the weak ad's actual performance.
- "after.score" must be higher (70-95).
- Each variant must beat the original: clearer benefit, sharper hook, stronger CTA.
- No emojis, no hashtags, no disclaimers.`;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enc = new TextEncoder();
      const send = (event: string, data: unknown) => {
        controller.enqueue(enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      send("stage", { stage: "diagnosing", label: "Diagnosing weak ad..." });

      let raw = "";
      let lastErr = "";
      let ok = false;

      for (const model of MODELS) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${key}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.8,
              responseMimeType: "application/json",
            },
          }),
        });

        if (!res.ok || !res.body) {
          lastErr = `${res.status} ${await res.text().catch(() => "")}`;
          if (res.status !== 429 && res.status !== 503 && res.status !== 500) break;
          continue;
        }

        send("stage", { stage: "writing", label: "Writing variants..." });

        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buf = "";
        let charCount = 0;

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });

          let idx: number;
          while ((idx = buf.indexOf("\n")) !== -1) {
            const line = buf.slice(0, idx).trim();
            buf = buf.slice(idx + 1);
            if (!line.startsWith("data:")) continue;
            const jsonStr = line.slice(5).trim();
            if (!jsonStr) continue;
            try {
              const chunk = JSON.parse(jsonStr);
              const parts = chunk?.candidates?.[0]?.content?.parts ?? [];
              for (const p of parts) {
                if (typeof p?.text === "string") {
                  raw += p.text;
                  charCount += p.text.length;
                  if (charCount % 40 < p.text.length) {
                    send("progress", { chars: raw.length });
                  }
                }
              }
            } catch {}
          }
        }

        ok = true;
        break;
      }

      if (!ok) {
        send("error", { message: `Gemini error: ${lastErr}` });
        controller.close();
        return;
      }

      send("stage", { stage: "scoring", label: "Scoring rewrite..." });

      const parsed = safeParse<Payload>(raw);
      if (!parsed) {
        send("error", { message: "Could not parse rewrite JSON" });
      } else {
        send("done", parsed);
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

function safeParse<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]) as T;
      } catch {}
    }
    return null;
  }
}
