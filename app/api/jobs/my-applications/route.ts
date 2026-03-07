/**
 * GET /api/jobs/my-applications
 *   Returns all job applications submitted by the authenticated user (worker).
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateUser } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser(request)
    if (user instanceof NextResponse) return user

    const applications = await prisma.jobApplication.findMany({
      where: { workerId: user.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        job: {
          include: {
            farmer: { select: { id: true, name: true, phone: true, location: true } },
          },
        },
      },
    })

    return NextResponse.json({ applications })
  } catch (error) {
    console.error('[My Applications GET] Error:', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
