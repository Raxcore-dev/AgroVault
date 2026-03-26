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
  
  // Configure connection pool with better timeout settings for Neon
  const pool = new pg.Pool({ 
    connectionString,
    max: 10, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
    connectionTimeoutMillis: 5000, // Fail fast if can't connect (5 seconds)
    statement_timeout: 10000, // Query timeout of 10 seconds
  })
  
  const adapter = new PrismaPg(pool, {
    maxRequests: 10,
    timeout: 10000, // 10 second timeout for queries
  })
  
  return new PrismaClient({ 
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
