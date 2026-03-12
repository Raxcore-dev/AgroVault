/**
 * useRoleGuard Hook
 *
 * Protects a page so only users with the required role can access it.
 * Redirects unauthorised users to a fallback route.
 *
 * Usage (at the top of a farmer-only page):
 *   const { allowed, isLoading } = useRoleGuard('farmer')
 *   if (isLoading || !allowed) return null
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { type UserRole, getRestrictedRedirect, JOB_APPLICANT_REDIRECT, FARMER_REDIRECT } from '@/lib/role-routes'

interface RoleGuardResult {
  /** Whether the current user is allowed to view this page */
  allowed: boolean
  /** Whether auth state is still loading */
  isLoading: boolean
}

export function useRoleGuard(requiredRole: UserRole): RoleGuardResult {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const allowed = !isLoading && !!user && user.role === requiredRole

  useEffect(() => {
    if (isLoading) return
    if (!user) return // AppShell handles unauthenticated redirect

    if (user.role !== requiredRole) {
      const redirect = requiredRole === 'farmer' ? JOB_APPLICANT_REDIRECT : FARMER_REDIRECT
      router.replace(redirect)
    }
  }, [isLoading, user, requiredRole, router])

  return { allowed, isLoading }
}
