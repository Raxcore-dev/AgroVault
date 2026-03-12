/**
 * Role-Based Route Configuration
 *
 * Defines which routes are accessible by each user role.
 * Used by AppShell for route protection and by navigation components.
 */

export type UserRole = 'farmer' | 'buyer'

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
]

/** Routes that are exclusively for buyers */
export const BUYER_ONLY_ROUTES = [
  '/dashboard/my-applications',
]

/** Redirect destination when a buyer tries to access a farmer route */
export const BUYER_REDIRECT = '/marketplace'

/** Redirect destination when a farmer tries to access a buyer route */
export const FARMER_REDIRECT = '/dashboard'

/**
 * Check whether a pathname is restricted for the given role.
 * Returns the redirect path if blocked, or null if allowed.
 */
export function getRestrictedRedirect(
  pathname: string,
  role: UserRole
): string | null {
  if (role === 'buyer') {
    const isFarmerRoute = FARMER_ONLY_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(route + '/')
    )
    if (isFarmerRoute) return BUYER_REDIRECT
  }

  if (role === 'farmer') {
    const isBuyerRoute = BUYER_ONLY_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(route + '/')
    )
    if (isBuyerRoute) return FARMER_REDIRECT
  }

  return null
}
