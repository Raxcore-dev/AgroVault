/**
 * GET /api/sensors
 *
 * Legacy sensor endpoint — now backed by Supabase for authenticated farmers.
 * Unauthenticated requests receive mock data (used by public pages like /temperature).
 */
import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { getLatestSensorReadingsForFarmer } from '@/lib/services/sensorService'
import { generateSensorData } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)

  if (user) {
    try {
      const { readings, summary } = await getLatestSensorReadingsForFarmer(user.userId)
      return NextResponse.json({ readings, summary, source: 'supabase' })
    } catch (err) {
      console.error('[SensorsAPI] Supabase error, falling back to mock:', err)
    }
  }

  // Unauthenticated or Supabase unavailable — fall back to mock data
  const data = generateSensorData()
  return NextResponse.json({ ...data, source: 'mock' })
}
