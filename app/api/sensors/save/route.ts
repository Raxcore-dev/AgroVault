/**
 * POST /api/sensors/save
 * 
 * Receives sensor data from IoT device and saves to database
 * Required body: { storageUnitId, temperature, humidity }
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { storageUnitId, temperature, humidity } = body

    // Validate required fields
    if (!storageUnitId || temperature === undefined || humidity === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: storageUnitId, temperature, humidity' },
        { status: 400 }
      )
    }

    // Determine status based on thresholds
    let status = 'normal'
    if (temperature > 25 || temperature < 10 || humidity > 85 || humidity < 40) {
      status = 'warning'
    }
    if (temperature > 30 || temperature < 5 || humidity > 95 || humidity < 30) {
      status = 'danger'
    }

    // Save to database
    const reading = await prisma.storageReading.create({
      data: {
        storageUnitId,
        temperature: parseFloat(temperature),
        humidity: parseFloat(humidity),
        status,
      },
    })

    // Check if alerts should be generated
    if (status === 'warning' || status === 'danger') {
      const alerts = []

      if (temperature > 25) {
        alerts.push({
          storageUnitId,
          alertType: 'high_temperature',
          message: `Temperature is ${temperature}°C (threshold: 25°C)`,
          severity: status,
        })
      }

      if (temperature < 10) {
        alerts.push({
          storageUnitId,
          alertType: 'low_temperature',
          message: `Temperature is ${temperature}°C (minimum: 10°C)`,
          severity: status,
        })
      }

      if (humidity > 85) {
        alerts.push({
          storageUnitId,
          alertType: 'high_humidity',
          message: `Humidity is ${humidity}% (threshold: 85%)`,
          severity: status,
        })
      }

      if (humidity < 40) {
        alerts.push({
          storageUnitId,
          alertType: 'low_humidity',
          message: `Humidity is ${humidity}% (minimum: 40%)`,
          severity: status,
        })
      }

      // Create alerts in bulk
      for (const alert of alerts) {
        await prisma.alert.create({ data: alert })
      }
    }

    return NextResponse.json(
      {
        success: true,
        reading,
        message: 'Sensor data saved successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[SensorsAPI:Save] Error:', error)
    return NextResponse.json(
      { error: 'Failed to save sensor data' },
      { status: 500 }
    )
  }
}
