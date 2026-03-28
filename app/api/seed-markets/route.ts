/**
 * Seed Market Data API
 * 
 * POST /api/seed-markets
 * 
 * Populates the Market table with Kenya counties market data
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { KENYA_COUNTIES_MARKETS } from '@/lib/data/kenya-counties-markets'

export async function POST() {
  try {
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
      const batch = marketsToCreate.slice(i, batchSize)
      await prisma.market.createMany({ data: batch })
      console.log(`✅ Created ${Math.min(i + batchSize, marketsToCreate.length)}/${marketsToCreate.length} markets`)
    }

    console.log(`🎉 Seeded ${marketsToCreate.length} markets successfully!`)

    return NextResponse.json({
      success: true,
      message: `Seeded ${marketsToCreate.length} markets successfully!`,
      count: marketsToCreate.length,
    })
  } catch (error) {
    console.error('❌ Error seeding markets:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Send a POST request to seed the market data',
  })
}
