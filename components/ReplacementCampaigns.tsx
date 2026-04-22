"use client";

import { useEffect, useState } from "react";
import { emitLog } from "@/lib/logBus";

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

export type LaunchResult = {
  ok: boolean;
  campaignId: string;
  platform: string;
  name: string;
  launchedAt: string;
  budgetDaily: number;
  estimatedReach: number;
};

type Status = "draft" | "launching" | "live";

export function ReplacementCampaigns({
  campaigns,
  onLaunched,
}: {
  campaigns: Campaign[];
  onLaunched?: (c: Campaign, r: LaunchResult) => void;
}) {
  const [states, setStates] = useState<Record<number, Status>>({});
  const [launches, setLaunches] = useState<Record<number, LaunchResult>>({});
  const [imageByIdx, setImageByIdx] = useState<Record<number, string | null>>({});
  const [imageLoading, setImageLoading] = useState<Record<number, boolean>>({});
  const [imageError, setImageError] = useState<Record<number, boolean>>({});

  useEffect(() => {
    campaigns.forEach((c, i) => {
      if (imageByIdx[i] !== undefined || imageLoading[i]) return;
      setImageLoading((m) => ({ ...m, [i]: true }));
      const t0 = Date.now();
      fetch("/api/generate-creative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign: c }),
      })
        .then(async (res) => {
          const data = await res.json();
          const ok = res.ok && data.image;
          setImageByIdx((m) => ({ ...m, [i]: ok ? data.image : null }));
          if (!ok) setImageError((m) => ({ ...m, [i]: true }));
          emitLog({
            method: "POST",
            host: "generativelanguage.googleapis.com",
            path: `/v1beta/models/gemini-2.5-flash-image:generateContent`,
            status: res.status,
            latencyMs: Date.now() - t0,
            bytes: ok ? Math.round((data.image as string).length * 0.75) : 0,
            platform: c.platform,
            note: ok ? `creative for ${c.name}` : `creative failed`,
          });
        })
        .catch(() => {
          setImageByIdx((m) => ({ ...m, [i]: null }));
          setImageError((m) => ({ ...m, [i]: true }));
        })
        .finally(() => {
          setImageLoading((m) => ({ ...m, [i]: false }));
        });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaigns]);

  async function launch(idx: number, c: Campaign) {
    setStates((s) => ({ ...s, [idx]: "launching" }));
    try {
      const res = await fetch("/api/launch-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: c.name, platform: c.platform }),
      });
      const data: LaunchResult = await res.json();
      setLaunches((l) => ({ ...l, [idx]: data }));
      setStates((s) => ({ ...s, [idx]: "live" }));
      onLaunched?.(c, data);
    } catch {
      setStates((s) => ({ ...s, [idx]: "draft" }));
    }
  }

  if (!campaigns.length) {
    return (
      <div className="rounded-2xl border border-white/5 bg-ink-800/60 p-6 text-sm text-zinc-400">
        No weak ads to replace — everything's performing.
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {campaigns.map((c, i) => {
        const status = states[i] ?? "draft";
        const launched = launches[i];
        const img = imageByIdx[i];
        const loadingImg = imageLoading[i];
        const failedImg = imageError[i];
        const onLaunchClick = () => {
          if (status === "draft" && !launched) launch(i, c);
        };
        return (
          <article
            key={i}
            className="surface-hover relative flex flex-col overflow-hidden animate-fade-up"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="pointer-events-none absolute -top-24 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-400/20 via-cyan-400/10 to-transparent blur-3xl" />

            <div className="relative aspect-[16/10] w-full overflow-hidden">
              {img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={img}
                  alt={c.headline}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : loadingImg ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-violet-600/30 via-pink-600/20 to-orange-500/10">
                  <div className="shimmer absolute inset-0" />
                  <div className="relative z-10 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur">
                    <Spinner />
                    Rendering with Gemini...
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-pink-600 to-orange-400" />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

              <div className="absolute left-4 top-4 flex items-center gap-2 text-[10px]">
                <span className="rounded-full bg-black/50 px-2 py-1 font-medium text-rose-300 ring-1 ring-inset ring-rose-400/30 backdrop-blur">
                  Replaces · {c.replaces}
                </span>
                <span className="rounded-full bg-black/50 px-2 py-1 font-medium text-zinc-100 ring-1 ring-inset ring-white/15 backdrop-blur">
                  {c.platform}
                </span>
              </div>
              <div className="absolute right-4 top-4">
                <StatusPill status={status} />
              </div>

              <div className="absolute inset-x-4 bottom-4">
                <div className="text-[10px] uppercase tracking-widest text-white/70">
                  {c.name}
                </div>
                <div className="mt-1 text-xl font-bold leading-tight text-white drop-shadow">
                  {c.headline}
                </div>
              </div>

              {failedImg && (
                <div className="absolute right-4 bottom-4 rounded-full bg-black/60 px-2 py-1 text-[10px] text-zinc-300 backdrop-blur">
                  creative quota reached
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col p-5">
              <p className="text-sm leading-relaxed text-zinc-200">{c.primaryText}</p>

              <dl className="mt-5 grid grid-cols-2 gap-3">
                <Row label="Hook" value={c.hook} />
                <Row label="Targeting" value={c.targeting} />
                <Row label="Expected lift" value={c.expectedLift} accent />
                {launched ? (
                  <Row label="Daily budget" value={`$${launched.budgetDaily}`} />
                ) : (
                  <Row label="CTA" value={c.cta} />
                )}
              </dl>

              {launched && (
                <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3 text-xs text-emerald-200">
                  Live on {launched.platform} ·{" "}
                  <span className="tabular-nums">
                    ~{launched.estimatedReach.toLocaleString()}
                  </span>{" "}
                  est. reach · id{" "}
                  <span className="font-mono text-[11px] opacity-80">{launched.campaignId}</span>
                </div>
              )}

              <div className="mt-auto flex items-center gap-2 pt-5">
                <span className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-black">
                  {c.cta}
                </span>
                <button
                  onClick={onLaunchClick}
                  disabled={status !== "draft"}
                  className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold text-white transition ${
                    status === "live"
                      ? "bg-emerald-500/20 text-emerald-300 cursor-default"
                      : status === "launching"
                      ? "bg-white/10 cursor-wait"
                      : "btn-gradient"
                  }`}
                >
                  {status === "live" ? (
                    <>
                      <CheckIcon /> Launched
                    </>
                  ) : status === "launching" ? (
                    <>
                      <Spinner /> Launching...
                    </>
                  ) : (
                    <>
                      <RocketIcon /> Launch to {c.platform}
                    </>
                  )}
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function StatusPill({ status }: { status: Status }) {
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300 ring-1 ring-inset ring-emerald-400/30">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-slow" /> Live
      </span>
    );
  }
  if (status === "launching") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-medium text-zinc-200 ring-1 ring-inset ring-white/10">
        <Spinner /> Launching
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-medium text-zinc-400 ring-1 ring-inset ring-white/10">
      <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" /> Draft
    </span>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] uppercase tracking-widest text-zinc-500">{label}</dt>
      <dd
        className={`mt-1 text-sm leading-snug ${
          accent ? "text-emerald-300 font-medium" : "text-zinc-200"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function RocketIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.5-2 5-2 5s3.5-.5 5-2c.8-.8.9-2 .3-3-.6-1-1.8-.9-2.6 0z" />
      <path d="M12 15 9 12M14.5 9.5 20 4M20 4l-6 1M20 4l-1 6" />
      <path d="M17.5 11 13 6.5C11 4.5 8 4 6 5c-1 2-.5 5 1.5 7l4.5 4.5c2 2 5 2.5 7 1.5 1-2 .5-5-1.5-7z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

function Spinner() {
  return <span className="h-3 w-3 rounded-full border-2 border-white/20 border-t-white animate-spin" />;
}

