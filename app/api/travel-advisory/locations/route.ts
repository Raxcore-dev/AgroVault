import { NextRequest, NextResponse } from 'next/server'
import { KENYAN_MARKET_LOCATIONS } from '@/lib/services/travelAdvisoryService'

/**
 * GET /api/travel-advisory/locations
 *
 * Returns the list of known Kenyan market/city locations for autocomplete.
 * Public endpoint — no auth required.
 */
export async function GET(_request: NextRequest) {
  return NextResponse.json({ locations: KENYAN_MARKET_LOCATIONS })
}
