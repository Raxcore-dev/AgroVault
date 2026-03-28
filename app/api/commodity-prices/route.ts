import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/commodity-prices
 * 
 * Get commodity prices (public access)
 * This is used by the AI chat and other public-facing features
 * 
 * Query params:
 *   - county: filter by county
 *   - commodity: filter by commodity (e.g., "maize", "beans")
 *   - search: search by county or commodity name
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const county = searchParams.get('county')
    const commodity = searchParams.get('commodity')
    const search = searchParams.get('search')

    const where: any = {
      isActive: true,
    }

    // Build query based on filters
    if (county) {
      where.county = county
    }

    if (commodity) {
      where.commodity = commodity
    }

    if (search) {
      where.OR = [
        { county: { contains: search, mode: 'insensitive' } },
        { commodity: { contains: search, mode: 'insensitive' } },
      ]
    }

    const prices = await prisma.commodityPrice.findMany({
      where,
      orderBy: [{ county: 'asc' }, { commodity: 'asc' }],
    })

    // Format response with helpful statistics
    const formattedPrices = prices.map(price => ({
      county: price.county,
      commodity: price.commodity,
      pricePerKg: price.pricePerKg,
      pricePerBag: price.pricePerBag,
      pricePer90kgBag: price.pricePerBag, // alias for clarity
      priceTrend: price.priceTrend,
      demandLevel: price.demandLevel,
      lastUpdated: price.lastUpdated,
      formattedPrice: `KES ${price.pricePerKg.toLocaleString()}/kg`,
      formattedBagPrice: price.pricePerBag 
        ? `KES ${price.pricePerBag.toLocaleString()}/90kg bag`
        : null,
    }))

    return NextResponse.json({
      prices: formattedPrices,
      total: formattedPrices.length,
      counties: [...new Set(prices.map(p => p.county))],
      commodities: [...new Set(prices.map(p => p.commodity))],
    })
  } catch (error) {
    console.error('Error fetching commodity prices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch commodity prices' },
      { status: 500 }
    )
  }
}
