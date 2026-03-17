/**
 * POST /api/spoilage-predictions/generate-alerts
 * 
 * Analyzes all storage units and creates alerts for high-risk spoilage predictions.
 * This can be called manually or scheduled to run periodically.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { predictSpoilage, formatKES, formatTimeframe } from '@/lib/services/spoilage-prediction'

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const auth = await getAuthUser(request)
    if (!auth) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    if (auth.role !== 'farmer') {
      return NextResponse.json({ error: 'Only farmers can generate alerts.' }, { status: 403 })
    }

    // Fetch all storage units with commodities and latest readings
    const storageUnits = await prisma.storageUnit.findMany({
      where: { farmerId: auth.userId },
      include: {
        commodities: {
          where: { quantity: { gt: 0 } }
        },
        readings: {
          orderBy: { recordedAt: 'desc' },
          take: 1
        }
      }
    })

    const alertsCreated = []
    const predictions = []

    for (const unit of storageUnits) {
      if (unit.readings.length === 0) continue

      const latestReading = unit.readings[0]

      for (const commodity of unit.commodities) {
        // Get market price
        const marketPrice = await getMarketPrice(commodity.commodityName.toLowerCase())

        // Generate prediction
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

        predictions.push(prediction)

        // Create alert if needed
        if (prediction.shouldCreateAlert) {
          // Check if similar alert already exists (within last 24 hours)
          const existingAlert = await prisma.alert.findFirst({
            where: {
              storageUnitId: unit.id,
              commodityId: commodity.id,
              alertType: 'spoilage_prediction',
              timestamp: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
              }
            }
          })

          if (!existingAlert) {
            // Build alert message
            let message = `⚠️ Spoilage Risk Alert: ${commodity.commodityName} in "${unit.name}"\n\n`
            message += `Current Conditions:\n`
            message += `• Temperature: ${prediction.currentTemperature}°C\n`
            message += `• Humidity: ${prediction.currentHumidity}%\n\n`
            message += `Estimated Spoilage: ${prediction.estimatedSpoilagePercentage}% within ${formatTimeframe(prediction.timeframeHours)}\n`
            message += `Potential Loss: ${prediction.estimatedSpoilageQuantity.toFixed(1)} ${prediction.unit}`
            
            if (prediction.estimatedEconomicLoss) {
              message += ` (${formatKES(prediction.estimatedEconomicLoss)})`
            }
            
            message += `\n\nRecommended Actions:\n`
            prediction.immediateActions.forEach((action, i) => {
              message += `${i + 1}. ${action}\n`
            })

            if (prediction.marketRecommendation) {
              message += `\n${prediction.marketRecommendation}`
            }

            // Create the alert
            const alert = await prisma.alert.create({
              data: {
                alertType: 'spoilage_prediction',
                message,
                severity: prediction.alertSeverity,
                storageUnitId: unit.id,
                commodityId: commodity.id,
                spoilageRisk: prediction.riskLevel.level,
                recommendedAction: prediction.immediateActions[0] || 'Improve storage conditions'
              }
            })

            alertsCreated.push({
              alertId: alert.id,
              storageUnit: unit.name,
              commodity: commodity.commodityName,
              riskLevel: prediction.riskLevel.level,
              spoilagePercentage: prediction.estimatedSpoilagePercentage
            })
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      alertsCreated: alertsCreated.length,
      alerts: alertsCreated,
      totalPredictions: predictions.length,
      highRiskCount: predictions.filter(p => p.riskLevel.level === 'high').length,
      message: `Generated ${alertsCreated.length} new spoilage alerts from ${predictions.length} predictions.`
    })
  } catch (error) {
    console.error('[Generate Spoilage Alerts] Error:', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

/**
 * Helper function to get market price for a commodity
 */
async function getMarketPrice(commodityName: string): Promise<number | undefined> {
  try {
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

    // Fallback prices
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

    return fallbackPrices[commodityName] || 50
  } catch (error) {
    console.error('Error fetching market price:', error)
    return undefined
  }
}
