"use client";

import { useCallback, useState } from "react";
import type { Ad } from "@/lib/mockAds";
import { AdsTable } from "@/components/AdsTable";
import { TableSkeleton } from "@/components/TableSkeleton";
import { Insights, type InsightPayload } from "@/components/Insights";
import { AnalyzingState } from "@/components/AnalyzingState";
import { GeneratedIdeas, type AdIdea } from "@/components/GeneratedIdeas";
import {
  ReplacementCampaigns,
  type Campaign,
  type LaunchResult,
} from "@/components/ReplacementCampaigns";
import { SyncProgress, type SyncStep } from "@/components/SyncProgress";
import { KpiBar } from "@/components/KpiBar";
import { ActivityFeed, type ActivityEvent } from "@/components/ActivityFeed";
import { Copilot } from "@/components/Copilot";
import { Toasts, type Toast } from "@/components/Toasts";
import {
  PlatformConnector,
  type ConnectorStatus,
} from "@/components/PlatformConnector";
import { ApiConsole } from "@/components/ApiConsole";
import { PLATFORMS, configFor } from "@/lib/platforms";
import { emitLog } from "@/lib/logBus";

type View = "idle" | "syncing" | "ready" | "analyzing" | "results" | "error";
type Tab = "overview" | "platforms" | "console" | "ai";

const SYNC_STEPS: { label: string; platform?: string }[] = [
  { label: "Authenticating OAuth tokens...", platform: undefined },
  { label: "Pulling campaigns from Meta Ads...", platform: "Facebook" },
  { label: "Pulling campaigns from Instagram Ads...", platform: "Instagram" },
  { label: "Pulling campaigns from TikTok for Business...", platform: "TikTok" },
  { label: "Pulling campaigns from Google Ads...", platform: "Google" },
  { label: "Pulling campaigns from Pinterest Ads...", platform: "Pinterest" },
  { label: "Normalizing metrics across platforms...", platform: undefined },
];

