"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { type Ad, statusFor } from "@/lib/mockAds";
import { PlatformIcon } from "./PlatformIcon";

type SortKey = "name" | "platform" | "ctr" | "cpc" | "conversions" | "spend" | "roas" | "status";

const STATUS_RANK = { strong: 0, "needs-work": 1, weak: 2 } as const;

export function AdsTable({ ads }: { ads: Ad[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("spend");
  const [dir, setDir] = useState<"asc" | "desc">("desc");

  const rows = useMemo(() => {
    const enriched = ads.map((a) => {
      const roas = a.conversions && a.spend ? (a.conversions * 42) / a.spend : 0;
      const cpa = a.conversions ? a.spend / a.conversions : Infinity;
      return { ad: a, roas, cpa, status: statusFor(a) };
    });
    const sign = dir === "asc" ? 1 : -1;
    return enriched.sort((a, b) => {
      switch (sortKey) {
        case "name":
          return sign * a.ad.name.localeCompare(b.ad.name);
        case "platform":
          return sign * a.ad.platform.localeCompare(b.ad.platform);
        case "ctr":
          return sign * (a.ad.ctr - b.ad.ctr);
        case "cpc":
          return sign * (a.ad.cpc - b.ad.cpc);
        case "conversions":
          return sign * (a.ad.conversions - b.ad.conversions);
        case "spend":
          return sign * (a.ad.spend - b.ad.spend);
        case "roas":
          return sign * (a.roas - b.roas);
        case "status":
          return sign * (STATUS_RANK[a.status] - STATUS_RANK[b.status]);
      }
    });
  }, [ads, sortKey, dir]);

  function sortBy(k: SortKey) {
    if (k === sortKey) setDir(dir === "asc" ? "desc" : "asc");
    else {
      setSortKey(k);
      setDir(k === "name" || k === "platform" ? "asc" : "desc");
    }
  }

  return (
    <div className="surface overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.015] px-5 py-3.5">
        <div>
          <h2 className="text-[15px] font-semibold tracking-tight text-white">All ads</h2>
          <p className="mt-0.5 text-[11px] text-zinc-500">
            {ads.length} rows · sorted by {sortKey} {dir === "asc" ? "↑" : "↓"}
          </p>
        </div>
        <span className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-zinc-400 md:inline-block">
          Click any row to diagnose & rewrite
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.015] text-left text-[11px] uppercase tracking-widest text-zinc-500">
              <Th onClick={() => sortBy("name")} active={sortKey === "name"} dir={dir}>
                Ad
              </Th>
              <Th onClick={() => sortBy("platform")} active={sortKey === "platform"} dir={dir}>
                Platform
              </Th>
              <Th right onClick={() => sortBy("ctr")} active={sortKey === "ctr"} dir={dir}>
                CTR
              </Th>
              <Th right onClick={() => sortBy("cpc")} active={sortKey === "cpc"} dir={dir}>
                CPC
              </Th>
              <Th right onClick={() => sortBy("conversions")} active={sortKey === "conversions"} dir={dir}>
                Conv.
              </Th>
              <Th right onClick={() => sortBy("spend")} active={sortKey === "spend"} dir={dir}>
                Spend
              </Th>
              <Th right onClick={() => sortBy("roas")} active={sortKey === "roas"} dir={dir}>
                ROAS
              </Th>
              <Th onClick={() => sortBy("status")} active={sortKey === "status"} dir={dir}>
                Status
              </Th>
              <th className="w-0" />
            </tr>
          </thead>
          <tbody>
            {rows.map(({ ad, roas, status }, i) => (
              <tr
                key={ad.id}
                className="group cursor-pointer border-b border-white/5 transition hover:bg-white/[0.04] animate-fade-up"
                style={{ animationDelay: `${i * 30}ms` }}
                onClick={() => (window.location.href = `/ad/${ad.id}`)}
              >
                <td className="px-5 py-4">
                  <Link
                    href={`/ad/${ad.id}`}
                    className="text-[15px] font-semibold text-white hover:text-violet-300"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {ad.name}
                  </Link>
                  <div className="mt-0.5 text-[11px] text-zinc-500 tabular-nums">
                    id: {ad.id} · 7d window
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="inline-flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/5 ring-1 ring-inset ring-white/10">
                      <PlatformIcon platform={ad.platform} className="h-4 w-4" />
                    </span>
                    <span className="text-sm text-zinc-200">{ad.platform}</span>
                  </div>
                </td>
                <Td right tone={ad.ctr >= 1.5 ? "good" : ad.ctr >= 0.8 ? "neutral" : "bad"}>
                  {ad.ctr.toFixed(2)}%
                </Td>
                <Td right tone={ad.cpc <= 0.8 ? "good" : ad.cpc <= 1.2 ? "neutral" : "bad"}>
                  ${ad.cpc.toFixed(2)}
                </Td>
                <Td right>{ad.conversions}</Td>
                <Td right>${ad.spend.toLocaleString()}</Td>
                <Td right tone={roas >= 2 ? "good" : roas >= 1 ? "neutral" : "bad"}>
                  {roas.toFixed(2)}x
                </Td>
                <td className="px-5 py-4">
                  <StatusChip status={status} />
                </td>
                <td className="pr-5 text-right text-zinc-500 opacity-0 transition group-hover:opacity-100">
                  →
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({
  children,
  right,
  onClick,
  active,
  dir,
}: {
  children: React.ReactNode;
  right?: boolean;
  onClick: () => void;
  active: boolean;
  dir: "asc" | "desc";
}) {
  return (
    <th
      onClick={onClick}
      className={`cursor-pointer select-none px-5 py-3 font-semibold transition hover:text-white ${
        right ? "text-right" : ""
      } ${active ? "text-white" : ""}`}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {active && <span className="text-[9px]">{dir === "asc" ? "▲" : "▼"}</span>}
      </span>
    </th>
  );
}

function Td({
  children,
  right,
  tone,
}: {
  children: React.ReactNode;
  right?: boolean;
  tone?: "good" | "bad" | "neutral";
}) {
  const color =
    tone === "good" ? "text-emerald-300" : tone === "bad" ? "text-rose-300" : "text-zinc-100";
  return (
    <td
      className={`px-5 py-4 font-semibold tabular-nums ${color} ${right ? "text-right" : ""}`}
    >
      {children}
    </td>
  );
}

function StatusChip({ status }: { status: "strong" | "weak" | "needs-work" }) {
  const map = {
    strong: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
    weak: "bg-rose-500/15 text-rose-300 ring-rose-400/30",
    "needs-work": "bg-amber-500/15 text-amber-300 ring-amber-400/30",
  } as const;
  const label = status === "needs-work" ? "Needs Work" : status === "strong" ? "Strong" : "Weak";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${map[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
