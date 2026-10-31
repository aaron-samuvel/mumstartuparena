import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { refreshDataSource } from "@/lib/jobs/ingestion";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "Scheduled refresh is not configured." }, { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const staleBefore = new Date(Date.now() - 23 * 60 * 60 * 1000);
    const sources = await db.dataSource.findMany({
      where: { enabled: true, OR: [{ lastCheckedAt: null }, { lastCheckedAt: { lt: staleBefore } }] },
      orderBy: [{ lastCheckedAt: "asc" }, { createdAt: "asc" }],
      take: 20,
    });
    const results = [];
    for (const source of sources) {
      try {
        results.push(await refreshDataSource(source.id));
      } catch (error) {
        await db.dataSource.update({ where: { id: source.id }, data: { lastCheckedAt: new Date() } }).catch(() => undefined);
        results.push({ sourceId: source.id, sourceName: source.name, error: error instanceof Error ? error.message : "Refresh failed." });
      }
    }
    return NextResponse.json({ processed: results.length, nextBatchPending: sources.length === 20, results }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Scheduled refresh failed." }, { status: 503 });
  }
}
