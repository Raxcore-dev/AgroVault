/**
 * GET /api/jobs/[id]
 *   Returns a single job with full details.
 *
 * PATCH /api/jobs/[id]
 *   Updates a job (farmer who owns it only).
 *   Body: { title?, description?, workersNeeded?, payPerDay?, isOpen?, ... }
 *
 * DELETE /api/jobs/[id]
 *   Deletes a job (farmer who owns it only).
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateUser } from '@/lib/api-auth'

// ─── GET: Single Job Details ───
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        farmer: { select: { id: true, name: true, email: true, phone: true, location: true } },
        _count: { select: { applications: true } },
      },
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found.' }, { status: 404 })
    }

    return NextResponse.json({ job })
  } catch (error) {
    console.error('[Job GET] Error:', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

// ─── PATCH: Update Job ───
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateUser(request)
    if (user instanceof NextResponse) return user

    const { id } = await params

    const job = await prisma.job.findUnique({ where: { id } })
    if (!job) {
      return NextResponse.json({ error: 'Job not found.' }, { status: 404 })
    }
    if (job.farmerId !== user.userId) {
      return NextResponse.json({ error: 'You can only edit your own jobs.' }, { status: 403 })
    }

    const body = await request.json()
    const allowedFields = ['title', 'cropType', 'description', 'workersNeeded', 'payPerDay', 'location', 'latitude', 'longitude', 'startDate', 'isOpen']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {}
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        if (key === 'startDate') {
          data[key] = new Date(body[key])
        } else if (key === 'cropType') {
          data[key] = String(body[key]).toLowerCase()
        } else if (key === 'workersNeeded') {
          data[key] = Number(body[key])
        } else if (key === 'payPerDay' || key === 'latitude' || key === 'longitude') {
          data[key] = Number(body[key])
        } else {
          data[key] = body[key]
        }
      }
    }

    const updated = await prisma.job.update({
      where: { id },
      data,
      include: {
        farmer: { select: { id: true, name: true, phone: true, location: true } },
        _count: { select: { applications: true } },
      },
    })

    return NextResponse.json({ job: updated })
  } catch (error) {
    console.error('[Job PATCH] Error:', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

// ─── DELETE: Remove Job ───
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateUser(request)
    if (user instanceof NextResponse) return user

    const { id } = await params

    const job = await prisma.job.findUnique({ where: { id } })
    if (!job) {
      return NextResponse.json({ error: 'Job not found.' }, { status: 404 })
    }
    if (job.farmerId !== user.userId) {
      return NextResponse.json({ error: 'You can only delete your own jobs.' }, { status: 403 })
    }

    await prisma.job.delete({ where: { id } })

    return NextResponse.json({ message: 'Job deleted successfully.' })
  } catch (error) {
    console.error('[Job DELETE] Error:', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
