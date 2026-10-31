# MumStartupArena

Mumbai Metropolitan Region company and job discovery, grounded in traceable sources.

## Local development

1. Install Node.js and PostgreSQL.
2. Copy `.env.example` to `.env` and set `DATABASE_URL`.
3. Run `pnpm install` and `pnpm run db:dev`. For providers with separate serverless pool URLs, set `DATABASE_URL_POOLED` for runtime queries and keep `DIRECT_URL` for migrations.
4. Run `pnpm run dev` and open `http://localhost:3000`.

No company, job, salary, event or funding sample records are bundled. The public experience should only display records after they have been sourced and reviewed.

## Current foundation

- Responsive MMR product landing page with transparent empty-state messaging.
- PostgreSQL/Prisma models for companies, offices, jobs and data sources.
- Database-backed `/api/health` endpoint for service health checks.
- Period-labeled `/insights` dashboard and `/api/analytics`, computed from verified companies and recently checked open roles.
- Vercel-ready Next.js build with Prisma migration support and pooled runtime/direct migration database URLs.
- Phased delivery estimates and product proposals in `docs/`.

## Deployment

See [`docs/DEPLOY_VERCEL.md`](docs/DEPLOY_VERCEL.md). Vercel detects Next.js automatically; connect this repository, configure PostgreSQL environment variables, apply migrations, then add the production domain in Vercel.

## Data integrity

Never invent companies, job counts, salary ranges, hiring activity, or other ecosystem statistics. Job records must retain the original application URL and source, and verification timestamps. Every analytics chart must name its reporting period and data coverage.

