-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('OPEN', 'CLOSED', 'EXPIRED', 'NEEDS_REVIEW');

-- CreateEnum
CREATE TYPE "WorkMode" AS ENUM ('ONSITE', 'HYBRID', 'REMOTE', 'UNSPECIFIED');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'APPRENTICESHIP', 'UNSPECIFIED');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "websiteUrl" TEXT,
    "careersUrl" TEXT,
    "industry" TEXT,
    "dataSourceId" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "sourceUrl" TEXT,
    "lastCheckedAt" TIMESTAMP(3),
    "lastVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Office" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "name" TEXT,
    "address" TEXT,
    "locality" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "sourceUrl" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Office_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "originalUrl" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "sourceName" TEXT,
    "externalId" TEXT,
    "locality" TEXT,
    "city" TEXT,
    "workMode" "WorkMode" NOT NULL DEFAULT 'UNSPECIFIED',
    "employmentType" "EmploymentType" NOT NULL DEFAULT 'UNSPECIFIED',
    "minExperienceYrs" DOUBLE PRECISION,
    "maxExperienceYrs" DOUBLE PRECISION,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "salaryCurrency" TEXT NOT NULL DEFAULT 'INR',
    "fresherFriendly" BOOLEAN NOT NULL DEFAULT false,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "JobStatus" NOT NULL DEFAULT 'NEEDS_REVIEW',
    "dataSourceId" TEXT,
    "postedAt" TIMESTAMP(3),
    "lastCheckedAt" TIMESTAMP(3),
    "lastVerifiedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "contentHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "refreshIntervalMins" INTEGER NOT NULL DEFAULT 1440,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "limitations" TEXT,
    "lastCheckedAt" TIMESTAMP(3),
    "lastSuccessfulAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataSource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");

-- CreateIndex
CREATE INDEX "Company_name_idx" ON "Company"("name");

-- CreateIndex
CREATE INDEX "Company_industry_idx" ON "Company"("industry");

-- CreateIndex
CREATE INDEX "Company_dataSourceId_idx" ON "Company"("dataSourceId");

-- CreateIndex
CREATE INDEX "Company_verificationStatus_idx" ON "Company"("verificationStatus");

-- CreateIndex
CREATE INDEX "Office_city_locality_idx" ON "Office"("city", "locality");

-- CreateIndex
CREATE INDEX "Office_latitude_longitude_idx" ON "Office"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "Office_verificationStatus_idx" ON "Office"("verificationStatus");

-- CreateIndex
CREATE INDEX "Job_status_postedAt_idx" ON "Job"("status", "postedAt");

-- CreateIndex
CREATE INDEX "Job_city_locality_idx" ON "Job"("city", "locality");

-- CreateIndex
CREATE INDEX "Job_fresherFriendly_status_idx" ON "Job"("fresherFriendly", "status");

-- CreateIndex
CREATE INDEX "Job_contentHash_idx" ON "Job"("contentHash");

-- CreateIndex
CREATE INDEX "Job_dataSourceId_idx" ON "Job"("dataSourceId");

-- CreateIndex
CREATE UNIQUE INDEX "Job_companyId_externalId_key" ON "Job"("companyId", "externalId");

-- CreateIndex
CREATE INDEX "DataSource_enabled_lastCheckedAt_idx" ON "DataSource"("enabled", "lastCheckedAt");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "DataSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Office" ADD CONSTRAINT "Office_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "DataSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

