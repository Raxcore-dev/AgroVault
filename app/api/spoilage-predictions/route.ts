/**
 * GET /api/spoilage-predictions
 * 
 * Returns enhanced spoilage predictions with real-time trend analysis
 * for all storage units owned by the authenticated farmer.
 * 
 * Query parameters:
 *   - storageUnitId (optional): Get prediction for specific storage unit
 *   - highRiskOnly (optional): Only return high-risk predictions
 *   - includeTrends (optional): Include detailed trend data (default: true)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import {
  predictSpoilageEnhanced,
  getHistoricalReadings,
  getMarketPriceForCommodity,
} from '@/lib/services/spoilage-prediction-enhanced'

export async function GET(request: NextRequest) {
  try {
    // Auth check
    const auth = await getAuthUser(request)
    if (!auth) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    if (auth.role !== 'farmer') {
      return NextResponse.json({ error: 'Only farmers can access spoilage predictions.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const storageUnitId = searchParams.get('storageUnitId')
    const highRiskOnly = searchParams.get('highRiskOnly') === 'true'

    // Build query
    const where: any = { farmerId: auth.userId }
    if (storageUnitId) {
      where.id = storageUnitId
    }

    // Fetch storage units with commodities
    const storageUnits = await prisma.storageUnit.findMany({
      where,
      include: {
        commodities: {
          where: {
            quantity: { gt: 0 } // Only active commodities
          }
        }
      }
    })

    // Generate enhanced predictions for each commodity
    const predictions = []

    for (const unit of storageUnits) {
      // Get historical readings for trend analysis
      const historicalReadings = await getHistoricalReadings(unit.id, 30) // Last 30 minutes

      // Skip if no readings at all
      if (historicalReadings.length === 0) {
        continue
      }

      // Get current conditions (latest reading)
      const currentReading = historicalReadings[0]

      for (const commodity of unit.commodities) {
        // Get market price for this commodity
        const marketPrice = await getMarketPriceForCommodity(commodity.commodityName)

        const prediction = await predictSpoilageEnhanced(
          unit.id,
          unit.name,
          unit.location,
          unit.latitude || 0,
          unit.longitude || 0,
          commodity.id,
          commodity.commodityName,
          commodity.quantity,
          commodity.unit,
          commodity.dateStored,
          currentReading.temperature,
          currentReading.humidity,
          historicalReadings,
          marketPrice
        )

        // Filter by risk level if requested
        if (highRiskOnly && prediction.riskLevel.level !== 'high' && prediction.riskLevel.level !== 'critical') {
          continue
        }

        predictions.push(prediction)
      }
    }

    // Sort by risk score (critical/high first) and spoilage percentage
    predictions.sort((a, b) => {
      const riskOrder = { critical: 0, high: 1, moderate: 2, safe: 3 }
      const riskDiff = riskOrder[a.riskLevel.level] - riskOrder[b.riskLevel.level]
      if (riskDiff !== 0) return riskDiff
      return b.estimatedSpoilagePercentage - a.estimatedSpoilagePercentage
    })

    // Calculate summary statistics
    const summary = {
      totalPredictions: predictions.length,
      criticalRiskCount: predictions.filter(p => p.riskLevel.level === 'critical').length,
      highRiskCount: predictions.filter(p => p.riskLevel.level === 'high').length,
      moderateRiskCount: predictions.filter(p => p.riskLevel.level === 'moderate').length,
      safeCount: predictions.filter(p => p.riskLevel.level === 'safe').length,
      totalEstimatedLoss: predictions.reduce((sum, p) => sum + (p.estimatedEconomicLoss || 0), 0),
      alertsNeeded: predictions.filter(p => 
        p.riskLevel.level === 'critical' || 
        p.riskLevel.level === 'high' || 
        p.earlyWarning?.triggered
      ).length,
      withEarlyWarnings: predictions.filter(p => p.earlyWarning?.triggered).length,
    }

    return NextResponse.json({
      predictions,
      summary,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Spoilage Predictions GET] Error:', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
