/**
 * Direct Database Seed Script
 * 
 * Connects directly to the PostgreSQL database and seeds market data
 * Run with: npx tsx scripts/seed-markets-direct.ts
 */

import { PrismaClient } from '../lib/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { KENYA_COUNTIES_MARKETS } from '../lib/data/kenya-counties-markets'

async function main() {
  console.log('🌱 Seeding market data to PostgreSQL...')

  const connectionString = process.env.DATABASE_URL!
  
  const pool = new pg.Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    statement_timeout: 30000,
  })

  const adapter = new PrismaPg(pool, {
    maxRequests: 5,
    timeout: 30000,
  })

  const prisma = new PrismaClient({
    adapter,
    log: ['info', 'error'],
  })

  try {
    // Clear existing market data
    await prisma.market.deleteMany()
    console.log('🗑️  Cleared existing market data')

    const marketsToCreate = []

    // Extract market data from KENYA_COUNTIES_MARKETS
    for (const countyData of KENYA_COUNTIES_MARKETS) {
      for (const market of countyData.markets) {
        for (const commodity of countyData.commodities) {
          marketsToCreate.push({
            marketName: market.name,
            location: countyData.county,
            commodity: commodity.commodity.toLowerCase(),
            pricePerKg: commodity.pricePerKg,
            previousPricePerKg: commodity.pricePerKg * 0.95,
            demandLevel: commodity.demandLevel,
            priceTrend: commodity.priceTrend === 'increasing' ? 'increasing' : commodity.priceTrend === 'decreasing' ? 'decreasing' : 'stable',
            latitude: market.latitude,
            longitude: market.longitude,
            lastUpdated: new Date(),
          })
        }
      }
    }

    // Create markets in batches
    const batchSize = 100
    for (let i = 0; i < marketsToCreate.length; i += batchSize) {
      const batch = marketsToCreate.slice(i, batchSize)
      await prisma.market.createMany({ data: batch })
      console.log(`✅ Created ${Math.min(i + batchSize, marketsToCreate.length)}/${marketsToCreate.length} markets`)
    }

    console.log(`🎉 Seeded ${marketsToCreate.length} markets successfully!`)
  } catch (error) {
    console.error('❌ Error seeding markets:', error)
    throw error
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
