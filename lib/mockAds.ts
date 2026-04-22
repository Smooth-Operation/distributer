export type Platform = "Facebook" | "Instagram" | "Pinterest" | "TikTok" | "Google";

export type Ad = {
  id: number;
  name: string;
  platform: Platform;
  ctr: number;
  cpc: number;
  conversions: number;
  spend: number;
};

export const ads: Ad[] = [
  {
    id: 1,
    name: "Gym Transformation",
    platform: "Facebook",
    ctr: 1.2,
    cpc: 0.8,
    conversions: 12,
    spend: 480,
  },
  {
    id: 2,
    name: "Luxury Watch Angle",
    platform: "Pinterest",
    ctr: 0.4,
    cpc: 1.5,
    conversions: 3,
    spend: 620,
  },
  {
    id: 3,
    name: "Before / After Fitness",
    platform: "Facebook",
    ctr: 3.5,
    cpc: 0.3,
    conversions: 45,
    spend: 310,
  },
  {
    id: 4,
    name: "Travel Lifestyle",
    platform: "Instagram",
    ctr: 0.9,
    cpc: 1.2,
    conversions: 7,
    spend: 540,
  },
  {
    id: 5,
    name: "Unboxing Hook",
    platform: "TikTok",
    ctr: 4.1,
    cpc: 0.22,
    conversions: 58,
    spend: 260,
  },
  {
    id: 6,
    name: "Generic Product Shot",
    platform: "Google",
    ctr: 0.2,
    cpc: 2.1,
    conversions: 1,
    spend: 410,
  },
];

export type Status = "strong" | "weak" | "needs-work";

export function statusFor(ad: Ad): Status {
  const score = ad.ctr * 2 + ad.conversions * 0.1 - ad.cpc;
  if (score >= 5) return "strong";
  if (score <= 1) return "weak";
  return "needs-work";
}

export type DailyRow = {
  date: string;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  conversions: number;
  spend: number;
};

export function dailyFor(ad: Ad, days = 7): DailyRow[] {
  const rows: DailyRow[] = [];
  const seed = ad.id * 131;
  for (let i = days - 1; i >= 0; i--) {
    const jitter = (((i * 37 + seed) % 100) / 100 - 0.5) * 0.35;
    const ctr = Math.max(0.05, ad.ctr * (1 + jitter));
    const cpc = Math.max(0.05, ad.cpc * (1 + jitter * 0.4));
    const spendDay = Math.round((ad.spend / days) * (1 + jitter * 0.3));
    const clicks = Math.round(spendDay / cpc);
    const impressions = Math.round((clicks / Math.max(0.05, ctr)) * 100);
    const conv = Math.max(0, Math.round((ad.conversions / days) * (1 + jitter * 0.4)));
    const d = new Date();
    d.setDate(d.getDate() - i);
    rows.push({
      date: d.toISOString().slice(0, 10),
      impressions,
      clicks,
      ctr: Number(ctr.toFixed(2)),
      cpc: Number(cpc.toFixed(2)),
      conversions: conv,
      spend: spendDay,
    });
  }
  return rows;
}

export type AudienceRow = {
  segment: string;
  share: number;
  ctr: number;
  cpc: number;
  conversions: number;
};

export function audienceFor(ad: Ad): AudienceRow[] {
  const base = ad.ctr;
  const b = ad.cpc;
  const c = ad.conversions;
  return [
    { segment: "25-34 · Male", share: 0.32, ctr: +(base * 1.25).toFixed(2), cpc: +(b * 0.9).toFixed(2), conversions: Math.round(c * 0.35) },
    { segment: "25-34 · Female", share: 0.18, ctr: +(base * 0.85).toFixed(2), cpc: +(b * 1.1).toFixed(2), conversions: Math.round(c * 0.18) },
    { segment: "35-44 · Male", share: 0.22, ctr: +(base * 1.05).toFixed(2), cpc: +(b * 0.95).toFixed(2), conversions: Math.round(c * 0.22) },
    { segment: "35-44 · Female", share: 0.12, ctr: +(base * 0.7).toFixed(2), cpc: +(b * 1.2).toFixed(2), conversions: Math.round(c * 0.1) },
    { segment: "18-24 · Mixed", share: 0.1, ctr: +(base * 1.4).toFixed(2), cpc: +(b * 0.75).toFixed(2), conversions: Math.round(c * 0.1) },
    { segment: "45+ · Mixed", share: 0.06, ctr: +(base * 0.5).toFixed(2), cpc: +(b * 1.4).toFixed(2), conversions: Math.round(c * 0.05) },
  ];
}

export type PlacementRow = {
  placement: string;
  impressions: number;
  ctr: number;
  cpc: number;
  conversions: number;
};

export function placementsFor(ad: Ad): PlacementRow[] {
  const baseImp = 18000 + ad.id * 1400;
  return [
    { placement: "Feed",     impressions: Math.round(baseImp * 0.55), ctr: +(ad.ctr * 1.1).toFixed(2), cpc: +(ad.cpc * 0.95).toFixed(2), conversions: Math.round(ad.conversions * 0.5) },
    { placement: "Stories",  impressions: Math.round(baseImp * 0.22), ctr: +(ad.ctr * 0.85).toFixed(2), cpc: +(ad.cpc * 1.05).toFixed(2), conversions: Math.round(ad.conversions * 0.2) },
    { placement: "Reels",    impressions: Math.round(baseImp * 0.18), ctr: +(ad.ctr * 1.3).toFixed(2), cpc: +(ad.cpc * 0.8).toFixed(2),  conversions: Math.round(ad.conversions * 0.25) },
    { placement: "Search",   impressions: Math.round(baseImp * 0.05), ctr: +(ad.ctr * 0.6).toFixed(2), cpc: +(ad.cpc * 1.3).toFixed(2), conversions: Math.round(ad.conversions * 0.05) },
  ];
}
