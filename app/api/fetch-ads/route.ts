import { NextResponse } from "next/server";
import { ads } from "@/lib/mockAds";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const delay = 800 + Math.floor(Math.random() * 1000);
  await new Promise((r) => setTimeout(r, delay));

  return NextResponse.json({
    ads,
    syncedAt: new Date().toISOString(),
    sources: [
      { platform: "Facebook", count: ads.filter((a) => a.platform === "Facebook").length },
      { platform: "Instagram", count: ads.filter((a) => a.platform === "Instagram").length },
      { platform: "TikTok", count: ads.filter((a) => a.platform === "TikTok").length },
      { platform: "Pinterest", count: ads.filter((a) => a.platform === "Pinterest").length },
      { platform: "Google", count: ads.filter((a) => a.platform === "Google").length },
    ],
  });
}
