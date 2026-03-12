import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'
import {
  getMarketTravelAdvisory,
  KENYAN_MARKET_LOCATIONS,
} from '@/lib/services/travelAdvisoryService'

/**
 * GET /api/travel-advisory?market=Kisumu&farmerLocation=Nairobi
 *
 * Returns a MarketTravelAdvisory for the specified market/destination,
 * optionally enriched with the farmer's market price insights.
 *
 * Query params:
 *   market         - destination market or location name (required)
 *   farmerLocation - farmer's current location (optional, defaults to user's saved location)
 */
export async function GET(request: NextRequest) {
  const auth = await authenticateUser(request)
  if (auth instanceof NextResponse) return auth

  const { searchParams } = new URL(request.url)
  const market = searchParams.get('market')?.trim()
  const farmerLocationParam = searchParams.get('farmerLocation')?.trim()

  if (!market) {
    return NextResponse.json(
      { error: 'Missing required query parameter: market' },
      { status: 400 },
    )
  }

  // Resolve farmer location: query param → DB user location → fallback
  let farmerLocation = farmerLocationParam ?? 'Kenya'
  if (!farmerLocationParam) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: auth.userId },
        select: { location: true },
      })
      if (dbUser?.location) farmerLocation = dbUser.location
    } catch {
      // non-critical — continue with fallback
    }
  }

  try {
    const advisory = await getMarketTravelAdvisory(market, farmerLocation, auth.userId)
    return NextResponse.json(advisory)
  } catch (err) {
    console.error('[TravelAdvisory] Error:', err)
    return NextResponse.json(
      { error: 'Failed to generate travel advisory' },
      { status: 500 },
    )
  }
}
