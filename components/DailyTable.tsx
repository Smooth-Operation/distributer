import type { DailyRow } from "@/lib/mockAds";

export function DailyTable({ rows }: { rows: DailyRow[] }) {
  const totals = rows.reduce(
    (acc, r) => {
      acc.impressions += r.impressions;
      acc.clicks += r.clicks;
      acc.conversions += r.conversions;
      acc.spend += r.spend;
      return acc;
    },
    { impressions: 0, clicks: 0, conversions: 0, spend: 0 }
  );
  const blendedCtr = totals.impressions ? (totals.clicks / totals.impressions) * 100 : 0;
  const blendedCpc = totals.clicks ? totals.spend / totals.clicks : 0;

  return (
    <div className="surface overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.015] px-5 py-3.5">
        <h3 className="text-[15px] font-semibold tracking-tight text-white">Daily performance · last 7 days</h3>
        <span className="text-[11px] text-zinc-500">
          Σ {totals.impressions.toLocaleString()} impr · {totals.clicks.toLocaleString()} clicks
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left text-[11px] uppercase tracking-widest text-zinc-500">
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3 text-right">Impressions</th>
              <th className="px-5 py-3 text-right">Clicks</th>
              <th className="px-5 py-3 text-right">CTR</th>
              <th className="px-5 py-3 text-right">CPC</th>
              <th className="px-5 py-3 text-right">Conv.</th>
              <th className="px-5 py-3 text-right">Spend</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.date} className="border-b border-white/5 hover:bg-white/[0.03]">
                <td className="px-5 py-3 font-mono text-[13px] text-zinc-300">{r.date}</td>
                <td className="px-5 py-3 text-right font-semibold tabular-nums text-zinc-100">
                  {r.impressions.toLocaleString()}
                </td>
                <td className="px-5 py-3 text-right font-semibold tabular-nums text-zinc-100">
                  {r.clicks.toLocaleString()}
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
                <td className="px-5 py-3 text-right font-semibold tabular-nums text-zinc-100">
                  ${r.spend}
                </td>
              </tr>
            ))}
            <tr className="bg-white/[0.03]">
              <td className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                Total / blended
              </td>
              <td className="px-5 py-3 text-right font-bold tabular-nums text-white">
                {totals.impressions.toLocaleString()}
              </td>
              <td className="px-5 py-3 text-right font-bold tabular-nums text-white">
                {totals.clicks.toLocaleString()}
              </td>
              <td className="px-5 py-3 text-right font-bold tabular-nums text-white">
                {blendedCtr.toFixed(2)}%
              </td>
              <td className="px-5 py-3 text-right font-bold tabular-nums text-white">
                ${blendedCpc.toFixed(2)}
              </td>
              <td className="px-5 py-3 text-right font-bold tabular-nums text-white">
                {totals.conversions}
              </td>
              <td className="px-5 py-3 text-right font-bold tabular-nums text-white">
                ${totals.spend}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
