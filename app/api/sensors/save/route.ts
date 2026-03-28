/**
 * POST /api/sensors/save
 *
 * Receives sensor data from IoT device and saves to database
 * 
 * Two modes of operation:
 * 
 * 1. **Device ID Mode (Recommended)** - Sensor identifies itself by deviceId
 *    System looks up which storage unit this sensor is assigned to
 *    Request: { deviceId, temperature, humidity }
 * 
 * 2. **Storage Unit ID Mode (Legacy)** - Sensor sends storage unit ID directly
 *    Request: { storageUnitId, temperature, humidity }
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    let { deviceId, storageUnitId, temperature, humidity } = body

    console.log('[SensorsAPI:Save] Received request:', {
      deviceId,
      storageUnitId,
      temperature,
      humidity,
      timestamp: new Date().toISOString(),
    })

    let sensorId = null

    // If deviceId is provided, look up the storage unit
    if (deviceId) {
      const sensor = await prisma.sensor.findFirst({
        where: { deviceId },
        select: { id: true, storageUnitId: true, name: true },
      })

      if (!sensor) {
        return NextResponse.json(
          {
            error: 'Sensor not registered. Please register this device first.',
            deviceId,
            message: 'Use the sensor registration endpoint to link this device to a storage unit'
          },
          { status: 404 }
        )
      }

      storageUnitId = sensor.storageUnitId
      sensorId = sensor.id
      console.log('[SensorsAPI:Save] Device', deviceId, 'mapped to storage unit', storageUnitId)
    }

    // Validate required fields
    if (!storageUnitId || temperature === undefined || humidity === undefined) {
      console.log('[SensorsAPI:Save] Validation failed - missing fields')
      return NextResponse.json(
        { error: 'Missing required fields: storageUnitId (or deviceId), temperature, humidity' },
        { status: 400 }
      )
    }

    // Verify storage unit exists
    const unit = await prisma.storageUnit.findUnique({
      where: { id: storageUnitId },
      select: { id: true, name: true, farmerId: true },
    })

    if (!unit) {
      return NextResponse.json(
        { error: 'Storage unit not found.' },
        { status: 404 }
      )
    }

    // Determine status based on thresholds
    let status = 'normal'
    const reasons: string[] = []

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

    console.log('[SensorsAPI:Save] Status determined:', status, reasons)
    console.log('[SensorsAPI:Save] Attempting to save to database...')

    // Save to database with sensor reference if deviceId was provided
    const reading = await prisma.storageReading.create({
      data: {
        storageUnitId,
        sensorId: sensorId || null,
        temperature: parseFloat(temperature),
        humidity: parseFloat(humidity),
        status,
      },
    })

    console.log('[SensorsAPI:Save] Successfully saved reading:', reading.id)

    // Generate alerts if needed
    if (status === 'warning' || status === 'danger') {
      const alerts = []

      if (humidity > 75) {
        alerts.push({
          storageUnitId,
          alertType: 'high_humidity',
          message: `Humidity is ${humidity}% - ${reasons.join(', ')}`,
          severity: status,
          recommendedAction: 'Increase ventilation immediately',
        })
      }

      if (temperature > 35) {
        alerts.push({
          storageUnitId,
          alertType: 'critical_temperature',
          message: `Temperature is ${temperature}°C - ${reasons.join(', ')}`,
          severity: 'danger',
          recommendedAction: 'Emergency cooling required',
        })
      } else if (temperature > 30) {
        alerts.push({
          storageUnitId,
          alertType: 'high_temperature',
          message: `Temperature is ${temperature}°C - ${reasons.join(', ')}`,
          severity: status,
          recommendedAction: 'Monitor closely and improve ventilation',
        })
      }

      // Create alerts in database
      for (const alert of alerts) {
        await prisma.alert.create({ data: alert })
      }
      console.log('[SensorsAPI:Save] Generated', alerts.length, 'alerts')
    }

    return NextResponse.json(
      {
        success: true,
        reading: {
          ...reading,
          storage_unit_name: unit.name,
          status_reasons: reasons,
        },
        message: `Data saved for ${unit.name}`,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('[SensorsAPI:Save] Error details:', {
      message: error?.message || 'Unknown error',
      code: error?.code,
      stack: error?.stack,
    })
    return NextResponse.json(
      { error: 'Failed to save sensor data', details: error?.message || 'Unknown error' },
      { status: 500 }
    )
  }
}
