import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ads,
  statusFor,
  dailyFor,
  audienceFor,
  placementsFor,
} from "@/lib/mockAds";
import { configFor } from "@/lib/platforms";
import { PlatformBadge } from "@/components/PlatformBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { RewriteFlow } from "@/components/RewriteFlow";
import { ApiConsole } from "@/components/ApiConsole";
import { PlatformIcon } from "@/components/PlatformIcon";
import { DailyTable } from "@/components/DailyTable";
import { AudienceTable, PlacementsTable } from "@/components/BreakdownTables";

export default async function AdDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ad = ads.find((a) => a.id.toString() === id);
  if (!ad) notFound();

  const cfg = configFor(ad.platform);
  const status = statusFor(ad);
  const daily = dailyFor(ad, 7);
  const audience = audienceFor(ad);
  const placements = placementsFor(ad);
  const cpa = ad.conversions > 0 ? ad.spend / ad.conversions : null;
  const roas = ad.conversions && ad.spend ? (ad.conversions * 42) / ad.spend : 0;
  const ctrVsBench = ad.ctr - 1.5;

  return (
    <main className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] bg-radial-hero" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] grid-bg" />

      <div className="relative mx-auto max-w-7xl px-6 pb-32 pt-8">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-8 w-8">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-violet-500 via-pink-500 to-orange-400 blur-md opacity-70" />
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 via-pink-500 to-orange-400 text-sm font-bold text-white">
                A
              </div>
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">Ad Brain</span>
          </Link>
          <nav className="hidden gap-7 text-sm md:flex">
            <Link className="text-zinc-400 hover:text-white" href="/">
              Dashboard
            </Link>
          </nav>
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-zinc-300 to-zinc-500 ring-1 ring-white/10" />
        </header>

        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white"
        >
          ← All ads
        </Link>

        <section className="mt-4 overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-8 shadow-card">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <PlatformBadge platform={ad.platform} />
                <StatusBadge status={status} />
                <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-mono text-zinc-400 ring-1 ring-inset ring-white/10">
                  id: {ad.id}
                </span>
              </div>
              <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight text-white md:text-6xl">
                {ad.name}
              </h1>
              <div className="mt-3 flex items-center gap-2 text-sm text-zinc-500">
                <span
                  className="flex h-6 w-6 items-center justify-center rounded"
                  style={{ backgroundColor: `${cfg.color}26` }}
                >
                  <PlatformIcon platform={ad.platform} className="h-4 w-4" />
                </span>
                <span className="truncate font-mono text-xs">
                  {cfg.apiHost}/{cfg.apiVersion}
                  {cfg.endpoints.insights}?ad_id={ad.id}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-6">
            <BigMetric label="CTR" value={`${ad.ctr.toFixed(2)}%`} tone={ad.ctr >= 1.5 ? "good" : "bad"} delta={`${ctrVsBench >= 0 ? "+" : ""}${ctrVsBench.toFixed(2)}pp vs. bench`} />
            <BigMetric label="CPC" value={`$${ad.cpc.toFixed(2)}`} tone={ad.cpc <= 1 ? "good" : "bad"} />
            <BigMetric label="Conversions" value={ad.conversions.toString()} tone={ad.conversions >= 20 ? "good" : "bad"} />
            <BigMetric label="Spend" value={`$${ad.spend.toLocaleString()}`} />
            <BigMetric label="Cost / conv." value={cpa === null ? "—" : `$${cpa.toFixed(2)}`} tone={cpa !== null && cpa <= 20 ? "good" : "bad"} />
            <BigMetric label="ROAS" value={`${roas.toFixed(2)}x`} tone={roas >= 2 ? "good" : "bad"} />
          </div>
        </section>

        <section className="mt-8">
          <DailyTable rows={daily} />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <AudienceTable rows={audience} />
          <PlacementsTable rows={placements} />
        </section>

        <section className="mt-12">
          <div className="mb-4">
            <div className="text-[10px] uppercase tracking-widest text-violet-300">
              AI Rewrite
            </div>
            <h2 className="mt-1 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Diagnose & rebuild this ad
            </h2>
            <p className="mt-2 text-base text-zinc-400">
              Gemini streams in the diagnosis, writes 3 tone-varied rewrites, and lets you launch any variant to {cfg.brand} in one click.
            </p>
          </div>
          <RewriteFlow ad={ad} />
        </section>

        <section className="mt-12">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Live API console</h3>
              <p className="text-xs text-zinc-500">
                Every request to {cfg.brand} and Gemini — real-time
              </p>
            </div>
          </div>
          <ApiConsole />
        </section>
      </div>
    </main>
  );
}

function BigMetric({
  label,
  value,
  tone,
  delta,
}: {
  label: string;
  value: string;
  tone?: "good" | "bad" | "neutral";
  delta?: string;
}) {
  const color =
    tone === "good"
      ? "text-emerald-300"
      : tone === "bad"
      ? "text-rose-300"
      : "text-white";
  return (
    <div className="rounded-xl border border-white/5 bg-black/30 p-4">
      <div className="text-[10px] uppercase tracking-widest text-zinc-500">{label}</div>
      <div className={`mt-2 text-3xl font-bold tabular-nums md:text-4xl ${color}`}>
        {value}
      </div>
      {delta && <div className="mt-1 text-[11px] text-zinc-500">{delta}</div>}
    </div>
  );
}
