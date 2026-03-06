/**
 * Prisma Client Singleton
 * 
 * Creates a single Prisma client instance shared across the application.
 * Uses @prisma/adapter-pg for PostgreSQL (Neon) connections.
 * In development, attaches to `globalThis` to survive HMR (Hot Module Replacement)
 * without creating new database connections on every reload.
 */

import { PrismaClient } from '@/lib/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL!
  const pool = new pg.Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
