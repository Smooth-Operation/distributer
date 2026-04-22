export function AnalyzingState() {
  return (
    <div className="flex flex-col items-center gap-6 py-10">
      <div className="relative">
        <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-violet-500 via-pink-500 to-orange-400 blur-xl opacity-60 animate-pulse-slow" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-10 w-10 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        </div>
      </div>

      <div className="text-center">
        <p className="text-lg font-medium text-white">
          AI is analyzing your ads
          <Dots />
        </p>
        <p className="mt-1 text-sm text-zinc-400">
          Scoring creatives, funnels, and spend efficiency.
        </p>
      </div>

      <div className="mt-2 grid w-full max-w-3xl gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 w-full rounded-2xl border border-white/5 bg-ink-800/60 p-5"
          >
            <div className="shimmer h-4 w-1/3 rounded" />
            <div className="shimmer mt-3 h-3 w-full rounded" />
            <div className="shimmer mt-2 h-3 w-4/5 rounded" />
            <div className="shimmer mt-2 h-3 w-3/5 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

function Dots() {
  return (
    <span className="inline-flex ml-1 gap-1 align-middle">
      <span className="h-1.5 w-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="h-1.5 w-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: "120ms" }} />
      <span className="h-1.5 w-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: "240ms" }} />
    </span>
  );
}
