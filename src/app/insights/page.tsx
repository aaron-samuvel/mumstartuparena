import Link from "next/link";
import { ArrowLeft, BarChart3, BriefcaseBusiness, MapPin, Sparkles } from "lucide-react";
import { getMarketInsights } from "@/lib/analytics";

export const dynamic = "force-dynamic";

function BarList({ title, items }: { title: string; items: Array<{ label: string; count: number }> }) {
  const peak = Math.max(1, ...items.map((item) => item.count));
  return <section className="insight-card"><h2>{title}</h2>{items.length ? <div className="insight-bars">{items.map((item) => <div className="insight-bar-row" key={item.label}><span>{item.label}</span><div className="insight-track"><i style={{ width: `${Math.max(3, item.count / peak * 100)}%` }} /></div><b>{item.count}</b></div>)}</div> : <p className="empty-note">No verified records for this period yet.</p>}</section>;
}

export default async function InsightsPage() {
  let data: Awaited<ReturnType<typeof getMarketInsights>> | null = null;
  try { data = await getMarketInsights(30); } catch { /* Show an unavailable state without inventing data. */ }
  return <main className="insights-shell">
    <Link className="back-link" href="/"><ArrowLeft size={15} /> Back to MumStartupArena</Link>
    <header className="insights-heading"><p className="eyebrow"><BarChart3 size={14} /> OBSERVED MARKET DATA</p><h1>MMR tech hiring<br /><em>at a glance.</em></h1><p>Every count below comes from verified companies and roles checked within the reporting window.</p></header>
    {!data ? <section className="insight-card"><h2>Insights unavailable</h2><p className="empty-note">The database could not be reached. Please try again later.</p></section> : <>
      <p className="insights-period">REPORTING PERIOD · {new Date(data.period.start).toLocaleDateString("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" })} – {new Date(data.period.end).toLocaleDateString("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" })} · 30 DAYS</p>
      <section className="insights-summary"><article><BriefcaseBusiness size={17} /><b>{data.currentOpenRolesVerifiedInPeriod.toLocaleString("en-IN")}</b><span>open roles checked in period</span></article><article><Sparkles size={17} /><b>{data.fresherFriendlyRoles.toLocaleString("en-IN")}</b><span>marked fresher friendly</span></article><article><MapPin size={17} /><b>{data.rolesByCity.length.toLocaleString("en-IN")}</b><span>MMR locations with roles</span></article></section>
      <div className="insights-grid"><BarList title="Hiring by listed location" items={data.rolesByCity.map((item) => ({ label: item.city || "Unspecified", count: item.count }))} /><BarList title="Roles by employment type" items={data.rolesByEmploymentType.map((item) => ({ label: item.type.replaceAll("_", " "), count: item.count }))} /><BarList title="Roles by work mode" items={data.rolesByWorkMode.map((item) => ({ label: item.mode.replaceAll("_", " "), count: item.count }))} /><BarList title="Skills listed" items={data.demandedSkills.map((item) => ({ label: item.skill, count: item.count }))} /></div>
      <section className="insight-card insight-caveat"><h2>Coverage and limits</h2><p>{data.caveat}</p><p>{data.coverage.verifiedCompanies.toLocaleString("en-IN")} verified companies in the directory · {data.coverage.jobsChecked.toLocaleString("en-IN")} role records scanned · {data.coverage.salaryRecords.toLocaleString("en-IN")} salary ranges available.</p>{data.salary.medianRangeMidpointINR !== null && <p>Median midpoint of the {data.salary.sampleSize} INR salary ranges: ₹{data.salary.medianRangeMidpointINR.toLocaleString("en-IN")}.</p>}</section>
    </>}
  </main>;
}
