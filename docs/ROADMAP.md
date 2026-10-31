# Delivery roadmap

These are planning estimates, not delivery commitments. The scope is large enough that data access, credentials and product decisions can change the schedule substantially. Estimates assume one experienced full-stack engineer unless stated otherwise.

Overall estimate: **6–12 months for one experienced engineer** or **3–6 months for a small team of 3–5**, assuming data-source access and external service credentials are available. A focused discovery MVP can ship much sooner; later phases can overlap for a small team.

## Today: project foundation

- Create a coherent MMR-focused product identity and responsive landing experience.
- Establish the Next.js and TypeScript application, PostgreSQL/Prisma data model, health endpoint and Vercel deployment path.
- Add a live market insights dashboard with explicit coverage windows and no inferred skill or salary data.
- Keep the product empty-state truthful until companies and jobs are verified and imported.

## Layer 1 — Discovery MVP (6–10 weeks, small team; 10–16 weeks, solo)

- Company and office directory with verified-source workflows.
- Job ingestion from agreed official sources, freshness tracking and duplicate detection.
- Search, locality and job filters, map pins backed by database records, and public company/job pages.
- Basic admin review/import tools and operational monitoring.
- Exit condition: a small, auditable MMR dataset with live refreshes and source links, not demo records.

## Layer 2 — Candidate workflows (4–8 additional weeks)

- Accounts, candidate profiles, saved jobs, application tracking and notification preferences.
- Resume upload and parsing with secure storage and consent.
- Rule-based matching first; AI explanation only after quality checks and privacy review.

## Layer 3 — Company workflows and alerts (4–8 additional weeks)

- Company submissions, verification queue, office management, job posting and career-page integrations.
- Email and in-app alerts with frequency controls, unsubscribe, delivery logs and abuse protections.

## Layer 4 — Intelligence and ecosystem (6–12 additional weeks)

- Time-bounded analytics based on observed, deduplicated data; trends and salary insights only where samples support them.
- Skill-gap recommendations, career assistant, event/incubator/funding data from verifiable sources.
- Admin audit log, import operations, source health and reporting.

## Release and operational hardening (2–4 additional weeks)

- Production security review, backups/restore drill, rate limits, privacy and retention controls, monitoring, domain/DNS and staged deployment.
- Verify live data refresh and alerts in production before calling the platform complete.

## Critical dependencies

- Access to official job feeds or permission to collect from named career sites; each source needs its own limits and refresh policy.
- Seed directory compiled from sources and manually reviewed. No synthetic listings or guessed salary data.
- Vercel project access, production domain DNS, email provider, secure file storage and any AI provider credentials.
- A decision on whether candidate accounts and resume parsing are in the first public release.
