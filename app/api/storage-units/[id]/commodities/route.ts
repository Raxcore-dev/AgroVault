/**
 * Commodities API
 *
 * GET  /api/storage-units/[id]/commodities  – List commodities in a storage unit
 * POST /api/storage-units/[id]/commodities  – Add a commodity to a storage unit
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
  })
  if (!unit) {
    return NextResponse.json({ error: 'Storage unit not found.' }, { status: 404 })
  }

  const commodities = await prisma.commodity.findMany({
    where: { storageUnitId: id },
    orderBy: { dateStored: 'desc' },
  })

  return NextResponse.json({ commodities })
}

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
  const { commodityName, quantity, unit: commodityUnit, expectedStorageDuration } = body

  if (!commodityName || quantity == null || !expectedStorageDuration) {
    return NextResponse.json(
      { error: 'commodityName, quantity, and expectedStorageDuration are required.' },
      { status: 400 }
    )
  }

  const commodity = await prisma.commodity.create({
    data: {
      commodityName,
      quantity: Number(quantity),
      unit: commodityUnit || 'kg',
      expectedStorageDuration: Number(expectedStorageDuration),
      storageUnitId: id,
    },
  })

  return NextResponse.json({ commodity }, { status: 201 })
}
