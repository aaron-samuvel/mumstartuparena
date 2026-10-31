import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Prisma Postgres on Vercel exposes a separate pooled URL for serverless traffic.
// Other providers can keep using DATABASE_URL as the pooled runtime URL.
export const db = globalForPrisma.prisma ?? new PrismaClient({
  ...(process.env.DATABASE_URL_POOLED ? { datasourceUrl: process.env.DATABASE_URL_POOLED } : {}),
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
