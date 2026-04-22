"use client";

import { useState } from "react";
import type { Ad } from "@/lib/mockAds";
import { ScoreMeter } from "./ScoreMeter";
import { AdPreview } from "./AdPreview";
import { emitLog } from "@/lib/logBus";
import { configFor } from "@/lib/platforms";

type Variant = {
  tone: string;
  headline: string;
  primaryText: string;
  cta: string;
  score: number;
  hook: string;
};

type RewriteResult = {
  before: { score: number; issues: string[] };
  after: { score: number; wins: string[] };
  variants: Variant[];
};

type Stage = "idle" | "diagnosing" | "writing" | "scoring" | "done" | "error";

const STAGE_LABELS: Record<Exclude<Stage, "idle">, string> = {
  diagnosing: "Diagnosing weak ad",
  writing: "Writing variants",
  scoring: "Scoring rewrite",
  done: "Done",
  error: "Error",
};

const STAGE_ORDER: Stage[] = ["diagnosing", "writing", "scoring", "done"];

export function RewriteFlow({ ad }: { ad: Ad }) {
  const [stage, setStage] = useState<Stage>("idle");
  const [chars, setChars] = useState(0);
  const [result, setResult] = useState<RewriteResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeVariant, setActiveVariant] = useState(0);
  const [launchingIdx, setLaunchingIdx] = useState<number | null>(null);
  const [launchedIdx, setLaunchedIdx] = useState<number | null>(null);

  async function rewrite() {
    setStage("diagnosing");
    setChars(0);
    setResult(null);
    setError(null);
    setActiveVariant(0);

    const t0 = Date.now();
    const cfg = configFor(ad.platform);
    emitLog({
      method: "POST",
      host: "api.adbrain.ai",
      path: `/v1/rewrite?ad_id=${ad.id}&platform=${ad.platform.toLowerCase()}`,
      status: 200,
      latencyMs: 0,
      bytes: 512,
      platform: ad.platform,
      note: "Opening SSE stream to Gemini",
    });

    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ad }),
      });
      if (!res.body) throw new Error("No stream");

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });

        let sep: number;
        while ((sep = buf.indexOf("\n\n")) !== -1) {
          const block = buf.slice(0, sep);
          buf = buf.slice(sep + 2);
          const lines = block.split("\n");
          const event = lines.find((l) => l.startsWith("event:"))?.slice(6).trim();
          const dataLine = lines.find((l) => l.startsWith("data:"))?.slice(5).trim();
          if (!event || !dataLine) continue;
          let data: unknown = null;
          try {
            data = JSON.parse(dataLine);
          } catch {}

          if (event === "stage") {
            const s = (data as { stage: Stage })?.stage;
            if (s) setStage(s);
          } else if (event === "progress") {
            setChars((data as { chars: number })?.chars ?? 0);
          } else if (event === "done") {
            setResult(data as RewriteResult);
            setStage("done");
            emitLog({
              method: "GET",
              host: "generativelanguage.googleapis.com",
              path: `/v1beta/models/gemini-2.5-flash:streamGenerateContent`,
              status: 200,
              latencyMs: Date.now() - t0,
              bytes: (data as RewriteResult).variants.length * 380,
              platform: ad.platform,
              note: `3 variants · ${cfg.brand}`,
            });
          } else if (event === "error") {
            setError((data as { message: string })?.message ?? "Unknown error");
            setStage("error");
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Stream failed");
      setStage("error");
    }
  }

  async function launchVariant(idx: number, v: Variant) {
    setLaunchingIdx(idx);
    const cfg = configFor(ad.platform);
    const t0 = Date.now();
    emitLog({
      method: "POST",
      host: cfg.apiHost,
      path: `${cfg.endpoints.create}`,
      status: 0,
      latencyMs: 0,
      bytes: 1200 + v.primaryText.length,
      platform: ad.platform,
      note: `launch · ${v.tone}`,
    });
    try {
      const res = await fetch("/api/launch-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `${ad.name} · ${v.tone}`, platform: ad.platform }),
      });
      const data = await res.json();
      emitLog({
        method: "POST",
        host: cfg.apiHost,
        path: `${cfg.endpoints.create}`,
        status: res.status,
        latencyMs: Date.now() - t0,
        bytes: 480,
        platform: ad.platform,
        note: `campaign ${data.campaignId}`,
      });
      setLaunchedIdx(idx);
    } catch {
      emitLog({
        method: "POST",
        host: cfg.apiHost,
        path: `${cfg.endpoints.create}`,
        status: 500,
        latencyMs: Date.now() - t0,
        bytes: 0,
        platform: ad.platform,
      });
    } finally {
      setLaunchingIdx(null);
    }
  }

  const running = stage !== "idle" && stage !== "done" && stage !== "error";
  const lift = result
    ? Math.round(((result.after.score - result.before.score) / Math.max(1, result.before.score)) * 100)
    : 0;

  return (
    <div>
      <StagePipeline stage={stage} chars={chars} />

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={rewrite}
          disabled={running}
          className="btn-gradient inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-glow disabled:opacity-70"
        >
          <MagicIcon />
          {running ? "Rewriting..." : result ? "Rewrite again" : "Rewrite with AI"}
        </button>
        {result && (
          <span className="text-xs text-zinc-500">
            3 tone-varied variants · hit "Launch" on any to push live
          </span>
        )}
      </div>

      {stage === "error" && error && (
        <div className="mt-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-200">
          <div className="font-semibold">Rewrite failed.</div>
          <div className="mt-1 text-sm opacity-80">{error}</div>
        </div>
      )}

      {running && (
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <SkeletonPreview label="Diagnosing..." />
          <SkeletonPreview label="Drafting..." />
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-8 animate-fade-up">
          <div className="rounded-2xl border border-white/5 bg-ink-800/70 p-6 shadow-card">
            <div className="grid items-center gap-6 md:grid-cols-[auto_1fr_auto_auto]">
              <ScoreMeter value={result.before.score} label="Before" tone="bad" />
              <div className="relative hidden h-px w-full md:block">
                <div className="absolute inset-0 bg-gradient-to-r from-rose-400/40 via-white/10 to-emerald-400/40" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-ink-900 px-3 py-1 text-[11px] font-semibold text-white tabular-nums">
                  +{lift}% lift
                </div>
              </div>
              <ScoreMeter value={result.after.score} label="After" tone="good" />
              <div className="ml-2 hidden md:block">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                  Projected
                </div>
                <div className="text-3xl font-bold tabular-nums text-emerald-300">
                  +{lift}%
                </div>
                <div className="text-xs text-zinc-500">CTR uplift</div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-rose-300">
                  Why it's failing
                </div>
                <ul className="mt-2 space-y-2">
                  {result.before.issues.map((x, i) => (
                    <li key={i} className="flex gap-2 text-sm text-zinc-200">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-rose-400" />
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-emerald-300">
                  What the rewrite fixes
                </div>
                <ul className="mt-2 space-y-2">
                  {result.after.wins.map((x, i) => (
                    <li key={i} className="flex gap-2 text-sm text-zinc-200">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-emerald-400" />
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-end justify-between">
              <h3 className="text-xl font-semibold text-white">Before vs. After</h3>
              <div className="flex gap-1 rounded-full border border-white/10 bg-white/5 p-1">
                {result.variants.map((v, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveVariant(i)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      activeVariant === i ? "bg-white text-black" : "text-zinc-300 hover:text-white"
                    }`}
                  >
                    {v.tone}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <AdPreview
                variant="before"
                data={{
                  platform: ad.platform,
                  headline: ad.name,
                  primaryText: `CTR ${ad.ctr}% · CPC $${ad.cpc.toFixed(
                    2
                  )} · ${ad.conversions} conversions from $${ad.spend} spend.`,
                  cta: "Learn More",
                  tone: "Original",
                }}
              />
              <AdPreview
                data={{
                  platform: ad.platform,
                  headline: result.variants[activeVariant].headline,
                  primaryText: result.variants[activeVariant].primaryText,
                  cta: result.variants[activeVariant].cta,
                  tone: result.variants[activeVariant].tone,
                }}
              />
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  All variants
                </div>
                <h3 className="mt-1 text-xl font-semibold tracking-tight text-white">
                  Pick one and launch
                </h3>
              </div>
              <span className="text-[11px] text-zinc-500">
                Click a card to preview · click Launch to push live
              </span>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {result.variants.map((v, i) => {
                const isActive = activeVariant === i;
                const isLaunching = launchingIdx === i;
                const isLaunched = launchedIdx === i;
                return (
                  <article
                    key={i}
                    onClick={() => setActiveVariant(i)}
                    className={`surface-hover group relative flex cursor-pointer flex-col p-5 animate-fade-up ${
                      isActive
                        ? "ring-1 ring-inset ring-violet-400/40 bg-violet-500/[0.06]"
                        : ""
                    }`}
                    style={{ animationDelay: `${i * 90}ms` }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ring-1 ring-inset ${
                          i === 0
                            ? "bg-emerald-500/10 text-emerald-300 ring-emerald-400/25"
                            : i === 1
                            ? "bg-violet-500/10 text-violet-300 ring-violet-400/25"
                            : "bg-amber-500/10 text-amber-300 ring-amber-400/25"
                        }`}
                      >
                        {v.tone}
                      </span>
                      <div className="text-right">
                        <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                          Score
                        </div>
                        <div className="text-2xl font-semibold tabular-nums text-emerald-300">
                          {v.score}
                          <span className="text-xs text-zinc-500">/100</span>
                        </div>
                      </div>
                    </div>

                    <h4 className="mt-4 text-[17px] font-semibold leading-snug tracking-tight text-white">
                      {v.headline}
                    </h4>
                    <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">
                      {v.primaryText}
                    </p>

                    <div className="mt-4 rounded-lg border border-white/[0.06] bg-black/30 p-3">
                      <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                        Hook
                      </div>
                      <div className="mt-1 text-[12px] leading-relaxed text-zinc-300">
                        {v.hook}
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
                      <div>
                        <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                          CTA
                        </div>
                        <div className="mt-1">
                          <span className="rounded-md bg-white px-2.5 py-1 text-[11px] font-semibold text-black">
                            {v.cta}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isLaunching && !isLaunched) launchVariant(i, v);
                        }}
                        disabled={isLaunching || isLaunched}
                        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${
                          isLaunched
                            ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-400/30 cursor-default"
                            : isLaunching
                            ? "bg-white/10 text-zinc-200 cursor-wait"
                            : "btn-gradient text-white"
                        }`}
                      >
                        {isLaunched ? (
                          <>
                            <CheckIconInline /> Launched
                          </>
                        ) : isLaunching ? (
                          <>
                            <SpinnerInline /> Launching...
                          </>
                        ) : (
                          <>
                            <RocketInline /> Launch
                          </>
                        )}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StagePipeline({ stage, chars }: { stage: Stage; chars: number }) {
  if (stage === "idle" || stage === "error") return null;
  const currentIdx = STAGE_ORDER.indexOf(stage);
  return (
    <div className="rounded-2xl border border-white/5 bg-ink-800/70 p-4 shadow-card backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-zinc-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-violet-400/50" />
            <span className="relative h-2 w-2 rounded-full bg-violet-400" />
          </span>
          {STAGE_LABELS[stage as keyof typeof STAGE_LABELS]}
        </div>
        {chars > 0 && (
          <div className="text-[11px] text-zinc-500 tabular-nums">
            {chars} chars streamed
          </div>
        )}
      </div>
      <div className="mt-3 flex gap-2">
        {STAGE_ORDER.slice(0, 3).map((s, i) => {
          const active = i === currentIdx;
          const done = i < currentIdx || stage === "done";
          return (
            <div key={s} className="flex-1">
              <div
                className={`h-1 rounded-full transition-all duration-500 ${
                  done
                    ? "bg-emerald-400"
                    : active
                    ? "bg-gradient-to-r from-violet-400 to-pink-400 animate-pulse"
                    : "bg-white/10"
                }`}
              />
              <div
                className={`mt-1.5 text-[10px] uppercase tracking-widest ${
                  done ? "text-emerald-400" : active ? "text-white" : "text-zinc-600"
                }`}
              >
                {STAGE_LABELS[s as keyof typeof STAGE_LABELS]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SkeletonPreview({ label }: { label: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/5 bg-ink-800/60 shadow-card">
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-2.5">
        <div className="h-6 w-6 rounded-full bg-white/5" />
        <div className="flex-1">
          <div className="shimmer h-3 w-24 rounded" />
          <div className="shimmer mt-1 h-2 w-16 rounded" />
        </div>
      </div>
      <div className="shimmer aspect-[5/4] w-full" />
      <div className="px-4 py-3">
        <div className="shimmer h-3 w-full rounded" />
        <div className="shimmer mt-2 h-3 w-3/4 rounded" />
        <div className="mt-4 flex items-center justify-between">
          <div className="shimmer h-2 w-20 rounded" />
          <div className="shimmer h-6 w-20 rounded-md" />
        </div>
      </div>
      <div className="border-t border-white/5 px-4 py-2 text-[10px] uppercase tracking-widest text-zinc-600">
        {label}
      </div>
    </div>
  );
}

function MagicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 4V2M15 10V8M9 4V2M9 10V8" />
      <path d="M3 21l18-18-3-3L3 18v3h3" />
    </svg>
  );
}

function CheckIconInline() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

function SpinnerInline() {
  return (
    <span className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
  );
}

function RocketInline() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.5-2 5-2 5s3.5-.5 5-2c.8-.8.9-2 .3-3-.6-1-1.8-.9-2.6 0z" />
      <path d="M12 15 9 12M14.5 9.5 20 4M20 4l-6 1M20 4l-1 6" />
      <path d="M17.5 11 13 6.5C11 4.5 8 4 6 5c-1 2-.5 5 1.5 7l4.5 4.5c2 2 5 2.5 7 1.5 1-2 .5-5-1.5-7z" />
    </svg>
  );
}
