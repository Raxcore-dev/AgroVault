/**
 * POST /api/sensors/register
 * 
 * Register an IoT sensor device and link it to a storage unit.
 * Once registered, the sensor can send data using just its deviceId.
 * 
 * Request body:
 * {
 *   "storageUnitId": "string",     // ID of storage unit to monitor
 *   "deviceName": "string",         // Friendly name for this sensor
 *   "deviceId": "string",           // Unique device identifier (ESP32 MAC or custom)
 *   "deviceType": "string"          // e.g., "ESP32-DHT22"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "sensor": { ... },
 *   "message": "Sensor registered successfully"
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { authorizeRole } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

const farmerGuard = authorizeRole('farmer')

export async function POST(request: NextRequest) {
  const user = await farmerGuard(request)
  if (user instanceof NextResponse) return user

  try {
    const body = await request.json()
    const { storageUnitId, deviceName, deviceId, deviceType = 'ESP32-DHT22' } = body

    // Validate required fields
    if (!storageUnitId || !deviceId) {
      return NextResponse.json(
        { error: 'storageUnitId and deviceId are required.' },
        { status: 400 }
      )
    }

    // Verify storage unit exists and belongs to this farmer
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

    // Check if a sensor with this deviceId already exists
    const existingSensor = await prisma.sensor.findUnique({
      where: { deviceId },
    })

    if (existingSensor) {
      // Update existing sensor
      const updated = await prisma.sensor.update({
        where: { deviceId },
        data: {
          storageUnitId,
          name: deviceName || existingSensor.name,
          deviceType: deviceType || existingSensor.deviceType,
          status: 'active',
          lastSyncAt: new Date(),
        },
      })

      return NextResponse.json({
        success: true,
        sensor: updated,
        message: `Sensor updated and linked to ${unit.name}`,
      })
    }

    // Create new sensor
    const sensor = await prisma.sensor.create({
      data: {
        id: crypto.randomUUID(),
        deviceId,
        name: deviceName || `Sensor for ${unit.name}`,
        deviceType,
        storageUnitId,
        status: 'active',
        lastSyncAt: new Date(),
      },
    })

    return NextResponse.json(
      {
        success: true,
        sensor,
        storageUnit: {
          id: unit.id,
          name: unit.name,
          location: unit.location,
        },
        message: `Sensor registered and linked to ${unit.name}`,
        instructions: {
          esp32_code: `
// Use this configuration in your ESP32 code:
const char* deviceId = "${deviceId}";
const char* serverURL = "http://192.168.100.227:3000/api/sensors/save";

// In your loop(), send data like this:
String payload = "{\\\"deviceId\\\":\\\"" + String(deviceId) + 
                 "\\\",\\\"temperature\\\":" + String(temperature) + 
                 ",\\\"humidity\\\":" + String(humidity) + "}";
          `.trim(),
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('[SensorRegister] Error:', error.message)
    return NextResponse.json(
      { error: 'Failed to register sensor', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * GET /api/sensors/register
 * 
 * List all registered sensors for the authenticated farmer.
 */
export async function GET(request: NextRequest) {
  const user = await farmerGuard(request)
  if (user instanceof NextResponse) return user

  try {
    const sensors = await prisma.sensor.findMany({
      where: { StorageUnit: { farmerId: user.userId } },
      include: {
        StorageUnit: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        StorageReading: {
          orderBy: { recordedAt: 'desc' },
          take: 1,
          select: {
            id: true,
            temperature: true,
            humidity: true,
            status: true,
            recordedAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ sensors })
  } catch (error: any) {
    console.error('[SensorList] Error:', error.message)
    return NextResponse.json(
      { error: 'Failed to list sensors', details: error.message },
      { status: 500 }
    )
  }
}
