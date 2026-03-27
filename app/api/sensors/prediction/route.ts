/**
 * GET /api/sensors/prediction
 *
 * Real-time AI-powered spoilage prediction endpoint
 * 
 * Analyzes current sensor data with historical trends to predict
 * spoilage risk BEFORE it happens using RAX AI.
 *
 * Query parameters:
 *   - storageUnitId (optional): Get prediction for specific unit
 *   - includeTrends (default: true): Include detailed trend analysis
 *   - forceAI (default: false): Force AI analysis even if cached
 *
 * Response includes:
 *   - Current temperature and humidity
 *   - Trend analysis (rising/falling/stable)
 *   - Duration of exposure to risky conditions
 *   - AI-powered risk prediction
 *   - Early warnings
 *   - Actionable recommendations
 *   - Market suggestions (if risk is high)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import {
  predictSpoilageWithAI,
  getHistoricalSensorReadings,
  getMarketPriceForCommodity,
  analyzeTrend,
} from '@/lib/services/ai-spoilage-prediction'
import { getLatestSensorReadingsForFarmer } from '@/lib/services/sensorService'

// Cache to avoid repeated AI calls for same conditions
interface PredictionCache {
  prediction: any
  timestamp: number
}

const predictionCache = new Map<string, PredictionCache>()
const CACHE_TTL_MS = 30 * 1000 // 30 seconds cache for real-time feel

export async function GET(request: NextRequest) {
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
        { error: 'Only farmers can access spoilage predictions.' },
        { status: 403 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const storageUnitId = searchParams.get('storageUnitId')
    const includeTrends = searchParams.get('includeTrends') !== 'false'
    const forceAI = searchParams.get('forceAI') === 'true'

    // Fetch farmer's storage units
    const where: any = { farmerId: auth.userId }
    if (storageUnitId) {
      where.id = storageUnitId
    }

    const storageUnits = await prisma.storageUnit.findMany({
      where,
      include: {
        commodities: {
          where: { quantity: { gt: 0 } },
        },
      },
    })

    if (storageUnits.length === 0) {
      return NextResponse.json({
        predictions: [],
        summary: {
          totalPredictions: 0,
          criticalRiskCount: 0,
          highRiskCount: 0,
          warningCount: 0,
          safeCount: 0,
          totalEstimatedLoss: 0,
          earlyWarningsCount: 0,
        },
        message: 'No storage units found. Add storage units to see predictions.',
      })
    }

    // Get latest sensor readings (from Supabase live or simulation)
    const { readings: sensorReadings } = await getLatestSensorReadingsForFarmer(auth.userId)

    // Create a map of storage unit ID to sensor reading
    const sensorMap = new Map(
      sensorReadings.map(r => [r.storage_unit_id, r])
    )

    // Generate predictions for each commodity
    const predictions = []

    for (const unit of storageUnits) {
      // Get sensor reading for this unit
      const sensorReading = sensorMap.get(unit.id)
      
      // Skip if no sensor data available
      if (!sensorReading) {
        continue
      }

      // Get historical readings for trend analysis
      const historicalReadings = await getHistoricalSensorReadings(unit.id, 20)
      
      // If no historical data, create from current reading
      if (historicalReadings.length === 0) {
        historicalReadings.push({
          temperature: sensorReading.temperature,
          humidity: sensorReading.humidity,
          timestamp: new Date(sensorReading.timestamp),
        })
      }

      for (const commodity of unit.commodities) {
        try {
          // Check cache (unless forceAI)
          const cacheKey = `${unit.id}-${commodity.id}-${Math.round(sensorReading.temperature)}-${Math.round(sensorReading.humidity)}`
          
          if (!forceAI) {
            const cached = predictionCache.get(cacheKey)
            if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
              predictions.push(cached.prediction)
              continue
            }
          }

          // Generate AI-powered prediction
          const prediction = await predictSpoilageWithAI(
            unit.id,
            unit.name,
            unit.location || 'Unknown',
            commodity.id,
            commodity.commodityName,
            commodity.quantity,
            commodity.unit,
            commodity.dateStored,
            sensorReading.temperature,
            sensorReading.humidity,
            historicalReadings
          )

          // Remove trends if not requested
          if (!includeTrends) {
            delete (prediction as any).temperatureTrend
            delete (prediction as any).humidityTrend
          }

          predictions.push(prediction)
          
          // Cache the prediction
          predictionCache.set(cacheKey, {
            prediction,
            timestamp: Date.now(),
          })
        } catch (error) {
          console.error(`[Prediction] Error for ${unit.name} - ${commodity.commodityName}:`, error)
          // Continue with other predictions
        }
      }
    }

    // Sort by risk level (critical first)
    const riskOrder: Record<string, number> = { critical: 0, high_risk: 1, warning: 2, safe: 3 }
    predictions.sort((a, b) => {
      const riskDiff = riskOrder[a.aiPrediction.riskLevel] - riskOrder[b.aiPrediction.riskLevel]
      if (riskDiff !== 0) return riskDiff
      return b.aiPrediction.spoilageProbability - a.aiPrediction.spoilageProbability
    })

    // Calculate summary
    const summary = {
      totalPredictions: predictions.length,
      criticalRiskCount: predictions.filter(p => p.aiPrediction.riskLevel === 'critical').length,
      highRiskCount: predictions.filter(p => p.aiPrediction.riskLevel === 'high_risk').length,
      warningCount: predictions.filter(p => p.aiPrediction.riskLevel === 'warning').length,
      safeCount: predictions.filter(p => p.aiPrediction.riskLevel === 'safe').length,
      totalEstimatedLoss: predictions.reduce((sum, p) => sum + (p.estimatedLoss?.value || 0), 0),
      earlyWarningsCount: predictions.filter(p => p.aiPrediction.earlyWarning.triggered).length,
    }

    return NextResponse.json({
      predictions,
      summary,
      lastUpdated: new Date().toISOString(),
      refreshInterval: 10000, // 10 seconds
    })
  } catch (error) {
    console.error('[Sensors Prediction API] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate predictions',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/sensors/prediction
 *
 * Generate prediction for specific storage unit and commodity
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth || auth.role !== 'farmer') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { storageUnitId, commodityId } = body

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
      },
    })

    if (!unit || unit.commodities.length === 0) {
      return NextResponse.json(
        { error: 'Storage unit or commodity not found' },
        { status: 404 }
      )
    }

    const commodity = unit.commodities[0]

    // Get sensor reading
    const { readings } = await getLatestSensorReadingsForFarmer(auth.userId)
    const sensorReading = readings.find(r => r.storage_unit_id === storageUnitId)

    if (!sensorReading) {
      return NextResponse.json(
        { error: 'No sensor data available for this storage unit' },
        { status: 404 }
      )
    }

    // Get historical readings
    const historicalReadings = await getHistoricalSensorReadings(storageUnitId, 20)
    if (historicalReadings.length === 0) {
      historicalReadings.push({
        temperature: sensorReading.temperature,
        humidity: sensorReading.humidity,
        timestamp: new Date(sensorReading.timestamp),
      })
    }

    // Generate prediction
    const prediction = await predictSpoilageWithAI(
      storageUnitId,
      unit.name,
      unit.location || 'Unknown',
      commodityId,
      commodity.commodityName,
      commodity.quantity,
      commodity.unit,
      commodity.dateStored,
      sensorReading.temperature,
      sensorReading.humidity,
      historicalReadings
    )

    return NextResponse.json(prediction)
  } catch (error) {
    console.error('[Sensors Prediction POST] Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate prediction' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/sensors/prediction
 *
 * Clear prediction cache
 */
export async function DELETE() {
  predictionCache.clear()
  return NextResponse.json({ message: 'Prediction cache cleared' })
}
