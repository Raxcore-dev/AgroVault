/**
 * GET /api/products/[id]
 *   Returns a single product by ID with full farmer information.
 * 
 * PATCH /api/products/[id]
 *   Updates a product. Only the farmer who owns it can update.
 * 
 * DELETE /api/products/[id]
 *   Deletes a product. Only the farmer who owns it can delete.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// ─── GET: Fetch Single Product ───
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        farmer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            location: true,
          },
        },
        storageUnit: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error('[Product GET] Error:', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

// ─── PATCH: Update Product (Owner Farmer Only) ───
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    const { id } = await params

    // Verify product exists and belongs to this farmer
    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 })
    }
    if (existing.farmerId !== auth.userId) {
      return NextResponse.json({ error: 'You can only update your own products.' }, { status: 403 })
    }

    const body = await request.json()
    const allowedFields = [
      'productName', 'description', 'price', 'quantity', 'unit',
      'productImage', 'locationName', 'latitude', 'longitude',
      'category', 'isAvailable', 'storageUnitId', 'harvestDate',
    ]

    // Only allow updating specific fields
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        data[field] = body[field]
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data,
      include: {
        farmer: {
          select: { id: true, name: true, phone: true, location: true },
        },
        storageUnit: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
      },
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error('[Product PATCH] Error:', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

// ─── DELETE: Remove Product (Owner Farmer Only) ───
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    const { id } = await params

    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 })
    }
    if (existing.farmerId !== auth.userId) {
      return NextResponse.json({ error: 'You can only delete your own products.' }, { status: 403 })
    }

    // Delete related messages first, then the product
    await prisma.message.deleteMany({ where: { productId: id } })
    await prisma.product.delete({ where: { id } })

    return NextResponse.json({ message: 'Product deleted successfully.' })
  } catch (error) {
    console.error('[Product DELETE] Error:', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
