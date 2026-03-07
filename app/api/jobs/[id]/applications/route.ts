/**
 * GET /api/jobs/[id]/applications
 *   Returns the authenticated user's application for this job.
 *   Workers use this to check if they already applied.
 *
 * POST /api/jobs/[id]/applications
 *   Submit an application for a job. Requires authentication.
 *   Body: { message }
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateUser } from '@/lib/api-auth'

// ─── GET: Check My Application ───
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateUser(request)
    if (user instanceof NextResponse) return user

    const { id } = await params

    const application = await prisma.jobApplication.findUnique({
      where: {
        jobId_workerId: { jobId: id, workerId: user.userId },
      },
      include: {
        job: { select: { id: true, title: true, farmerId: true } },
      },
    })

    return NextResponse.json({ application })
  } catch (error) {
    console.error('[Job Application GET] Error:', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

// ─── POST: Apply for a Job ───
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateUser(request)
    if (user instanceof NextResponse) return user

    const { id } = await params
    const body = await request.json()
    const { message } = body

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Application message is required.' },
        { status: 400 }
      )
    }

    // Check job exists and is open
    const job = await prisma.job.findUnique({ where: { id } })
    if (!job) {
      return NextResponse.json({ error: 'Job not found.' }, { status: 404 })
    }
    if (!job.isOpen) {
      return NextResponse.json({ error: 'This job is no longer accepting applications.' }, { status: 400 })
    }

    // Farmers cannot apply to their own jobs
    if (job.farmerId === user.userId) {
      return NextResponse.json({ error: 'You cannot apply to your own job.' }, { status: 400 })
    }

    // Check for duplicate application
    const existing = await prisma.jobApplication.findUnique({
      where: {
        jobId_workerId: { jobId: id, workerId: user.userId },
      },
    })
    if (existing) {
      return NextResponse.json({ error: 'You have already applied for this job.' }, { status: 409 })
    }

    const application = await prisma.jobApplication.create({
      data: {
        jobId: id,
        workerId: user.userId,
        message: message.trim(),
      },
      include: {
        worker: { select: { id: true, name: true, phone: true, location: true } },
        job: { select: { id: true, title: true, farmerId: true } },
      },
    })

    return NextResponse.json({ application }, { status: 201 })
  } catch (error) {
    console.error('[Job Application POST] Error:', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
