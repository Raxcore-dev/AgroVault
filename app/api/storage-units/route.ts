/**
 * Storage Units API
 *
 * GET  /api/storage-units         – List all storage units for the authenticated farmer
 * POST /api/storage-units         – Create a new storage unit (farmer only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorizeRole } from '@/lib/api-auth'

const farmerGuard = authorizeRole('farmer')

export async function GET(request: NextRequest) {
  const user = await farmerGuard(request)
  if (user instanceof NextResponse) return user

  const units = await prisma.storageUnit.findMany({
    where: { farmerId: user.userId },
    include: {
      _count: { select: { commodities: true, alerts: true } },
      readings: { orderBy: { recordedAt: 'desc' }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ storageUnits: units })
}

export async function POST(request: NextRequest) {
  const user = await farmerGuard(request)
  if (user instanceof NextResponse) return user

  const body = await request.json()
  const { name, location, capacity } = body

  if (!name || !location || capacity == null) {
    return NextResponse.json(
      { error: 'Name, location, and capacity are required.' },
      { status: 400 }
    )
  }

  const unit = await prisma.storageUnit.create({
    data: {
      name,
      location,
      capacity: Number(capacity),
      farmerId: user.userId,
    },
  })

  return NextResponse.json({ storageUnit: unit }, { status: 201 })
}
