"use client";

import { useEffect, useState } from "react";

export function ScoreMeter({
  value,
  label,
  tone = "good",
  size = "md",
}: {
  value: number;
  label: string;
  tone?: "good" | "bad";
  size?: "sm" | "md" | "lg";
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const from = display;
    const to = Math.max(0, Math.min(100, value));
    const dur = 900;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const dim = size === "lg" ? 160 : size === "sm" ? 80 : 120;
  const stroke = size === "lg" ? 12 : size === "sm" ? 7 : 10;
  const r = (dim - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (display / 100) * c;
  const color = tone === "good" ? "#34d399" : "#fb7185";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="-rotate-90">
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={r}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={r}
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            style={{
              strokeDasharray: c,
              strokeDashoffset: offset,
              transition: "stroke-dashoffset 0.3s linear",
              filter: `drop-shadow(0 0 10px ${color}55)`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-bold tabular-nums text-white ${
              size === "lg" ? "text-4xl" : size === "sm" ? "text-xl" : "text-2xl"
            }`}
          >
            {display}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-zinc-500">
            / 100
          </span>
        </div>
      </div>
      <span className="text-xs font-medium text-zinc-400">{label}</span>
    </div>
  );
}
