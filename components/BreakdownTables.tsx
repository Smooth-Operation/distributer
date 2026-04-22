import type { AudienceRow, PlacementRow } from "@/lib/mockAds";

export function AudienceTable({ rows }: { rows: AudienceRow[] }) {
  return (
    <div className="overflow-hidden surface">
      <div className="border-b border-white/[0.06] bg-white/[0.015] px-5 py-3">
        <h3 className="text-base font-semibold text-white">Audience breakdown</h3>
        <p className="text-xs text-zinc-500">Share of spend · performance by segment</p>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/5 text-left text-[11px] uppercase tracking-widest text-zinc-500">
            <th className="px-5 py-3">Segment</th>
            <th className="px-5 py-3">Share</th>
            <th className="px-5 py-3 text-right">CTR</th>
            <th className="px-5 py-3 text-right">CPC</th>
            <th className="px-5 py-3 text-right">Conv.</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.segment} className="border-b border-white/5 hover:bg-white/[0.03]">
              <td className="px-5 py-3 font-semibold text-zinc-100">{r.segment}</td>
              <td className="px-5 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-400 to-pink-400"
                      style={{ width: `${Math.round(r.share * 100)}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-xs tabular-nums text-zinc-400">
                    {Math.round(r.share * 100)}%
                  </span>
                </div>
              </td>
              <td
                className={`px-5 py-3 text-right font-semibold tabular-nums ${
                  r.ctr >= 1.5 ? "text-emerald-300" : r.ctr >= 0.8 ? "text-zinc-100" : "text-rose-300"
                }`}
              >
                {r.ctr.toFixed(2)}%
              </td>
              <td
                className={`px-5 py-3 text-right font-semibold tabular-nums ${
                  r.cpc <= 0.8 ? "text-emerald-300" : r.cpc <= 1.2 ? "text-zinc-100" : "text-rose-300"
                }`}
              >
                ${r.cpc.toFixed(2)}
              </td>
              <td className="px-5 py-3 text-right font-semibold tabular-nums text-zinc-100">
                {r.conversions}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PlacementsTable({ rows }: { rows: PlacementRow[] }) {
  return (
    <div className="overflow-hidden surface">
      <div className="border-b border-white/[0.06] bg-white/[0.015] px-5 py-3">
        <h3 className="text-base font-semibold text-white">Placement breakdown</h3>
        <p className="text-xs text-zinc-500">Where your ad is running</p>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/5 text-left text-[11px] uppercase tracking-widest text-zinc-500">
            <th className="px-5 py-3">Placement</th>
            <th className="px-5 py-3 text-right">Impressions</th>
            <th className="px-5 py-3 text-right">CTR</th>
            <th className="px-5 py-3 text-right">CPC</th>
            <th className="px-5 py-3 text-right">Conv.</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.placement} className="border-b border-white/5 hover:bg-white/[0.03]">
              <td className="px-5 py-3 font-semibold text-zinc-100">{r.placement}</td>
              <td className="px-5 py-3 text-right font-semibold tabular-nums text-zinc-100">
                {r.impressions.toLocaleString()}
              </td>
              <td
                className={`px-5 py-3 text-right font-semibold tabular-nums ${
                  r.ctr >= 1.5 ? "text-emerald-300" : r.ctr >= 0.8 ? "text-zinc-100" : "text-rose-300"
                }`}
              >
                {r.ctr.toFixed(2)}%
              </td>
              <td
                className={`px-5 py-3 text-right font-semibold tabular-nums ${
                  r.cpc <= 0.8 ? "text-emerald-300" : r.cpc <= 1.2 ? "text-zinc-100" : "text-rose-300"
                }`}
              >
                ${r.cpc.toFixed(2)}
              </td>
              <td className="px-5 py-3 text-right font-semibold tabular-nums text-zinc-100">
                {r.conversions}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
