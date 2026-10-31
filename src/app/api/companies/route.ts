import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const q = params.get("q")?.trim().slice(0, 100);
  const city = params.get("city")?.trim().slice(0, 80);
  const industry = params.get("industry")?.trim().slice(0, 80);
  const limit = Math.min(Math.max(Number(params.get("limit")) || 20, 1), 100);
  const cursor = params.get("cursor") || undefined;

  try {
    const where = {
      verificationStatus: "VERIFIED" as const,
      verifiedAt: { not: null },
      ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" as const } }, { description: { contains: q, mode: "insensitive" as const } }] } : {}),
      ...(industry ? { industry: { equals: industry, mode: "insensitive" as const } } : {}),
      ...(city ? { offices: { some: { city: { equals: city, mode: "insensitive" as const }, verificationStatus: "VERIFIED" as const, verifiedAt: { not: null } } } } : {}),
    };
    const [companies, total] = await Promise.all([
      db.company.findMany({ where, take: limit, ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}), orderBy: { name: "asc" }, include: { offices: { where: { verificationStatus: "VERIFIED", verifiedAt: { not: null } }, select: { id: true, name: true, address: true, locality: true, city: true, latitude: true, longitude: true } }, _count: { select: { jobs: { where: { status: "OPEN" } } } } } }),
      db.company.count({ where }),
    ]);
    return NextResponse.json({ items: companies, total, nextCursor: companies.length === limit ? companies.at(-1)?.id ?? null : null });
  } catch {
    return NextResponse.json({ error: "Company directory is temporarily unavailable." }, { status: 503 });
  }
}
