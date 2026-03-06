/**
 * API Route Authentication & Authorization Middleware Helpers
 *
 * - authenticateUser(request):  Verifies JWT, returns user payload or 401
 * - authorizeRole(...roles):    Returns a guard that also checks the user's role
 *
 * Usage in API route handlers:
 *   const user = await authenticateUser(request)
 *   if (user instanceof NextResponse) return user // 401
 *
 *   const guard = authorizeRole('farmer')
 *   const farmerUser = await guard(request)
 *   if (farmerUser instanceof NextResponse) return farmerUser // 401 | 403
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, type TokenPayload } from '@/lib/auth'

/** Verify JWT. Returns the payload on success or a 401 NextResponse. */
export async function authenticateUser(
  request: NextRequest
): Promise<TokenPayload | NextResponse> {
  const user = await getAuthUser(request)
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required. Please log in.' },
      { status: 401 }
    )
  }
  return user
}

/**
 * Returns a guard function that first authenticates, then checks role.
 * Returns the payload on success, or a 401/403 NextResponse.
 */
export function authorizeRole(...allowedRoles: string[]) {
  return async function (
    request: NextRequest
  ): Promise<TokenPayload | NextResponse> {
    const result = await authenticateUser(request)
    if (result instanceof NextResponse) return result // 401

    if (!allowedRoles.includes(result.role)) {
      return NextResponse.json(
        { error: 'Forbidden. You do not have access to this resource.' },
        { status: 403 }
      )
    }
    return result
  }
}
