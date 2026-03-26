import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { KENYA_COUNTIES_MARKETS, getCountyNames } from '@/lib/data/kenya-counties-markets'

/**
 * GET /api/counties
 * 
 * Returns a list of all 47 Kenyan counties with optional market data.
 * Query params:
 *   - includeMarkets: boolean (optional) - Include markets for each county
 *   - search: string (optional) - Search counties by name
 */
export async function GET(request: NextRequest) {
  // Optional auth check - allow public access for county data
  const user = await getAuthUser(request)
  
  const searchParams = request.nextUrl.searchParams
  const includeMarkets = searchParams.get('includeMarkets') === 'true'
  const searchQuery = searchParams.get('search') || ''

  try {
    let counties = KENYA_COUNTIES_MARKETS

    // Filter by search query if provided
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      counties = counties.filter(c => 
        c.county.toLowerCase().includes(query) ||
        c.headquarters.toLowerCase().includes(query)
      )
    }

    // Sort alphabetically
    counties = [...counties].sort((a, b) => a.county.localeCompare(b.county))

    // Build response data
    const responseData = counties.map(county => ({
      name: county.county,
      headquarters: county.headquarters,
      latitude: county.latitude,
      longitude: county.longitude,
      marketCount: county.markets.length,
      markets: includeMarkets ? county.markets : undefined,
      commodityCount: county.commodities.length,
      commodities: includeMarkets ? county.commodities : undefined,
    }))

    return NextResponse.json({
      counties: responseData,
      total: responseData.length,
    })
  } catch (error) {
    console.error('Error fetching counties:', error)
    return NextResponse.json(
      { error: 'Failed to fetch counties' },
      { status: 500 }
    )
  }
}
