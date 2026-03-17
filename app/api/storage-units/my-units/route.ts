/**
 * GET /api/storage-units/my-units
 * 
 * Returns all storage units owned by the authenticated farmer.
 * Used in the Add Product form to link a product to a storage unit.
 * 
 * Requires authentication as a farmer.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    if (auth.role !== 'farmer') {
      return NextResponse.json({ error: 'Only farmers can access this.' }, { status: 403 })
    }

    const storageUnits = await prisma.storageUnit.findMany({
      where: { farmerId: auth.userId },
      select: {
        id: true,
        name: true,
        location: true,
        capacity: true,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ storageUnits })
  } catch (error) {
    console.error('[My Storage Units GET] Error:', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
