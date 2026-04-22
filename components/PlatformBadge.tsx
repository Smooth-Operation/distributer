import type { Platform } from "@/lib/mockAds";

const styles: Record<Platform, string> = {
  Facebook: "bg-blue-500/10 text-blue-300 ring-blue-400/30",
  Instagram: "bg-pink-500/10 text-pink-300 ring-pink-400/30",
  Pinterest: "bg-red-500/10 text-red-300 ring-red-400/30",
  TikTok: "bg-fuchsia-500/10 text-fuchsia-300 ring-fuchsia-400/30",
  Google: "bg-emerald-500/10 text-emerald-300 ring-emerald-400/30",
};

export function PlatformBadge({ platform }: { platform: Platform }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${styles[platform]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {platform}
    </span>
  );
}