export default function Page() {
  const [view, setView] = useState<View>("idle");
  const [tab, setTab] = useState<Tab>("overview");
  const [ads, setAds] = useState<Ad[]>([]);
  const [syncSteps, setSyncSteps] = useState<SyncStep[]>(
    SYNC_STEPS.map((s) => ({ label: s.label, state: "pending" }))
  );
  const [syncedAt, setSyncedAt] = useState<string | null>(null);
  const [connectors, setConnectors] = useState<Record<string, ConnectorStatus>>(
    Object.fromEntries(PLATFORMS.map((p) => [p.platform, "disconnected"]))
  );

  const [insights, setInsights] = useState<InsightPayload | null>(null);
  const [ideas, setIdeas] = useState<AdIdea[] | null>(null);
  const [ideasLoading, setIdeasLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
  const [campaignsLoading, setCampaignsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const logEvent = useCallback((e: Omit<ActivityEvent, "id" | "at">) => {
    setEvents((prev) => [
      ...prev,
      { ...e, id: prev.length + Date.now(), at: new Date().toISOString() },
    ]);
  }, []);

  const pushToast = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4200);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  function randDelay(min = 500, max = 1100) {
    return min + Math.floor(Math.random() * (max - min));
  }

  async function syncPlatforms() {
    setView("syncing");
    setError(null);
    setInsights(null);
    setIdeas(null);
    setCampaigns(null);
    setConnectors(Object.fromEntries(PLATFORMS.map((p) => [p.platform, "disconnected"])));
    setSyncSteps(SYNC_STEPS.map((s) => ({ label: s.label, state: "pending" })));

    const fetchPromise = fetch("/api/fetch-ads", { cache: "no-store" }).then(async (r) => {
      if (!r.ok) throw new Error(`Sync failed: ${r.status}`);
      return r.json() as Promise<{ ads: Ad[]; syncedAt: string }>;
    });

    try {
      for (let i = 0; i < SYNC_STEPS.length; i++) {
        const step = SYNC_STEPS[i];
        setSyncSteps((prev) =>
          prev.map((s, idx) =>
            idx < i ? { ...s, state: "done" } : idx === i ? { ...s, state: "active" } : s
          )
        );

        if (step.platform) {
          setConnectors((prev) => ({ ...prev, [step.platform!]: "connecting" }));
          const cfg = configFor(step.platform as never);
          const t0 = Date.now();
          emitLog({
            method: "POST",
            host: cfg.apiHost,
            path: "/oauth/access_token?grant_type=refresh",
            status: 200,
            latencyMs: 120 + Math.floor(Math.random() * 140),
            bytes: 312,
            platform: step.platform,
            note: "token refreshed",
          });
          await new Promise((r) => setTimeout(r, randDelay(380, 620)));
          emitLog({
            method: "GET",
            host: cfg.apiHost,
            path: `/${cfg.apiVersion}${cfg.endpoints.list}?limit=50&fields=name,ctr,cpc,conversions,spend`,
            status: 200,
            latencyMs: 400 + Math.floor(Math.random() * 500),
            bytes: 2400 + Math.floor(Math.random() * 3200),
            platform: step.platform,
            note: `pulled ads from ${cfg.brand}`,
          });
          await new Promise((r) => setTimeout(r, randDelay(350, 700)));
          emitLog({
            method: "GET",
            host: cfg.apiHost,
            path: `/${cfg.apiVersion}${cfg.endpoints.insights}?date_preset=last_7d`,
            status: 200,
            latencyMs: 280 + Math.floor(Math.random() * 400),
            bytes: 1200 + Math.floor(Math.random() * 1500),
            platform: step.platform,
            note: `insights ${Date.now() - t0}ms total`,
          });
          setConnectors((prev) => ({ ...prev, [step.platform!]: "connected" }));
        } else {
          await new Promise((r) => setTimeout(r, randDelay(450, 900)));
        }

        setSyncSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, state: "done" } : s)));
      }

      const data = await fetchPromise;
      setAds(data.ads);
      setSyncedAt(data.syncedAt);
      setView("ready");
      logEvent({
        kind: "sync",
        title: `Synced ${data.ads.length} ads`,
        detail: `${new Set(data.ads.map((a) => a.platform)).size} platforms connected`,
      });
      pushToast({
        title: "Platforms synced",
        detail: `${data.ads.length} ads ready to analyze`,
        tone: "success",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sync failed");
      setView("error");
    }
  }

  async function analyze() {
    if (!ads.length) return;
    setView("analyzing");
    setTab("ai");
    setError(null);
    setIdeas(null);
    setCampaigns(null);
    const start = Date.now();
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ads }),
      });
      if (!res.ok) throw new Error(`Analyze failed: ${res.status}`);
      const data: InsightPayload = await res.json();
      const elapsed = Date.now() - start;
      if (elapsed < 1400) await new Promise((r) => setTimeout(r, 1400 - elapsed));
      setInsights(data);
      setView("results");
      const totals =
        (data.scale?.length ?? 0) +
        (data.fix?.length ?? 0) +
        (data.kill?.length ?? 0) +
        (data.opportunities?.length ?? 0);
      logEvent({
        kind: "analyze",
        title: "AI analysis complete",
        detail: `${totals} insights across scale / fix / kill / ops`,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setView("error");
    }
  }

  async function generateIdeas() {
    setIdeasLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ads }),
      });
      if (!res.ok) throw new Error(`Generate failed: ${res.status}`);
      const data = await res.json();
      const list = data.ideas ?? [];
      setIdeas(list);
      logEvent({
        kind: "creative",
        title: `${list.length} new angle${list.length === 1 ? "" : "s"} generated`,
        detail: list.slice(0, 1).map((x: AdIdea) => x.headline).join(""),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setIdeasLoading(false);
    }
  }

  async function fixAndReplace() {
    setCampaignsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ads }),
      });
      if (!res.ok) throw new Error(`Generate campaigns failed: ${res.status}`);
      const data = await res.json();
      const list: Campaign[] = data.campaigns ?? [];
      setCampaigns(list);
      logEvent({
        kind: "creative",
        title: `${list.length} replacement campaign${list.length === 1 ? "" : "s"} built`,
        detail: list.map((c) => c.name).slice(0, 2).join(" · "),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setCampaignsLoading(false);
    }
  }

  const synced = ads.length > 0;
  const platforms = new Set(ads.map((a) => a.platform));
  const connectedCount = Object.values(connectors).filter((s) => s === "connected").length;

  const handleLaunched = (c: Campaign, r: LaunchResult) => {
    const cfg = configFor(r.platform as never);
    emitLog({
      method: "POST",
      host: cfg.apiHost,
      path: `/${cfg.apiVersion}${cfg.endpoints.create}`,
      status: 201,
      latencyMs: 900 + Math.floor(Math.random() * 1200),
      bytes: 1400 + c.primaryText.length,
      platform: r.platform,
      note: `campaign ${r.campaignId}`,
    });
    logEvent({
      kind: "launch",
      title: `Launched "${c.name}"`,
      detail: `${r.platform} · $${r.budgetDaily}/day · id ${r.campaignId}`,
    });
    pushToast({
      title: `Live on ${r.platform}`,
      detail: `${c.name} · ~${r.estimatedReach.toLocaleString()} est. reach`,
      tone: "success",
    });
  };

  return (
    <main className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-radial-hero" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] grid-bg" />

      <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-6">
        <TopBar
          synced={synced}
          connectedCount={connectedCount}
          totalPlatforms={PLATFORMS.length}
          syncedAt={syncedAt}
          onSync={syncPlatforms}
          onAnalyze={analyze}
          syncing={view === "syncing"}
          analyzing={view === "analyzing"}
          adCount={ads.length}
        />

        {!synced && view !== "syncing" && <IdleHero onSync={syncPlatforms} />}

        {view === "syncing" && (
          <section className="mt-8">
            <SyncProgress steps={syncSteps} />
            <div className="mt-6">
              <TableSkeleton rows={6} />
            </div>
          </section>
        )}

        {synced && view !== "syncing" && (
          <>
            <section className="mt-6">
              <KpiBar ads={ads} />
            </section>

            <Tabs tab={tab} setTab={setTab} analyzed={!!insights} />

            <section className="mt-6">
              {tab === "overview" && (
                <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
                  <AdsTable ads={ads} />
                  <ActivityFeed events={events} />
                </div>
              )}

              {tab === "platforms" && (
                <PlatformConnector statuses={connectors} />
              )}

              {tab === "console" && <ApiConsole />}

              {tab === "ai" && (
                <AiTab
                  view={view}
                  insights={insights}
                  error={error}
                  onAnalyze={analyze}
                  onFixAndReplace={fixAndReplace}
                  onGenerateIdeas={generateIdeas}
                  campaigns={campaigns}
                  campaignsLoading={campaignsLoading}
                  ideas={ideas}
                  ideasLoading={ideasLoading}
                  handleLaunched={handleLaunched}
                  platforms={platforms.size}
                />
              )}
            </section>
          </>
        )}
      </div>

      {synced && <Copilot ads={ads} />}
      <Toasts toasts={toasts} onDismiss={dismissToast} />
    </main>
  );
}

