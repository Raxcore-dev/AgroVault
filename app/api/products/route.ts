/**
 * GET /api/products
 *   Returns all available products with optional filtering.
 *   Query parameters:
 *     - search: keyword search in product name and description
 *     - location: filter by location name (partial match)
 *     - minPrice / maxPrice: price range filter
 *     - minQuantity: minimum quantity available
 *     - category: filter by product category
 *     - sort: "price_asc" | "price_desc" | "newest" | "oldest"
 *     - page / limit: pagination (defaults: page=1, limit=20)
 * 
 * POST /api/products
 *   Creates a new product listing. Requires authentication as a farmer.
 *   Body: { productName, description, price, quantity, unit?, productImage?,
 *           locationName, latitude, longitude, category? }
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// ─── GET: List / Search / Filter Products ───
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const search = searchParams.get('search') || ''
    const location = searchParams.get('location') || ''
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined
    const minQuantity = searchParams.get('minQuantity') ? Number(searchParams.get('minQuantity')) : undefined
    const category = searchParams.get('category') || ''
    const sort = searchParams.get('sort') || 'newest'
    const page = Math.max(1, Number(searchParams.get('page')) || 1)
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20))
    const skip = (page - 1) * limit

    // Build dynamic where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { isAvailable: true }

    // Keyword search: match product name or description (case-insensitive)
    if (search) {
      where.OR = [
        { productName: { contains: search } },
        { description: { contains: search } },
      ]
    }

    // Location filter (partial match)
    if (location) {
      where.locationName = { contains: location }
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {}
      if (minPrice !== undefined) where.price.gte = minPrice
      if (maxPrice !== undefined) where.price.lte = maxPrice
    }

    // Minimum quantity filter
    if (minQuantity !== undefined) {
      where.quantity = { gte: minQuantity }
    }

    // Category filter
    if (category) {
      where.category = category
    }

    // Sorting
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let orderBy: any = { createdAt: 'desc' }
    switch (sort) {
      case 'price_asc': orderBy = { price: 'asc' }; break
      case 'price_desc': orderBy = { price: 'desc' }; break
      case 'oldest': orderBy = { createdAt: 'asc' }; break
      default: orderBy = { createdAt: 'desc' }
    }

    // Fetch products with farmer info
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          farmer: {
            select: { id: true, name: true, phone: true, location: true },
          },
          storageUnit: {
            select: { id: true, name: true, location: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('[Products GET] Error:', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

// ─── POST: Create a New Product (Farmer Only) ───
export async function POST(request: NextRequest) {
  try {
    // ─── Auth check: must be logged in ───
    const auth = await getAuthUser(request)
    if (!auth) {
      return NextResponse.json(
        { error: 'Authentication required.' },
        { status: 401 }
      )
    }

    // ─── Role check: only farmers can list products ───
    if (auth.role !== 'farmer') {
      return NextResponse.json(
        { error: 'Only farmers can add products.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      productName,
      description,
      price,
      quantity,
      unit,
      productImage,
      locationName,
      latitude,
      longitude,
      category,
    } = body

    // ─── Validation ───
    if (!productName || !description || price == null || quantity == null || !locationName || latitude == null || longitude == null) {
      return NextResponse.json(
        { error: 'Missing required fields: productName, description, price, quantity, locationName, latitude, longitude.' },
        { status: 400 }
      )
    }

    if (typeof price !== 'number' || price <= 0) {
      return NextResponse.json({ error: 'Price must be a positive number.' }, { status: 400 })
    }

    if (typeof quantity !== 'number' || quantity <= 0) {
      return NextResponse.json({ error: 'Quantity must be a positive number.' }, { status: 400 })
    }

    // ─── Create product ───
    const product = await prisma.product.create({
      data: {
        productName,
        description,
        price,
        quantity,
        unit: unit || 'kg',
        productImage: productImage || null,
        locationName,
        latitude,
        longitude,
        category: category || 'general',
        farmerId: auth.userId,
      },
      include: {
        farmer: {
          select: { id: true, name: true, phone: true, location: true },
        },
      },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('[Products POST] Error:', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
