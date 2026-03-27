/**
 * Market Intelligence Service - RAX AI Powered
 *
 * Provides AI-driven market intelligence when spoilage risk is HIGH.
 * Analyzes real-time market conditions and generates actionable recommendations
 * using RAX AI to help farmers sell urgently before spoilage.
 *
 * Features:
 * - Finds nearby markets within 50km radius
 * - Fetches real-time commodity prices
 * - Analyzes 7-day and 30-day price trends
 * - Uses RAX AI to generate insights and recommendations
 * - Quantifies potential loss prevention value
 */

import { RaxAI } from 'rax-ai'
import { prisma } from '@/lib/prisma'
import { KENYA_COUNTIES_MARKETS, COUNTY_COORDS } from '@/lib/data/kenya-counties-markets'

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface MarketWithDistance {
  id: string
  marketName: string
  location: string
  commodity: string
  pricePerKg: number
  previousPricePerKg: number | null
  demandLevel: 'high' | 'medium' | 'low'
  priceTrend: 'increasing' | 'stable' | 'decreasing'
  latitude: number
  longitude: number
  lastUpdated: Date
  distanceKm: number
  priceHistory?: {
    price7DaysAgo: number | null
    price30DaysAgo: number | null
    trend7Day: string
    trend30Day: string
    direction: 'UP' | 'DOWN' | 'STABLE'
  }
}

export interface SpoilageContext {
  commodityName: string
  quantity: number
  unit: string
  location: string
  latitude: number
  longitude: number
  currentTemperature: number
  currentHumidity: number
  temperatureTrend: 'rising' | 'falling' | 'stable'
  humidityTrend: 'rising' | 'falling' | 'stable'
  spoilageRiskScore: number
  spoilageProbability: number
  predictedTimeToSpoilage: string
  daysInStorage: number
  optimalStorageConditions: {
    tempRange: { min: number; max: number }
    humidityRange: { min: number; max: number }
    maxStorageDays: number
  }
  timeInDangerousConditions: number // minutes
}

export interface MarketIntelligenceResult {
  marketAssessment: string
  urgencyLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM'
  recommendedAction: string
  nearbyMarkets: Array<{
    marketName: string
    distance_km: number
    currentPrice: number
    priceHistory: {
      '7dayTrend': string
      '30dayTrend': string
      direction: 'UP' | 'DOWN' | 'STABLE'
    }
    demandLevel: string
    aiInsight: string
  }>
  marketTrendAnalysis: string
  sellingStrategy: string
  potentialLossPreventionValue: number
  aiConfidence: number
  timestamp: string
}

export interface MarketPriceHistory {
  currentDate: number
  price7DaysAgo: number | null
  price30DaysAgo: number | null
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const MAX_SEARCH_RADIUS_KM = 50
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes cache for urgent situations

const CACHE = new Map<string, { result: MarketIntelligenceResult; timestamp: number }>()

// ─── Helper Functions ──────────────────────────────────────────────────────────

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/**
 * Normalize commodity name for market matching
 */
function normalizeCommodity(name: string): string {
  const n = name.toLowerCase().trim()
  if (n.includes('maize') || n.includes('corn')) return 'maize'
  if (n.includes('wheat')) return 'wheat'
  if (n.includes('bean')) return 'beans'
  if (n.includes('tomato')) return 'tomatoes'
  if (n.includes('potato')) return 'potatoes'
  if (n.includes('rice')) return 'rice'
  if (n.includes('onion')) return 'onions'
  if (n.includes('cabbage')) return 'cabbages'
  if (n.includes('gram') || n.includes('ndengu')) return 'grams'
  if (n.includes('sorghum')) return 'sorghum'
  if (n.includes('millet')) return 'millet'
  return n.split(/\s+/)[0]
}

/**
 * Get RAX AI client
 */
function getRaxClient(): RaxAI | null {
  const apiKey = process.env.RAX_API_KEY
  if (!apiKey || apiKey === 'your_rax_api_key_here' || apiKey === '') {
    return null
  }
  return new RaxAI({ apiKey })
}

/**
 * Extract text from RAX AI response
 */
function extractResponseText(response: unknown): string {
  const r = response as Record<string, unknown>

  if (r.choices && Array.isArray(r.choices) && r.choices[0]) {
    const choice = r.choices[0] as Record<string, unknown>
    if (choice.message) {
      const msg = choice.message as Record<string, unknown>
      if (typeof msg.content === 'string') return msg.content
    }
  }

  if (typeof r.content === 'string') return r.content
  if (typeof r.text === 'string') return r.text
  if (typeof r.message === 'string') return r.message

  return JSON.stringify(response)
}

/**
 * Parse JSON from AI response
 */
function parseJSON<T>(text: string): T | null {
  try {
    let cleaned = text.trim()
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '')
    }
    return JSON.parse(cleaned) as T
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        return JSON.parse(match[0]) as T
      } catch {
        return null
      }
    }
    return null
  }
}

