import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/admin/seed-commodity-prices
 * 
 * Seed the database with initial commodity prices (admin only)
 * This is run through the API to ensure proper database connection
 */
export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const user = await getAuthUser(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    // Sample data for key counties and commodities
    const SAMPLE_PRICES = [
      // Major maize growing areas
      { county: 'Trans Nzoia', commodity: 'maize', pricePerKg: 35, pricePerBag: 3150, demandLevel: 'high', priceTrend: 'stable' },
      { county: 'Uasin Gishu', commodity: 'maize', pricePerKg: 36, pricePerBag: 3240, demandLevel: 'high', priceTrend: 'stable' },
      { county: 'Nakuru', commodity: 'maize', pricePerKg: 39, pricePerBag: 3510, demandLevel: 'high', priceTrend: 'stable' },
      { county: 'Narok', commodity: 'maize', pricePerKg: 38, pricePerBag: 3420, demandLevel: 'high', priceTrend: 'stable' },
      { county: 'Kisumu', commodity: 'maize', pricePerKg: 44, pricePerBag: 3960, demandLevel: 'high', priceTrend: 'stable' },
      { county: 'Mombasa', commodity: 'maize', pricePerKg: 52, pricePerBag: 4680, demandLevel: 'high', priceTrend: 'increasing' },
      { county: 'Nairobi', commodity: 'maize', pricePerKg: 48, pricePerBag: 4320, demandLevel: 'high', priceTrend: 'stable' },
      
      // Beans prices
      { county: 'Trans Nzoia', commodity: 'beans', pricePerKg: 70, pricePerBag: 6300, demandLevel: 'high', priceTrend: 'stable' },
      { county: 'Uasin Gishu', commodity: 'beans', pricePerKg: 72, pricePerBag: 6480, demandLevel: 'high', priceTrend: 'stable' },
      { county: 'Nakuru', commodity: 'beans', pricePerKg: 80, pricePerBag: 7200, demandLevel: 'high', priceTrend: 'stable' },
      { county: 'Kisumu', commodity: 'beans', pricePerKg: 90, pricePerBag: 8100, demandLevel: 'high', priceTrend: 'stable' },
      { county: 'Mombasa', commodity: 'beans', pricePerKg: 115, pricePerBag: 10350, demandLevel: 'high', priceTrend: 'stable' },
      { county: 'Nairobi', commodity: 'beans', pricePerKg: 95, pricePerBag: 8550, demandLevel: 'high', priceTrend: 'stable' },
      
      // Wheat prices
      { county: 'Trans Nzoia', commodity: 'wheat', pricePerKg: 55, pricePerBag: 4950, demandLevel: 'high', priceTrend: 'stable' },
      { county: 'Uasin Gishu', commodity: 'wheat', pricePerKg: 56, pricePerBag: 5040, demandLevel: 'high', priceTrend: 'stable' },
      { county: 'Nakuru', commodity: 'wheat', pricePerKg: 57, pricePerBag: 5130, demandLevel: 'high', priceTrend: 'stable' },
      { county: 'Narok', commodity: 'wheat', pricePerKg: 56, pricePerBag: 5040, demandLevel: 'high', priceTrend: 'stable' },
      { county: 'Nairobi', commodity: 'wheat', pricePerKg: 62, pricePerBag: 5580, demandLevel: 'high', priceTrend: 'stable' },
      
      // Rice prices
      { county: 'Kisumu', commodity: 'rice', pricePerKg: 135, pricePerBag: 12150, demandLevel: 'high', priceTrend: 'stable' },
      { county: 'Mombasa', commodity: 'rice', pricePerKg: 145, pricePerBag: 13050, demandLevel: 'high', priceTrend: 'stable' },
      { county: 'Nairobi', commodity: 'rice', pricePerKg: 150, pricePerBag: 13500, demandLevel: 'high', priceTrend: 'stable' },
      
      // Tea and Coffee
      { county: 'Nyeri', commodity: 'coffee', pricePerKg: 360, pricePerBag: 32400, demandLevel: 'high', priceTrend: 'increasing' },
      { county: 'Kiambu', commodity: 'coffee', pricePerKg: 345, pricePerBag: 31050, demandLevel: 'medium', priceTrend: 'stable' },
      { county: 'Kericho', commodity: 'tea', pricePerKg: 115, pricePerBag: 10350, demandLevel: 'high', priceTrend: 'stable' },
      { county: 'Nandi', commodity: 'tea', pricePerKg: 110, pricePerBag: 9900, demandLevel: 'high', priceTrend: 'stable' },
      
      // Vegetables
      { county: 'Nakuru', commodity: 'tomatoes', pricePerKg: 70, pricePerBag: 6300, demandLevel: 'high', priceTrend: 'decreasing' },
      { county: 'Nakuru', commodity: 'onions', pricePerKg: 85, pricePerBag: 7650, demandLevel: 'high', priceTrend: 'stable' },
      { county: 'Nairobi', commodity: 'tomatoes', pricePerKg: 90, pricePerBag: 8100, demandLevel: 'high', priceTrend: 'fluctuating' },
      { county: 'Nairobi', commodity: 'onions', pricePerKg: 100, pricePerBag: 9000, demandLevel: 'high', priceTrend: 'stable' },
      { county: 'Nairobi', commodity: 'cabbages', pricePerKg: 55, pricePerBag: 4950, demandLevel: 'high', priceTrend: 'stable' },
      
      // Fish
      { county: 'Kisumu', commodity: 'fish', pricePerKg: 300, pricePerBag: 27000, demandLevel: 'high', priceTrend: 'increasing' },
      { county: 'Siaya', commodity: 'fish', pricePerKg: 280, pricePerBag: 25200, demandLevel: 'high', priceTrend: 'increasing' },
      { county: 'Homa Bay', commodity: 'fish', pricePerKg: 270, pricePerBag: 24300, demandLevel: 'high', priceTrend: 'stable' },
    ]

    let created = 0
    let updated = 0
    const results = []

    for (const data of SAMPLE_PRICES) {
      try {
        const result = await prisma.commodityPrice.upsert({
          where: {
            county_commodity: {
              county: data.county,
              commodity: data.commodity,
            },
          },
          update: {
            pricePerKg: data.pricePerKg,
            pricePerBag: data.pricePerBag,
            priceTrend: data.priceTrend,
            demandLevel: data.demandLevel,
            lastUpdated: new Date(),
          },
          create: {
            county: data.county,
            commodity: data.commodity,
            pricePerKg: data.pricePerKg,
            pricePerBag: data.pricePerBag,
            priceTrend: data.priceTrend,
            demandLevel: data.demandLevel,
            unit: 'kg',
            isActive: true,
            source: 'seed',
          },
        })
        
        results.push({
          county: data.county,
          commodity: data.commodity,
          pricePerKg: data.pricePerKg,
          status: result.id ? 'updated' : 'created',
        })
        created++
      } catch (error: any) {
        results.push({
          county: data.county,
          commodity: data.commodity,
          error: error.message,
          status: 'failed',
        })
      }
    }

    // Verify data
    const count = await prisma.commodityPrice.count()

    return NextResponse.json({
      success: true,
      message: `Seeded ${created} commodity prices`,
      totalRecords: count,
      results,
    })
  } catch (error: any) {
    console.error('Error seeding commodity prices:', error)
    return NextResponse.json(
      { error: 'Failed to seed commodity prices', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/seed-commodity-prices
 * 
 * Check seed status
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const count = await prisma.commodityPrice.count()
    const sample = await prisma.commodityPrice.findMany({
      take: 10,
      orderBy: { lastUpdated: 'desc' },
    })

    return NextResponse.json({
      totalRecords: count,
      sample,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch seed status' },
      { status: 500 }
    )
  }
}