function TopBar({
  synced,
  connectedCount,
  totalPlatforms,
  syncedAt,
  onSync,
  onAnalyze,
  syncing,
  analyzing,
  adCount,
}: {
  synced: boolean;
  connectedCount: number;
  totalPlatforms: number;
  syncedAt: string | null;
  onSync: () => void;
  onAnalyze: () => void;
  syncing: boolean;
  analyzing: boolean;
  adCount: number;
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <div className="relative h-8 w-8">
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-violet-500 via-pink-500 to-orange-400 blur-md opacity-70" />
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 via-pink-500 to-orange-400 text-sm font-bold text-white">
            A
          </div>
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-tight text-white">Ad Brain</div>
          <div className="text-[10px] text-zinc-500">Ad Distribution Manager</div>
        </div>
      </div>

      <div className="order-3 flex w-full items-center gap-2 md:order-2 md:w-auto">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] ${
            synced
              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
              : "border-white/10 bg-white/5 text-zinc-400"
          }`}
          title={syncedAt ?? undefined}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              synced ? "bg-emerald-400 animate-pulse-slow" : "bg-zinc-500"
            }`}
          />
          {synced
            ? `${connectedCount}/${totalPlatforms} platforms · ${adCount} ads`
            : "Not connected"}
        </span>
        {syncedAt && (
          <span className="text-[11px] text-zinc-500">
            synced {new Date(syncedAt).toLocaleTimeString()}
          </span>
        )}
      </div>

      <div className="order-2 flex items-center gap-2 md:order-3">
        {!synced ? (
          <button
            onClick={onSync}
            disabled={syncing}
            className="btn-gradient inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-glow disabled:opacity-70"
          >
            <PlugIcon />
            {syncing ? "Syncing..." : "Sync Ad Platforms"}
          </button>
        ) : (
          <>
            <button
              onClick={onAnalyze}
              disabled={analyzing}
              className="btn-gradient inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-glow disabled:opacity-70"
            >
              <SparkleIcon />
              {analyzing ? "Analyzing..." : "Analyze with AI"}
            </button>
            <button
              onClick={onSync}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-white/10"
            >
              <RefreshIcon />
              Re-sync
            </button>
          </>
        )}
      </div>
    </header>
  );
}