// ─── Market Data Functions ─────────────────────────────────────────────────────

/**
 * Find nearby markets within specified radius
 */
export async function findNearbyMarkets(
  commodityName: string,
  latitude: number,
  longitude: number,
  radiusKm: number = MAX_SEARCH_RADIUS_KM
): Promise<MarketWithDistance[]> {
  const normalizedCommodity = normalizeCommodity(commodityName)

  // Fetch markets from database
  const markets = await prisma.market.findMany({
    where: {
      commodity: {
        contains: normalizedCommodity,
        mode: 'insensitive',
      },
    },
  })

  // Also fetch from Kenya Counties dataset as fallback
  const countyMarkets: MarketWithDistance[] = []
  
  for (const countyData of KENYA_COUNTIES_MARKETS) {
    const matchingCommodities = countyData.commodities.filter(c => 
      c.commodity.toLowerCase().includes(normalizedCommodity)
    )
    
    if (matchingCommodities.length > 0) {
      const distance = haversineKm(latitude, longitude, countyData.latitude, countyData.longitude)
      
      if (distance <= radiusKm) {
        for (const commodity of matchingCommodities) {
          countyMarkets.push({
            id: `county-${countyData.county}-${commodity.commodity}`,
            marketName: `${countyData.county} Market`,
            location: countyData.county,
            commodity: commodity.commodity,
            pricePerKg: commodity.pricePerKg,
            previousPricePerKg: null,
            demandLevel: commodity.demandLevel as 'high' | 'medium' | 'low',
            priceTrend: commodity.priceTrend as 'increasing' | 'stable' | 'decreasing',
            latitude: countyData.latitude,
            longitude: countyData.longitude,
            lastUpdated: new Date(),
            distanceKm: Math.round(distance),
            priceHistory: undefined,
          })
        }
      }
    }
  }

  // Calculate distances and filter
  const marketsWithDistance = markets
    .map(market => ({
      ...market,
      distanceKm: Math.round(haversineKm(latitude, longitude, market.latitude, market.longitude)),
      priceHistory: undefined as undefined,
    }))
    .filter(m => m.distanceKm <= radiusKm) as MarketWithDistance[]

  // Combine with county markets (avoid duplicates)
  const combined: MarketWithDistance[] = [...marketsWithDistance]

  for (const countyMarket of countyMarkets) {
    const exists = combined.some(m =>
      m.marketName === countyMarket.marketName &&
      m.commodity === countyMarket.commodity
    )
    if (!exists) {
      combined.push({
        ...countyMarket,
        id: countyMarket.id,
        marketName: countyMarket.marketName,
        location: countyMarket.location,
        commodity: countyMarket.commodity,
        pricePerKg: countyMarket.pricePerKg,
        previousPricePerKg: countyMarket.previousPricePerKg,
        demandLevel: countyMarket.demandLevel,
        priceTrend: countyMarket.priceTrend,
        latitude: countyMarket.latitude,
        longitude: countyMarket.longitude,
        lastUpdated: countyMarket.lastUpdated,
        distanceKm: countyMarket.distanceKm,
      })
    }
  }

  // Sort by distance and price (prefer closer and higher price)
  return combined.sort((a, b) => {
    const scoreA = a.pricePerKg / Math.max(a.distanceKm, 1)
    const scoreB = b.pricePerKg / Math.max(b.distanceKm, 1)
    return scoreB - scoreA
  })
}

