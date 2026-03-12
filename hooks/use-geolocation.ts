/**
 * useGeolocation — automatic location detection hook
 *
 * Requests the browser Geolocation API after the user has authenticated,
 * reverse-geocodes the coordinates to a Kenyan county via the Nominatim API,
 * and persists the result to /api/location.
 *
 * Usage:
 *   Call `captureLocation(token)` once after login.
 *   The hook is intentionally fire-and-forget — failures are silent so as not
 *   to block the main user flow.
 */

'use client'

import { useCallback, useRef } from 'react'

interface LocationResult {
  latitude: number
  longitude: number
  county: string | null
  region: string | null
}

/**
 * Resolve latitude + longitude to county/region via Nominatim (OpenStreetMap).
 * Returns null on any failure.
 */
async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<{ county: string | null; region: string | null }> {
  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}` +
      `&format=json&zoom=10&addressdetails=1`

    const res = await fetch(url, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'AgroVault/1.0' },
    })

    if (!res.ok) return { county: null, region: null }

    const data = await res.json()
    const addr = data?.address ?? {}

    // Nominatim fields for Kenya: county or state_district maps to county name
    const county: string | null =
      addr.county?.replace(/\s+county$/i, '').trim() ??
      addr.state_district?.replace(/\s+county$/i, '').trim() ??
      addr.city ??
      addr.town ??
      addr.village ??
      null

    const region: string | null =
      addr.state?.replace(/\s+county$/i, '').trim() ?? null

    return { county, region }
  } catch {
    return { county: null, region: null }
  }
}

export function useGeolocation() {
  const hasCaptured = useRef(false)

  /**
   * Fire-and-forget: request browser location, reverse-geocode, persist.
   * Call once immediately after a successful login.
   */
  const captureLocation = useCallback(
    async (token: string): Promise<LocationResult | null> => {
      if (hasCaptured.current) return null
      if (!navigator.geolocation) return null

      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            hasCaptured.current = true
            const { latitude, longitude } = position.coords

            const { county, region } = await reverseGeocode(latitude, longitude)

            // Persist to backend (best-effort)
            try {
              await fetch('/api/location', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ latitude, longitude, county, region }),
              })
            } catch {
              // silent – network failure should not break the UX
            }

            resolve({ latitude, longitude, county, region })
          },
          () => {
            // User denied or error – continue silently
            resolve(null)
          },
          { timeout: 10_000, maximumAge: 5 * 60 * 1000 },
        )
      })
    },
    [],
  )

  return { captureLocation }
}
