/**
 * Sensor Service
 *
 * Provides IoT sensor readings (temperature + humidity) for dashboard usage.
 *
 * In `SENSOR_MODE=live`, readings are loaded from Supabase and enriched with
 * storage unit names from the Neon database (Prisma).
 *
 * In `SENSOR_MODE=simulation`, location-aware virtual readings are generated
 * for demos and local testing.
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

import type { SensorRow } from '@/lib/supabase'
import { prisma } from '@/lib/prisma'
import { getWeatherForecast } from '@/lib/services/weatherService'

// ─── Types ────────────────────────────────────────────────────────────────────

export type SensorStatus = 'normal' | 'warning' | 'danger'
export type SensorMode = 'simulation' | 'live'

const SENSOR_MODE: SensorMode =
  process.env.SENSOR_MODE?.toLowerCase() === 'live' ? 'live' : 'simulation'

const SIMULATION_STEP_INTERVAL_MS = 10_000

interface SimulationRange {
  min: number
  max: number
}

interface SimulationProfile {
  temperature: SimulationRange
  humidity: SimulationRange
}

type WeatherCondition = 'hot' | 'rainy' | 'cloudy'

const WEATHER_SIMULATION_PROFILES: Record<WeatherCondition, SimulationProfile> = {
  hot: {
    temperature: { min: 28, max: 36 },
    humidity: { min: 40, max: 60 },
  },
  rainy: {
    temperature: { min: 20, max: 27 },
    humidity: { min: 70, max: 90 },
  },
  cloudy: {
    temperature: { min: 24, max: 30 },
    humidity: { min: 55, max: 70 },
  },
}

const WEATHER_CACHE_TTL_MS = 10 * 60 * 1000
const weatherConditionCache = new Map<string, { condition: WeatherCondition; timestamp: number }>()

const simulationState = new Map<
  string,
  { temperature: number; humidity: number; timestamp: number; weatherCondition: WeatherCondition }
>()

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

  if (humidity > 75) {
    reasons.push('High Risk of Mold Growth')
    status = 'warning'
  }

  if (temperature > 35) {
    reasons.push('Grain Spoilage Risk')
    status = status === 'warning' ? 'danger' : 'warning'
  }

  return { status, reasons }
}

function isRainyDescription(description: string): boolean {
  return /(rain|drizzle|thunderstorm|storm|shower|hail)/i.test(description)
}

function isCloudyDescription(description: string): boolean {
  return /(cloud|overcast|mist|fog|haze)/i.test(description)
}

async function getWeatherConditionForLocation(location: string | null | undefined): Promise<WeatherCondition> {
  const normalized = location?.trim().toLowerCase() || 'kisumu'
  const cached = weatherConditionCache.get(normalized)
  const now = Date.now()

  if (cached && now - cached.timestamp < WEATHER_CACHE_TTL_MS) {
    return cached.condition
  }

  try {
    const weather = await getWeatherForecast(location || 'Kisumu')
    const description = weather.current.description || ''
    const rainChance = Number(weather.forecast?.[0]?.rain_probability ?? 0)
    const currentTemp = Number(weather.current.temperature ?? 0)

    let condition: WeatherCondition = 'cloudy'
    if (isRainyDescription(description) || rainChance >= 60) {
      condition = 'rainy'
    } else if (currentTemp >= 30 && !isCloudyDescription(description)) {
      condition = 'hot'
    }

    weatherConditionCache.set(normalized, { condition, timestamp: now })
    return condition
  } catch (err) {
    console.error('[SensorService] Weather condition fallback to cloudy:', err)
    weatherConditionCache.set(normalized, { condition: 'cloudy', timestamp: now })
    return 'cloudy'
  }
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function roundToSingleDecimal(value: number): number {
  return Math.round(value * 10) / 10
}

function nextSimulationValue(
  previous: number | null,
  range: SimulationRange,
  maxStep = 1.4,
): number {
  if (previous == null) {
    return roundToSingleDecimal(randomBetween(range.min, range.max))
  }

  const delta = randomBetween(-maxStep, maxStep)
  const nudged = clamp(previous + delta, range.min, range.max)
  return roundToSingleDecimal(nudged)
}

async function buildSimulatedReading(
  unit: { id: string; name: string; location: string | null },
): Promise<SensorReading> {
  const now = Date.now()
  const prior = simulationState.get(unit.id)
  const weatherCondition = await getWeatherConditionForLocation(unit.location)
  const profile = WEATHER_SIMULATION_PROFILES[weatherCondition]

  // Keep values stable until the 10-second simulation tick elapses.
  if (prior && now - prior.timestamp < SIMULATION_STEP_INTERVAL_MS) {
    const { status, reasons } = classifySensorStatus(prior.temperature, prior.humidity)
    return {
      id: `sim-${unit.id}`,
      storage_unit_id: unit.id,
      storage_unit_name: unit.name,
      storage_unit_location: unit.location,
      temperature: prior.temperature,
      humidity: prior.humidity,
      timestamp: new Date(prior.timestamp).toISOString(),
      status,
      status_reasons: reasons,
    }
  }

  const temperature = nextSimulationValue(prior?.temperature ?? null, profile.temperature)
  const humidity = nextSimulationValue(prior?.humidity ?? null, profile.humidity, 2)

  simulationState.set(unit.id, {
    temperature,
    humidity,
    timestamp: now,
    weatherCondition,
  })

  const { status, reasons } = classifySensorStatus(temperature, humidity)

  return {
    id: `sim-${unit.id}`,
    storage_unit_id: unit.id,
    storage_unit_name: unit.name,
    storage_unit_location: unit.location,
    temperature,
    humidity,
    timestamp: new Date(now).toISOString(),
    status,
    status_reasons: reasons,
  }
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

async function getSupabaseConfig() {
  const { supabaseAdmin, SENSOR_TABLE } = await import('@/lib/supabase')
  return { supabaseAdmin, SENSOR_TABLE }
}

export function getSensorMode(): SensorMode {
  return SENSOR_MODE
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

  if (SENSOR_MODE === 'simulation') {
    const readings = sortReadings(await Promise.all(units.map((unit) => buildSimulatedReading(unit))))
    return { readings, summary: buildSummary(readings, units.length) }
  }

  const unitIds = units.map((u) => u.id)
  const unitMap = new Map(units.map((u) => [u.id, u]))
  const { supabaseAdmin, SENSOR_TABLE } = await getSupabaseConfig()

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

  if (SENSOR_MODE === 'simulation') {
    if (!unit) return null
    return await buildSimulatedReading(unit)
  }

  const { supabaseAdmin, SENSOR_TABLE } = await getSupabaseConfig()

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
  if (SENSOR_MODE === 'simulation') {
    const state = simulationState.get(storageUnitId)
    if (!state) return []

    // Return a synthetic flat history if requested while in simulation mode.
    return Array.from({ length: Math.max(1, Math.min(limit, 50)) }).map((_, index) => {
      const secondsAgo = index * 10
      return {
        id: `sim-history-${storageUnitId}-${index}`,
        storage_unit_id: storageUnitId,
        temperature: state.temperature,
        humidity: state.humidity,
        timestamp: new Date(state.timestamp - secondsAgo * 1_000).toISOString(),
      }
    })
  }

  const { supabaseAdmin, SENSOR_TABLE } = await getSupabaseConfig()

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
