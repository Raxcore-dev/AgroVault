/**
 * Weather Forecast API
 *
 * GET /api/weather/forecast?location=Kisumu
 *
 * Returns current weather + 7-day forecast for the farmer's location.
 * If no location is provided, uses the authenticated farmer's registered location.
 */

import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'
import { getWeatherForecast } from '@/lib/services/weatherService'

export async function GET(request: NextRequest) {
  const user = await authenticateUser(request)
  if (user instanceof NextResponse) return user

  try {
    const { searchParams } = new URL(request.url)
    let location = searchParams.get('location')

    // Fall back to the user's registered location
    if (!location) {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.userId },
        select: { location: true },
      })
      location = dbUser?.location ?? 'Kisumu'
    }

    const weather = await getWeatherForecast(location)

    return NextResponse.json(weather)
  } catch (error) {
    console.error('[API] Weather forecast error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch weather forecast.' },
      { status: 500 }
    )
  }
}
