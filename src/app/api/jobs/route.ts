import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const modes = ["ONSITE", "HYBRID", "REMOTE"] as const;
const types = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "APPRENTICESHIP"] as const;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const q = params.get("q")?.trim().slice(0, 100);
  const city = params.get("city")?.trim().slice(0, 80);
  const skill = params.get("skill")?.trim().slice(0, 60);
  const mode = params.get("workMode")?.toUpperCase();
  const type = params.get("employmentType")?.toUpperCase();
  const freshers = params.get("freshers") === "true";
  const limit = Math.min(Math.max(Number(params.get("limit")) || 20, 1), 100);
  const cursor = params.get("cursor") || undefined;

  try {
    const where = {
      status: "OPEN" as const,
      company: { verificationStatus: "VERIFIED" as const, verifiedAt: { not: null } },
      ...(city ? { city: { equals: city, mode: "insensitive" as const } } : {}),
      ...(skill ? { skills: { has: skill } } : {}),
      ...(modes.includes(mode as (typeof modes)[number]) ? { workMode: mode as (typeof modes)[number] } : {}),
      ...(types.includes(type as (typeof types)[number]) ? { employmentType: type as (typeof types)[number] } : {}),
      ...(freshers ? { fresherFriendly: true } : {}),
      AND: [
        ...(q ? [{ OR: [
          { title: { contains: q, mode: "insensitive" as const } },
          { description: { contains: q, mode: "insensitive" as const } },
          { company: { name: { contains: q, mode: "insensitive" as const } } },
          { skills: { has: q } },
        ] }] : []),
        { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
      ],
    };
    const [jobs, total] = await Promise.all([
      db.job.findMany({ where, take: limit, ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}), orderBy: [{ postedAt: "desc" }, { createdAt: "desc" }], include: { company: { select: { id: true, name: true, slug: true, websiteUrl: true } } } }),
      db.job.count({ where }),
    ]);
    return NextResponse.json({ items: jobs, total, nextCursor: jobs.length === limit ? jobs.at(-1)?.id ?? null : null });
  } catch {
    return NextResponse.json({ error: "Job listings are temporarily unavailable." }, { status: 503 });
  }
}
