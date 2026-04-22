"use client";

import { PLATFORMS, type PlatformConfig } from "@/lib/platforms";
import { PlatformIcon } from "./PlatformIcon";

export type ConnectorStatus = "disconnected" | "connecting" | "connected" | "error";

export function PlatformConnector({
  statuses,
  onReconnect,
}: {
  statuses: Record<string, ConnectorStatus>;
  onReconnect?: (p: PlatformConfig) => void;
}) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Connected platforms</h2>
          <p className="text-sm text-zinc-500">
            Live accounts · OAuth tokens · rate-limited per provider
          </p>
        </div>
        <span className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300 md:inline-block">
          {Object.values(statuses).filter((s) => s === "connected").length} /{" "}
          {PLATFORMS.length} online
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {PLATFORMS.map((p, i) => {
          const s = statuses[p.platform] ?? "disconnected";
          const pct = Math.min(100, (p.rateLimit.used / p.rateLimit.max) * 100);
          return (
            <div
              key={p.platform}
              className="surface relative overflow-hidden p-5 animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div
                className={`pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gradient-to-br ${p.tint} blur-3xl`}
              />

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-inset ring-white/10"
                    style={{ backgroundColor: `${p.color}26` }}
                  >
                    <PlatformIcon
                      platform={p.platform}
                      className="h-6 w-6"
                    />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{p.brand}</div>
                    <div className="text-[11px] text-zinc-500 font-mono">
                      {p.apiHost}/{p.apiVersion}
                    </div>
                  </div>
                </div>
                <StatusPill status={s} />
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 text-[11px]">
                <Field label="Account" value={p.accountId} mono />
                <Field label="Token" value={p.tokenPreview} mono />
              </dl>

              <div className="mt-4">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-zinc-500">
                  <span>Rate limit · {p.rateLimit.window}</span>
                  <span className="font-mono text-zinc-400">
                    {p.rateLimit.used}/{p.rateLimit.max}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      background:
                        pct > 80
                          ? "linear-gradient(90deg,#fb7185,#f97316)"
                          : pct > 50
                          ? "linear-gradient(90deg,#fbbf24,#84cc16)"
                          : "linear-gradient(90deg,#34d399,#22d3ee)",
                    }}
                  />
                </div>
              </div>

              <details className="mt-4 text-[11px]">
                <summary className="cursor-pointer text-zinc-400 hover:text-white">
                  Endpoints
                </summary>
                <ul className="mt-2 space-y-1 font-mono text-zinc-500">
                  <li>
                    <span className="mr-2 rounded bg-emerald-500/20 px-1 text-[9px] text-emerald-300">
                      GET
                    </span>
                    {p.endpoints.list}
                  </li>
                  <li>
                    <span className="mr-2 rounded bg-blue-500/20 px-1 text-[9px] text-blue-300">
                      POST
                    </span>
                    {p.endpoints.create}
                  </li>
                  <li>
                    <span className="mr-2 rounded bg-emerald-500/20 px-1 text-[9px] text-emerald-300">
                      GET
                    </span>
                    {p.endpoints.insights}
                  </li>
                </ul>
              </details>

              {onReconnect && (
                <button
                  onClick={() => onReconnect(p)}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-zinc-200 hover:bg-white/10"
                >
                  <RefreshIcon />
                  Reconnect
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function StatusPill({ status }: { status: ConnectorStatus }) {
  const map = {
    connected: {
      cls: "bg-emerald-500/10 text-emerald-300 ring-emerald-400/30",
      dot: "bg-emerald-400 animate-pulse-slow",
      label: "Connected",
    },
    connecting: {
      cls: "bg-amber-500/10 text-amber-300 ring-amber-400/30",
      dot: "bg-amber-400 animate-pulse",
      label: "Connecting",
    },
    disconnected: {
      cls: "bg-white/5 text-zinc-400 ring-white/10",
      dot: "bg-zinc-500",
      label: "Offline",
    },
    error: {
      cls: "bg-rose-500/10 text-rose-300 ring-rose-400/30",
      dot: "bg-rose-400",
      label: "Error",
    },
  } as const;
  const s = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium ring-1 ring-inset ${s.cls}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-[9px] uppercase tracking-widest text-zinc-600">{label}</dt>
      <dd className={`mt-0.5 truncate text-zinc-200 ${mono ? "font-mono text-[11px]" : ""}`}>
        {value}
      </dd>
    </div>
  );
}

function RefreshIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 0 1-15.5 6.3L3 16M3 12a9 9 0 0 1 15.5-6.3L21 8" />
      <path d="M21 3v5h-5M3 21v-5h5" />
    </svg>
  );
}
