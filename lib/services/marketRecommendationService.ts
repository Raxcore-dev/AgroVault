/**
 * Market Recommendation Service
 *
 * Given a commodity and a farmer's location, finds the best nearby market
 * based on:
 *   1. Same commodity type
 *   2. Within a configurable radius (default: 100 km)
 *   3. Highest price per kg
 *   4. Closest distance (tiebreaker)
 *
 * Uses Haversine formula for distance calculations.
 * Caches market data to reduce DB hits.
 */

import { prisma } from '@/lib/prisma'

// ─── Configuration ───

const DEFAULT_RADIUS_KM = 100
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

// ─── In-Memory Cache ───

interface CacheEntry {
  data: MarketRecord[]
  timestamp: number
}

interface MarketRecord {
  id: string
  marketName: string
  location: string
  commodity: string
  pricePerKg: number
  latitude: number
  longitude: number
  lastUpdated: Date
}

const marketCache: Map<string, CacheEntry> = new Map()

/**
 * Haversine distance between two lat/lng points in kilometers.
 */
function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Fetch markets for a given commodity, with caching.
 */
async function getMarketsForCommodity(commodity: string): Promise<MarketRecord[]> {
  const cacheKey = commodity.toLowerCase()
  const cached = marketCache.get(cacheKey)

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data
  }

  const markets = await prisma.market.findMany({
    where: {
      commodity: {
        equals: commodity,
        mode: 'insensitive',
      },
    },
  })

  marketCache.set(cacheKey, {
    data: markets,
    timestamp: Date.now(),
  })

  return markets
}

/**
 * Clear the market cache (useful when market data is updated).
 */
export function clearMarketCache(): void {
  marketCache.clear()
}

export interface MarketRecommendation {
  marketId: string
  marketName: string
  location: string
  pricePerKg: number
  distanceKm: number
}

/**
 * Approximate coordinates for well-known Kenyan locations.
 * Used as fallback when storage unit doesn't have lat/lng.
 */
const LOCATION_COORDS: Record<string, { lat: number; lng: number }> = {
  'nairobi': { lat: -1.2921, lng: 36.8219 },
  'nakuru': { lat: -0.3031, lng: 36.0800 },
  'kisumu': { lat: -0.0917, lng: 34.7680 },
  'eldoret': { lat: 0.5143, lng: 35.2698 },
  'mombasa': { lat: -4.0435, lng: 39.6682 },
  'nyeri': { lat: -0.4169, lng: 36.9458 },
  'thika': { lat: -1.0396, lng: 37.0900 },
  'machakos': { lat: -1.5177, lng: 37.2634 },
  'kiambu': { lat: -1.1714, lng: 36.8355 },
  'meru': { lat: 0.0480, lng: 37.6559 },
  'kericho': { lat: -0.3692, lng: 35.2863 },
  'naivasha': { lat: -0.7172, lng: 36.4310 },
  'kakamega': { lat: 0.2827, lng: 34.7519 },
  'bungoma': { lat: 0.5635, lng: 34.5607 },
  'kitale': { lat: 1.0187, lng: 35.0020 },
  'nanyuki': { lat: 0.0067, lng: 37.0722 },
  'embu': { lat: -0.5389, lng: 37.4596 },
  'nakuru town': { lat: -0.3031, lng: 36.0800 },
}

/**
 * Get best market recommendation for a commodity near a location.
 *
 * @param commodity - Normalized commodity name (e.g. "maize")
 * @param latitude - Farmer's latitude (optional)
 * @param longitude - Farmer's longitude (optional)
 * @param locationName - Farmer's location name (fallback for coords)
 * @param radiusKm - Search radius in km (default 100)
 */
