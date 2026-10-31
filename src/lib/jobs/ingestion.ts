import { createHash } from "node:crypto";
import { db } from "@/lib/db";

type WorkMode = "ONSITE" | "HYBRID" | "REMOTE" | "UNSPECIFIED";
type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" | "APPRENTICESHIP" | "UNSPECIFIED";
type NormalizedPosting = {
  id: string;
  title: string;
  url: string;
  location: string | null;
  description: string | null;
  workMode: WorkMode;
  employmentType: EmploymentType;
  fresherFriendly: boolean;
  postedAt: Date | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
};

function string(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asDate(value: unknown): Date | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function textOnly(value: string | null): string | null {
  if (!value) return null;
  return value.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;/gi, "'").replace(/\s+/g, " ").trim().slice(0, 30_000) || null;
}

function workMode(value: unknown): WorkMode {
  const mode = string(value)?.toLowerCase();
  if (mode?.includes("remote")) return "REMOTE";
  if (mode?.includes("hybrid")) return "HYBRID";
  if (mode?.includes("site") || mode?.includes("office")) return "ONSITE";
  return "UNSPECIFIED";
}

function employmentType(...values: Array<unknown>): EmploymentType {
  const joined = values.map(string).filter(Boolean).join(" ").toLowerCase();
  if (/intern|apprentice/.test(joined)) return /apprentice/.test(joined) ? "APPRENTICESHIP" : "INTERNSHIP";
  if (/part[ -]?time/.test(joined)) return "PART_TIME";
  if (/contract|temporary/.test(joined)) return "CONTRACT";
  if (/full[ -]?time/.test(joined)) return "FULL_TIME";
  return "UNSPECIFIED";
}

function salaryValue(value: unknown): number | null {
  const number = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(number) && number >= 0 ? Math.round(number) : null;
}

function normalizeGreenhouse(payload: unknown): NormalizedPosting[] {
  if (!payload || typeof payload !== "object" || !Array.isArray((payload as { jobs?: unknown }).jobs)) throw new Error("Greenhouse returned an unexpected response.");
  return (payload as { jobs: Array<Record<string, unknown>> }).jobs.flatMap((job) => {
    const id = job.id == null ? null : String(job.id);
    const title = string(job.title);
    const url = string(job.absolute_url);
    const locObject = job.location as { name?: unknown } | null;
    const location = string(locObject?.name);
    const offices = Array.isArray(job.offices) ? job.offices.map((office) => string((office as { location?: unknown })?.location)).filter(Boolean) : [];
    const resolvedLocation = location || offices.join("; ") || null;
    if (!id || !title || !url) return [];
    const content = string(job.content);
    const searchable = `${title} ${content || ""}`;
    return [{
      id, title, url, location: resolvedLocation, description: textOnly(content), workMode: workMode(`${title} ${resolvedLocation || ""}`),
      employmentType: employmentType(title, content), fresherFriendly: /\b(fresher|new graduate|new grad|graduate programme|graduate program|entry[ -]level|internship)\b/i.test(searchable),
      postedAt: asDate(job.updated_at || job.created_at), salaryMin: null, salaryMax: null, salaryCurrency: "INR",
    }];
  });
}

function normalizeLever(payload: unknown): NormalizedPosting[] {
  if (!Array.isArray(payload)) throw new Error("Lever returned an unexpected response.");
  return (payload as Array<Record<string, unknown>>).flatMap((job) => {
    const id = string(job.id);
    const title = string(job.text);
    const url = string(job.hostedUrl) || string(job.applyUrl);
    const categories = job.categories as Record<string, unknown> | null;
    const location = string(categories?.location);
    const salary = job.salaryRange as Record<string, unknown> | null;
    const mode = workMode(job.workplaceType);
    const description = string(job.descriptionPlain) || string(job.openingPlain);
    if (!id || !title || !url) return [];
    const min = salaryValue(salary?.min);
    const max = salaryValue(salary?.max);
    return [{
      id, title, url, location, description: textOnly(description), workMode: mode,
      employmentType: employmentType(categories?.commitment, title),
      fresherFriendly: /\b(fresher|new graduate|new grad|graduate programme|graduate program|entry[ -]level|internship)\b/i.test(`${title} ${string(categories?.level) || ""} ${description || ""}`),
      postedAt: asDate(job.createdAt), salaryMin: min, salaryMax: max, salaryCurrency: string(salary?.currency)?.toUpperCase().slice(0, 8) || "INR",
    }];
  });
}

async function fetchFeed(type: string, sourceUrl: string): Promise<NormalizedPosting[]> {
  const source = new URL(sourceUrl);
  let apiUrl: URL;
  let normalize: (payload: unknown) => NormalizedPosting[];
  if (type === "greenhouse" && source.hostname === "boards-api.greenhouse.io") {
    const match = source.pathname.match(/^\/v1\/boards\/([A-Za-z0-9_-]+)\/jobs\/?$/);
    if (!match) throw new Error("Greenhouse source URL must point to one public job board.");
    apiUrl = new URL(`/v1/boards/${match[1]}/jobs?content=true`, source.origin);
    normalize = normalizeGreenhouse;
  } else if (type === "lever" && ["api.lever.co", "api.eu.lever.co"].includes(source.hostname)) {
    const match = source.pathname.match(/^\/v0\/postings\/([A-Za-z0-9_-]+)\/?$/);
    if (!match) throw new Error("Lever source URL must point to one public postings site.");
    apiUrl = new URL(`/v0/postings/${match[1]}?mode=json`, source.origin);
    normalize = normalizeLever;
  } else {
    throw new Error("Only configured public Greenhouse and Lever job board feeds are supported.");
  }

  const response = await fetch(apiUrl, { headers: { accept: "application/json" }, redirect: "error", signal: AbortSignal.timeout(15_000), cache: "no-store" });
  if (!response.ok) throw new Error(`Source returned HTTP ${response.status}.`);
  const payload: unknown = await response.json();
  return normalize(payload);
}

