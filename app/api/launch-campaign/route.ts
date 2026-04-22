import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const delay = 1200 + Math.floor(Math.random() * 1200);
  await new Promise((r) => setTimeout(r, delay));

  return NextResponse.json({
    ok: true,
    campaignId: `c_${Math.random().toString(36).slice(2, 10)}`,
    platform: body?.platform ?? "Facebook",
    name: body?.name ?? "Untitled",
    launchedAt: new Date().toISOString(),
    budgetDaily: 40 + Math.floor(Math.random() * 80),
    estimatedReach: 8000 + Math.floor(Math.random() * 42000),
  });
}
