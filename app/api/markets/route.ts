/**
 * Markets API
 *
 * GET /api/markets – Returns all markets, optionally filtered by commodity.
 *
 * Query params:
 *   ?commodity=maize  – Filter by commodity type
 */

import { NextRequest, NextResponse } from 'next/server'
import { fetchMarkets } from '@/lib/services/marketRecommendationService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const commodity = searchParams.get('commodity') ?? undefined

    const markets = await fetchMarkets(commodity)

    return NextResponse.json({ markets })
  } catch (error) {
    console.error('Error fetching markets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch markets.' },
      { status: 500 }
    )
  }
}
