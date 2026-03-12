/**
 * Market Insights Service
 *
 * Provides intelligent, location-aware commodity market analysis for farmers:
 *   1. Fetches stored commodities from the farmer's storage units.
 *   2. Finds the best nearby market for each commodity.
 *   3. Computes price trends and demand levels.
 *   4. Builds personalised selling recommendations.
 *
 * Market prices are refreshed from a simulated external source every 30 minutes
 * (replace `refreshMarketPrices` body with a real API call in production).
 * Per-user insights are cached for 15 minutes to reduce DB load.
 */

import { prisma } from '@/lib/prisma'

// ─── Exported Types ────────────────────────────────────────────────────────────

export interface MarketInsight {
  commodityName: string
  normalizedCommodity: string
  marketName: string
  marketLocation: string
  pricePerKg: number
  previousPricePerKg: number | null
  demandLevel: 'high' | 'medium' | 'low'
  priceTrend: 'increasing' | 'stable' | 'decreasing'
  trendLabel: string
  recommendation: string
  lastUpdated: string
  distanceKm: number
  quantity: number
  storageUnitName: string
  hasSpoilageRisk: boolean
}

// ─── Module-Level Cache ────────────────────────────────────────────────────────

interface CacheEntry {
  insights: MarketInsight[]
  farmerLocation: string
  timestamp: number
}

const insightsCache = new Map<string, CacheEntry>()
const INSIGHTS_TTL_MS = 15 * 60 * 1000    // 15 minutes per-user
const REFRESH_INTERVAL_MS = 30 * 60 * 1000 // 30 minutes between price refreshes

let lastPriceRefresh = 0

// ─── Commodity Normalization ───────────────────────────────────────────────────

/**
 * Maps human-readable commodity names stored by farmers to the keys used
 * in the Market table (e.g., "White Maize" → "maize").
 */
export function normalizeCommodity(name: string): string {
  const n = name.toLowerCase().trim()
  if (n.includes('maize') || n.includes('corn'))         return 'maize'
  if (n.includes('wheat'))                               return 'wheat'
  if (n.includes('bean'))                                return 'beans'
  if (n.includes('tomato'))                              return 'tomatoes'
  if (n.includes('avocado'))                             return 'avocados'
  if (n.includes('gram') || n.includes('ndengu'))        return 'grams'
  if (n.includes('rice'))                                return 'rice'
  if (n.includes('potato'))                              return 'potatoes'
  if (n.includes('sorghum'))                             return 'sorghum'
  if (n.includes('onion'))                               return 'onions'
  if (n.includes('cabbage'))                             return 'cabbages'
  return n.split(/\s+/)[0]
}

// ─── Geographic Utilities ──────────────────────────────────────────────────────

const LOCATION_COORDS: Record<string, { lat: number; lng: number }> = {
  nairobi:        { lat: -1.2921, lng: 36.8219 },
  nakuru:         { lat: -0.3031, lng: 36.0800 },
  kisumu:         { lat: -0.0917, lng: 34.7680 },
  eldoret:        { lat:  0.5143, lng: 35.2698 },
  mombasa:        { lat: -4.0435, lng: 39.6682 },
  nyeri:          { lat: -0.4169, lng: 36.9458 },
  thika:          { lat: -1.0396, lng: 37.0900 },
  machakos:       { lat: -1.5177, lng: 37.2634 },
  kiambu:         { lat: -1.1714, lng: 36.8355 },
  meru:           { lat:  0.0480, lng: 37.6559 },
  kericho:        { lat: -0.3692, lng: 35.2863 },
  naivasha:       { lat: -0.7172, lng: 36.4310 },
  kakamega:       { lat:  0.2827, lng: 34.7519 },
  bungoma:        { lat:  0.5635, lng: 34.5607 },
  kitale:         { lat:  1.0187, lng: 35.0020 },
  nanyuki:        { lat:  0.0067, lng: 37.0722 },
  embu:           { lat: -0.5389, lng: 37.4596 },
  'nakuru town':  { lat: -0.3031, lng: 36.0800 },
}