/**
 * Get price history for market (simulated for MVP)
 * In production, this would query a price_history table
 */
export async function getPriceHistoryForMarket(
  marketId: string,
  commodity: string
): Promise<MarketPriceHistory> {
  try {
    // Try to fetch from price_history table if it exists
    const currentMarket = await prisma.market.findUnique({
      where: { id: marketId },
      select: { pricePerKg: true, previousPricePerKg: true },
    })

    if (!currentMarket) {
      return {
        currentDate: 0,
        price7DaysAgo: null,
        price30DaysAgo: null,
      }
    }

    const currentPrice = currentMarket.pricePerKg
    
    // Simulate historical prices based on current price and trend
    // In production, replace with actual historical data
    const trendFactor = currentMarket.previousPricePerKg 
      ? (currentPrice - currentMarket.previousPricePerKg) / currentMarket.previousPricePerKg
      : 0

    // Estimate 7-day and 30-day prices
    const price7DaysAgo = currentMarket.previousPricePerKg 
      ? Math.round(currentMarket.previousPricePerKg * (1 - trendFactor * 0.5) * 2) / 2
      : Math.round(currentPrice * 0.95 * 2) / 2

    const price30DaysAgo = currentMarket.previousPricePerKg
      ? Math.round(currentMarket.previousPricePerKg * (1 - trendFactor * 2) * 2) / 2
      : Math.round(currentPrice * 0.90 * 2) / 2

    return {
      currentDate: currentPrice,
      price7DaysAgo,
      price30DaysAgo,
    }
  } catch (error) {
    console.error('Error fetching price history:', error)
    return {
      currentDate: 0,
      price7DaysAgo: null,
      price30DaysAgo: null,
    }
  }
}

/**
 * Calculate trend percentage
 */
function calculateTrend(current: number, previous: number | null): { percentage: string; direction: 'UP' | 'DOWN' | 'STABLE' } {
  if (!previous) {
    return { percentage: 'N/A', direction: 'STABLE' }
  }
  
  const change = ((current - previous) / previous) * 100
  const direction = change > 2 ? 'UP' : change < -2 ? 'DOWN' : 'STABLE'
  const sign = change >= 0 ? '+' : ''
  
  return {
    percentage: `${sign}${change.toFixed(1)}%`,
    direction,
  }
}

// ─── RAX AI Market Intelligence ────────────────────────────────────────────────

/**
 * Generate AI-powered market intelligence for spoilage emergency
 */
