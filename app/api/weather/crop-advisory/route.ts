/**
 * GET /api/weather/crop-advisory
 *
 * Analyzes weather forecasts and predicts their impact on stored commodities.
 * Returns AI-generated recommendations for each commodity based on weather conditions.
 *
 * Query parameters:
 *   - storageUnitId (required): Storage unit to analyze
 *   - latitude: Farmer's latitude (optional, defaults to storage unit location)
 *   - longitude: Farmer's longitude (optional, defaults to storage unit location)
 *   - location: Location name (optional, for weather context)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { analyzeWeatherImpactOnCommodities } from '@/lib/services/weather-crop-advisory-rax'

export async function GET(request: NextRequest) {
  try {
    // Auth check
    const auth = await getAuthUser(request)
    if (!auth) {
      return NextResponse.json(
        { error: 'Authentication required.' },
        { status: 401 }
      )
    }

    if (auth.role !== 'farmer') {
      return NextResponse.json(
        { error: 'Only farmers can access crop advisory.' },
        { status: 403 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const storageUnitId = searchParams.get('storageUnitId')

    if (!storageUnitId) {
      return NextResponse.json(
        {
          error: 'storageUnitId query parameter is required.',
        },
        { status: 400 }
      )
    }

    // Fetch storage unit to verify ownership and get location
    const storageUnit = await prisma.storageUnit.findUnique({
      where: { id: storageUnitId },
      include: {
        User: true,
      },
    })

    if (!storageUnit) {
      return NextResponse.json(
        { error: 'Storage unit not found.' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (storageUnit.farmerId !== auth.userId) {
      return NextResponse.json(
        { error: 'You do not have permission to access this storage unit.' },
        { status: 403 }
      )
    }

    // Get coordinates (from query params or storage unit)
    let latitude = parseFloat(searchParams.get('latitude') || '')
    let longitude = parseFloat(searchParams.get('longitude') || '')
    let location = searchParams.get('location') || storageUnit.location

    // Kenya locations mapping for weather forecast
    const kenyaLocations: Record<string, { lat: number; lon: number }> = {
      'Nairobi': { lat: -1.2921, lon: 36.8219 },
      'Nakuru': { lat: -0.3031, lon: 36.0800 },
      'Kisumu': { lat: -0.1022, lon: 34.7617 },
      'Mombasa': { lat: -4.0435, lon: 39.6682 },
      'Eldoret': { lat: 0.5143, lon: 35.2698 },
      'Kisii': { lat: -0.6915, lon: 34.7732 },
      'Kericho': { lat: -0.3667, lon: 35.2833 },
      'Naivasha': { lat: -0.7167, lon: 36.4333 },
      'Voi': { lat: -3.3975, lon: 38.5733 },
      'Machakos': { lat: -2.7265, lon: 37.2653 },
    }

    // If coordinates not provided, try to use storage unit location
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      if (storageUnit.latitude && storageUnit.longitude) {
        // Use explicit coordinates from storage unit
        latitude = storageUnit.latitude
        longitude = storageUnit.longitude
      } else {
        // Try to map location name to coordinates
        const coords = kenyaLocations[location] || kenyaLocations[Object.keys(kenyaLocations)[0]]
        if (coords) {
          latitude = coords.lat
          longitude = coords.lon
          console.log(`[Crop Advisory] Mapped location "${location}" to coordinates: ${latitude}, ${longitude}`)
        } else {
          return NextResponse.json(
            {
              error: `Storage unit location "${location}" not recognized. Please update storage unit with specific coordinates or use a known Kenya location.`,
              availableLocations: Object.keys(kenyaLocations),
            },
            { status: 400 }
          )
        }
      }
    }

    // Analyze weather impact on commodities
    const advisory = await analyzeWeatherImpactOnCommodities(
      storageUnitId,
      auth.userId,
      latitude,
      longitude,
      location
    )

    // If severe weather impact detected, create alerts
    if (
      advisory.severity === 'CRITICAL' ||
      advisory.severity === 'HIGH'
    ) {
      // Create alerts for affected commodities
      for (const commodityAdvisory of advisory.commodityAdvisories) {
        if (
          commodityAdvisory.recommendations.urgency === 'CRITICAL' ||
          commodityAdvisory.recommendations.urgency === 'HIGH'
        ) {
          const commodity = await prisma.commodity.findUnique({
            where: { id: commodityAdvisory.commodityId },
          })

          if (commodity) {
            await prisma.alert.create({
              data: {
                alertType: 'weather_spoilage_risk',
                message: `Weather forecast indicates ${advisory.severity} risk for ${commodityAdvisory.commodityName}. ${commodityAdvisory.recommendations.primary === 'SELL_IMMEDIATELY' ? 'Consider selling immediately.' : 'Monitor closely.'}`,
                severity:
                  commodityAdvisory.recommendations.urgency === 'CRITICAL'
                    ? 'danger'
                    : 'warning',
                isRead: false,
                storageUnitId,
                commodityId: commodityAdvisory.commodityId,
                spoilageRisk: `${Math.round(commodityAdvisory.forecastedConditions.forecastedSpoilageRisk)}%`,
                recommendedAction: commodityAdvisory.recommendations.primary,
              },
            })
          }
        }
      }
    }

    return NextResponse.json(advisory)
  } catch (error) {
    console.error('Crop advisory error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate crop advisory. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
