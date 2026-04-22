"use client";

import { useEffect, useState } from "react";

type Stats = {
  saved: number;
  adsAnalyzed: number;
  roasLift: number;
};

export function RoiTicker({ base }: { base: Stats }) {
  const [stats, setStats] = useState<Stats>(base);

  useEffect(() => {
    const id = setInterval(() => {
      setStats((s) => ({
        saved: s.saved + Math.floor(Math.random() * 7),
        adsAnalyzed: s.adsAnalyzed + (Math.random() > 0.85 ? 1 : 0),
        roasLift: s.roasLift,
      }));
    }, 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="surface flex items-center justify-between gap-4 overflow-hidden px-5 py-3">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/50" />
          <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-400">
          Live
        </span>
      </div>
      <Stat label="Saved this week" value={`$${stats.saved.toLocaleString()}`} tone="good" />
      <Stat label="Ads analyzed" value={stats.adsAnalyzed.toLocaleString()} />
      <Stat label="Avg. ROAS lift" value={`+${stats.roasLift.toFixed(1)}x`} tone="good" />
      <Stat label="Platforms" value="5" />
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "good";
}) {
  return (
    <div className="flex items-baseline gap-2 overflow-hidden">
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </span>
      <span
        key={value}
        className={`animate-ticker text-base font-semibold tabular-nums tracking-tight ${
          tone === "good" ? "text-emerald-300" : "text-white"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
