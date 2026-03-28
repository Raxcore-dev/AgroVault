/**
 * GET /api/sensors
 *
 * Returns real-time sensor data from Neon PostgreSQL database.
 * This endpoint is used by authenticated farmers to get live IoT sensor readings.
 * 
 * Data source: StorageReading table (populated by ESP32 devices via /api/sensors/save)
 */
import { NextRequest, NextResponse } from 'next/server'
import { authorizeRole } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

const farmerGuard = authorizeRole('farmer')

export async function GET(request: NextRequest) {
  const user = await farmerGuard(request)
  
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required. This endpoint no longer serves mock data.' },
      { status: 401 }
    )
  }

  try {
    // Get all storage units for this farmer
    const units = await prisma.storageUnit.findMany({
      where: { farmerId: user.userId },
      select: { id: true, name: true, location: true },
    })

    if (units.length === 0) {
      return NextResponse.json({ readings: [], summary: null })
    }

    const unitIds = units.map((u) => u.id)
    const unitMap = new Map(units.map((u) => [u.id, u]))

    // Get the latest reading for each unit
    const latestReadings = await prisma.$queryRaw<
      Array<{
        id: string
        temperature: number
        humidity: number
        status: string
        recordedAt: Date
        storageUnitId: string
      }>
    >`
      SELECT DISTINCT ON ("storageUnitId") 
        id, temperature, humidity, status, "recordedAt", "storageUnitId"
      FROM "StorageReading"
      WHERE "storageUnitId" IN (${Prisma.join(unitIds)})
      ORDER BY "storageUnitId", "recordedAt" DESC
    `

    // Build enriched readings
    const readings = latestReadings.map((reading) => {
      const unit = unitMap.get(reading.storageUnitId)
      return {
        id: reading.id,
        storageId: reading.storageUnitId,
        storageName: unit?.name ?? null,
        storageLocation: unit?.location ?? null,
        temperature: reading.temperature,
        humidity: reading.humidity,
        timestamp: reading.recordedAt.toISOString(),
        status: reading.status,
      }
    })

    // Build summary
    const dangerCount = readings.filter((r) => r.status === 'danger').length
    const warningCount = readings.filter((r) => r.status === 'warning').length
    const normalCount = readings.filter((r) => r.status === 'normal').length

    const avgTemp = readings.length > 0
      ? readings.reduce((s, r) => s + r.temperature, 0) / readings.length
      : null
    const avgHum = readings.length > 0
      ? readings.reduce((s, r) => s + r.humidity, 0) / readings.length
      : null

    const summary = {
      total_units: units.length,
      units_with_readings: readings.length,
      danger_count: dangerCount,
      warning_count: warningCount,
      normal_count: normalCount,
      avg_temperature: avgTemp ? Math.round(avgTemp * 10) / 10 : null,
      avg_humidity: avgHum ? Math.round(avgHum * 10) / 10 : null,
    }

    return NextResponse.json({ 
      readings, 
      summary,
      source: 'neon',
      mode: 'live'
    })
  } catch (err: any) {
    console.error('[SensorsAPI] Error:', err.message)
    return NextResponse.json(
      { error: 'Unable to fetch sensor data.', details: err.message },
      { status: 500 }
    )
  }
}
