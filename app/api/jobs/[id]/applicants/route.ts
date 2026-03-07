/**
 * GET /api/jobs/[id]/applicants
 *   Returns all applications for a job. Only the farmer who posted the job can view these.
 *
 * PATCH /api/jobs/[id]/applicants
 *   Update an application's status (accept/reject). Only the job's farmer can do this.
 *   Body: { applicationId, status: "accepted" | "rejected" }
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateUser } from '@/lib/api-auth'

// ─── GET: All Applicants for a Job ───
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateUser(request)
    if (user instanceof NextResponse) return user

    const { id } = await params

    // Verify job belongs to this farmer
    const job = await prisma.job.findUnique({ where: { id } })
    if (!job) {
      return NextResponse.json({ error: 'Job not found.' }, { status: 404 })
    }
    if (job.farmerId !== user.userId) {
      return NextResponse.json({ error: 'You can only view applicants for your own jobs.' }, { status: 403 })
    }

    const applications = await prisma.jobApplication.findMany({
      where: { jobId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        worker: { select: { id: true, name: true, email: true, phone: true, location: true } },
      },
    })

    return NextResponse.json({
      job: { id: job.id, title: job.title, workersNeeded: job.workersNeeded },
      applications,
      stats: {
        total: applications.length,
        pending: applications.filter((a) => a.status === 'pending').length,
        accepted: applications.filter((a) => a.status === 'accepted').length,
        rejected: applications.filter((a) => a.status === 'rejected').length,
      },
    })
  } catch (error) {
    console.error('[Applicants GET] Error:', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

// ─── PATCH: Update Application Status ───
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateUser(request)
    if (user instanceof NextResponse) return user

    const { id } = await params
    const body = await request.json()
    const { applicationId, status } = body

    if (!applicationId || !status) {
      return NextResponse.json(
        { error: 'applicationId and status are required.' },
        { status: 400 }
      )
    }

    if (!['accepted', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'status must be "accepted" or "rejected".' },
        { status: 400 }
      )
    }

    // Verify job belongs to this farmer
    const job = await prisma.job.findUnique({ where: { id } })
    if (!job) {
      return NextResponse.json({ error: 'Job not found.' }, { status: 404 })
    }
    if (job.farmerId !== user.userId) {
      return NextResponse.json({ error: 'You can only manage applicants for your own jobs.' }, { status: 403 })
    }

    const application = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: { status },
      include: {
        worker: { select: { id: true, name: true, email: true, phone: true, location: true } },
      },
    })

    return NextResponse.json({ application })
  } catch (error) {
    console.error('[Applicants PATCH] Error:', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
