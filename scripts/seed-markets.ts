/**
 * Seed Markets Script
 * 
 * Populates the Market table with data from kenya-counties-markets.ts
 * Run with: npx tsx scripts/seed-markets.ts
 */

import { PrismaClient } from '../lib/generated/prisma/client'
import { KENYA_COUNTIES_MARKETS } from '../lib/data/kenya-counties-markets'

const prisma = new PrismaClient({
  datasourceUrl: 'file:./dev.db',
})

async function main() {
  console.log('🌱 Seeding market data...')

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
          previousPricePerKg: commodity.pricePerKg * 0.95, // 5% lower for previous
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
    const batch = marketsToCreate.slice(i, i + batchSize)
    await prisma.market.createMany({ data: batch })
    console.log(`✅ Created ${Math.min(i + batchSize, marketsToCreate.length)}/${marketsToCreate.length} markets`)
  }

  console.log(`🎉 Seeded ${marketsToCreate.length} markets successfully!`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding markets:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
