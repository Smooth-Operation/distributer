"use client";

export type Toast = {
  id: number;
  title: string;
  detail?: string;
  tone?: "success" | "info" | "error";
};

export function Toasts({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="pointer-events-none fixed bottom-5 left-5 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex min-w-[240px] max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur animate-fade-up ${
            t.tone === "error"
              ? "border-rose-400/30 bg-rose-500/10 text-rose-100"
              : t.tone === "info"
              ? "border-white/10 bg-white/5 text-zinc-100"
              : "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
          }`}
        >
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold">{t.title}</div>
            {t.detail && <div className="mt-0.5 text-xs opacity-80">{t.detail}</div>}
          </div>
          <button
            onClick={() => onDismiss(t.id)}
            className="rounded-full p-1 text-current/80 opacity-70 hover:opacity-100"
            aria-label="Dismiss"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