function mmrCity(location: string | null): string | null {
  if (!location) return null;
  const withoutNaviMumbai = location.replace(/\bnavi[ -]mumbai\b/ig, " ");
  const names = [
    ...( /\bnavi[ -]mumbai\b/i.test(location) ? ["Navi Mumbai"] : []),
    ...( /\bmumbai\b/i.test(withoutNaviMumbai) ? ["Mumbai"] : []),
    ...( /\bthane\b/i.test(location) ? ["Thane"] : []),
  ];
  const unique = [...new Set(names)];
  return unique.length === 1 ? unique[0] : null;
}

function isRelevantLocation(location: string | null, mode: WorkMode): boolean {
  return !!mmrCity(location) || mode === "REMOTE" || /\bremote\b/i.test(location || "");
}

export async function refreshDataSource(sourceId: string) {
  const source = await db.dataSource.findUnique({ where: { id: sourceId } });
  if (!source || !source.enabled) throw new Error("Source is missing or disabled.");
  const checkedAt = new Date();
  await db.dataSource.update({ where: { id: source.id }, data: { lastCheckedAt: checkedAt } });

  const companies = await db.company.findMany({
    where: { dataSourceId: source.id, verificationStatus: "VERIFIED", verifiedAt: { not: null } },
    include: { offices: { where: { verificationStatus: "VERIFIED", verifiedAt: { not: null } }, select: { city: true } } },
  });
  if (companies.length !== 1) throw new Error("Each enabled source must belong to exactly one verified company.");
  const company = companies[0];
  if (!company.offices.some((office) => ["mumbai", "navi mumbai", "thane"].includes(office.city.trim().toLowerCase()))) throw new Error("The company needs a verified Mumbai, Navi Mumbai, or Thane office before job ingestion is enabled.");

  const postings = await fetchFeed(source.sourceType.toLowerCase(), source.url);
  let imported = 0;
  let skipped = 0;
  const seenUrls = new Set<string>();
  for (const posting of postings) {
    const safeUrl = new URL(posting.url);
    if (!(["http:", "https:"].includes(safeUrl.protocol)) || !isRelevantLocation(posting.location, posting.workMode)) { skipped += 1; continue; }
    const canonicalUrl = safeUrl.toString();
    if (seenUrls.has(canonicalUrl)) { skipped += 1; continue; }
    seenUrls.add(canonicalUrl);
    const city = mmrCity(posting.location);
    const contentHash = createHash("sha256").update(`${company.id}\n${posting.title.toLowerCase()}\n${canonicalUrl.toLowerCase()}`).digest("hex");
    await db.job.upsert({
      where: { companyId_externalId: { companyId: company.id, externalId: posting.id } },
      create: {
        companyId: company.id, dataSourceId: source.id, externalId: posting.id, title: posting.title.slice(0, 250),
        description: posting.description, originalUrl: canonicalUrl, sourceUrl: source.url, sourceName: source.name,
        locality: posting.location?.slice(0, 160) || null, city, workMode: posting.workMode, employmentType: posting.employmentType,
        fresherFriendly: posting.fresherFriendly, postedAt: posting.postedAt, salaryMin: posting.salaryMin, salaryMax: posting.salaryMax,
        salaryCurrency: posting.salaryCurrency, contentHash, status: "OPEN", lastCheckedAt: checkedAt, lastVerifiedAt: checkedAt,
      },
      update: {
        title: posting.title.slice(0, 250), description: posting.description, originalUrl: canonicalUrl,
        sourceUrl: source.url, sourceName: source.name, locality: posting.location?.slice(0, 160) || null, city,
        workMode: posting.workMode, employmentType: posting.employmentType, fresherFriendly: posting.fresherFriendly,
        postedAt: posting.postedAt, salaryMin: posting.salaryMin, salaryMax: posting.salaryMax,
        salaryCurrency: posting.salaryCurrency, contentHash, status: "OPEN", expiresAt: null,
        lastCheckedAt: checkedAt, lastVerifiedAt: checkedAt,
      },
    });
    imported += 1;
  }

  const stale = await db.job.updateMany({
    where: {
      companyId: company.id, dataSourceId: source.id, status: "OPEN",
      OR: [{ lastCheckedAt: null }, { lastCheckedAt: { lt: checkedAt } }],
    },
    data: { status: "EXPIRED", lastCheckedAt: checkedAt },
  });
  await db.dataSource.update({ where: { id: source.id }, data: { lastSuccessfulAt: checkedAt } });
  await db.company.update({ where: { id: company.id }, data: { lastCheckedAt: checkedAt, lastVerifiedAt: checkedAt } });
  return { sourceId: source.id, sourceName: source.name, fetched: postings.length, imported, skipped, expired: stale.count };
}
