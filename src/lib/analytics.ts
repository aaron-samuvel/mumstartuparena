import { db } from "@/lib/db";

export async function getMarketInsights(periodDays: number) {
  const generatedAt = new Date();
  const periodStart = new Date(generatedAt.getTime() - periodDays * 24 * 60 * 60 * 1000);
  const verifiedCompany = { verificationStatus: "VERIFIED" as const, verifiedAt: { not: null } };
  const currentOpenJob = {
    status: "OPEN" as const,
    lastVerifiedAt: { gte: periodStart, lte: generatedAt },
    company: verifiedCompany,
    AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gt: generatedAt } }] }],
  };
  const [companyCount, jobsByCity, jobsByType, jobsByWorkMode, fresherJobs, jobs] = await Promise.all([
    db.company.count({ where: verifiedCompany }),
    db.job.groupBy({ by: ["city"], where: currentOpenJob, _count: { _all: true } }),
    db.job.groupBy({ by: ["employmentType"], where: currentOpenJob, _count: { _all: true } }),
    db.job.groupBy({ by: ["workMode"], where: currentOpenJob, _count: { _all: true } }),
    db.job.count({ where: { ...currentOpenJob, fresherFriendly: true } }),
    db.job.findMany({ where: currentOpenJob, select: { skills: true, salaryMin: true, salaryMax: true, salaryCurrency: true }, take: 5000 }),
  ]);

  const skillCounts = new Map<string, number>();
  for (const job of jobs) for (const skill of job.skills) {
    const normalized = skill.trim();
    if (normalized) skillCounts.set(normalized, (skillCounts.get(normalized) || 0) + 1);
  }
  const salaries = jobs.flatMap((job) => job.salaryMin !== null && job.salaryMax !== null && job.salaryCurrency === "INR" ? [(job.salaryMin + job.salaryMax) / 2] : []);
  salaries.sort((a, b) => a - b);
  const medianSalary = salaries.length ? Math.round(salaries[Math.floor(salaries.length / 2)]) : null;

  return {
    period: { days: periodDays, start: periodStart.toISOString(), end: generatedAt.toISOString() },
    generatedAt: generatedAt.toISOString(),
    coverage: { verifiedCompanies: companyCount, jobsChecked: jobs.length, salaryRecords: salaries.length, limitedTo: 5000 },
    currentOpenRolesVerifiedInPeriod: jobs.length,
    fresherFriendlyRoles: fresherJobs,
    rolesByCity: jobsByCity.filter((entry) => entry.city).map((entry) => ({ city: entry.city, count: entry._count._all })).sort((a, b) => b.count - a.count),
    rolesByEmploymentType: jobsByType.map((entry) => ({ type: entry.employmentType, count: entry._count._all })).sort((a, b) => b.count - a.count),
    rolesByWorkMode: jobsByWorkMode.map((entry) => ({ mode: entry.workMode, count: entry._count._all })).sort((a, b) => b.count - a.count),
    demandedSkills: [...skillCounts].map(([skill, count]) => ({ skill, count })).sort((a, b) => b.count - a.count).slice(0, 10),
    salary: { medianRangeMidpointINR: medianSalary, sampleSize: salaries.length },
    caveat: "Counts include currently open roles on verified companies that were checked during this reporting period. Skill and salary summaries use available listing fields; missing values are not inferred.",
  };
}
