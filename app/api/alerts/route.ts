/**
 * Alerts API
 *
 * GET   /api/alerts         – List alerts for the authenticated farmer
 * PATCH /api/alerts         – Mark alerts as read (body: { alertIds: string[] })
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorizeRole } from '@/lib/api-auth'

const farmerGuard = authorizeRole('farmer')

export async function GET(request: NextRequest) {
  const user = await farmerGuard(request)
  if (user instanceof NextResponse) return user

  const { searchParams } = new URL(request.url)
  const unreadOnly = searchParams.get('unread') === 'true'

  const alerts = await prisma.alert.findMany({
    where: {
      storageUnit: { farmerId: user.userId },
      ...(unreadOnly ? { isRead: false } : {}),
    },
    include: { storageUnit: { select: { id: true, name: true } } },
    orderBy: { timestamp: 'desc' },
    take: 50,
  })

  const unreadCount = await prisma.alert.count({
    where: { storageUnit: { farmerId: user.userId }, isRead: false },
  })

  return NextResponse.json({ alerts, unreadCount })
}

export async function PATCH(request: NextRequest) {
  const user = await farmerGuard(request)
  if (user instanceof NextResponse) return user

  const body = await request.json()
  const { alertIds } = body

  if (!Array.isArray(alertIds) || alertIds.length === 0) {
    return NextResponse.json({ error: 'alertIds array required.' }, { status: 400 })
  }

  // Only mark alerts that belong to this farmer's storage units
  await prisma.alert.updateMany({
    where: {
      id: { in: alertIds },
      storageUnit: { farmerId: user.userId },
    },
    data: { isRead: true },
  })

  return NextResponse.json({ success: true })
}
