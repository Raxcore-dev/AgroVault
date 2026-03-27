/**
 * POST /api/market-intelligence/spoilage-triggered-insights
 *
 * Generates AI-powered market intelligence when spoilage risk is HIGH.
 * 
 * This endpoint is triggered automatically when a commodity's spoilage risk
 * score exceeds 70%. It analyzes nearby markets, price trends, and generates
 * actionable selling recommendations using RAX AI.
 *
 * Request Body:
 * {
 *   storageUnitId: string
 *   commodityName: string
 *   quantity: number
 *   unit: string
 *   latitude: number
 *   longitude: number
 *   location: string
 *   currentTemperature: number
 *   currentHumidity: number
 *   temperatureTrend: 'rising' | 'falling' | 'stable'
 *   humidityTrend: 'rising' | 'falling' | 'stable'
 *   spoilageRiskScore: number
 *   spoilageProbability: number
 *   predictedTimeToSpoilage: string
 *   daysInStorage: number
 *   optimalStorageConditions: {
 *     tempRange: { min: number, max: number }
 *     humidityRange: { min: number, max: number }
 *     maxStorageDays: number
 *   }
 *   timeInDangerousConditions: number
 * }
 *
 * Response:
 * {
 *   marketAssessment: string
 *   urgencyLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM'
 *   recommendedAction: string
 *   nearbyMarkets: Array<{
 *     marketName: string
 *     distance_km: number
 *     currentPrice: number
 *     priceHistory: { 7dayTrend: string, 30dayTrend: string, direction: 'UP' | 'DOWN' | 'STABLE' }
 *     demandLevel: string
 *     aiInsight: string
 *   }>
 *   marketTrendAnalysis: string
 *   sellingStrategy: string
 *   potentialLossPreventionValue: number
 *   aiConfidence: number
 *   timestamp: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import {
  getSpoilageTriggeredMarketIntelligence,
  SpoilageContext,
} from '@/lib/services/market-intelligence-rax'

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const auth = await getAuthUser(request)
    if (!auth) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in.' },
        { status: 401 }
      )
    }

    if (auth.role !== 'farmer') {
      return NextResponse.json(
        { error: 'Only farmers can access market intelligence.' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = [
      'storageUnitId',
      'commodityName',
      'quantity',
      'latitude',
      'longitude',
      'location',
      'currentTemperature',
      'currentHumidity',
      'spoilageRiskScore',
      'spoilageProbability',
    ]

    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Check if spoilage risk is high enough to trigger market intelligence
    if (body.spoilageRiskScore < 50 && body.spoilageProbability < 40) {
      return NextResponse.json(
        { 
          error: 'Spoilage risk too low for market intelligence',
          message: 'Market intelligence is only available for high-risk situations (risk score ≥ 50 or probability ≥ 40%)'
        },
        { status: 400 }
      )
    }

    // Build spoilage context
    const spoilageContext: SpoilageContext = {
      commodityName: body.commodityName,
      quantity: body.quantity,
      unit: body.unit || 'kg',
      location: body.location,
      latitude: body.latitude,
      longitude: body.longitude,
      currentTemperature: body.currentTemperature,
      currentHumidity: body.currentHumidity,
      temperatureTrend: body.temperatureTrend || 'stable',
      humidityTrend: body.humidityTrend || 'stable',
      spoilageRiskScore: body.spoilageRiskScore,
      spoilageProbability: body.spoilageProbability,
      predictedTimeToSpoilage: body.predictedTimeToSpoilage || 'Unknown',
      daysInStorage: body.daysInStorage || 0,
      optimalStorageConditions: body.optimalStorageConditions || {
        tempRange: { min: 15, max: 25 },
        humidityRange: { min: 60, max: 70 },
        maxStorageDays: 90,
      },
      timeInDangerousConditions: body.timeInDangerousConditions || 0,
    }

    // Generate market intelligence
    const intelligence = await getSpoilageTriggeredMarketIntelligence(spoilageContext)

    // Log the intelligence generation for analytics
    console.log('[Market Intelligence] Generated for:', {
      commodity: spoilageContext.commodityName,
      quantity: spoilageContext.quantity,
      urgencyLevel: intelligence.urgencyLevel,
      potentialLossPrevention: intelligence.potentialLossPreventionValue,
      marketsAnalyzed: intelligence.nearbyMarkets.length,
    })

    return NextResponse.json(intelligence)
  } catch (error) {
    console.error('[Market Intelligence API] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate market intelligence',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/market-intelligence/spoilage-triggered-insights
 *
 * Get market intelligence for a specific storage unit and commodity
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth || auth.role !== 'farmer') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const storageUnitId = searchParams.get('storageUnitId')
    const commodityId = searchParams.get('commodityId')

    if (!storageUnitId || !commodityId) {
      return NextResponse.json(
        { error: 'storageUnitId and commodityId are required' },
        { status: 400 }
      )
    }

    // Fetch storage unit and commodity
    const unit = await prisma.storageUnit.findUnique({
      where: { id: storageUnitId },
      include: {
        commodities: {
          where: { id: commodityId },
        },
        farmer: {
          select: { location: true },
        },
      },
    })

    if (!unit || unit.commodities.length === 0) {
      return NextResponse.json(
        { error: 'Storage unit or commodity not found' },
        { status: 404 }
      )
    }

    const commodity = unit.commodities[0]

    // Get latest sensor reading
    const latestReading = await prisma.storageReading.findFirst({
      where: { storageUnitId },
      orderBy: { recordedAt: 'desc' },
    })

    if (!latestReading) {
      return NextResponse.json(
        { error: 'No sensor data available' },
        { status: 404 }
      )
    }

    // Calculate days in storage
    const daysInStorage = Math.floor(
      (Date.now() - new Date(commodity.dateStored).getTime()) / (1000 * 60 * 60 * 24)
    )

    // Build spoilage context (simplified - in production use full AI prediction)
    const spoilageContext: SpoilageContext = {
      commodityName: commodity.commodityName,
      quantity: commodity.quantity,
      unit: commodity.unit,
      location: unit.location || unit.farmer.location || 'Kenya',
      latitude: unit.latitude || 0,
      longitude: unit.longitude || 0,
      currentTemperature: latestReading.temperature,
      currentHumidity: latestReading.humidity,
      temperatureTrend: 'stable', // Would need historical data for trend
      humidityTrend: 'stable',
      spoilageRiskScore: 70, // Default high risk for GET endpoint
      spoilageProbability: 60,
      predictedTimeToSpoilage: '24-48 hours',
      daysInStorage,
      optimalStorageConditions: {
        tempRange: { min: 15, max: 25 },
        humidityRange: { min: 60, max: 70 },
        maxStorageDays: 90,
      },
      timeInDangerousConditions: 0,
    }

    // Generate market intelligence
    const intelligence = await getSpoilageTriggeredMarketIntelligence(spoilageContext)

    return NextResponse.json(intelligence)
  } catch (error) {
    console.error('[Market Intelligence GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch market intelligence' },
      { status: 500 }
    )
  }
}
