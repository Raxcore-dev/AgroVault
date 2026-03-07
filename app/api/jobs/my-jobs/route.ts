/**
 * GET /api/jobs/my-jobs
 *   Returns all jobs posted by the authenticated farmer.
 *   Used on the farmer's "My Jobs" page.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorizeRole } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  try {
    const guard = authorizeRole('farmer')
    const user = await guard(request)
    if (user instanceof NextResponse) return user

    const jobs = await prisma.job.findMany({
      where: { farmerId: user.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { applications: true } },
        applications: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            worker: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    })

    return NextResponse.json({ jobs })
  } catch (error) {
    console.error('[My Jobs GET] Error:', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
