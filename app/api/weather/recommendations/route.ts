/**
 * Weather Recommendations API
 *
 * GET /api/weather/recommendations?location=Kisumu
 *
 * Returns AI-powered harvest timing recommendations based on
 * the weather forecast and the farmer's stored commodities.
 */

import { NextRequest, NextResponse } from 'next/server'
import { authorizeRole } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'
import { getWeatherForecast } from '@/lib/services/weatherService'
import { analyzeWeatherRisks } from '@/lib/services/weatherAnalysisService'
import { analyzeHarvestTiming } from '@/lib/services/aiRecommendationService'

const farmerGuard = authorizeRole('farmer')

export async function GET(request: NextRequest) {
  const user = await farmerGuard(request)
  if (user instanceof NextResponse) return user

  try {
    const { searchParams } = new URL(request.url)
    let location = searchParams.get('location')

    if (!location) {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.userId },
        select: { location: true },
      })
      location = dbUser?.location ?? 'Kisumu'
    }

    // Fetch weather + risks
    const weather = await getWeatherForecast(location)
    const riskSummary = analyzeWeatherRisks(weather)

    // Fetch farmer's commodities as "crops"
    const commodities = await prisma.commodity.findMany({
      where: {
        storageUnit: { farmerId: user.userId },
      },
      select: {
        commodityName: true,
        dateStored: true,
        expectedStorageDuration: true,
      },
    })

    // Determine harvest readiness based on storage duration
    const crops = commodities.map((c) => {
      const daysStored = Math.floor(
        (Date.now() - new Date(c.dateStored).getTime()) / (1000 * 60 * 60 * 24)
      )
      return {
        name: c.commodityName
          .toLowerCase()
          .replace(/^(white|red|fresh|organic|hass|green|dried)\s+/i, '')
          .trim(),
        harvestReady: daysStored >= c.expectedStorageDuration * 0.8,
      }
    })

    // Deduplicate crop names
    const uniqueCrops = Array.from(
      new Map(crops.map((c) => [c.name, c])).values()
    )

    // If no commodities, still provide a general recommendation
    if (uniqueCrops.length === 0) {
      uniqueCrops.push({ name: 'general crops', harvestReady: true })
    }

    const analyses = await analyzeHarvestTiming(weather, riskSummary, uniqueCrops)

    return NextResponse.json({
      location,
      weather_risk: riskSummary.overall_risk,
      safe_harvest_window: riskSummary.safe_harvest_window,
      recommendations: analyses,
    })
  } catch (error) {
    console.error('[API] Weather recommendations error:', error)
    return NextResponse.json(
      { error: 'Failed to generate harvest recommendations.' },
      { status: 500 }
    )
  }
}
