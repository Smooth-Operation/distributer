export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="surface overflow-hidden">
      <div className="border-b border-white/5 bg-white/[0.02] px-5 py-3">
        <div className="shimmer h-4 w-40 rounded" />
        <div className="shimmer mt-1.5 h-3 w-56 rounded" />
      </div>
      <div className="divide-y divide-white/5">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] items-center gap-4 px-5 py-4"
          >
            <div>
              <div className="shimmer h-4 w-3/4 rounded" />
              <div className="shimmer mt-1 h-2.5 w-1/3 rounded" />
            </div>
            <div className="shimmer h-5 w-16 rounded" />
            <div className="shimmer h-4 w-10 justify-self-end rounded" />
            <div className="shimmer h-4 w-12 justify-self-end rounded" />
            <div className="shimmer h-4 w-8 justify-self-end rounded" />
            <div className="shimmer h-4 w-14 justify-self-end rounded" />
            <div className="shimmer h-4 w-10 justify-self-end rounded" />
            <div className="shimmer h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
