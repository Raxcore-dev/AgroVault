/**
 * GET /api/sensors/neon
 *
 * Returns sensor readings directly from Neon PostgreSQL (StorageReading table)
 * This is for ESP32 IoT sensors that save directly to the database.
 *
 * Query params:
 *   storageUnitId - (optional) Filter to specific unit
 *
 * This endpoint requires authentication (farmer role).
 */

import { NextRequest, NextResponse } from 'next/server'
import { authorizeRole } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

const farmerGuard = authorizeRole('farmer')

export async function GET(request: NextRequest) {
  const user = await farmerGuard(request)
  if (user instanceof NextResponse) return user

  try {
    const { searchParams } = new URL(request.url)
    const storageUnitId = searchParams.get('storageUnitId')

    let readings

    if (storageUnitId) {
      // Verify the storage unit belongs to this farmer
      const unit = await prisma.storageUnit.findFirst({
        where: { id: storageUnitId, farmerId: user.userId },
        select: { id: true, name: true, location: true },
      })

      if (!unit) {
        return NextResponse.json(
          { error: 'Storage unit not found or access denied.' },
          { status: 404 }
        )
      }

      // Get recent readings for this unit
      readings = await prisma.storageReading.findMany({
        where: { storageUnitId },
        orderBy: { recordedAt: 'desc' },
        take: 50,
        select: {
          id: true,
          temperature: true,
          humidity: true,
          status: true,
          recordedAt: true,
          storageUnitId: true,
          StorageUnit: {
            select: {
              id: true,
              name: true,
              location: true,
            },
          },
          Sensor: {
            select: {
              id: true,
              name: true,
              deviceId: true,
            },
          },
        },
      })
    } else {
      // Get latest reading for each of farmer's storage units
      const units = await prisma.storageUnit.findMany({
        where: { farmerId: user.userId },
        select: {
          id: true,
          name: true,
          location: true,
          StorageReading: {
            orderBy: { recordedAt: 'desc' },
            take: 1,
            select: {
              id: true,
              temperature: true,
              humidity: true,
              status: true,
              recordedAt: true,
              storageUnitId: true,
            },
          },
          Sensor: {
            select: {
              id: true,
              name: true,
              deviceId: true,
              status: true,
            },
          },
        },
      })

      // Flatten to get readings with unit info
      readings = units.flatMap((unit) =>
        unit.StorageReading.map((reading) => ({
          ...reading,
          storage_unit_name: unit.name,
          storage_unit_location: unit.location,
          sensors: unit.Sensor,
        }))
      )
    }

    // Transform to match frontend expected format
    const transformedReadings = readings.map((r: any) => ({
      id: r.id,
      storage_unit_id: r.storageUnitId,
      storage_unit_name: r.storage_unit_name || r.storageUnit?.name || null,
      storage_unit_location: r.storage_unit_location || r.storageUnit?.location || null,
      temperature: r.temperature,
      humidity: r.humidity,
      timestamp: r.recordedAt.toISOString(),
      status: r.status,
      status_reasons: getStatusReasons(r.temperature, r.humidity),
    }))

    return NextResponse.json({
      success: true,
      readings: transformedReadings,
      source: 'neon',
      count: transformedReadings.length,
    })
  } catch (error: any) {
    console.error('[SensorsAPI:Neon] Error:', error.message)
    return NextResponse.json(
      { error: 'Failed to fetch sensor readings from Neon', details: error.message },
      { status: 500 }
    )
  }
}

function getStatusReasons(temperature: number, humidity: number): string[] {
  const reasons: string[] = []

  if (humidity > 75) {
    reasons.push('High Risk of Mold Growth')
  }
  if (temperature > 35) {
    reasons.push('Grain Spoilage Risk')
  }
  if (temperature > 30) {
    reasons.push('High Temperature')
  }
  if (humidity > 85) {
    reasons.push('High Humidity')
  }

  return reasons.length > 0 ? reasons : []
}
