/**
 * GET /api/risk
 *
 * Returns real-time risk assessments based on live sensor data
 * from the Neon PostgreSQL database.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RiskAssessment {
  storageUnitId: string
  storageUnitName: string
  storageUnitLocation: string
  riskLevel: 'low' | 'medium' | 'high'
  temperature: number
  humidity: number
  spoilageRisk: number
  recommendation: string
  status_reasons: string[]
  timestamp: string
}

function calculateRiskAssessment(
  temperature: number,
  humidity: number,
  storageUnitId: string,
  storageUnitName: string,
  storageUnitLocation: string,
  timestamp: string
): RiskAssessment {
  // Calculate spoilage risk based on temperature and humidity
  let spoilageRisk = 0

  // Temperature risk (optimal: 15-25°C)
  if (temperature < 10) spoilageRisk += 20
  else if (temperature < 15) spoilageRisk += 10
  else if (temperature > 35) spoilageRisk += 40
  else if (temperature > 30) spoilageRisk += 25
  else if (temperature > 25) spoilageRisk += 10

  // Humidity risk (optimal: 55-70%)
  if (humidity > 85) spoilageRisk += 40
  else if (humidity > 75) spoilageRisk += 30
  else if (humidity > 70) spoilageRisk += 15
  else if (humidity < 50) spoilageRisk += 20
  else if (humidity < 55) spoilageRisk += 10

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high'
  if (spoilageRisk >= 50) riskLevel = 'high'
  else if (spoilageRisk >= 25) riskLevel = 'medium'
  else riskLevel = 'low'

  // Generate recommendation
  let recommendation = ''
  if (riskLevel === 'high') {
    recommendation = 'Immediate action required. Increase ventilation and monitor conditions every 2 hours.'
  } else if (riskLevel === 'medium') {
    recommendation = 'Check ventilation systems and consider reducing storage density.'
  } else {
    recommendation = 'Storage conditions are optimal. Continue regular monitoring.'
  }

  // Generate status reasons
  const status_reasons: string[] = []
  if (humidity > 75) status_reasons.push('High Risk of Mold Growth')
  if (temperature > 35) status_reasons.push('Grain Spoilage Risk')
  if (temperature > 30 && !status_reasons.includes('High Temperature')) status_reasons.push('High Temperature')
  if (humidity > 85 && !status_reasons.includes('High Humidity')) status_reasons.push('High Humidity')

  return {
    storageUnitId,
    storageUnitName,
    storageUnitLocation,
    riskLevel,
    temperature,
    humidity,
    spoilageRisk: Math.min(100, spoilageRisk),
    recommendation,
    status_reasons,
    timestamp,
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the latest sensor readings for all storage units
    const latestReadings = await prisma.$queryRaw<
      Array<{
        id: string
        temperature: number
        humidity: number
        status: string
        recordedAt: Date
        storageUnitId: string
        storageUnitName: string
        storageUnitLocation: string
      }>
    >`
      SELECT DISTINCT ON (r."storageUnitId") 
        r.id, 
        r.temperature, 
        r.humidity, 
        r.status, 
        r."recordedAt",
        r."storageUnitId",
        u.name as "storageUnitName",
        u.location as "storageUnitLocation"
      FROM "StorageReading" r
      INNER JOIN "StorageUnit" u ON r."storageUnitId" = u.id
      ORDER BY r."storageUnitId", r."recordedAt" DESC
    `

    // Convert readings to risk assessments
    const riskAssessments: RiskAssessment[] = latestReadings.map((reading) =>
      calculateRiskAssessment(
        reading.temperature,
        reading.humidity,
        reading.storageUnitId,
        reading.storageUnitName,
        reading.storageUnitLocation,
        reading.recordedAt.toISOString()
      )
    )

    return NextResponse.json(riskAssessments)
  } catch (error: any) {
    console.error('[RiskAPI] Error:', error.message)
    return NextResponse.json(
      { error: 'Failed to fetch risk data', details: error.message },
      { status: 500 }
    )
  }
}
