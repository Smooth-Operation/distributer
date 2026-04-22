export type SyncStep = {
  label: string;
  state: "pending" | "active" | "done";
};

export function SyncProgress({ steps }: { steps: SyncStep[] }) {
  return (
    <div className="surface mx-auto max-w-xl p-5 animate-scale-in">
      <div className="flex items-center gap-2 border-b border-white/5 pb-3">
        <div className="relative">
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/30" />
          <span className="relative block h-2 w-2 rounded-full bg-emerald-400" />
        </div>
        <span className="text-xs font-medium uppercase tracking-widest text-zinc-400">
          Live sync in progress
        </span>
      </div>

      <ul className="mt-4 space-y-3">
        {steps.map((s, i) => (
          <li key={i} className="flex items-center gap-3 text-sm">
            <StepIcon state={s.state} />
            <span
              className={
                s.state === "done"
                  ? "text-zinc-200"
                  : s.state === "active"
                  ? "text-white"
                  : "text-zinc-500"
              }
            >
              {s.label}
            </span>
            {s.state === "active" && (
              <span className="ml-auto inline-flex gap-1">
                <Dot delay={0} />
                <Dot delay={120} />
                <Dot delay={240} />
              </span>
            )}
            {s.state === "done" && (
              <span className="ml-auto text-[10px] font-semibold uppercase tracking-widest text-emerald-400">
                OK
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function StepIcon({ state }: { state: SyncStep["state"] }) {
  if (state === "done") {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 ring-1 ring-inset ring-emerald-400/40">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-emerald-300"
        >
          <path d="M5 12l5 5L20 7" />
        </svg>
      </span>
    );
  }
  if (state === "active") {
    return (
      <span className="flex h-5 w-5 items-center justify-center">
        <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </span>
    );
  }
  return (
    <span className="flex h-5 w-5 items-center justify-center">
      <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
    </span>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="h-1 w-1 rounded-full bg-white animate-bounce"
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}
