/**
 * Sensor Service
 *
 * Provides IoT sensor readings (temperature + humidity) for dashboard usage.
 *
 * All readings are fetched from the Neon PostgreSQL database (StorageReading table),
 * populated by ESP32 devices via /api/sensors/save.
 *
 * Table schema in Neon PostgreSQL:
 *   StorageReading (
 *     id               text          PRIMARY KEY,
 *     temperature      float,
 *     humidity         float,
 *     status           text,
 *     recordedAt       timestamptz,
 *     storageUnitId    text,
 *     sensorId         text?
 *   )
 */

import { prisma } from '@/lib/prisma'

// ─── Types ────────────────────────────────────────────────────────────────────

export type SensorStatus = 'normal' | 'warning' | 'danger'

export interface SensorReading {
  id: string
  storage_unit_id: string
  storage_unit_name: string | null
  storage_unit_location: string | null
  temperature: number
  humidity: number
  timestamp: string
  status: SensorStatus
  status_reasons: string[]
}

export interface SensorSummary {
  total_units: number
  units_with_readings: number
  danger_count: number
  warning_count: number
  normal_count: number
  avg_temperature: number | null
  avg_humidity: number | null
  last_updated: string | null
}

// ─── Status classification ────────────────────────────────────────────────────

function classifySensorStatus(
  temperature: number,
  humidity: number,
): { status: SensorStatus; reasons: string[] } {
  const reasons: string[] = []
  let status: SensorStatus = 'normal'

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

function sortReadings(readings: SensorReading[]): SensorReading[] {
  readings.sort((a, b) => {
    const order = { danger: 0, warning: 1, normal: 2 }
    const diff = order[a.status] - order[b.status]
    if (diff !== 0) return diff
    return (a.storage_unit_name ?? '').localeCompare(b.storage_unit_name ?? '')
  })
  return readings
}

export function getSensorMode(): 'live' {
  return 'live' // Always live - no simulation mode
}

// ─── Fetch helpers ────────────────────────────────────────────────────────────

/**
 * Fetch the latest sensor reading for every storage unit
 * that belongs to a specific farmer (filtered by Neon DB).
 *
 * Steps:
 *   1. Load the farmer's storage unit IDs + metadata from Neon.
 *   2. Query for the latest reading per each unit ID.
 *   3. Enrich with unit names and classify status.
 */
export async function getLatestSensorReadingsForFarmer(
  farmerId: string,
): Promise<{ readings: SensorReading[]; summary: SensorSummary }> {
  // 1. Fetch farmer's units from Neon
  const units = await prisma.storageUnit.findMany({
    where: { farmerId },
    select: { id: true, name: true, location: true },
  })

  if (units.length === 0) {
    return { readings: [], summary: buildSummary([], 0) }
  }

  const unitIds = units.map((u) => u.id)
  const unitMap = new Map(units.map((u) => [u.id, u]))

  // 2. Fetch latest reading per storage unit from Neon
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

  const latestReadings = Array.from(readingMap.values())

  // 3. Build enriched readings
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
      status: status as SensorStatus,
      status_reasons: reasons,
    }
  })

  return { readings: sortReadings(readings), summary: buildSummary(readings, units.length) }
}

/**
 * Fetch the latest sensor reading for a single storage unit.
 * Returns null if no reading exists.
 */
export async function getLatestSensorReadingForUnit(
  storageUnitId: string,
): Promise<SensorReading | null> {
  const unit = await prisma.storageUnit.findUnique({
    where: { id: storageUnitId },
    select: { id: true, name: true, location: true },
  })

  if (!unit) return null

  const latestReading = await prisma.storageReading.findFirst({
    where: { storageUnitId },
    orderBy: { recordedAt: 'desc' },
  })

  if (!latestReading) return null

  const { status, reasons } = classifySensorStatus(
    latestReading.temperature,
    latestReading.humidity,
  )

  return {
    id: latestReading.id,
    storage_unit_id: storageUnitId,
    storage_unit_name: unit.name,
    storage_unit_location: unit.location,
    temperature: latestReading.temperature,
    humidity: latestReading.humidity,
    timestamp: latestReading.recordedAt.toISOString(),
    status: status as SensorStatus,
    status_reasons: reasons,
  }
}

/**
 * Fetch ALL recent readings for a single storage unit (for history/charts).
 * Defaults to the last 50 readings.
 */
export async function getSensorHistoryForUnit(
  storageUnitId: string,
  limit = 50,
): Promise<Array<{
  id: string
  temperature: number
  humidity: number
  status: string
  timestamp: string
}>> {
  const readings = await prisma.storageReading.findMany({
    where: { storageUnitId },
    orderBy: { recordedAt: 'desc' },
    take: limit,
    select: {
      id: true,
      temperature: true,
      humidity: true,
      status: true,
      recordedAt: true,
    },
  })

  return readings.map((r) => ({
    id: r.id,
    temperature: r.temperature,
    humidity: r.humidity,
    status: r.status,
    timestamp: r.recordedAt.toISOString(),
  }))
}

// ─── Summary builder ──────────────────────────────────────────────────────────

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