export async function getMarketRecommendation(
  commodity: string,
  latitude: number | null | undefined,
  longitude: number | null | undefined,
  locationName?: string,
  radiusKm: number = DEFAULT_RADIUS_KM
): Promise<MarketRecommendation | null> {
  const markets = await getMarketsForCommodity(commodity)

  if (markets.length === 0) return null

  // Resolve farmer location
  let farmerLat = latitude
  let farmerLng = longitude

  if ((farmerLat == null || farmerLng == null) && locationName) {
    const coords = LOCATION_COORDS[locationName.toLowerCase().trim()]
    if (coords) {
      farmerLat = coords.lat
      farmerLng = coords.lng
    }
  }

  // If we still don't have coords, rank by price only
  if (farmerLat == null || farmerLng == null) {
    const best = markets.sort((a, b) => b.pricePerKg - a.pricePerKg)[0]
    return {
      marketId: best.id,
      marketName: best.marketName,
      location: best.location,
      pricePerKg: best.pricePerKg,
      distanceKm: 0,
    }
  }

  // Filter by distance and compute scores
  interface RankedMarket extends MarketRecord {
    distanceKm: number
    score: number
  }

  const rankedMarkets: RankedMarket[] = markets
    .map((m) => {
      const dist = haversineDistance(farmerLat!, farmerLng!, m.latitude, m.longitude)
      return { ...m, distanceKm: Math.round(dist * 10) / 10, score: 0 }
    })
    .filter((m) => m.distanceKm <= radiusKm)

  if (rankedMarkets.length === 0) {
    // If no markets within radius, return the closest one regardless
    const allWithDist = markets.map((m) => ({
      ...m,
      distanceKm: Math.round(
        haversineDistance(farmerLat!, farmerLng!, m.latitude, m.longitude) * 10
      ) / 10,
      score: 0,
    }))
    allWithDist.sort((a, b) => a.distanceKm - b.distanceKm)
    const closest = allWithDist[0]
    return {
      marketId: closest.id,
      marketName: closest.marketName,
      location: closest.location,
      pricePerKg: closest.pricePerKg,
      distanceKm: closest.distanceKm,
    }
  }

  // Score: 70% price (higher is better), 30% proximity (closer is better)
  const maxPrice = Math.max(...rankedMarkets.map((m) => m.pricePerKg))
  const maxDist = Math.max(...rankedMarkets.map((m) => m.distanceKm), 1)

  for (const m of rankedMarkets) {
    const priceScore = (m.pricePerKg / maxPrice) * 70
    const distScore = ((maxDist - m.distanceKm) / maxDist) * 30
    m.score = priceScore + distScore
  }

  rankedMarkets.sort((a, b) => b.score - a.score)
  const best = rankedMarkets[0]

  return {
    marketId: best.id,
    marketName: best.marketName,
    location: best.location,
    pricePerKg: best.pricePerKg,
    distanceKm: best.distanceKm,
  }
}

/**
 * Get all market recommendations for a farmer (for each high-risk commodity).
 */
export async function getAllMarketRecommendations(farmerId: string): Promise<
  Array<{
    storageUnitId: string
    storageUnitName: string
    commodityName: string
    recommendation: MarketRecommendation | null
  }>
> {
  const highRiskAlerts = await prisma.alert.findMany({
    where: {
      storageUnit: { farmerId },
      alertType: 'spoilage_risk',
      spoilageRisk: 'high',
      isRead: false,
    },
    include: {
      storageUnit: true,
      commodity: true,
      recommendedMarket: true,
    },
    orderBy: { timestamp: 'desc' },
  })

  // Deduplicate by storageUnit + commodity
  const seen = new Set<string>()
  const results: Array<{
    storageUnitId: string
    storageUnitName: string
    commodityName: string
    recommendation: MarketRecommendation | null
  }> = []

  for (const alert of highRiskAlerts) {
    const key = `${alert.storageUnitId}:${alert.commodityId}`
    if (seen.has(key)) continue
    seen.add(key)

    let recommendation: MarketRecommendation | null = null
    if (alert.recommendedMarket) {
      const dist = alert.storageUnit.latitude && alert.storageUnit.longitude
        ? haversineDistance(
            alert.storageUnit.latitude,
            alert.storageUnit.longitude,
            alert.recommendedMarket.latitude,
            alert.recommendedMarket.longitude
          )
        : 0
      recommendation = {
        marketId: alert.recommendedMarket.id,
        marketName: alert.recommendedMarket.marketName,
        location: alert.recommendedMarket.location,
        pricePerKg: alert.recommendedMarket.pricePerKg,
        distanceKm: Math.round(dist * 10) / 10,
      }
    }

    results.push({
      storageUnitId: alert.storageUnitId,
      storageUnitName: alert.storageUnit.name,
      commodityName: alert.commodity?.commodityName ?? 'Unknown',
      recommendation,
    })
  }

  return results
}

/**
 * Fetch all markets, optionally filtered by commodity.
 */
export async function fetchMarkets(commodity?: string): Promise<MarketRecord[]> {
  if (commodity) {
    return getMarketsForCommodity(commodity)
  }

  const cached = marketCache.get('__all__')
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data
  }

  const markets = await prisma.market.findMany({
    orderBy: [{ commodity: 'asc' }, { pricePerKg: 'desc' }],
  })

  marketCache.set('__all__', { data: markets, timestamp: Date.now() })
  return markets
}