export async function generateSpoilageTriggeredInsights(
  spoilageContext: SpoilageContext,
  nearbyMarkets: MarketWithDistance[]
): Promise<MarketIntelligenceResult> {
  // Check cache
  const cacheKey = `${spoilageContext.commodityName}-${spoilageContext.latitude}-${spoilageContext.longitude}-${Math.round(spoilageContext.spoilageRiskScore)}`
  const cached = CACHE.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.result
  }

  const rax = getRaxClient()
  
  if (!rax || nearbyMarkets.length === 0) {
    return generateFallbackInsights(spoilageContext, nearbyMarkets)
  }

  try {
    // Prepare market data for AI
    const marketsFormatted = nearbyMarkets.slice(0, 10).map((m, i) => {
      const trend7Day = m.priceHistory?.trend7Day || 'N/A'
      const trend30Day = m.priceHistory?.trend30Day || 'N/A'
      const direction = m.priceHistory?.direction || 'STABLE'

      return `${i + 1}. ${m.marketName} (${m.location})
   - Distance: ${m.distanceKm} km
   - Current Price: KES ${m.pricePerKg}/kg
   - 7-Day Trend: ${trend7Day} (${direction})
   - 30-Day Trend: ${trend30Day}
   - Demand: ${m.demandLevel.toUpperCase()}
   - Price Trend: ${m.priceTrend}`
    }).join('\n\n')

    const systemPrompt = `You are an expert agricultural market analyst specializing in emergency crop sales in Kenya. 
A farmer has a SPOILAGE EMERGENCY - their stored crop is at high risk of spoiling soon.

Your role:
1. Analyze the spoilage urgency and market conditions
2. Evaluate each nearby market for urgent sale suitability
3. Recommend the BEST market for immediate sale
4. Provide specific, actionable strategy
5. Quantify potential losses and savings

CRITICAL: The farmer needs to sell URGENTLY to prevent total loss. Price is secondary to speed of sale.
Be direct, action-oriented, and use farmer-friendly language. Include specific numbers (prices, distances, percentages).

Always respond with valid JSON only, no markdown, no code fences.`

    const userPrompt = `SPOILAGE EMERGENCY - MARKET INTELLIGENCE REQUEST

FARMER'S SITUATION:
- Commodity: ${spoilageContext.commodityName}
- Quantity: ${spoilageContext.quantity} ${spoilageContext.unit}
- Location: ${spoilageContext.location} (Lat: ${spoilageContext.latitude}, Lng: ${spoilageContext.longitude})
- Days in Storage: ${spoilageContext.daysInStorage}

CURRENT STORAGE CONDITIONS:
- Temperature: ${spoilageContext.currentTemperature}°C (Optimal: ${spoilageContext.optimalStorageConditions.tempRange.min}-${spoilageContext.optimalStorageConditions.tempRange.max}°C) - Trend: ${spoilageContext.temperatureTrend}
- Humidity: ${spoilageContext.currentHumidity}% (Optimal: ${spoilageContext.optimalStorageConditions.humidityRange.min}-${spoilageContext.optimalStorageConditions.humidityRange.max}%) - Trend: ${spoilageContext.humidityTrend}

SPOILAGE RISK ASSESSMENT:
- Risk Score: ${spoilageContext.spoilageRiskScore}/100
- Spoilage Probability: ${spoilageContext.spoilageProbability}%
- Predicted Time to Spoilage: ${spoilageContext.predictedTimeToSpoilage}
- Time in Dangerous Conditions: ${spoilageContext.timeInDangerousConditions} minutes

OPTIMAL STORAGE REQUIREMENTS:
- Temperature Range: ${spoilageContext.optimalStorageConditions.tempRange.min}-${spoilageContext.optimalStorageConditions.tempRange.max}°C
- Humidity Range: ${spoilageContext.optimalStorageConditions.humidityRange.min}-${spoilageContext.optimalStorageConditions.humidityRange.max}%
- Maximum Storage Life: ${spoilageContext.optimalStorageConditions.maxStorageDays} days

NEARBY MARKETS (within 50km):

${marketsFormatted}

ANALYZE AND PROVIDE:
1. MARKET ASSESSMENT: Brief analysis of current market conditions and spoilage urgency
2. URGENCY LEVEL: CRITICAL (sell within 24h), HIGH (sell within 48h), or MEDIUM (sell within 72h)
3. RECOMMENDED ACTION: Specific market to sell at and why
4. MARKET RANKING: Rank top 3 markets for URGENT sale (consider distance, price, demand)
5. MARKET TREND ANALYSIS: Why are prices moving? What's driving demand?
6. SELLING STRATEGY: Exact action plan - which market, when to go, what to expect
7. POTENTIAL LOSS PREVENTION VALUE: Calculate:
   - Current value of crop at average market price
   - Potential loss if spoilage occurs (based on spoilage probability)
   - Value that can be saved by selling immediately

FORMAT RESPONSE AS JSON:
{
  "marketAssessment": "string",
  "urgencyLevel": "CRITICAL|HIGH|MEDIUM",
  "recommendedAction": "string",
  "nearbyMarkets": [
    {
      "marketName": "string",
      "distance_km": number,
      "currentPrice": number,
      "priceHistory": {
        "7dayTrend": "string (e.g., +3.2%)",
        "30dayTrend": "string (e.g., -1.5%)",
        "direction": "UP|DOWN|STABLE"
      },
      "demandLevel": "string",
      "aiInsight": "string (why this market is good/bad for urgent sale)"
    }
  ],
  "marketTrendAnalysis": "string",
  "sellingStrategy": "string",
  "potentialLossPreventionValue": number (KES),
  "aiConfidence": number (0-100)
}`

    const response = await rax.chat({
      model: 'rax-4.0',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    })

    const text = extractResponseText(response)
    const parsed = parseJSON<MarketIntelligenceResult>(text)

    if (parsed && parsed.marketAssessment && parsed.recommendedAction) {
      // Validate and enhance result
      const result: MarketIntelligenceResult = {
        ...parsed,
        timestamp: new Date().toISOString(),
        aiConfidence: Math.min(Math.max(parsed.aiConfidence || 75, 50), 95),
      }

      // Cache result
      CACHE.set(cacheKey, { result, timestamp: Date.now() })

      return result
    }

    return generateFallbackInsights(spoilageContext, nearbyMarkets)
  } catch (error) {
    console.error('[Market Intelligence] AI error:', error)
    return generateFallbackInsights(spoilageContext, nearbyMarkets)
  }
}

