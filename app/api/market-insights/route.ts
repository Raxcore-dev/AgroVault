/**
 * GET  /api/market-insights  — Returns commodity market insights for the authenticated farmer.
 * POST /api/market-insights  — Forces a cache bypass and returns freshly fetched insights.
 *
 * Both endpoints require a valid farmer JWT in the Authorization header.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import {
  getMarketInsightsForFarmer,
  clearInsightsCache,
} from '@/lib/services/marketInsightsService'

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }
  if (user.role !== 'farmer') {
    return NextResponse.json(
      { error: 'Market insights are available to farmers only.' },
      { status: 403 },
    )
  }

  try {
    const result = await getMarketInsightsForFarmer(user.userId)
    return NextResponse.json(result)
  } catch (error) {
    console.error('[Market Insights GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch market insights.' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }
  if (user.role !== 'farmer') {
    return NextResponse.json(
      { error: 'Market insights are available to farmers only.' },
      { status: 403 },
    )
  }

  try {
    // Clear cache so the next call fetches truly fresh data
    clearInsightsCache(user.userId)
    const result = await getMarketInsightsForFarmer(user.userId)
    return NextResponse.json(result)
  } catch (error) {
    console.error('[Market Insights POST/refresh]', error)
    return NextResponse.json(
      { error: 'Failed to refresh market insights.' },
      { status: 500 },
    )
  }
}
