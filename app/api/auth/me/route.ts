/**
 * GET /api/auth/me
 * 
 * Returns the currently authenticated user's profile.
 * Requires a valid JWT in the Authorization header.
 * 
 * Returns:
 *   - 200: { user } with full profile data
 *   - 401: Not authenticated
 *   - 404: User not found
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // ─── Verify JWT from Authorization header ───
    const authPayload = await getAuthUser(request)
    if (!authPayload) {
      return NextResponse.json(
        { error: 'Authentication required.' },
        { status: 401 }
      )
    }

    // ─── Fetch full user profile from database ───
    const user = await prisma.user.findUnique({
      where: { id: authPayload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        location: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('[Me] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    )
  }
}
