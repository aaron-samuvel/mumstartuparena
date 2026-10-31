# Deploy to Vercel

The app uses Next.js App Router and Prisma. Vercel detects Next.js and its build command from `package.json`; no `vercel.json` override is needed. [Vercel build configuration](https://vercel.com/docs/builds/configure-a-build)

## Set up the Vercel project

1. Import the repository into Vercel and keep the repository root as the Root Directory.
2. Use the default Next.js framework settings and Production branch selected by your repository.
3. Add a PostgreSQL provider through the Vercel Marketplace. Vercel Postgres itself is no longer offered for new projects; Vercel connects to external Postgres providers through Marketplace integrations. [Vercel Postgres guidance](https://vercel.com/docs/postgres)
4. Configure these values in **Development**, **Preview**, and **Production** as applicable:
   - For most PostgreSQL providers, `DATABASE_URL` is the pooled connection for application requests and `DIRECT_URL` is the direct/unpooled connection for Prisma migrations.
   - If you use Vercel's Prisma Postgres integration, it supplies `DATABASE_URL` as direct and `DATABASE_URL_POOLED` as pooled. The app automatically uses `DATABASE_URL_POOLED` at runtime; set `DIRECT_URL` to the direct `DATABASE_URL` value for migrations.
   - `NEXT_PUBLIC_APP_URL`: the URL for that environment. Use the production custom domain in Production.
   - `CRON_SECRET`: a long random secret used to authorize the scheduled `/api/cron/refresh` route. Vercel sends it as a bearer token for cron invocations; never expose it as a `NEXT_PUBLIC_` variable.
5. Keep database credentials in Vercel's environment settings, never in the repository. Vercel applies environment changes on the next deployment. [Vercel environment variables](https://vercel.com/docs/environment-variables)

Prisma's production guidance distinguishes pooled URLs for serverless application traffic from direct URLs for migrations and administrative connections. [Prisma connection pooling](https://www.prisma.io/docs/postgres/database/connection-pooling)

## Apply the initial migration

Before sending traffic to the first deployment, use a trusted local or CI environment with the production `DIRECT_URL` loaded and run:

```powershell
pnpm install --frozen-lockfile
pnpm run db:migrate
```

Repeat `pnpm run db:migrate` against the direct connection as part of releases that add migrations. The normal Vercel build runs `pnpm run build`; it generates Prisma Client and builds Next.js, but does not mutate the production database.

## Domain and verification

In Vercel Project Settings, add `mumstartuparena.com` and `www.mumstartuparena.com`, then apply the DNS records Vercel provides at the domain registrar. After each Production deployment, confirm `/api/health` reports a connected database and that the company/job API routes return database-backed responses.

## Current deployment limits

- No Vercel project has been created or linked from this workspace.
- No production database, credentials, domain DNS, email service, or secure resume storage is configured.
- The repo currently contains no sourced company or job records. Do not report market statistics until verified records are imported.
- The daily cron checks at most 20 enabled data sources per run. Sources must be tied to a verified company with a verified MMR office. Greenhouse and Lever public feeds are supported; sources remain disabled by default until reviewed and enabled.