function IdleHero({ onSync }: { onSync: () => void }) {
  return (
    <section className="mt-14 text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300 backdrop-blur">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-slow" />
        Powered by Gemini · Live platform sync
      </div>
      <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight text-white md:text-6xl">
        All Your Ads. <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-orange-300 bg-clip-text text-transparent">One Smart Brain.</span>
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-balance text-base text-zinc-400 md:text-lg">
        Sync every platform. Let AI tell you what to scale, fix, or kill — in seconds.
      </p>
      <button
        onClick={onSync}
        className="btn-gradient mt-7 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-glow"
      >
        <PlugIcon />
        Sync Ad Platforms
      </button>
      <p className="mt-3 text-xs text-zinc-500">
        Facebook · Instagram · TikTok · Pinterest · Google
      </p>
    </section>
  );
}

const TABS: { id: Tab; label: string; hint?: string }[] = [
  { id: "overview", label: "Overview", hint: "Ads + activity" },
  { id: "platforms", label: "Platforms", hint: "Accounts · tokens · rate limits" },
  { id: "console", label: "API Console", hint: "Live requests" },
  { id: "ai", label: "AI Insights", hint: "Scale · fix · kill" },
];

function Tabs({
  tab,
  setTab,
  analyzed,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  analyzed: boolean;
}) {
  return (
    <div className="mt-8 flex items-center gap-1 overflow-x-auto border-b border-white/5 pb-0">
      {TABS.map((t) => {
        const active = tab === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative inline-flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-medium transition ${
              active ? "text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            {t.label}
            {t.id === "ai" && analyzed && (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            )}
            {active && (
              <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400" />
            )}
          </button>
        );
      })}
    </div>
  );
}

