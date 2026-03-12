import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { getNationalMarketData } from '@/lib/services/marketInsightsService'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Try to load stored GPS coordinates for this user
  const locationData = await prisma.userLocation.findUnique({
    where: { userId: user.userId },
    select: { latitude: true, longitude: true, county: true, region: true },
  })

  const userLat = locationData?.latitude ?? null
  const userLng = locationData?.longitude ?? null

  const { markets, lastRefreshed } = await getNationalMarketData(userLat, userLng)

  return NextResponse.json({
    markets,
    lastRefreshed,
    userLocation: locationData
      ? { county: locationData.county, region: locationData.region, lat: userLat, lng: userLng }
      : null,
  })
}
