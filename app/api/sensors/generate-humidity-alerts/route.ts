/**
 * POST /api/sensors/generate-humidity-alerts
 *
 * Automatically generates humidity alerts in the database for storage units
 * with high-risk humidity levels (>75%).
 *
 * Prevents duplicate alerts within 24 hours for the same storage unit.
 *
 * Response:
 *   {
 *     alerts_created: number,
 *     alerts: Alert[]
 *   }
 */

import { NextRequest, NextResponse } from 'next/server'
import { authorizeRole } from '@/lib/api-auth'
import { getLatestSensorReadingsForFarmer } from '@/lib/services/sensorService'
import {
  generateHumidityRecommendations,
  classifyHumidityStatus,
} from '@/lib/services/humidity-recommendation'
import { prisma } from '@/lib/prisma'

const farmerGuard = authorizeRole('farmer')

export async function POST(request: NextRequest) {
  const user = await farmerGuard(request)
  if (user instanceof NextResponse) return user

  try {
    const { readings } = await getLatestSensorReadingsForFarmer(user.userId)

    // Filter high-risk readings
    const highRiskReadings = readings.filter((r) => {
      const status = classifyHumidityStatus(r.humidity)
      return status === 'high'
    })

    if (highRiskReadings.length === 0) {
      return NextResponse.json({
        alerts_created: 0,
        alerts: [],
        message: 'No high-risk humidity conditions detected.',
      })
    }

    // Fetch storage units with commodity data
    const storageUnits = await prisma.storageUnit.findMany({
      where: { farmerId: user.userId },
      include: {
        Commodity: {
          orderBy: { dateStored: 'desc' },
          take: 1,
        },
      },
    })

    const unitMap = new Map(
      storageUnits.map((unit) => [
        unit.id,
        {
          cropType: unit.Commodity[0]?.commodityName,
          commodityId: unit.Commodity[0]?.id,
        },
      ]),
    )

    const createdAlerts = []
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    for (const reading of highRiskReadings) {
      // Check for existing alert within 24 hours
      const existingAlert = await prisma.alert.findFirst({
        where: {
          storageUnitId: reading.storage_unit_id,
          alertType: 'high_humidity',
          timestamp: { gte: twentyFourHoursAgo },
        },
      })

      if (existingAlert) {
        continue // Skip if alert already exists
      }

      const unitData = unitMap.get(reading.storage_unit_id)
      const analysis = generateHumidityRecommendations(
        reading.humidity,
        reading.temperature,
        unitData?.cropType,
      )

      // Create alert
      const alert = await prisma.alert.create({
        data: {
          alertType: 'high_humidity',
          message: `High humidity detected in ${reading.storage_unit_name || 'storage unit'}. Current humidity: ${reading.humidity.toFixed(1)}%. ${analysis.ai_insight}`,
          severity: 'danger',
          storageUnitId: reading.storage_unit_id,
          commodityId: unitData?.commodityId || null,
          isRead: false,
        },
      })

      createdAlerts.push(alert)
    }

    return NextResponse.json({
      alerts_created: createdAlerts.length,
      alerts: createdAlerts,
      message: `${createdAlerts.length} humidity alert(s) created successfully.`,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[GenerateHumidityAlertsAPI] Error:', message)
    return NextResponse.json(
      { error: 'Unable to generate humidity alerts.' },
      { status: 500 },
    )
  }
}
