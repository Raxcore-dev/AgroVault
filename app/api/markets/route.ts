import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { 
  KENYA_COUNTIES_MARKETS, 
  getMarketsByCounty, 
  getCountyCoords,
  getCommoditiesByCounty,
} from '@/lib/data/kenya-counties-markets'

/**
 * GET /api/markets
 * 
 * Returns market data filtered by county and/or commodity.
 * Query params:
 *   - county: string (optional) - Filter by county name
 *   - commodity: string (optional) - Filter by commodity type
 *   - includeAnalysis: boolean (optional) - Include price analysis and recommendations
 */
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const countyFilter = searchParams.get('county')
  const commodityFilter = searchParams.get('commodity')
  const includeAnalysis = searchParams.get('includeAnalysis') === 'true'

  try {
    // Build query for database markets
    const whereClause: Record<string, unknown> = {}
    
    if (countyFilter) {
      whereClause.location = { contains: countyFilter, mode: 'insensitive' }
    }
    
    if (commodityFilter) {
      whereClause.commodity = { contains: commodityFilter, mode: 'insensitive' }
    }

    // Fetch markets from database
    const dbMarkets = await prisma.market.findMany({
      where: whereClause,
      orderBy: [{ location: 'asc' }, { marketName: 'asc' }],
    })

    // If no county filter, also include static data for completeness
    let staticMarkets: Array<{
      marketName: string
      location: string
      commodity: string
      pricePerKg: number
      demandLevel: string
      priceTrend: string
      latitude: number
      longitude: number
    }> = []

    if (!countyFilter && !commodityFilter) {
      // Include static data for all counties
      for (const countyData of KENYA_COUNTIES_MARKETS) {
        for (const market of countyData.markets) {
          for (const commodity of countyData.commodities) {
            staticMarkets.push({
              marketName: market.name,
              location: countyData.county,
              commodity: commodity.commodity,
              pricePerKg: commodity.pricePerKg,
              demandLevel: commodity.demandLevel,
              priceTrend: commodity.priceTrend,
              latitude: market.latitude,
              longitude: market.longitude,
            })
          }
        }
      }
    } else if (countyFilter) {
      // Include static data for specific county
      const countyData = KENYA_COUNTIES_MARKETS.find(
        c => c.county.toLowerCase() === countyFilter.toLowerCase()
      )
      if (countyData) {
        for (const market of countyData.markets) {
          for (const commodity of countyData.commodities) {
            if (!commodityFilter || commodity.commodity.toLowerCase() === commodityFilter.toLowerCase()) {
              staticMarkets.push({
                marketName: market.name,
                location: countyData.county,
                commodity: commodity.commodity,
                pricePerKg: commodity.pricePerKg,
                demandLevel: commodity.demandLevel,
                priceTrend: commodity.priceTrend,
                latitude: market.latitude,
                longitude: market.longitude,
              })
            }
          }
        }
      }
    }

    // Combine database and static markets
    const allMarkets = [...dbMarkets, ...staticMarkets]

    // Remove duplicates (by marketName + location + commodity)
    const uniqueMarkets = allMarkets.filter(
      (market, index, self) =>
        index === self.findIndex(
          m => m.marketName === market.marketName && 
               m.location === market.location && 
               m.commodity === market.commodity
        )
    )

    // Build response with analysis if requested
    const responseData = uniqueMarkets.map(market => {
      const baseData = {
        id: 'id' in market ? market.id : `${market.marketName}-${market.location}-${market.commodity}`,
        marketName: market.marketName,
        location: market.location,
        county: market.location,
        commodity: market.commodity,
        pricePerKg: market.pricePerKg,
        previousPricePerKg: 'previousPricePerKg' in market ? market.previousPricePerKg : null,
        demandLevel: market.demandLevel as 'high' | 'medium' | 'low',
        priceTrend: market.priceTrend as 'increasing' | 'stable' | 'decreasing',
        latitude: market.latitude,
        longitude: market.longitude,
      }

      if (!includeAnalysis) {
        return baseData
      }

      // Calculate analysis
      const priceChange = market.previousPricePerKg 
        ? market.pricePerKg - market.previousPricePerKg 
        : 0
      const priceChangePercent = market.previousPricePerKg
        ? (priceChange / market.previousPricePerKg) * 100
        : 0

      // Determine trend label
      let trendLabel = 'Stable'
      if (market.priceTrend === 'increasing') {
        trendLabel = priceChange > 0 ? `Increasing (+KES ${priceChange.toFixed(1)}/kg)` : 'Increasing'
      } else if (market.priceTrend === 'decreasing') {
        trendLabel = priceChange < 0 ? `Decreasing (KES ${priceChange.toFixed(1)}/kg)` : 'Decreasing'
      }

      // Generate recommendation
      let recommendation = ''
      if (market.demandLevel === 'high' && market.priceTrend === 'increasing') {
        recommendation = `Excellent time to sell ${market.commodity}! High demand and rising prices at ${market.marketName}.`
      } else if (market.demandLevel === 'high' && market.priceTrend === 'stable') {
        recommendation = `Good opportunity to sell ${market.commodity} at ${market.marketName}. Demand is high with stable prices.`
      } else if (market.demandLevel === 'low' && market.priceTrend === 'decreasing') {
        recommendation = `Consider holding ${market.commodity} if possible. Both demand and prices are declining.`
      } else if (market.priceTrend === 'increasing') {
        recommendation = `Prices are rising for ${market.commodity}. Consider selling soon at ${market.marketName}.`
      } else {
        recommendation = `Market conditions are stable for ${market.commodity} at ${market.marketName}. Monitor for price changes.`
      }

      return {
        ...baseData,
        priceChange: Math.round(priceChange * 10) / 10,
        priceChangePercent: Math.round(priceChangePercent * 10) / 10,
        trendLabel,
        recommendation,
      }
    })

    // Calculate summary statistics
    const summary = {
      totalMarkets: responseData.length,
      avgPrice: responseData.length > 0
        ? Math.round((responseData.reduce((sum, m) => sum + m.pricePerKg, 0) / responseData.length) * 100) / 100
        : 0,
      highDemand: responseData.filter(m => m.demandLevel === 'high').length,
      increasing: responseData.filter(m => m.priceTrend === 'increasing').length,
      stable: responseData.filter(m => m.priceTrend === 'stable').length,
      decreasing: responseData.filter(m => m.priceTrend === 'decreasing').length,
    }

    // Find best market for each commodity
    const bestMarketsByCommodity: Record<string, typeof responseData[0]> = {}
    for (const market of responseData) {
      const existing = bestMarketsByCommodity[market.commodity]
      if (!existing || market.pricePerKg > existing.pricePerKg) {
        bestMarketsByCommodity[market.commodity] = market
      }
    }

    return NextResponse.json({
      markets: responseData,
      summary,
      bestMarkets: bestMarketsByCommodity,
      counties: Array.from(new Set(responseData.map(m => m.location))).sort(),
      commodities: Array.from(new Set(responseData.map(m => m.commodity))).sort(),
    })
  } catch (error) {
    console.error('Error fetching markets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch markets' },
      { status: 500 }
    )
  }
}
