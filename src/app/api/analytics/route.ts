import { NextRequest, NextResponse } from "next/server";
import { getMarketInsights } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const requested = Number(request.nextUrl.searchParams.get("days")) || 30;
  const days = Math.min(Math.max(Math.floor(requested), 7), 365);
  try {
    const data = await getMarketInsights(days);
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Market insights are temporarily unavailable." }, { status: 503 });
  }
}
