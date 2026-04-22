"use client";

export type AdPreviewData = {
  platform: string;
  headline: string;
  primaryText: string;
  cta: string;
  tone?: string;
};

export function AdPreview({
  data,
  variant = "after",
}: {
  data: AdPreviewData;
  variant?: "before" | "after";
}) {
  const dim = variant === "before";
  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border shadow-card ${
        dim
          ? "border-rose-400/20 bg-rose-500/[0.03]"
          : "border-emerald-400/20 bg-gradient-to-b from-emerald-500/[0.04] to-transparent"
      }`}
    >
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-2.5">
        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-violet-400 to-pink-400" />
        <div className="flex-1">
          <div className="text-[11px] font-semibold text-white">Your Brand</div>
          <div className="text-[10px] text-zinc-500">
            {data.platform} · Sponsored
          </div>
        </div>
        <MoreDotsIcon />
      </div>

      <div
        className={`relative aspect-[5/4] w-full ${
          dim ? "bg-gradient-to-br from-zinc-700 to-zinc-900" : "bg-gradient-to-br from-violet-600 via-pink-600 to-orange-400"
        }`}
      >
        <div className="absolute inset-0 flex items-end p-5">
          <div className="text-white">
            <div className={`text-[10px] uppercase tracking-widest ${dim ? "text-zinc-400" : "text-white/80"}`}>
              {data.tone ?? (dim ? "Original" : "Rewrite")}
            </div>
            <div
              className={`mt-1 font-bold leading-tight ${
                dim ? "text-xl text-zinc-200" : "text-2xl"
              }`}
            >
              {data.headline || " "}
            </div>
          </div>
        </div>
        {!dim && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        )}
      </div>

      <div className="px-4 py-3">
        <p
          className={`text-[13px] leading-relaxed ${
            dim ? "text-zinc-400" : "text-zinc-100"
          }`}
        >
          {data.primaryText || " "}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500">
            yourbrand.com
          </span>
          <span
            className={`rounded-md px-3 py-1.5 text-[11px] font-semibold ${
              dim ? "bg-white/10 text-zinc-300" : "bg-white text-black"
            }`}
          >
            {data.cta || "Learn More"}
          </span>
        </div>
      </div>
    </div>
  );
}

function MoreDotsIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="text-zinc-600"
    >
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  );
}
