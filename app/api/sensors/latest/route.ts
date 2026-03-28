/**
 * GET /api/sensors/latest
 *
 * Returns the latest IoT sensor reading per storage unit for the
 * authenticated farmer from Neon PostgreSQL database.
 *
 * This endpoint fetches REAL sensor data from the StorageReading table
 * (populated by ESP32 devices via /api/sensors/save).
 *
 * Query params:
 *   storageUnitId  – (optional) filter to a single unit
 *
 * Response (all units):
 *   { readings: SensorReading[], summary: SensorSummary }
 *
 * Response (single unit via ?storageUnitId=xxx):
 *   { reading: SensorReading | null }
 */

import { NextRequest, NextResponse } from 'next/server'
import { authorizeRole } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

const farmerGuard = authorizeRole('farmer')

interface SensorReading {
  id: string
  storage_unit_id: string
  storage_unit_name: string | null
  storage_unit_location: string | null
  temperature: number
  humidity: number
  timestamp: string
  status: 'normal' | 'warning' | 'danger'
  status_reasons: string[]
}

interface SensorSummary {
  total_units: number
  units_with_readings: number
  danger_count: number
  warning_count: number
  normal_count: number
  avg_temperature: number | null
  avg_humidity: number | null
  last_updated: string | null
}

function classifySensorStatus(
  temperature: number,
  humidity: number,
): { status: 'normal' | 'warning' | 'danger'; reasons: string[] } {
  const reasons: string[] = []
  let status: 'normal' | 'warning' | 'danger' = 'normal'

  if (humidity > 75) {
    reasons.push('High Risk of Mold Growth')
    status = 'warning'
  }

  if (temperature > 35) {
    reasons.push('Grain Spoilage Risk')
    status = status === 'warning' ? 'danger' : 'warning'
  }

  if (temperature > 30 && !reasons.includes('High Temperature')) {
    reasons.push('High Temperature')
    if (status === 'normal') status = 'warning'
  }

  if (humidity > 85 && !reasons.includes('High Humidity')) {
    reasons.push('High Humidity')
    if (status === 'normal') status = 'warning'
  }

  return { status, reasons }
}

function buildSummary(readings: SensorReading[], totalUnits: number): SensorSummary {
  if (readings.length === 0) {
    return {
      total_units: totalUnits,
      units_with_readings: 0,
      danger_count: 0,
      warning_count: 0,
      normal_count: 0,
      avg_temperature: null,
      avg_humidity: null,
      last_updated: null,
    }
  }

  const dangerCount = readings.filter((r) => r.status === 'danger').length
  const warningCount = readings.filter((r) => r.status === 'warning').length
  const normalCount = readings.filter((r) => r.status === 'normal').length

  const avgTemp = readings.reduce((s, r) => s + r.temperature, 0) / readings.length
  const avgHum = readings.reduce((s, r) => s + r.humidity, 0) / readings.length

  const lastUpdated = readings
    .map((r) => r.timestamp)
    .sort()
    .at(-1) ?? null

  return {
    total_units: totalUnits,
    units_with_readings: readings.length,
    danger_count: dangerCount,
    warning_count: warningCount,
    normal_count: normalCount,
    avg_temperature: Math.round(avgTemp * 10) / 10,
    avg_humidity: Math.round(avgHum * 10) / 10,
    last_updated: lastUpdated,
  }
}