function AiTab({
  view,
  insights,
  error,
  onAnalyze,
  onFixAndReplace,
  onGenerateIdeas,
  campaigns,
  campaignsLoading,
  ideas,
  ideasLoading,
  handleLaunched,
  platforms,
}: {
  view: View;
  insights: InsightPayload | null;
  error: string | null;
  onAnalyze: () => void;
  onFixAndReplace: () => void;
  onGenerateIdeas: () => void;
  campaigns: Campaign[] | null;
  campaignsLoading: boolean;
  ideas: AdIdea[] | null;
  ideasLoading: boolean;
  handleLaunched: (c: Campaign, r: LaunchResult) => void;
  platforms: number;
}) {
  if (view === "analyzing") {
    return <AnalyzingState />;
  }

  if (view === "error" && error) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-200">
        <div className="font-semibold">Something broke.</div>
        <div className="mt-1 text-sm opacity-80">{error}</div>
        <button
          onClick={onAnalyze}
          className="mt-4 rounded-full border border-rose-400/40 px-4 py-2 text-sm hover:bg-rose-500/10"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/5 bg-ink-800/50 p-10 text-center">
        <div className="text-[10px] uppercase tracking-widest text-violet-300">
          AI Insights
        </div>
        <div className="text-xl font-semibold text-white">
          Ready to diagnose your account.
        </div>
        <p className="max-w-md text-sm text-zinc-400">
          Gemini scores every ad, tells you what to scale and what to kill, and can
          rebuild your worst performers with one click.
        </p>
        <button
          onClick={onAnalyze}
          className="btn-gradient mt-3 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-glow"
        >
          <SparkleIcon />
          Analyze {platforms} platforms now
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Analysis complete
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-white md:text-3xl">
            The verdict.
          </h2>
        </div>
        <button
          onClick={onAnalyze}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-200 hover:bg-white/10"
        >
          Re-analyze
        </button>
      </div>

      <Insights data={insights} />

      <div className="flex flex-col items-center gap-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={onFixAndReplace}
            disabled={campaignsLoading}
            className="btn-gradient inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-glow disabled:opacity-70"
          >
            <WrenchIcon />
            {campaignsLoading ? "Building replacements..." : "Fix & Replace Weak Ads"}
          </button>
          <button
            onClick={onGenerateIdeas}
            disabled={ideasLoading}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-70"
          >
            <BoltIcon />
            {ideasLoading ? "Generating ideas..." : "Generate Better Ads"}
          </button>
        </div>
      </div>

      {campaignsLoading && (
        <div className="grid gap-5 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/5 bg-ink-800/60 p-6">
              <div className="shimmer h-4 w-1/3 rounded" />
              <div className="shimmer mt-4 h-6 w-2/3 rounded" />
              <div className="shimmer mt-6 h-24 w-full rounded" />
              <div className="shimmer mt-4 h-3 w-1/2 rounded" />
            </div>
          ))}
        </div>
      )}

      {campaigns && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Replacement campaigns</h3>
            <span className="text-xs text-zinc-500">
              {campaigns.length} new · ready to launch
            </span>
          </div>
          <ReplacementCampaigns campaigns={campaigns} onLaunched={handleLaunched} />
        </div>
      )}

      {ideas && ideas.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-semibold text-white">Fresh angles</h3>
          <GeneratedIdeas ideas={ideas} />
        </div>
      )}
    </div>
  );
}

function PlugIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 2v6M15 2v6M6 8h12v4a6 6 0 0 1-12 0V8Z" />
      <path d="M12 18v4" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2 3 14h7l-1 8 11-14h-7l1-6Z" />
    </svg>
  );
}

function WrenchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a4 4 0 0 0 5.4 5.4l.9.9-7.6 7.6a2.1 2.1 0 0 1-3-3l7.6-7.6-.9-.9a4 4 0 0 0-5.4-5.4l2.5 2.5-1.4 1.4-2.5-2.5a4 4 0 0 0 5.4 5.4Z" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 0 1-15.5 6.3L3 16M3 12a9 9 0 0 1 15.5-6.3L21 8" />
      <path d="M21 3v5h-5M3 21v-5h5" />
    </svg>
  );
}