/**
 * Fallback insights when AI is unavailable
 */
function generateFallbackInsights(
  spoilageContext: SpoilageContext,
  nearbyMarkets: MarketWithDistance[]
): MarketIntelligenceResult {
  const avgPrice = nearbyMarkets.length > 0
    ? nearbyMarkets.reduce((sum, m) => sum + m.pricePerKg, 0) / nearbyMarkets.length
    : 50

  const totalValue = spoilageContext.quantity * avgPrice
  const potentialLoss = totalValue * (spoilageContext.spoilageProbability / 100)

  // Determine urgency
  let urgencyLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' = 'MEDIUM'
  if (spoilageContext.spoilageRiskScore >= 80 || spoilageContext.spoilageProbability >= 70) {
    urgencyLevel = 'CRITICAL'
  } else if (spoilageContext.spoilageRiskScore >= 60 || spoilageContext.spoilageProbability >= 50) {
    urgencyLevel = 'HIGH'
  }

  // Find best market (highest price within reasonable distance)
  const bestMarket = nearbyMarkets.find(m => m.distanceKm <= 30) || nearbyMarkets[0]

  // Generate market insights
  const marketInsights = nearbyMarkets.slice(0, 5).map(m => {
    const trend = calculateTrend(m.pricePerKg, m.previousPricePerKg)
    
    let insight = ''
    if (m.distanceKm < 20 && m.demandLevel === 'high') {
      insight = 'Excellent choice: Close proximity with high demand ensures quick sale'
    } else if (m.pricePerKg > avgPrice * 1.05) {
      insight = 'Above-average price, but consider distance and transport costs'
    } else if (m.demandLevel === 'low') {
      insight = 'Lower demand may delay sale - not ideal for urgent situations'
    } else {
      insight = 'Viable option with moderate price and demand'
    }

    return {
      marketName: m.marketName,
      distance_km: m.distanceKm,
      currentPrice: m.pricePerKg,
      priceHistory: {
        '7dayTrend': m.priceHistory?.trend7Day || trend.percentage,
        '30dayTrend': m.priceHistory?.trend30Day || 'N/A',
        direction: trend.direction,
      },
      demandLevel: m.demandLevel,
      aiInsight: insight,
    }
  })

  return {
    marketAssessment: `Spoilage risk is ${urgencyLevel === 'CRITICAL' ? 'EXTREMELY HIGH' : urgencyLevel === 'HIGH' ? 'HIGH' : 'MODERATE'}. ${spoilageContext.commodityName} is currently trading at average KES ${avgPrice.toFixed(0)}/kg in your area. Immediate action is required to prevent losses.`,
    urgencyLevel,
    recommendedAction: bestMarket 
      ? `Sell immediately at ${bestMarket.marketName} (${bestMarket.location}), ${bestMarket.distanceKm}km away. Current price: KES ${bestMarket.pricePerKg}/kg. Demand is ${bestMarket.demandLevel}.`
      : 'Sell at any available market immediately to minimize losses.',
    nearbyMarkets: marketInsights,
    marketTrendAnalysis: `Market prices for ${spoilageContext.commodityName} are ${nearbyMarkets.some(m => m.priceTrend === 'increasing') ? 'trending upward due to seasonal demand' : nearbyMarkets.some(m => m.priceTrend === 'decreasing') ? 'declining due to oversupply' : 'stable'}. ${spoilageContext.daysInStorage > 60 ? 'Extended storage has increased spoilage risk significantly.' : 'Fresh commodity would command better prices.'}`,
    sellingStrategy: urgencyLevel === 'CRITICAL'
      ? `LOAD AND GO: Transport your ${spoilageContext.quantity} ${spoilageContext.unit} of ${spoilageContext.commodityName} to ${bestMarket?.marketName || 'nearest market'} IMMEDIATELY. Do not wait. Every hour increases spoilage risk. Expected revenue: KES ${totalValue.toFixed(0)}.`
      : urgencyLevel === 'HIGH'
      ? `SELL WITHIN 24 HOURS: Prepare your ${spoilageContext.commodityName} for sale at ${bestMarket?.marketName || 'market'}. Current conditions favor quick sale. Expected revenue: KES ${totalValue.toFixed(0)}.`
      : `MONITOR CLOSELY: Consider selling within 48-72 hours. Watch storage conditions hourly. If deterioration continues, execute emergency sale.`,
    potentialLossPreventionValue: potentialLoss,
    aiConfidence: 70,
    timestamp: new Date().toISOString(),
  }
}

