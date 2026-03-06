/**
 * Storage Readings API
 *
 * POST /api/storage-units/[id]/readings  – Record a new sensor reading
 *
 * Automatically generates alerts when thresholds are breached:
 *   - Temperature > 28°C  →  high_temperature / danger
 *   - Temperature > 24°C  →  high_temperature / warning
 *   - Humidity > 75%      →  high_humidity / danger
 *   - Humidity < 40%      →  low_humidity / warning
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorizeRole } from '@/lib/api-auth'

const farmerGuard = authorizeRole('farmer')

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await farmerGuard(request)
  if (user instanceof NextResponse) return user

  const { id } = await params

  const unit = await prisma.storageUnit.findFirst({
    where: { id, farmerId: user.userId },
  })
  if (!unit) {
    return NextResponse.json({ error: 'Storage unit not found.' }, { status: 404 })
  }

  const body = await request.json()
  const { temperature, humidity } = body

  if (temperature == null || humidity == null) {
    return NextResponse.json(
      { error: 'temperature and humidity are required.' },
      { status: 400 }
    )
  }

  const temp = Number(temperature)
  const hum = Number(humidity)

  // Determine status
  let status = 'normal'
  if (temp > 28 || hum > 75) status = 'danger'
  else if (temp > 24 || hum < 40 || hum > 70) status = 'warning'

  const reading = await prisma.storageReading.create({
    data: {
      temperature: temp,
      humidity: hum,
      status,
      storageUnitId: id,
    },
  })

  // Auto-generate alerts
  const alerts: { alertType: string; message: string; severity: string }[] = []

  if (temp > 28) {
    alerts.push({
      alertType: 'high_temperature',
      message: `Critical: Temperature at ${temp.toFixed(1)}°C in ${unit.name}. Immediate action required.`,
      severity: 'danger',
    })
  } else if (temp > 24) {
    alerts.push({
      alertType: 'high_temperature',
      message: `Warning: Temperature at ${temp.toFixed(1)}°C in ${unit.name}. Monitor closely.`,
      severity: 'warning',
    })
  }

  if (hum > 75) {
    alerts.push({
      alertType: 'high_humidity',
      message: `Critical: Humidity at ${hum.toFixed(1)}% in ${unit.name}. Spoilage risk is high.`,
      severity: 'danger',
    })
  } else if (hum < 40) {
    alerts.push({
      alertType: 'low_humidity',
      message: `Warning: Humidity at ${hum.toFixed(1)}% in ${unit.name}. Conditions too dry.`,
      severity: 'warning',
    })
  }

  // Check capacity
  const totalCommodity = await prisma.commodity.aggregate({
    where: { storageUnitId: id },
    _sum: { quantity: true },
  })
  const totalStored = totalCommodity._sum.quantity ?? 0
  if (totalStored > unit.capacity) {
    alerts.push({
      alertType: 'capacity_exceeded',
      message: `Capacity exceeded in ${unit.name}: ${totalStored.toFixed(0)}/${unit.capacity} tonnes.`,
      severity: 'danger',
    })
  }

  if (alerts.length > 0) {
    await prisma.alert.createMany({
      data: alerts.map((a) => ({ ...a, storageUnitId: id })),
    })
  }

  return NextResponse.json({
    reading,
    alerts: alerts.length > 0 ? alerts : null,
  }, { status: 201 })
}
