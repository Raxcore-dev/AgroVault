/**
 * GET /api/jobs
 *   Returns all open jobs with optional filtering.
 *   Query parameters:
 *     - search: keyword search in title and description
 *     - location: filter by location (partial match)
 *     - cropType: filter by crop type
 *     - sort: "newest" | "pay_asc" | "pay_desc" | "start_date"
 *     - page / limit: pagination (defaults: page=1, limit=20)
 *
 * POST /api/jobs
 *   Creates a new job posting. Requires authentication as a farmer.
 *   Body: { title, cropType, description, workersNeeded, payPerDay,
 *           location, latitude, longitude, startDate }
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateUser, authorizeRole } from '@/lib/api-auth'

// ─── GET: List / Search / Filter Jobs ───
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search') || ''
    const location = searchParams.get('location') || ''
    const cropType = searchParams.get('cropType') || ''
    const sort = searchParams.get('sort') || 'newest'
    const page = Math.max(1, Number(searchParams.get('page')) || 1)
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20))
    const skip = (page - 1) * limit

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { isOpen: true }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' }
    }

    if (cropType) {
      where.cropType = { equals: cropType, mode: 'insensitive' }
    }

    // Sorting
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let orderBy: any = { createdAt: 'desc' }
    switch (sort) {
      case 'pay_asc':
        orderBy = { payPerDay: 'asc' }
        break
      case 'pay_desc':
        orderBy = { payPerDay: 'desc' }
        break
      case 'start_date':
        orderBy = { startDate: 'asc' }
        break
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          farmer: { select: { id: true, name: true, phone: true, location: true } },
          _count: { select: { applications: true } },
        },
      }),
      prisma.job.count({ where }),
    ])

    return NextResponse.json({
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('[Jobs GET] Error:', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

// ─── POST: Create a Job ───
export async function POST(request: NextRequest) {
  try {
    const guard = authorizeRole('farmer')
    const user = await guard(request)
    if (user instanceof NextResponse) return user

    const body = await request.json()
    const {
      title,
      cropType,
      description,
      workersNeeded,
      payPerDay,
      location,
      latitude,
      longitude,
      startDate,
    } = body

    // Validation
    if (!title || !cropType || !description || !workersNeeded || !payPerDay || !location || !startDate) {
      return NextResponse.json(
        { error: 'title, cropType, description, workersNeeded, payPerDay, location, and startDate are required.' },
        { status: 400 }
      )
    }

    if (workersNeeded < 1) {
      return NextResponse.json({ error: 'workersNeeded must be at least 1.' }, { status: 400 })
    }

    if (payPerDay < 0) {
      return NextResponse.json({ error: 'payPerDay must be a positive number.' }, { status: 400 })
    }

    const job = await prisma.job.create({
      data: {
        title,
        cropType: cropType.toLowerCase(),
        description,
        workersNeeded: Number(workersNeeded),
        payPerDay: Number(payPerDay),
        location,
        latitude: Number(latitude) || 0,
        longitude: Number(longitude) || 0,
        startDate: new Date(startDate),
        farmerId: user.userId,
      },
      include: {
        farmer: { select: { id: true, name: true, phone: true, location: true } },
      },
    })

    return NextResponse.json({ job }, { status: 201 })
  } catch (error) {
    console.error('[Jobs POST] Error:', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
