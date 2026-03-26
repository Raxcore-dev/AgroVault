/**
 * Role-Based Route Configuration
 *
 * Defines which routes are accessible by each user role.
 * Used by AppShell for route protection and by navigation components.
 */

export type UserRole = 'farmer' | 'job_applicant'

/** Routes that are exclusively for farmers */
export const FARMER_ONLY_ROUTES = [
  '/dashboard/storage-units',
  '/dashboard/commodities',
  '/dashboard/alerts',
  '/dashboard/market-analysis',
  '/dashboard/market-insights',
  '/dashboard/weather',
  '/dashboard/jobs',
  '/dashboard/notifications',
  '/humidity',
  '/temperature',
  '/market',
  '/market-intelligence',
  '/risk',
]

/** Routes that are exclusively for job applicants */
export const JOB_APPLICANT_ONLY_ROUTES = [
  '/dashboard/my-applications',
]

/** Redirect destination when a job applicant tries to access a farmer route */
export const JOB_APPLICANT_REDIRECT = '/dashboard'

/** Redirect destination when a farmer tries to access a job applicant route */
export const FARMER_REDIRECT = '/dashboard'

/**
 * Check whether a pathname is restricted for the given role.
 * Returns the redirect path if blocked, or null if allowed.
 */
export function getRestrictedRedirect(
  pathname: string,
  role: UserRole
): string | null {
  if (role === 'job_applicant') {
    const isFarmerRoute = FARMER_ONLY_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(route + '/')
    )
    if (isFarmerRoute) return JOB_APPLICANT_REDIRECT
  }

  if (role === 'farmer') {
    const isApplicantRoute = JOB_APPLICANT_ONLY_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(route + '/')
    )
    if (isApplicantRoute) return FARMER_REDIRECT
  }

  return null
}
