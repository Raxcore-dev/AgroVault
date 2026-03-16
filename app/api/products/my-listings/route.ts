import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    const products = await prisma.product.findMany({
      where: { farmerId: auth.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        farmer: {
          select: { id: true, name: true, phone: true, location: true },
        },
        storageUnit: {
          select: { id: true, name: true, location: true },
        },
      },
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error('[My Products GET] Error:', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