function resolveCoords(
  lat: number | null | undefined,
  lng: number | null | undefined,
  location: string | null | undefined,
): { lat: number; lng: number } {
  if (lat != null && lng != null) return { lat, lng }
  return LOCATION_COORDS[(location ?? '').toLowerCase().trim()] ?? LOCATION_COORDS['nairobi']
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ─── External Price Refresh ────────────────────────────────────────────────────

/**
 * Simulates fetching fresh commodity prices from an external market API
 * (e.g. AMIS-EA, EAGC Kenya, or KALRO commodity feeds).
 *
 * Applies a realistic ±5 % fluctuation per market, then recalculates
 * price trend and demand level before writing back to the database.
 *
 * TO INTEGRATE A REAL API: replace the fluctuation logic below with an
 * HTTP call, map the response to { pricePerKg, priceTrend, demandLevel },
 * and upsert the results.
 */
async function refreshMarketPrices(): Promise<void> {
  const markets = await prisma.market.findMany()

  await Promise.all(
    markets.map((m) => {
      // Simulate external price feed: ±5 % fluctuation
      const factor = 1 + (Math.random() * 0.10 - 0.05)
      const newPrice = Math.round(m.pricePerKg * factor * 2) / 2 // round to nearest 0.5 KES

      // Derive trend from price movement relative to a 2 % threshold
      const diff = newPrice - m.pricePerKg
      const threshold = m.pricePerKg * 0.02
      const priceTrend =
        diff > threshold  ? 'increasing' :
        diff < -threshold ? 'decreasing' :
        'stable'

      // Demand level is correlated with trend direction
      const r = Math.random()
      const demandLevel =
        priceTrend === 'increasing'
          ? r < 0.60 ? 'high' : r < 0.90 ? 'medium' : 'low'
          : priceTrend === 'decreasing'
          ? r < 0.50 ? 'low'  : r < 0.90 ? 'medium' : 'high'
          : /* stable */ r < 0.25 ? 'low' : r < 0.75 ? 'medium' : 'high'

      return prisma.market.update({
        where: { id: m.id },
        data: {
          previousPricePerKg: m.pricePerKg,
          pricePerKg: newPrice,
          priceTrend,
          demandLevel,
          lastUpdated: new Date(),
        },
      })
    }),
  )

  lastPriceRefresh = Date.now()
  insightsCache.clear() // invalidate per-user caches after price update
}

// ─── Text Helpers ──────────────────────────────────────────────────────────────

function buildTrendLabel(
  priceTrend: string,
  pricePerKg: number,
  prev: number | null,
): string {
  const direction =
    priceTrend === 'increasing' ? 'Increasing' :
    priceTrend === 'decreasing' ? 'Decreasing' :
    'Stable'

  if (prev == null) return direction
  const diff = pricePerKg - prev
  const sign = diff >= 0 ? '+' : ''
  return `${direction} (${sign}KES ${diff.toFixed(1)}/kg)`
}

function relativeTime(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60_000)
  if (mins < 1)  return 'Just now'
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs} hour${hrs === 1 ? '' : 's'} ago`
  return date.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })
}

function buildRecommendation(
  commodity: string,
  pricePerKg: number,
  priceTrend: string,
  demandLevel: string,
  hasSpoilageRisk: boolean,
): string {
  if (hasSpoilageRisk) {
    return `High spoilage risk detected in your storage unit. ${commodity} is trading at KES ${pricePerKg.toFixed(0)}/kg. Sell immediately to minimise losses.`
  }
  if (priceTrend === 'increasing' && demandLevel === 'high') {
    return `Prices are rising and demand is high. Sell ${commodity} now to maximise your returns.`
  }
  if (priceTrend === 'increasing' && demandLevel === 'medium') {
    return `Price is trending upward. Hold for 2–3 more days for a potentially better rate.`
  }
  if (priceTrend === 'decreasing' && demandLevel === 'low') {
    return `Both price and demand are falling. Sell ${commodity} as soon as possible to limit losses.`
  }
  if (priceTrend === 'decreasing') {
    return `Prices are declining. Consider selling ${commodity} soon unless you have capacity to wait for market recovery.`
  }
  if (demandLevel === 'high') {
    return `High demand detected. Good opportunity to sell ${commodity} in bulk at the current stable price.`
  }
  return `Market is stable. Continue monitoring ${commodity} prices and wait for a price increase before selling.`
}

// ─── Main Export ───────────────────────────────────────────────────────────────

export async function getMarketInsightsForFarmer(userId: string): Promise<{
  insights: MarketInsight[]
  farmerLocation: string
  lastRefreshed: string
}> {
  // Serve from per-user cache if still fresh
  const hit = insightsCache.get(userId)
  if (hit && Date.now() - hit.timestamp < INSIGHTS_TTL_MS) {
    return {
      insights: hit.insights,
      farmerLocation: hit.farmerLocation,
      lastRefreshed: new Date(hit.timestamp).toISOString(),
    }
  }

  // Refresh market prices if the global refresh interval has elapsed
  if (Date.now() - lastPriceRefresh > REFRESH_INTERVAL_MS) {
    await refreshMarketPrices()
  }

  // Load farmer plus their storage units, commodities, and high-risk alerts
  const farmer = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      location: true,
      storageUnits: {
        select: {
          name: true,
          location: true,
          latitude: true,
          longitude: true,
          commodities: { select: { commodityName: true, quantity: true } },
          alerts: {
            where: { spoilageRisk: 'high', isRead: false },
            select: { id: true },
          },
        },
      },
    },
  })

  if (!farmer) throw new Error('Farmer not found')

  const farmerLocation =
    farmer.location ?? farmer.storageUnits[0]?.location ?? 'Kenya'

  // Aggregate commodities across all storage units (merge duplicates)
  type CommodityEntry = {
    originalName: string
    quantity: number
    storageUnitName: string
    unitLat: number | null
    unitLng: number | null
    unitLocation: string
    hasSpoilageRisk: boolean
  }
  const commodityMap = new Map<string, CommodityEntry>()

  for (const unit of farmer.storageUnits) {
    const hasRisk = unit.alerts.length > 0
    for (const c of unit.commodities) {
      const norm = normalizeCommodity(c.commodityName)
      const prev = commodityMap.get(norm)
      commodityMap.set(norm, prev
        ? { ...prev, quantity: prev.quantity + c.quantity, hasSpoilageRisk: prev.hasSpoilageRisk || hasRisk }
        : {
            originalName: c.commodityName,
            quantity: c.quantity,
            storageUnitName: unit.name,
            unitLat: unit.latitude,
            unitLng: unit.longitude,
            unitLocation: unit.location,
            hasSpoilageRisk: hasRisk,
          }
      )
    }
  }

  // Build insight for each commodity
  const insights: MarketInsight[] = []

  for (const [norm, data] of commodityMap) {
    const markets = await prisma.market.findMany({
      where: { commodity: { equals: norm, mode: 'insensitive' } },
    })
    if (markets.length === 0) continue

    const coords = resolveCoords(data.unitLat, data.unitLng, data.unitLocation)

    // Score each market: prefer high price and short distance
    const scored = markets
      .map((m) => ({
        ...m,
        distanceKm: haversineKm(coords.lat, coords.lng, m.latitude, m.longitude),
      }))
      .sort(
        (a, b) =>
          b.pricePerKg / Math.max(b.distanceKm, 1) -
          a.pricePerKg / Math.max(a.distanceKm, 1),
      )

    const best = scored[0]

    insights.push({
      commodityName:       data.originalName,
      normalizedCommodity: norm,
      marketName:          best.marketName,
      marketLocation:      best.location,
      pricePerKg:          best.pricePerKg,
      previousPricePerKg:  best.previousPricePerKg ?? null,
      demandLevel:         (best.demandLevel ?? 'medium') as 'high' | 'medium' | 'low',
      priceTrend:          (best.priceTrend ?? 'stable') as 'increasing' | 'stable' | 'decreasing',
      trendLabel:          buildTrendLabel(
                             best.priceTrend ?? 'stable',
                             best.pricePerKg,
                             best.previousPricePerKg ?? null,
                           ),
      recommendation:      buildRecommendation(
                             data.originalName,
                             best.pricePerKg,
                             best.priceTrend ?? 'stable',
                             best.demandLevel ?? 'medium',
                             data.hasSpoilageRisk,
                           ),
      lastUpdated:         relativeTime(best.lastUpdated),
      distanceKm:          Math.round(best.distanceKm),
      quantity:            data.quantity,
      storageUnitName:     data.storageUnitName,
      hasSpoilageRisk:     data.hasSpoilageRisk,
    })
  }

  // Populate per-user cache
  insightsCache.set(userId, { insights, farmerLocation, timestamp: Date.now() })

  return { insights, farmerLocation, lastRefreshed: new Date().toISOString() }
}

/** Clear per-user cache, e.g. after a forced refresh. */
export function clearInsightsCache(userId?: string): void {
  if (userId) insightsCache.delete(userId)
  else insightsCache.clear()
}

// ─── National Market Data ──────────────────────────────────────────────────────

export interface NationalMarketEntry {
  id: string
  commodity: string
  marketName: string
  county: string
  pricePerKg: number
  previousPricePerKg: number | null
  demandLevel: 'high' | 'medium' | 'low'
  priceTrend: 'increasing' | 'stable' | 'decreasing'
  trendLabel: string
  lastUpdated: string
  distanceKm: number | null
}

let nationalCacheTimestamp = 0
let nationalCacheData: NationalMarketEntry[] | null = null
const NATIONAL_TTL_MS = 15 * 60 * 1000

/**
 * Returns all market entries across Kenya, optionally sorted by distance
 * if the caller provides their GPS coordinates.
 */
export async function getNationalMarketData(
  userLat?: number | null,
  userLng?: number | null,
): Promise<{ markets: NationalMarketEntry[]; lastRefreshed: string }> {
  // Refresh market prices if interval elapsed
  if (Date.now() - lastPriceRefresh > REFRESH_INTERVAL_MS) {
    await refreshMarketPrices()
    nationalCacheData = null // invalidate national cache too
  }

  // Serve from national cache unless stale
  if (nationalCacheData && Date.now() - nationalCacheTimestamp < NATIONAL_TTL_MS) {
    const markets = sortByDistance(nationalCacheData, userLat, userLng)
    return { markets, lastRefreshed: new Date(nationalCacheTimestamp).toISOString() }
  }

  const rows = await prisma.market.findMany({ orderBy: { commodity: 'asc' } })

  const entries: NationalMarketEntry[] = rows.map((m) => ({
    id:                  m.id,
    commodity:           m.commodity,
    marketName:          m.marketName,
    county:              m.location,
    pricePerKg:          m.pricePerKg,
    previousPricePerKg:  m.previousPricePerKg ?? null,
    demandLevel:         (m.demandLevel ?? 'medium') as 'high' | 'medium' | 'low',
    priceTrend:          (m.priceTrend ?? 'stable') as 'increasing' | 'stable' | 'decreasing',
    trendLabel:          buildTrendLabel(m.priceTrend ?? 'stable', m.pricePerKg, m.previousPricePerKg ?? null),
    lastUpdated:         relativeTime(m.lastUpdated),
    distanceKm:          null,
  }))

  nationalCacheData = entries
  nationalCacheTimestamp = Date.now()

  const markets = sortByDistance(entries, userLat, userLng)
  return { markets, lastRefreshed: new Date(nationalCacheTimestamp).toISOString() }
}

function sortByDistance(
  entries: NationalMarketEntry[],
  userLat?: number | null,
  userLng?: number | null,
): NationalMarketEntry[] {
  if (userLat == null || userLng == null) return entries

  return entries
    .map((e) => {
      const coords = LOCATION_COORDS[(e.county ?? '').toLowerCase().trim()]
      if (!coords) return { ...e, distanceKm: null }
      return { ...e, distanceKm: Math.round(haversineKm(userLat, userLng, coords.lat, coords.lng)) }
    })
    .sort((a, b) => {
      if (a.distanceKm == null && b.distanceKm == null) return 0
      if (a.distanceKm == null) return 1
      if (b.distanceKm == null) return -1
      return a.distanceKm - b.distanceKm
    })
}
