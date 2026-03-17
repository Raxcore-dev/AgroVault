/**
 * GET /api/spoilage-predictions
 * 
 * Returns spoilage predictions for all storage units owned by the authenticated farmer.
 * Analyzes current storage conditions and predicts potential losses.
 * 
 * Query parameters:
 *   - storageUnitId (optional): Get prediction for specific storage unit
 *   - highRiskOnly (optional): Only return high-risk predictions
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { predictSpoilage } from '@/lib/services/spoilage-prediction'

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

    // Fetch storage units with commodities and latest readings
    const storageUnits = await prisma.storageUnit.findMany({
      where,
      include: {
        commodities: {
          where: {
            quantity: { gt: 0 } // Only active commodities
          }
        },
        readings: {
          orderBy: { recordedAt: 'desc' },
          take: 1 // Get latest reading
        }
      }
    })

    // Generate predictions for each commodity
    const predictions = []

    for (const unit of storageUnits) {
      // Skip if no recent readings
      if (unit.readings.length === 0) {
        continue
      }

      const latestReading = unit.readings[0]

      for (const commodity of unit.commodities) {
        // Get market price for this commodity (simplified - you can enhance this)
        const marketPrice = await getMarketPrice(commodity.commodityName.toLowerCase())

        const prediction = predictSpoilage(
          unit.id,
          unit.name,
          commodity.id,
          commodity.commodityName,
          commodity.quantity,
          commodity.unit,
          commodity.dateStored,
          latestReading.temperature,
          latestReading.humidity,
          marketPrice
        )

        // Filter by risk level if requested
        if (highRiskOnly && prediction.riskLevel.level !== 'high') {
          continue
        }

        predictions.push({
          ...prediction,
          storageLocation: unit.location,
          lastReadingTime: latestReading.recordedAt
        })
      }
    }

    // Sort by risk level (high first) and spoilage percentage
    predictions.sort((a, b) => {
      const riskOrder = { high: 0, moderate: 1, safe: 2 }
      const riskDiff = riskOrder[a.riskLevel.level] - riskOrder[b.riskLevel.level]
      if (riskDiff !== 0) return riskDiff
      return b.estimatedSpoilagePercentage - a.estimatedSpoilagePercentage
    })

    // Calculate summary statistics
    const summary = {
      totalPredictions: predictions.length,
      highRiskCount: predictions.filter(p => p.riskLevel.level === 'high').length,
      moderateRiskCount: predictions.filter(p => p.riskLevel.level === 'moderate').length,
      safeCount: predictions.filter(p => p.riskLevel.level === 'safe').length,
      totalEstimatedLoss: predictions.reduce((sum, p) => sum + (p.estimatedEconomicLoss || 0), 0),
      alertsNeeded: predictions.filter(p => p.shouldCreateAlert).length
    }

    return NextResponse.json({
      predictions,
      summary
    })
  } catch (error) {
    console.error('[Spoilage Predictions GET] Error:', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

/**
 * Helper function to get market price for a commodity
 * This is a simplified version - you can enhance it to fetch from Market table
 */
async function getMarketPrice(commodityName: string): Promise<number | undefined> {
  try {
    // Try to get average price from Market table
    const markets = await prisma.market.findMany({
      where: {
        commodity: {
          contains: commodityName,
          mode: 'insensitive'
        }
      },
      orderBy: { lastUpdated: 'desc' },
      take: 5
    })

    if (markets.length > 0) {
      const avgPrice = markets.reduce((sum, m) => sum + m.pricePerKg, 0) / markets.length
      return avgPrice
    }

    // Fallback prices for common commodities (KES per kg)
    const fallbackPrices: Record<string, number> = {
      maize: 45,
      'white maize': 45,
      'yellow maize': 42,
      beans: 80,
      'red beans': 85,
      'white beans': 90,
      wheat: 50,
      rice: 120,
      sorghum: 40,
      millet: 55,
      potatoes: 35,
      tomatoes: 60,
      onions: 50,
      cabbage: 30
    }

    return fallbackPrices[commodityName] || 50 // Default 50 KES/kg
  } catch (error) {
    console.error('Error fetching market price:', error)
    return undefined
  }
}