// ─── Main Export ───────────────────────────────────────────────────────────────

/**
 * Get comprehensive market intelligence for high-risk spoilage situation
 */
export async function getSpoilageTriggeredMarketIntelligence(
  spoilageContext: SpoilageContext
): Promise<MarketIntelligenceResult> {
  // Find nearby markets
  const nearbyMarkets = await findNearbyMarkets(
    spoilageContext.commodityName,
    spoilageContext.latitude,
    spoilageContext.longitude,
    MAX_SEARCH_RADIUS_KM
  )

  // Get price history for each market
  const marketsWithHistory = await Promise.all(
    nearbyMarkets.map(async (market) => {
      const history = await getPriceHistoryForMarket(market.id, market.commodity)

      const trend7Day = calculateTrend(market.pricePerKg, history.price7DaysAgo)
      const trend30Day = calculateTrend(market.pricePerKg, history.price30DaysAgo)

      return {
        ...market,
        priceHistory: {
          price7DaysAgo: history.price7DaysAgo,
          price30DaysAgo: history.price30DaysAgo,
          trend7Day: trend7Day.percentage,
          trend30Day: trend30Day.percentage,
          direction: trend7Day.direction,
        },
      }
    })
  )

  // Generate AI insights
  return generateSpoilageTriggeredInsights(spoilageContext, marketsWithHistory)
}

/**
 * Clear market intelligence cache
 */
export function clearMarketIntelligenceCache(): void {
  CACHE.clear()
}
