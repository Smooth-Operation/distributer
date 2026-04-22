"use client";

export function DemoNarrator({
  active,
  step,
  total,
  title,
  detail,
  onSkip,
}: {
  active: boolean;
  step: number;
  total: number;
  title: string;
  detail: string;
  onSkip: () => void;
}) {
  if (!active) return null;
  return (
    <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div
        className="surface flex max-w-xl items-center gap-4 px-5 py-3 animate-scale-in ring-1 ring-inset ring-violet-400/30"
        style={{ backdropFilter: "blur(22px) saturate(160%)" }}
      >
        <div className="relative">
          <span className="absolute inset-0 animate-ping rounded-full bg-violet-400/40" />
          <span className="relative block h-2 w-2 rounded-full bg-violet-400" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-violet-300">
              Demo · {step}/{total}
            </span>
            <span className="text-[13px] font-semibold text-white">{title}</span>
          </div>
          <div className="mt-0.5 text-[12px] leading-relaxed text-zinc-300">
            {detail}
          </div>
        </div>
        <button
          onClick={onSkip}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-zinc-300 hover:bg-white/10"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
