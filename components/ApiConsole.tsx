"use client";

import { useEffect, useRef, useState } from "react";
import { subscribeLog, type LogEntry } from "@/lib/logBus";

export function ApiConsole({ maxEntries = 120 }: { maxEntries?: number }) {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return subscribeLog((e) => {
      setEntries((prev) => {
        const next = [...prev, e];
        return next.length > maxEntries ? next.slice(-maxEntries) : next;
      });
    });
  }, [maxEntries]);

  useEffect(() => {
    if (autoScroll && scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }
  }, [entries, autoScroll]);

  return (
    <section className="overflow-hidden rounded-[16px] border border-white/10 bg-[#070809]/90 shadow-card backdrop-blur">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] bg-white/[0.015] px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          </div>
          <span className="font-mono text-[11px] text-zinc-400">
            ad-brain · api console
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-zinc-500">
          <label className="flex cursor-pointer items-center gap-1.5">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="h-3 w-3 accent-violet-400"
            />
            autoscroll
          </label>
          <button
            onClick={() => setEntries([])}
            className="rounded border border-white/10 px-2 py-0.5 hover:bg-white/5"
          >
            clear
          </button>
          <span className="font-mono">
            {entries.length} req
          </span>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="h-[260px] overflow-y-auto px-4 py-3 font-mono text-[11px] leading-relaxed"
      >
        {entries.length === 0 ? (
          <div className="text-zinc-600">
            {"> "}waiting for requests...{" "}
            <span className="animate-pulse">█</span>
          </div>
        ) : (
          <ul className="space-y-1">
            {entries.map((e) => (
              <li key={e.id} className="flex gap-2 animate-fade-up">
                <span className="shrink-0 text-zinc-600">
                  {new Date(e.at).toLocaleTimeString(undefined, { hour12: false })}
                </span>
                <span
                  className={`shrink-0 rounded px-1.5 text-[10px] font-semibold ${methodColor(
                    e.method
                  )}`}
                >
                  {e.method}
                </span>
                <span className="truncate text-zinc-300">
                  <span className="text-zinc-500">{e.host}</span>
                  {e.path}
                </span>
                <span className="ml-auto flex shrink-0 gap-2 text-[10px]">
                  <span className={statusColor(e.status)}>{e.status}</span>
                  <span className="text-zinc-500 tabular-nums">{e.latencyMs}ms</span>
                  <span className="text-zinc-600 tabular-nums">{formatBytes(e.bytes)}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function methodColor(m: LogEntry["method"]) {
  switch (m) {
    case "GET":
      return "bg-emerald-500/15 text-emerald-300";
    case "POST":
      return "bg-blue-500/15 text-blue-300";
    case "PATCH":
      return "bg-amber-500/15 text-amber-300";
    case "DELETE":
      return "bg-rose-500/15 text-rose-300";
  }
}

function statusColor(s: number) {
  if (s >= 500) return "text-rose-300";
  if (s >= 400) return "text-amber-300";
  if (s >= 300) return "text-blue-300";
  return "text-emerald-300";
}

function formatBytes(b: number) {
  if (b < 1024) return `${b}B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)}KB`;
  return `${(b / 1024 / 1024).toFixed(2)}MB`;
}
