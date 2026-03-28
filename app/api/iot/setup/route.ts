/**
 * POST /api/iot/setup
 * 
 * Creates a storage unit for IoT testing
 * Call this once to get a storageUnitId for your ESP32
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('[IoT:Setup] Creating storage unit for ESP32...')

    // Find or create a farmer user
    let farmer = await prisma.user.findFirst({
      where: { role: 'farmer' },
    })

    if (!farmer) {
      console.log('[IoT:Setup] Creating new farmer user...')
      farmer = await prisma.user.create({
        data: {
          name: 'IoT Test Farmer',
          email: `iot-test-${Date.now()}@agrovault.local`,
          password: 'placeholder_hash_not_used',
          role: 'farmer',
          phone: '+254700000000',
          location: 'Nakuru',
        },
      })
    }

    // Create storage unit
    const storageUnit = await prisma.storageUnit.create({
      data: {
        name: 'ESP32 Test Silo',
        location: 'Nakuru',
        capacity: 1000,
        latitude: -0.3031,
        longitude: 36.0800,
        farmerId: farmer.id,
      },
    })

    // Create sensor device
    const sensor = await prisma.sensor.create({
      data: {
        name: 'ESP32 Sensor #1',
        deviceType: 'combined',
        deviceId: 'ESP32-IOT-001',
        status: 'active',
        location: 'Zone A',
        storageUnitId: storageUnit.id,
      },
    })

    console.log('[IoT:Setup] Created storage unit:', storageUnit.id)

    return NextResponse.json({
      success: true,
      storageUnitId: storageUnit.id,
      sensorId: sensor.id,
      farmerId: farmer.id,
      message: 'Storage unit created successfully. Update your ESP32 code with storageUnitId.',
    })
  } catch (error: any) {
    console.error('[IoT:Setup] Error:', error.message)
    return NextResponse.json(
      { error: 'Failed to setup IoT storage unit', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // List existing storage units
    const units = await prisma.storageUnit.findMany({
      take: 10,
      include: {
        farmer: {
          select: { id: true, name: true, email: true },
        },
        sensors: {
          select: { id: true, name: true, deviceId: true, status: true },
        },
        _count: {
          select: { readings: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      storageUnits: units,
    })
  } catch (error: any) {
    console.error('[IoT:List] Error:', error.message)
    return NextResponse.json(
      { error: 'Failed to list storage units', details: error.message },
      { status: 500 }
    )
  }
}
