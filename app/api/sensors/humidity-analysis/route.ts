/**
 * GET /api/sensors/humidity-analysis
 *
 * Returns sensor readings enriched with AI-powered humidity analysis
 * and recommendations for the authenticated farmer.
 *
 * Response:
 *   {
 *     readings: EnrichedSensorReading[],
 *     summary: SensorSummary,
 *     alerts: HumidityAlert[]
 *   }
 */

import { NextRequest, NextResponse } from 'next/server'
import { authorizeRole } from '@/lib/api-auth'
import { getLatestSensorReadingsForFarmer } from '@/lib/services/sensorService'
import {
  generateHumidityRecommendations,
  calculateHumidityRiskScore,
  getAlertPriority,
  type HumidityAnalysis,
} from '@/lib/services/humidity-recommendation'
import { prisma } from '@/lib/prisma'

const farmerGuard = authorizeRole('farmer')

interface EnrichedSensorReading {
  id: string
  storage_unit_id: string
  storage_unit_name: string | null
  storage_unit_location: string | null
  temperature: number
  humidity: number
  timestamp: string
  status: string
  status_reasons: string[]
  humidity_analysis: HumidityAnalysis
  risk_score: number
  alert_priority: string
  crop_type?: string
  storage_duration?: number
}

interface HumidityAlert {
  storage_unit_id: string
  storage_unit_name: string | null
  humidity: number
  status: string
  priority: string
  message: string
  recommendations: string[]
}

export async function GET(request: NextRequest) {
  const user = await farmerGuard(request)
  if (user instanceof NextResponse) return user

  try {
    // Fetch sensor readings
    const { readings, summary } = await getLatestSensorReadingsForFarmer(user.userId)

    // Fetch storage units with commodity data for crop-specific analysis
    const storageUnits = await prisma.storageUnit.findMany({
      where: { farmerId: user.userId },
      include: {
        commodities: {
          orderBy: { dateStored: 'desc' },
          take: 1,
        },
      },
    })

    const unitMap = new Map(
      storageUnits.map((unit) => [
        unit.id,
        {
          cropType: unit.commodities[0]?.commodityName,
          storageDuration: unit.commodities[0]
            ? Math.floor(
                (Date.now() - new Date(unit.commodities[0].dateStored).getTime()) /
                  (1000 * 60 * 60 * 24),
              )
            : undefined,
        },
      ]),
    )

    // Enrich readings with humidity analysis
    const enrichedReadings: EnrichedSensorReading[] = readings.map((reading) => {
      const unitData = unitMap.get(reading.storage_unit_id)
      const analysis = generateHumidityRecommendations(
        reading.humidity,
        reading.temperature,
        unitData?.cropType,
        unitData?.storageDuration,
      )
      const riskScore = calculateHumidityRiskScore(
        reading.humidity,
        reading.temperature,
        unitData?.storageDuration,
      )
      const priority = getAlertPriority(analysis.status, riskScore)

      return {
        ...reading,
        humidity_analysis: analysis,
        risk_score: riskScore,
        alert_priority: priority,
        crop_type: unitData?.cropType,
        storage_duration: unitData?.storageDuration,
      }
    })

    // Generate alerts for high-risk units
    const alerts: HumidityAlert[] = enrichedReadings
      .filter((r) => r.humidity_analysis.status === 'high' || r.alert_priority === 'critical')
      .map((r) => ({
        storage_unit_id: r.storage_unit_id,
        storage_unit_name: r.storage_unit_name,
        humidity: r.humidity,
        status: r.humidity_analysis.status,
        priority: r.alert_priority,
        message: `High humidity detected in ${r.storage_unit_name || 'storage unit'}. Current humidity: ${r.humidity.toFixed(1)}%`,
        recommendations: r.humidity_analysis.immediate_actions,
      }))

    return NextResponse.json({
      readings: enrichedReadings,
      summary,
      alerts,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[HumidityAnalysisAPI] Error:', message)
    return NextResponse.json(
      { error: 'Unable to fetch humidity analysis.' },
      { status: 500 },
    )
  }
}
