import { ArrowDownRight, ArrowUpRight, BriefcaseBusiness, Building2, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { DiscoverySearch } from "./DiscoverySearch";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  let verifiedCompanies: number | null = null;
  let openJobs: number | null = null;
  try {
    [verifiedCompanies, openJobs] = await Promise.all([
      db.company.count({ where: { verificationStatus: "VERIFIED", verifiedAt: { not: null } } }),
      db.job.count({ where: { status: "OPEN", company: { verificationStatus: "VERIFIED", verifiedAt: { not: null } }, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] } }),
    ]);
  } catch {
    // Keep coverage unknown when the database is unavailable; never show invented totals.
  }
  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="MumStartupArena home"><span className="brand-mark">M</span><span>MUM<span className="brand-light">STARTUP</span>ARENA</span></a>
        <nav className="nav-links"><a href="#discover">Discover</a><a href="#jobs">Jobs</a><a href="/insights">Insights</a><a href="#about">For companies</a></nav>
        <a className="sign-in" href="mailto:hello@mumstartuparena.com?subject=Early%20access">Get early access <ArrowUpRight size={15} /></a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span className="live-dot" /> THE MMR TECH ECOSYSTEM, MAPPED</p>
          <h1>Find your place<br />in <em>Mumbai tech.</em></h1>
          <p className="hero-description">Explore the companies building across Mumbai, Navi Mumbai and Thane — and find the roles that bring you closer.</p>
          <DiscoverySearch />
        </div>
        <div className="hero-art" aria-label="Map preview of the Mumbai metropolitan region">
          <div className="map-grid" />
          <div className="map-water" />
          <div className="map-line line-one" /><div className="map-line line-two" /><div className="map-line line-three" />
          <div className="map-label label-mumbai">MUMBAI</div><div className="map-label label-thane">THANE</div><div className="map-label label-navi">NAVI MUMBAI</div>
          <div className="map-empty"><MapPin size={18} /><span>Verified office locations<br />will appear here</span></div>
          <div className="map-legend"><span className="legend-dot" /> Company offices <span className="legend-sep" /> <span className="legend-dot gold" /> Hiring now</div>
          <span className="map-caption">SCHEMATIC MMR · NOT TO SCALE</span>
        </div>
      </section>

      <section className="stats" aria-label="Platform coverage">
        <div className="stat"><Building2 size={17} /><span className="stat-value">{verifiedCompanies === null ? "—" : verifiedCompanies.toLocaleString("en-IN")}</span><span className="stat-label">verified companies</span><span className="stat-note">Only sourced and reviewed</span></div>
        <div className="stat"><BriefcaseBusiness size={17} /><span className="stat-value">{openJobs === null ? "—" : openJobs.toLocaleString("en-IN")}</span><span className="stat-label">live opportunities</span><span className="stat-note">Only verified listings</span></div>
        <div className="stat"><MapPin size={17} /><span className="stat-value">4</span><span className="stat-label">regions covered</span><span className="stat-note">Mumbai · Navi Mumbai · Thane · MMR</span></div>
        <div className="stat"><ShieldCheck size={17} /><span className="stat-value stat-word">Source first</span><span className="stat-label">every listing is traceable</span><span className="stat-note">Direct links to original sources</span></div>
      </section>

      <section className="discover" id="discover">
        <div className="section-heading"><div><p className="eyebrow">A BETTER WAY TO LOOK AROUND</p><h2>Opportunity has an <em>address.</em></h2></div><p className="section-intro">A clear view of who is building, where they work, and who is hiring — grounded in verifiable sources.</p></div>
        <div className="feature-grid">
          <article className="feature-card feature-map"><span className="feature-icon"><MapPin size={18} /></span><span className="feature-index">01 / EXPLORE</span><h3>Know the landscape.</h3><p>Browse a verified directory of technology companies by industry, office location and the work they do.</p><a href="#coverage">Explore the directory <ArrowUpRight size={15} /></a><div className="card-map-decoration"><span /><span /><span /><i /></div></article>
          <article className="feature-card feature-jobs" id="jobs"><span className="feature-icon"><BriefcaseBusiness size={18} /></span><span className="feature-index">02 / FIND WORK</span><h3>Find work that fits.</h3><p>Search live jobs, internships and fresher roles. Every opportunity points back to its original company source.</p><a href="mailto:hello@mumstartuparena.com?subject=Early%20access%20—%20jobs">Get job alerts <ArrowUpRight size={15} /></a><div className="job-decoration" aria-hidden="true"><span /><span /><span /></div></article>
          <article className="feature-card feature-insights"><span className="feature-icon"><Sparkles size={18} /></span><span className="feature-index">03 / UNDERSTAND</span><h3>See what’s changing.</h3><p>Follow hiring activity and skill demand by locality, using observed listings with clear reporting periods.</p><a href="/insights">View market insights <ArrowUpRight size={15} /></a><div className="chart-decoration"><span>30 DAY VERIFIED LISTING WINDOW</span></div></article>
        </div>
      </section>

      <section className="coverage" id="coverage"><div className="coverage-text"><p className="eyebrow">BUILT FOR THE FULL REGION</p><h2>One ecosystem.<br /><em>Many neighbourhoods.</em></h2><p>From Mumbai’s established tech corridors to the growing hubs of Navi Mumbai and Thane, MMR’s opportunities are easier to find when they’re all in one place.</p><a className="outline-link" href="mailto:hello@mumstartuparena.com?subject=Submit%20a%20company">Know a company we should add? <ArrowUpRight size={15} /></a></div><div className="locality-list"><div><span className="locality-no">01</span><span>Mumbai</span><span className="locality-status">Directory in progress <ArrowDownRight size={14} /></span></div><div><span className="locality-no">02</span><span>Navi Mumbai</span><span className="locality-status">Directory in progress <ArrowDownRight size={14} /></span></div><div><span className="locality-no">03</span><span>Thane</span><span className="locality-status">Directory in progress <ArrowDownRight size={14} /></span></div><div><span className="locality-no">04</span><span>Greater MMR</span><span className="locality-status">Directory in progress <ArrowDownRight size={14} /></span></div></div></section>

      <section className="principle" id="about"><span className="principle-icon"><ShieldCheck size={21} /></span><div><p className="eyebrow">TRUST BEFORE SCALE</p><h2>Real companies. Real roles.<br /><em>Always linked to the source.</em></h2></div><p>We don’t invent counts, listings or salary numbers. Each company and opportunity will carry its source and verification history, so you can see what’s current and where it came from.</p></section>

      <footer><a className="brand footer-brand" href="#top"><span className="brand-mark">M</span><span>MUM<span className="brand-light">STARTUP</span>ARENA</span></a><span>Made for the people building Mumbai tech.</span><a href="mailto:hello@mumstartuparena.com">Get in touch <ArrowUpRight size={14} /></a></footer>
    </main>
  );
}