export async function GET(request: NextRequest) {
  const user = await farmerGuard(request)
  if (user instanceof NextResponse) return user

  const { searchParams } = new URL(request.url)
  const storageUnitId = searchParams.get('storageUnitId')?.trim()

  try {
    // ── Single unit ──────────────────────────────────────────────────────────
    if (storageUnitId) {
      // Verify the storage unit belongs to this farmer
      const unit = await prisma.storageUnit.findFirst({
        where: { id: storageUnitId, farmerId: user.userId },
        select: { id: true, name: true, location: true },
      })

      if (!unit) {
        return NextResponse.json(
          { error: 'Storage unit not found or access denied.' },
          { status: 404 },
        )
      }

      // Get the latest reading for this unit
      const latestReading = await prisma.storageReading.findFirst({
        where: { storageUnitId },
        orderBy: { recordedAt: 'desc' },
      })

      if (!latestReading) {
        return NextResponse.json(
          { 
            reading: null,
            message: 'No sensor readings available yet. Waiting for ESP32 device to send data.',
            storage_unit: {
              id: unit.id,
              name: unit.name,
              location: unit.location,
            }
          },
          { status: 404 },
        )
      }

      const { status, reasons } = classifySensorStatus(
        latestReading.temperature,
        latestReading.humidity,
      )

      const reading: SensorReading = {
        id: latestReading.id,
        storage_unit_id: storageUnitId,
        storage_unit_name: unit.name,
        storage_unit_location: unit.location,
        temperature: latestReading.temperature,
        humidity: latestReading.humidity,
        timestamp: latestReading.recordedAt.toISOString(),
        status,
        status_reasons: reasons,
      }

      return NextResponse.json({ reading })
    }

    // ── All units for this farmer ────────────────────────────────────────────
    // Get all storage units for this farmer
    const units = await prisma.storageUnit.findMany({
      where: { farmerId: user.userId },
      select: { id: true, name: true, location: true },
    })

    if (units.length === 0) {
      return NextResponse.json({ 
        readings: [], 
        summary: buildSummary([], 0),
        message: 'No storage units found. Add a storage unit to start monitoring.'
      })
    }

    const unitIds = units.map((u) => u.id)
    const unitMap = new Map(units.map((u) => [u.id, u]))

    // Get the latest reading for each unit using Prisma's findMany with distinct
    // Since Prisma doesn't support DISTINCT ON directly, we fetch recent readings and deduplicate
    const allRecentReadings = await prisma.storageReading.findMany({
      where: { storageUnitId: { in: unitIds } },
      orderBy: { recordedAt: 'desc' },
      take: unitIds.length * 5, // Get up to 5 recent readings per unit
    })

    // Deduplicate: keep only the latest reading per storageUnitId
    const readingMap = new Map<string, typeof allRecentReadings[0]>()
    for (const reading of allRecentReadings) {
      if (!readingMap.has(reading.storageUnitId)) {
        readingMap.set(reading.storageUnitId, reading)
      }
    }

    const latestReadings = Array.from(readingMap.values()).map((reading) => ({
      id: reading.id,
      temperature: reading.temperature,
      humidity: reading.humidity,
      status: reading.status,
      recordedAt: reading.recordedAt,
      storageUnitId: reading.storageUnitId,
    }))

    // Build enriched readings
    const readings: SensorReading[] = latestReadings.map((reading) => {
      const unit = unitMap.get(reading.storageUnitId)
      const { status, reasons } = classifySensorStatus(reading.temperature, reading.humidity)

      return {
        id: reading.id,
        storage_unit_id: reading.storageUnitId,
        storage_unit_name: unit?.name ?? null,
        storage_unit_location: unit?.location ?? null,
        temperature: reading.temperature,
        humidity: reading.humidity,
        timestamp: reading.recordedAt.toISOString(),
        status: status as 'normal' | 'warning' | 'danger',
        status_reasons: reasons,
      }
    })

    // Sort readings: danger first, then warning, then normal
    readings.sort((a, b) => {
      const order = { danger: 0, warning: 1, normal: 2 }
      const diff = order[a.status] - order[b.status]
      if (diff !== 0) return diff
      return (a.storage_unit_name ?? '').localeCompare(b.storage_unit_name ?? '')
    })

    return NextResponse.json({ 
      readings, 
      summary: buildSummary(readings, units.length),
      source: 'neon',
      mode: 'live' as const
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[SensorsAPI /latest] Error:', message)
    return NextResponse.json(
      { error: 'Unable to fetch sensor data.', details: message },
      { status: 500 },
    )
  }
}
