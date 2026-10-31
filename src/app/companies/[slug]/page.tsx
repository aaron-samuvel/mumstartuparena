import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, MapPin } from "lucide-react";
import { db } from "@/lib/db";
import { safeExternalUrl } from "@/lib/url";

export const dynamic = "force-dynamic";

export default async function CompanyProfile({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const company = await db.company.findFirst({
    where: { slug, verificationStatus: "VERIFIED", verifiedAt: { not: null } },
    include: {
      offices: { where: { verificationStatus: "VERIFIED", verifiedAt: { not: null } }, orderBy: [{ city: "asc" }, { locality: "asc" }] },
      jobs: { where: { status: "OPEN", OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] }, orderBy: [{ postedAt: "desc" }, { createdAt: "desc" }] },
    },
  });
  if (!company) notFound();
  const websiteUrl = safeExternalUrl(company.websiteUrl);
  const companySourceUrl = safeExternalUrl(company.sourceUrl);

  return <main className="profile-shell">
    <Link className="back-link" href="/"><ArrowLeft size={15} /> Back to discovery</Link>
    <header className="profile-head"><p className="eyebrow">VERIFIED COMPANY</p><h1>{company.name}</h1>{company.industry && <p className="profile-industry">{company.industry}</p>}{company.description && <p className="profile-description">{company.description}</p>}{websiteUrl && <a className="outline-link" href={websiteUrl} target="_blank" rel="noreferrer">Company website <ArrowUpRight size={15} /></a>}</header>
    <section className="profile-grid"><div><p className="eyebrow">OFFICE LOCATIONS</p>{company.offices.length ? company.offices.map((office) => { const sourceUrl = safeExternalUrl(office.sourceUrl); return <article className="profile-card" key={office.id}><h2><MapPin size={16} /> {office.locality}, {office.city}</h2>{office.name && <p>{office.name}</p>}{office.address && <p>{office.address}</p>}{sourceUrl && <a href={sourceUrl} target="_blank" rel="noreferrer">Location source <ArrowUpRight size={14} /></a>}</article>; }) : <p className="empty-note">No verified office locations are available yet.</p>}</div><div><p className="eyebrow">OPEN OPPORTUNITIES · {company.jobs.length}</p>{company.jobs.length ? company.jobs.map((job) => { const originalUrl = safeExternalUrl(job.originalUrl); return <article className="profile-card" key={job.id}><h2>{job.title}</h2><p>{[job.locality, job.city, job.workMode !== "UNSPECIFIED" ? job.workMode.toLowerCase() : ""].filter(Boolean).join(" · ") || "Location not specified"}</p>{job.fresherFriendly && <span className="fresher-badge">Open to freshers</span>}{originalUrl && <a href={originalUrl} target="_blank" rel="noreferrer">Apply at original source <ArrowUpRight size={14} /></a>}</article>; }) : <p className="empty-note">No verified open roles at this time.</p>}</div></section>
    <footer className="profile-footer">Source checked {company.lastCheckedAt?.toLocaleDateString("en-IN", { dateStyle: "medium" }) ?? "date unavailable"} · Company source: {companySourceUrl ? <a href={companySourceUrl} target="_blank" rel="noreferrer">view source <ArrowUpRight size={12} /></a> : "not provided"}</footer>
  </main>;
}
