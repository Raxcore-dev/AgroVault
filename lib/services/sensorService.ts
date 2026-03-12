/**
 * Sensor Service
 *
 * Fetches IoT sensor readings (temperature + humidity) from the Supabase
 * `sensor_readings` table and enriches them with storage unit names from
 * the Neon database (Prisma).
 *
 * Table schema expected in Supabase:
 *   sensor_readings (
 *     id               text / uuid  PRIMARY KEY,
 *     storage_unit_id  text         -- matches StorageUnit.id in Neon
 *     temperature      float,
 *     humidity         float,
 *     timestamp        timestamptz
 *   )
 */

import { supabaseAdmin, SENSOR_TABLE, type SensorRow } from '@/lib/supabase'
import { prisma } from '@/lib/prisma'

// ─── Types ────────────────────────────────────────────────────────────────────

export type SensorStatus = 'normal' | 'warning' | 'danger'

export interface SensorReading {
  id: string
  storage_unit_id: string
  /** Display name matched from the Neon StorageUnit record (may be null if unit not found) */
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

  if (temperature > 28) {
    reasons.push(`Temperature critically high (${temperature.toFixed(1)}°C > 28°C)`)
    status = 'danger'
  } else if (temperature > 24) {
    reasons.push(`Temperature elevated (${temperature.toFixed(1)}°C > 24°C)`)
    if (status === 'normal') status = 'warning'
  }

  if (humidity > 75) {
    reasons.push(`Humidity critically high (${humidity.toFixed(1)}% > 75%) — mold risk`)
    status = 'danger'
  } else if (humidity > 70) {
    reasons.push(`Humidity elevated (${humidity.toFixed(1)}%)`)
    if (status === 'normal') status = 'warning'
  } else if (humidity < 40) {
    reasons.push(`Humidity too low (${humidity.toFixed(1)}% < 40%) — drying risk`)
    if (status === 'normal') status = 'warning'
  }

  return { status, reasons }
}

// ─── Fetch helpers ────────────────────────────────────────────────────────────

/**
 * Fetch the latest sensor reading for every storage unit
 * that belongs to a specific farmer (filtered by Neon DB).
 *
 * Steps:
 *   1. Load the farmer's storage unit IDs + metadata from Neon.
 *   2. Query Supabase for the latest reading per each unit ID.
 *   3. Enrich with names from step 1.
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
    return { readings: [], summary: buildSummary([], units.length) }
  }

  const unitIds = units.map((u) => u.id)
  const unitMap = new Map(units.map((u) => [u.id, u]))

  // 2. Fetch latest reading per storage unit from Supabase
  //    Supabase doesn't support DISTINCT ON natively via JS client,
  //    so we fetch the most recent N rows and deduplicate client-side.
  const { data, error } = await supabaseAdmin
    .from(SENSOR_TABLE)
    .select('id, storage_unit_id, temperature, humidity, timestamp')
    .in('storage_unit_id', unitIds)
    .order('timestamp', { ascending: false })
    .limit(unitIds.length * 5)   // fetch up to 5 recent rows per unit then deduplicate

  if (error) {
    console.error('[SensorService] Supabase error:', error.message)
    throw new Error(`Supabase error: ${error.message}`)
  }

  // Deduplicate: keep only the latest reading per storage_unit_id
  const latestByUnit = new Map<string, SensorRow>()
  for (const row of (data ?? []) as SensorRow[]) {
    if (!latestByUnit.has(row.storage_unit_id)) {
      latestByUnit.set(row.storage_unit_id, row)
    }
  }

  // 3. Build enriched readings
  const readings: SensorReading[] = []

  for (const unitId of unitIds) {
    const row = latestByUnit.get(unitId)
    const unit = unitMap.get(unitId)

    if (!row) continue   // no reading yet for this unit — skip

    const { status, reasons } = classifySensorStatus(row.temperature, row.humidity)

    readings.push({
      id: row.id,
      storage_unit_id: unitId,
      storage_unit_name: unit?.name ?? null,
      storage_unit_location: unit?.location ?? null,
      temperature: row.temperature,
      humidity: row.humidity,
      timestamp: row.timestamp,
      status,
      status_reasons: reasons,
    })
  }

  // Sort: danger → warning → normal → by unit name
  readings.sort((a, b) => {
    const order = { danger: 0, warning: 1, normal: 2 }
    const diff = order[a.status] - order[b.status]
    if (diff !== 0) return diff
    return (a.storage_unit_name ?? '').localeCompare(b.storage_unit_name ?? '')
  })

  return { readings, summary: buildSummary(readings, units.length) }
}

/**
 * Fetch the latest sensor reading for a single storage unit.
 * Returns null if no reading exists.
 */
export async function getLatestSensorReadingForUnit(
  storageUnitId: string,
): Promise<SensorReading | null> {
  const { data, error } = await supabaseAdmin
    .from(SENSOR_TABLE)
    .select('id, storage_unit_id, temperature, humidity, timestamp')
    .eq('storage_unit_id', storageUnitId)
    .order('timestamp', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null   // no rows found — not an error
    console.error('[SensorService] Supabase error:', error.message)
    throw new Error(`Supabase error: ${error.message}`)
  }

  if (!data) return null

  const row = data as SensorRow
  const { status, reasons } = classifySensorStatus(row.temperature, row.humidity)

  // Look up unit name from Neon
  const unit = await prisma.storageUnit.findUnique({
    where: { id: storageUnitId },
    select: { name: true, location: true },
  })

  return {
    id: row.id,
    storage_unit_id: storageUnitId,
    storage_unit_name: unit?.name ?? null,
    storage_unit_location: unit?.location ?? null,
    temperature: row.temperature,
    humidity: row.humidity,
    timestamp: row.timestamp,
    status,
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
): Promise<SensorRow[]> {
  const { data, error } = await supabaseAdmin
    .from(SENSOR_TABLE)
    .select('id, storage_unit_id, temperature, humidity, timestamp')
    .eq('storage_unit_id', storageUnitId)
    .order('timestamp', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[SensorService] Supabase error:', error.message)
    throw new Error(`Supabase error: ${error.message}`)
  }

  return (data ?? []) as SensorRow[]
}

/**
 * Sync a Supabase sensor reading into the Neon StorageReading table
 * so that the existing alert/spoilage pipeline is triggered.
 */
export async function syncReadingToNeon(
  reading: SensorReading,
): Promise<void> {
  const status =
    reading.status === 'danger' ? 'danger'
    : reading.status === 'warning' ? 'warning'
    : 'normal'

  await prisma.storageReading.create({
    data: {
      temperature: reading.temperature,
      humidity: reading.humidity,
      status,
      storageUnitId: reading.storage_unit_id,
      recordedAt: new Date(reading.timestamp),
    },
  })
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

  const dangerCount  = readings.filter((r) => r.status === 'danger').length
  const warningCount = readings.filter((r) => r.status === 'warning').length
  const normalCount  = readings.filter((r) => r.status === 'normal').length

  const avgTemp = readings.reduce((s, r) => s + r.temperature, 0) / readings.length
  const avgHum  = readings.reduce((s, r) => s + r.humidity, 0) / readings.length

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
