import type { Status } from "@/lib/mockAds";

const map: Record<Status, { label: string; cls: string; dot: string }> = {
  strong: {
    label: "Strong",
    cls: "bg-emerald-500/10 text-emerald-300 ring-emerald-400/30",
    dot: "bg-emerald-400",
  },
  weak: {
    label: "Weak",
    cls: "bg-rose-500/10 text-rose-300 ring-rose-400/30",
    dot: "bg-rose-400",
  },
  "needs-work": {
    label: "Needs Work",
    cls: "bg-amber-500/10 text-amber-300 ring-amber-400/30",
    dot: "bg-amber-400",
  },
};

export function StatusBadge({ status }: { status: Status }) {
  const s = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${s.cls}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot} animate-pulse-slow`} />
      {s.label}
    </span>
  );
}
