/**
 * GET /api/sensors/latest
 *
 * Returns the latest IoT sensor reading per storage unit for the
 * authenticated farmer.
 *
 * Data source depends on SENSOR_MODE:
 *   - simulation: generated virtual readings
 *   - live: Supabase sensor_readings table
 *
 * Query params:
 *   storageUnitId  – (optional) filter to a single unit
 *   sync           – (optional) "true" to additionally sync the reading into Neon
 *
 * Response (all units):
 *   { readings: SensorReading[], summary: SensorSummary }
 *
 * Response (single unit via ?storageUnitId=xxx):
 *   SensorReading | { error: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { authorizeRole } from '@/lib/api-auth'
import {
  getLatestSensorReadingsForFarmer,
  getLatestSensorReadingForUnit,
  getSensorMode,
  syncReadingToNeon,
} from '@/lib/services/sensorService'

const farmerGuard = authorizeRole('farmer')

export async function GET(request: NextRequest) {
  const user = await farmerGuard(request)
  if (user instanceof NextResponse) return user

  const { searchParams } = new URL(request.url)
  const storageUnitId = searchParams.get('storageUnitId')?.trim()
  const shouldSync    = searchParams.get('sync') === 'true'
  const mode = getSensorMode()

  try {
    // ── Single unit ──────────────────────────────────────────────────────────
    if (storageUnitId) {
      const reading = await getLatestSensorReadingForUnit(storageUnitId)

      if (!reading) {
        return NextResponse.json(
          { error: 'No sensor readings available yet.' },
          { status: 404 },
        )
      }

      if (shouldSync) {
        await syncReadingToNeon(reading).catch((err) =>
          console.error('[SensorsAPI] Neon sync failed:', err),
        )
      }

      return NextResponse.json({ ...reading, mode })
    }

    // ── All units for this farmer ────────────────────────────────────────────
    const { readings, summary } = await getLatestSensorReadingsForFarmer(user.userId)

    if (shouldSync && readings.length > 0) {
      await Promise.allSettled(readings.map((r) => syncReadingToNeon(r)))
    }

    return NextResponse.json({ readings, summary, mode })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[SensorsAPI /latest] Error:', message)
    return NextResponse.json(
      { error: 'Unable to fetch sensor data.' },
      { status: 500 },
    )
  }
}
