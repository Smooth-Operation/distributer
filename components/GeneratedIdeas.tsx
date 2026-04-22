export type AdIdea = {
  headline: string;
  angle: string;
  platform?: string;
};

export function GeneratedIdeas({ ideas }: { ideas: AdIdea[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {ideas.map((idea, i) => (
        <div
          key={i}
          className="surface-hover relative overflow-hidden p-6 animate-fade-up"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-300">
              Idea {String(i + 1).padStart(2, "0")}
            </span>
            {idea.platform && (
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                {idea.platform}
              </span>
            )}
          </div>
          <h4 className="mt-3 text-[15px] font-semibold leading-snug text-white">
            {idea.headline}
          </h4>
          <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">{idea.angle}</p>
        </div>
      ))}
    </div>
  );
}
