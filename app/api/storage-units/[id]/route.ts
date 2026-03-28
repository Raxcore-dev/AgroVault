/**
 * Single Storage Unit API
 *
 * GET    /api/storage-units/[id]  – Get details (with commodities + latest reading)
 * PATCH  /api/storage-units/[id]  – Update name/location/capacity/latitude/longitude
 * DELETE /api/storage-units/[id]  – Delete (cascades commodities, readings, alerts)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorizeRole } from '@/lib/api-auth'

const farmerGuard = authorizeRole('farmer')

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await farmerGuard(request)
  if (user instanceof NextResponse) return user

  const { id } = await params

  // Fetch storage unit with basic info
  const unit = await prisma.storageUnit.findFirst({
    where: { id, farmerId: user.userId },
    select: {
      id: true,
      name: true,
      location: true,
      capacity: true,
      latitude: true,
      longitude: true,
      createdAt: true,
      updatedAt: true,
      farmerId: true,
    },
  })

  if (!unit) {
    return NextResponse.json({ error: 'Storage unit not found.' }, { status: 404 })
  }

  // Fetch relationships separately to avoid timeout
  const [commodities, readings, alerts] = await Promise.all([
    prisma.commodity.findMany({
      where: { storageUnitId: id },
      orderBy: { dateStored: 'desc' },
    }),
    prisma.storageReading.findMany({
      where: { storageUnitId: id },
      orderBy: { recordedAt: 'desc' },
      take: 24,
    }),
    prisma.alert.findMany({
      where: { storageUnitId: id },
      orderBy: { timestamp: 'desc' },
      take: 20,
    }),
  ])

  // Transform to match frontend expected format
  const transformedUnit = {
    ...unit,
    commodities,
    readings,
    alerts,
  }

  return NextResponse.json({ storageUnit: transformedUnit })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await farmerGuard(request)
  if (user instanceof NextResponse) return user

  const { id } = await params

  const existing = await prisma.storageUnit.findFirst({
    where: { id, farmerId: user.userId },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Storage unit not found.' }, { status: 404 })
  }

  const body = await request.json()
  const updated = await prisma.storageUnit.update({
    where: { id },
    data: {
      ...(body.name && { name: body.name }),
      ...(body.location && { location: body.location }),
      ...(body.capacity != null && { capacity: Number(body.capacity) }),
      ...(body.latitude != null && { latitude: Number(body.latitude) }),
      ...(body.longitude != null && { longitude: Number(body.longitude) }),
    },
  })

  return NextResponse.json({ storageUnit: updated })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await farmerGuard(request)
  if (user instanceof NextResponse) return user

  const { id } = await params

  const existing = await prisma.storageUnit.findFirst({
    where: { id, farmerId: user.userId },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Storage unit not found.' }, { status: 404 })
  }

  await prisma.storageUnit.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
