export type InsightPayload = {
  scale: string[];
  fix: string[];
  kill: string[];
  opportunities: string[];
};

const sections: Array<{
  key: keyof InsightPayload;
  title: string;
  tone: "scale" | "fix" | "kill" | "ops";
}> = [
  { key: "scale", title: "Scale", tone: "scale" },
  { key: "fix", title: "Fix", tone: "fix" },
  { key: "kill", title: "Kill", tone: "kill" },
  { key: "opportunities", title: "Opportunities", tone: "ops" },
];

const toneStyles: Record<
  "scale" | "fix" | "kill" | "ops",
  { dot: string; label: string; ring: string }
> = {
  scale: { dot: "bg-emerald-400", label: "text-emerald-300", ring: "ring-emerald-400/25" },
  fix: { dot: "bg-amber-400", label: "text-amber-300", ring: "ring-amber-400/25" },
  kill: { dot: "bg-rose-400", label: "text-rose-300", ring: "ring-rose-400/25" },
  ops: { dot: "bg-violet-400", label: "text-violet-300", ring: "ring-violet-400/25" },
};

export function Insights({ data }: { data: InsightPayload }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {sections.map((s, i) => {
        const t = toneStyles[s.tone];
        const items = data[s.key] ?? [];
        return (
          <div
            key={s.key}
            className={`surface-hover relative overflow-hidden p-6 ring-1 ring-inset ${t.ring} animate-fade-up`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className={`h-2 w-2 rounded-full ${t.dot}`} />
                <span
                  className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${t.label}`}
                >
                  {s.title}
                </span>
              </div>
              <span className="text-[11px] font-medium text-zinc-500 tabular-nums">
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            </div>

            <ul className="mt-4 space-y-2.5">
              {items.map((item, idx) => (
                <li
                  key={idx}
                  className="flex gap-3 text-[14px] leading-relaxed text-zinc-100"
                >
                  <span className={`mt-[9px] h-1 w-1 flex-none rounded-full ${t.dot}`} />
                  <span>{item}</span>
                </li>
              ))}
              {items.length === 0 && (
                <li className="text-[13px] text-zinc-500">Nothing worth flagging here.</li>
              )}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
