/**
 * POST /api/location
 *
 * Stores (or updates) the authenticated farmer's GPS location captured via the
 * Browser Geolocation API.  The county/region are passed from the client after
 * reverse-geocoding with the Nominatim open API.
 *
 * Body: { latitude, longitude, county?, region? }
 *
 * GET /api/location
 *
 * Returns the stored location for the authenticated user.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  let body: { latitude?: unknown; longitude?: unknown; county?: unknown; region?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const latitude  = typeof body.latitude  === 'number' ? body.latitude  : null
  const longitude = typeof body.longitude === 'number' ? body.longitude : null
  const county    = typeof body.county    === 'string' ? body.county.trim()  : null
  const region    = typeof body.region    === 'string' ? body.region.trim()  : null

  if (latitude == null || longitude == null) {
    return NextResponse.json(
      { error: 'latitude and longitude are required numbers.' },
      { status: 400 },
    )
  }

  // Validate coordinate ranges
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return NextResponse.json(
      { error: 'Invalid coordinate values.' },
      { status: 400 },
    )
  }

  const locationRecord = await prisma.userLocation.upsert({
    where:  { userId: user.userId },
    update: { latitude, longitude, county, region },
    create: { userId: user.userId, latitude, longitude, county, region },
  })

  // Also update the free-text location field on User for display purposes
  if (county) {
    await prisma.user.update({
      where: { id: user.userId },
      data:  { location: county },
    })
  }

  return NextResponse.json({ location: locationRecord })
}

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const locationRecord = await prisma.userLocation.findUnique({
    where: { userId: user.userId },
  })

  return NextResponse.json({ location: locationRecord ?? null })
}
