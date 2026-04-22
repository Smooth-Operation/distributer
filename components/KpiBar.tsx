import type { Ad } from "@/lib/mockAds";

type Kpi = {
  label: string;
  value: string;
  sub?: string;
  accent?: "good" | "bad" | "neutral";
  spark?: number[];
};

export function KpiBar({ ads }: { ads: Ad[] }) {
  const spend = ads.reduce((a, b) => a + b.spend, 0);
  const conv = ads.reduce((a, b) => a + b.conversions, 0);
  const avgCtr = ads.length ? ads.reduce((a, b) => a + b.ctr, 0) / ads.length : 0;
  const avgCpc = ads.length ? ads.reduce((a, b) => a + b.cpc, 0) / ads.length : 0;
  const roas = conv && spend ? (conv * 42) / spend : 0;

  const spark = (n: number, amp = 0.25) =>
    Array.from({ length: 14 }).map((_, i) => {
      const base = 0.5 + Math.sin((i + n) * 0.7) * amp;
      const jitter = (((i * 131 + n * 17) % 37) / 37 - 0.5) * 0.2;
      return Math.max(0.05, Math.min(0.95, base + jitter));
    });

  const items: Kpi[] = [
    { label: "Ad spend", value: `$${spend.toLocaleString()}`, sub: "last 7d", accent: "neutral", spark: spark(1) },
    { label: "Conversions", value: conv.toString(), sub: `+${Math.round(conv * 0.14)} vs last wk`, accent: "good", spark: spark(3, 0.3) },
    { label: "Avg. CTR", value: `${avgCtr.toFixed(2)}%`, sub: "across platforms", accent: avgCtr >= 1.5 ? "good" : "bad", spark: spark(5, 0.35) },
    { label: "Avg. CPC", value: `$${avgCpc.toFixed(2)}`, sub: "blended", accent: avgCpc <= 1 ? "good" : "bad", spark: spark(7, 0.2) },
    { label: "ROAS", value: `${roas.toFixed(2)}x`, sub: "projected", accent: roas >= 2 ? "good" : "bad", spark: spark(9, 0.4) },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      {items.map((k, i) => (
        <div
          key={k.label}
          className="surface relative overflow-hidden p-4 animate-fade-up"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              {k.label}
            </span>
            <AccentDot accent={k.accent} />
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="text-[26px] font-semibold tracking-tight text-white tabular-nums">
              {k.value}
            </span>
          </div>
          {k.sub && <div className="mt-0.5 text-[11px] text-zinc-500">{k.sub}</div>}
          {k.spark && <Sparkline points={k.spark} accent={k.accent} />}
        </div>
      ))}
    </div>
  );
}

function AccentDot({ accent }: { accent?: "good" | "bad" | "neutral" }) {
  const cls =
    accent === "good"
      ? "bg-emerald-400"
      : accent === "bad"
      ? "bg-rose-400"
      : "bg-zinc-500";
  return <span className={`h-1.5 w-1.5 rounded-full ${cls}`} />;
}

function Sparkline({ points, accent }: { points: number[]; accent?: "good" | "bad" | "neutral" }) {
  const w = 120;
  const h = 28;
  const step = w / (points.length - 1);
  const d = points
    .map((v, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${((1 - v) * h).toFixed(1)}`)
    .join(" ");
  const stroke =
    accent === "good" ? "#34d399" : accent === "bad" ? "#fb7185" : "#a78bfa";
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`g-${stroke}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L${w},${h} L0,${h} Z`} fill={`url(#g-${stroke})`} />
      <path d={d} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
