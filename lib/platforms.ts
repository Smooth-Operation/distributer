import type { Platform } from "./mockAds";

export type PlatformConfig = {
  platform: Platform;
  brand: string;
  color: string;
  tint: string;
  apiHost: string;
  apiVersion: string;
  accountId: string;
  tokenPreview: string;
  rateLimit: { used: number; max: number; window: string };
  endpoints: {
    list: string;
    create: string;
    insights: string;
  };
};

export const PLATFORMS: PlatformConfig[] = [
  {
    platform: "Facebook",
    brand: "Meta Ads",
    color: "#1877F2",
    tint: "from-blue-500/20 to-blue-500/0",
    apiHost: "graph.facebook.com",
    apiVersion: "v21.0",
    accountId: "act_8820113145",
    tokenPreview: "EAAG•••••••••x7Qz",
    rateLimit: { used: 128, max: 600, window: "1h" },
    endpoints: {
      list: "/act_8820113145/ads",
      create: "/act_8820113145/adcreatives",
      insights: "/act_8820113145/insights",
    },
  },
  {
    platform: "Instagram",
    brand: "Instagram Ads",
    color: "#E4405F",
    tint: "from-pink-500/20 to-pink-500/0",
    apiHost: "graph.facebook.com",
    apiVersion: "v21.0",
    accountId: "act_8820113145",
    tokenPreview: "IGQW•••••••••n0Mp",
    rateLimit: { used: 54, max: 400, window: "1h" },
    endpoints: {
      list: "/act_8820113145/ads?fields=instagram_actor_id",
      create: "/act_8820113145/adcreatives",
      insights: "/act_8820113145/insights?level=ad",
    },
  },
  {
    platform: "TikTok",
    brand: "TikTok for Business",
    color: "#FF0050",
    tint: "from-fuchsia-500/20 to-fuchsia-500/0",
    apiHost: "business-api.tiktok.com",
    apiVersion: "v1.3",
    accountId: "7218449201",
    tokenPreview: "tt_••••••••m2Kl",
    rateLimit: { used: 92, max: 500, window: "1m" },
    endpoints: {
      list: "/open_api/v1.3/ad/get/",
      create: "/open_api/v1.3/ad/create/",
      insights: "/open_api/v1.3/report/integrated/get/",
    },
  },
  {
    platform: "Google",
    brand: "Google Ads",
    color: "#34A853",
    tint: "from-emerald-500/20 to-emerald-500/0",
    apiHost: "googleads.googleapis.com",
    apiVersion: "v17",
    accountId: "410-552-8834",
    tokenPreview: "ya29.•••••••Tj8",
    rateLimit: { used: 210, max: 15000, window: "1d" },
    endpoints: {
      list: "/v17/customers/4105528834/googleAds:search",
      create: "/v17/customers/4105528834/campaigns:mutate",
      insights: "/v17/customers/4105528834/googleAds:searchStream",
    },
  },
  {
    platform: "Pinterest",
    brand: "Pinterest Ads",
    color: "#BD081C",
    tint: "from-red-500/20 to-red-500/0",
    apiHost: "api.pinterest.com",
    apiVersion: "v5",
    accountId: "549755813122",
    tokenPreview: "pina_•••••Ak1q",
    rateLimit: { used: 37, max: 1000, window: "1h" },
    endpoints: {
      list: "/v5/ad_accounts/549755813122/ads",
      create: "/v5/ad_accounts/549755813122/ads",
      insights: "/v5/ad_accounts/549755813122/ads/analytics",
    },
  },
];

export function configFor(p: Platform): PlatformConfig {
  return PLATFORMS.find((x) => x.platform === p) ?? PLATFORMS[0];
}
