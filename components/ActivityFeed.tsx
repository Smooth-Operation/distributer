export type ActivityEvent = {
  id: number;
  at: string;
  kind: "sync" | "analyze" | "launch" | "creative" | "chat";
  title: string;
  detail?: string;
};

const kindStyles: Record<ActivityEvent["kind"], string> = {
  sync: "bg-blue-500/15 text-blue-300 ring-blue-400/30",
  analyze: "bg-violet-500/15 text-violet-300 ring-violet-400/30",
  launch: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
  creative: "bg-pink-500/15 text-pink-300 ring-pink-400/30",
  chat: "bg-zinc-500/15 text-zinc-300 ring-zinc-400/30",
};

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  if (!events.length) return null;
  return (
    <aside className="surface p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Activity</h3>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-400">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/40" />
            <span className="relative block h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          live
        </span>
      </div>
      <ul className="mt-4 space-y-3 max-h-[360px] overflow-y-auto pr-1">
        {events
          .slice()
          .reverse()
          .map((e) => (
            <li key={e.id} className="flex gap-3 text-xs">
              <span
                className={`mt-0.5 inline-flex h-5 shrink-0 items-center rounded-full px-2 text-[10px] font-semibold uppercase tracking-widest ring-1 ring-inset ${kindStyles[e.kind]}`}
              >
                {e.kind}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-medium leading-snug text-zinc-100">
                  {e.title}
                </div>
                {e.detail && (
                  <div className="mt-0.5 truncate text-[11px] text-zinc-500">
                    {e.detail}
                  </div>
                )}
                <div className="mt-0.5 text-[10px] text-zinc-600 tabular-nums">
                  {new Date(e.at).toLocaleTimeString()}
                </div>
              </div>
            </li>
          ))}
      </ul>
    </aside>
  );
}
