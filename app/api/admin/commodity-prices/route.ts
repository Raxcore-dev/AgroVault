import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/commodity-prices
 * 
 * Get all commodity prices (admin only)
 * Query params:
 *   - county: filter by county
 *   - commodity: filter by commodity
 *   - isActive: filter by active status
 */
export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const user = await getAuthUser(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const county = searchParams.get('county')
    const commodity = searchParams.get('commodity')
    const isActive = searchParams.get('isActive')

    const where: any = {}

    if (county) {
      where.county = county
    }

    if (commodity) {
      where.commodity = commodity
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    const prices = await prisma.commodityPrice.findMany({
      where,
      orderBy: [{ county: 'asc' }, { commodity: 'asc' }],
    })

    return NextResponse.json({
      prices,
      total: prices.length,
    })
  } catch (error) {
    console.error('Error fetching commodity prices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch commodity prices' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/commodity-prices
 * 
 * Create or update commodity price (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const user = await getAuthUser(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      county,
      commodity,
      pricePerKg,
      pricePerBag,
      priceTrend,
      demandLevel,
      notes,
    } = body

    // Validate required fields
    if (!county || !commodity || !pricePerKg) {
      return NextResponse.json(
        { error: 'County, commodity, and pricePerKg are required' },
        { status: 400 }
      )
    }

    // Check if price already exists
    const existing = await prisma.commodityPrice.findUnique({
      where: {
        county_commodity: {
          county,
          commodity,
        },
      },
    })

    let price
    if (existing) {
      // Update existing price
      price = await prisma.commodityPrice.update({
        where: {
          county_commodity: {
            county,
            commodity,
          },
        },
        data: {
          pricePerKg,
          pricePerBag: pricePerBag || null,
          previousPrice: existing.pricePerKg,
          priceTrend: priceTrend || 'stable',
          demandLevel: demandLevel || 'medium',
          notes: notes || null,
          lastUpdated: new Date(),
          updatedBy: user.id,
        },
      })
    } else {
      // Create new price
      price = await prisma.commodityPrice.create({
        data: {
          county,
          commodity,
          pricePerKg,
          pricePerBag: pricePerBag || null,
          priceTrend: priceTrend || 'stable',
          demandLevel: demandLevel || 'medium',
          notes: notes || null,
          updatedBy: user.id,
        },
      })
    }

    return NextResponse.json({
      price,
      message: existing ? 'Price updated successfully' : 'Price created successfully',
    })
  } catch (error) {
    console.error('Error saving commodity price:', error)
    return NextResponse.json(
      { error: 'Failed to save commodity price' },
      { status: 500 }
    )
  }
}
