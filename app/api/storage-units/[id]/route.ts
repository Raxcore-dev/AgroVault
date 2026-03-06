/**
 * Single Storage Unit API
 *
 * GET    /api/storage-units/[id]  – Get details (with commodities + latest reading)
 * PATCH  /api/storage-units/[id]  – Update name/location/capacity
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

  const unit = await prisma.storageUnit.findFirst({
    where: { id, farmerId: user.userId },
    include: {
      commodities: { orderBy: { dateStored: 'desc' } },
      readings: { orderBy: { recordedAt: 'desc' }, take: 24 },
      alerts: { orderBy: { timestamp: 'desc' }, take: 20 },
      _count: { select: { commodities: true } },
    },
  })

  if (!unit) {
    return NextResponse.json({ error: 'Storage unit not found.' }, { status: 404 })
  }

  return NextResponse.json({ storageUnit: unit })
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
