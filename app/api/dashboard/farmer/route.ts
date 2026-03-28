/**
 * Farmer Dashboard Stats API
 *
 * GET /api/dashboard/farmer – Returns summary statistics for the farmer dashboard
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorizeRole } from '@/lib/api-auth'

const farmerGuard = authorizeRole('farmer')

export async function GET(request: NextRequest) {
  const user = await farmerGuard(request)
  if (user instanceof NextResponse) return user

  const [
    storageUnits,
    totalCommodities,
    unreadAlerts,
    recentReadings,
    dangerAlerts,
  ] = await Promise.all([
    prisma.storageUnit.findMany({
      where: { farmerId: user.userId },
      include: {
        StorageReading: { orderBy: { recordedAt: 'desc' }, take: 1 },
        _count: { select: { Commodity: true, Alert: true } },
      },
    }),
    prisma.commodity.count({
      where: { StorageUnit: { farmerId: user.userId } },
    }),
    prisma.alert.count({
      where: { StorageUnit: { farmerId: user.userId }, isRead: false },
    }),
    prisma.storageReading.findMany({
      where: { StorageUnit: { farmerId: user.userId } },
      orderBy: { recordedAt: 'desc' },
      take: 10,
      include: { StorageUnit: { select: { name: true } } },
    }),
    prisma.alert.count({
      where: {
        StorageUnit: { farmerId: user.userId },
        severity: 'danger',
        isRead: false,
      },
    }),
  ])

  // Compute averages from the latest reading per unit
  const latestReadings = storageUnits
    .map((u) => u.StorageReading[0])
    .filter(Boolean)

  const avgTemp = latestReadings.length
    ? latestReadings.reduce((s, r) => s + r.temperature, 0) / latestReadings.length
    : null
  const avgHumidity = latestReadings.length
    ? latestReadings.reduce((s, r) => s + r.humidity, 0) / latestReadings.length
    : null

  return NextResponse.json({
    totalStorageUnits: storageUnits.length,
    totalCommodities,
    unreadAlerts,
    dangerAlerts,
    avgTemperature: avgTemp,
    avgHumidity,
    storageUnits: storageUnits.map((u) => ({
      id: u.id,
      name: u.name,
      location: u.location,
      capacity: u.capacity,
      commodityCount: u._count.Commodity,
      alertCount: u._count.Alert,
      latestReading: u.StorageReading[0] ?? null,
    })),
    recentReadings,
  })
}
