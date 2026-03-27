/**
 * Enhanced Spoilage Prediction Service with Real-Time Trend Analysis
 * 
 * Provides intelligent, time-based spoilage prediction by analyzing:
 * - Historical sensor data trends
 * - Duration of exposure to bad conditions
 * - Rate of change in temperature and humidity
 * - Market-based selling recommendations
 */

import { prisma } from '@/lib/prisma'
import { KENYA_COUNTIES_MARKETS, COUNTY_COORDS } from '@/lib/data/kenya-counties-markets'

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface TrendData {
  direction: 'rising' | 'falling' | 'stable'
  ratePerMinute: number
  changePercent: number
}

export interface DurationAnalysis {
  minutesInBadConditions: number
  severity: 'low' | 'moderate' | 'high' | 'critical'
  threshold: number
}

export interface SpoilagePredictionEnhanced {
  storageUnitId: string
  storageUnitName: string
  storageLocation: string
  latitude: number
  longitude: number
  commodityId: string
  commodityName: string
  quantityStored: number
  unit: string
  dateStored: Date

  // Current conditions
  currentTemperature: number
  currentHumidity: number

  // Trend analysis
  temperatureTrend: TrendData
  humidityTrend: TrendData

  // Time-based risk
  durationAnalysis: DurationAnalysis

  // Risk assessment
  riskLevel: {
    level: 'safe' | 'moderate' | 'high' | 'critical'
    color: 'green' | 'yellow' | 'orange' | 'red'
    label: string
    score: number // 0-100 risk score
  }

  // Spoilage prediction
  estimatedSpoilagePercentage: number
  estimatedSpoilageQuantity: number
  timeframeHours: number

  // Economic impact
  marketPricePerKg?: number
  estimatedEconomicLoss?: number

  // Recommendations
  immediateActions: string[]
  storageRecommendations: string[]
  marketRecommendation?: MarketRecommendation

  // Early warning
  earlyWarning?: {
    triggered: boolean
    message: string
    urgency: 'low' | 'medium' | 'high'
  }

  // Metadata
  lastReadingTime: string
  readingsAnalyzed: number
}

export interface MarketRecommendation {
  action: 'hold' | 'monitor' | 'sell_soon' | 'sell_immediately'
  message: string
  bestMarket?: {
    name: string
    location: string
    pricePerKg: number
    distance: number
  }
  alternativeMarkets?: Array<{
    name: string
    location: string
    pricePerKg: number
  }>
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const THRESHOLDS = {
  temperature: {
    safe: 25,
    moderate: 28,
    high: 32,
    critical: 35,
  },
  humidity: {
    safe: 60,
    moderate: 65,
    high: 75,
    critical: 85,
  },
  duration: {
    moderate: 10, // minutes
    high: 20,
    critical: 40,
  },
}

const TREND_WINDOW_MINUTES = 30 // Analyze last 30 minutes of readings

// ─── Trend Analysis ────────────────────────────────────────────────────────────

/**
 * Analyze trend from historical readings
 */
export function analyzeTrend(readings: number[]): TrendData {
  if (readings.length < 2) {
    return { direction: 'stable', ratePerMinute: 0, changePercent: 0 }
  }

  const firstHalf = readings.slice(0, Math.floor(readings.length / 2))
  const secondHalf = readings.slice(Math.floor(readings.length / 2))

  const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
  const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length

  const change = avgSecond - avgFirst
  const changePercent = (change / avgFirst) * 100
  const ratePerMinute = change / TREND_WINDOW_MINUTES

  let direction: 'rising' | 'falling' | 'stable' = 'stable'
  if (Math.abs(changePercent) > 3) {
    direction = change > 0 ? 'rising' : 'falling'
  }

  return { direction, ratePerMinute, changePercent }
}

// ─── Duration Analysis ─────────────────────────────────────────────────────────

/**
 * Calculate how long bad conditions have persisted
 */
export function analyzeDuration(
  readings: Array<{ recordedAt: Date; temperature: number; humidity: number }>
): DurationAnalysis {
  if (readings.length === 0) {
    return { minutesInBadConditions: 0, severity: 'low', threshold: THRESHOLDS.duration.moderate }
  }

  const now = new Date()
  let minutesInBadConditions = 0

  // Count consecutive readings with bad conditions
  for (let i = 0; i < readings.length; i++) {
    const reading = readings[i]
    const isBadCondition =
      reading.temperature > THRESHOLDS.temperature.moderate ||
      reading.humidity > THRESHOLDS.humidity.moderate

    if (isBadCondition) {
      const readingTime = new Date(reading.recordedAt)
      const minutesAgo = Math.floor((now.getTime() - readingTime.getTime()) / (1000 * 60))

      if (minutesAgo <= TREND_WINDOW_MINUTES) {
        minutesInBadConditions = Math.max(minutesInBadConditions, minutesAgo)
      }
    } else {
      // Reset if we find a good reading
      break
    }
  }

  // Determine severity based on duration
  let severity: 'low' | 'moderate' | 'high' | 'critical' = 'low'
  let threshold = THRESHOLDS.duration.moderate

  if (minutesInBadConditions >= THRESHOLDS.duration.critical) {
    severity = 'critical'
    threshold = THRESHOLDS.duration.critical
  } else if (minutesInBadConditions >= THRESHOLDS.duration.high) {
    severity = 'high'
    threshold = THRESHOLDS.duration.high
  } else if (minutesInBadConditions >= THRESHOLDS.duration.moderate) {
    severity = 'moderate'
    threshold = THRESHOLDS.duration.moderate
  }

  return { minutesInBadConditions, severity, threshold }
}

// ─── Risk Assessment ───────────────────────────────────────────────────────────

/**
 * Calculate comprehensive risk score (0-100)
 */
export function calculateRiskScore(
  temperature: number,
  humidity: number,
  tempTrend: TrendData,
  humidityTrend: TrendData,
  duration: DurationAnalysis
): number {
  let score = 0

  // Temperature component (0-30 points)
  if (temperature > THRESHOLDS.temperature.critical) score += 30
  else if (temperature > THRESHOLDS.temperature.high) score += 20
  else if (temperature > THRESHOLDS.temperature.moderate) score += 10

  // Humidity component (0-30 points)
  if (humidity > THRESHOLDS.humidity.critical) score += 30
  else if (humidity > THRESHOLDS.humidity.high) score += 20
  else if (humidity > THRESHOLDS.humidity.moderate) score += 10

  // Trend component (0-20 points)
  if (tempTrend.direction === 'rising') score += 10
  if (humidityTrend.direction === 'rising') score += 10

  // Duration component (0-20 points)
  if (duration.severity === 'critical') score += 20
  else if (duration.severity === 'high') score += 15
  else if (duration.severity === 'moderate') score += 8

  return Math.min(score, 100)
}

/**
 * Determine risk level from score
 */
export function getRiskLevelFromScore(score: number): {
  level: 'safe' | 'moderate' | 'high' | 'critical'
  color: 'green' | 'yellow' | 'orange' | 'red'
  label: string
  score: number
} {
  if (score >= 75) {
    return { level: 'critical', color: 'red', label: 'Critical Risk', score }
  }
  if (score >= 50) {
    return { level: 'high', color: 'orange', label: 'High Risk', score }
  }
  if (score >= 25) {
    return { level: 'moderate', color: 'yellow', label: 'Moderate Risk', score }
  }
  return { level: 'safe', color: 'green', label: 'Safe Conditions', score }
}

// ─── Spoilage Calculation ──────────────────────────────────────────────────────

/**
 * Calculate estimated spoilage percentage based on comprehensive analysis
 */
export function calculateSpoilagePercentage(
  riskScore: number,
  daysInStorage: number,
  temperature: number,
  humidity: number
): { percentage: number; timeframeHours: number } {
  let basePercentage = 0
  let timeframeHours = 168 // 7 days default

  if (riskScore >= 75) {
    // Critical: 20-40% spoilage
    basePercentage = 20 + ((riskScore - 75) / 25) * 20
    timeframeHours = 24
  } else if (riskScore >= 50) {
    // High: 10-20% spoilage
    basePercentage = 10 + ((riskScore - 50) / 25) * 10
    timeframeHours = 48
  } else if (riskScore >= 25) {
    // Moderate: 3-10% spoilage
    basePercentage = 3 + ((riskScore - 25) / 25) * 7
    timeframeHours = 72
  } else {
    // Safe: 0-3% natural spoilage
    basePercentage = daysInStorage > 60 ? 2 : 0
    timeframeHours = 168
  }

  // Adjust for extreme conditions
  if (temperature > 35 || humidity > 85) {
    basePercentage *= 1.5
    timeframeHours = Math.floor(timeframeHours / 2)
  }

  return {
    percentage: Math.min(Math.round(basePercentage * 10) / 10, 50),
    timeframeHours,
  }
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Generate immediate action recommendations
 */
export function generateImmediateActions(
  riskLevel: string,
  temperature: number,
  humidity: number,
  tempTrend: TrendData,
  humidityTrend: TrendData
): string[] {
  const actions: string[] = []

  if (riskLevel === 'critical') {
    actions.push('🚨 URGENT: Take immediate action to prevent severe spoilage')
    if (temperature > 35) {
      actions.push('🌡️ CRITICAL: Temperature dangerously high - activate emergency cooling')
    }
    if (humidity > 85) {
      actions.push('💧 CRITICAL: Humidity at dangerous levels - use industrial dehumidifiers')
    }
    actions.push('📦 Prepare for emergency sale or relocation of produce')
  } else if (riskLevel === 'high') {
    if (temperature > 32) {
      actions.push('🌡️ Reduce storage temperature immediately - improve ventilation or cooling')
    }
    if (humidity > 75) {
      actions.push('💧 Reduce humidity urgently - use dehumidifiers or increase air circulation')
      actions.push('☀️ Spread produce for drying if weather permits')
    }
    if (tempTrend.direction === 'rising') {
      actions.push('📈 Temperature rising rapidly - check cooling systems')
    }
    if (humidityTrend.direction === 'rising') {
      actions.push('📈 Humidity increasing - improve ventilation immediately')
    }
    actions.push('🔍 Inspect produce for early signs of mold or spoilage')
  } else if (riskLevel === 'moderate') {
    if (temperature > 28) {
      actions.push('🌡️ Monitor temperature closely - consider improving ventilation')
    }
    if (humidity > 65) {
      actions.push('💧 Watch humidity levels - ensure adequate air circulation')
    }
    actions.push('👀 Increase inspection frequency to twice daily')
  } else {
    actions.push('✅ Maintain current storage conditions')
    actions.push('📊 Continue regular monitoring')
    actions.push('📝 Keep records of temperature and humidity trends')
  }

  return actions
}

/**
 * Generate storage-specific recommendations
 */
export function generateStorageRecommendations(
  duration: DurationAnalysis,
  tempTrend: TrendData,
  humidityTrend: TrendData
): string[] {
  const recommendations: string[] = []

  if (duration.minutesInBadConditions > 0) {
    recommendations.push(
      `⏱️ Bad conditions persisted for ${duration.minutesInBadConditions} minutes - consider intervention`
    )
  }

  if (tempTrend.direction === 'rising' && tempTrend.ratePerMinute > 0.1) {
    recommendations.push('🌡️ Temperature rising fast - check for external heat sources')
  }

  if (humidityTrend.direction === 'rising' && humidityTrend.ratePerMinute > 0.2) {
    recommendations.push('💧 Humidity increasing - check for moisture leaks or poor ventilation')
  }

  if (duration.severity === 'critical') {
    recommendations.push('🚨 Consider emergency relocation to better storage facility')
  }

  return recommendations
}

/**
 * Get best market for commodity near farmer's location
 */
export async function getBestMarketRecommendation(
  commodityName: string,
  latitude: number,
  longitude: number,
  riskLevel: string
): Promise<MarketRecommendation | undefined> {
  try {
    // Normalize commodity name
    const normalizedCommodity = commodityName.toLowerCase().trim()

    // Find markets for this commodity
    const markets = await prisma.market.findMany({
      where: {
        commodity: {
          contains: normalizedCommodity.split(' ')[0], // Use first word (e.g., "maize" from "white maize")
          mode: 'insensitive',
        },
      },
      orderBy: { pricePerKg: 'desc' },
      take: 5,
    })

    if (markets.length === 0) {
      // No specific market data, return generic recommendation
      return getGenericMarketRecommendation(riskLevel)
    }

    // Calculate distances and find best option
    const marketsWithDistance = markets.map((market) => ({
      ...market,
      distance: calculateDistance(latitude, longitude, market.latitude, market.longitude),
    }))

    // Sort by price (descending) but consider distance
    const bestMarket = marketsWithDistance[0]

    // Determine action based on risk level
    let action: MarketRecommendation['action'] = 'hold'
    let message = 'Market conditions are stable. Continue monitoring prices.'

    if (riskLevel === 'critical') {
      action = 'sell_immediately'
      message = `🚨 CRITICAL: Sell immediately at ${bestMarket.marketName} to avoid total loss. Current price: KES ${bestMarket.pricePerKg.toFixed(2)}/kg`
    } else if (riskLevel === 'high') {
      action = 'sell_immediately'
      message = `⚠️ HIGH RISK: Recommended to sell within 24 hours at ${bestMarket.marketName}. Price: KES ${bestMarket.pricePerKg.toFixed(2)}/kg`
    } else if (riskLevel === 'moderate') {
      action = 'sell_soon'
      message = `⏰ Monitor closely. If conditions worsen, sell at ${bestMarket.marketName} (KES ${bestMarket.pricePerKg.toFixed(2)}/kg)`
    }

    return {
      action,
      message,
      bestMarket: {
        name: bestMarket.marketName,
        location: bestMarket.location,
        pricePerKg: bestMarket.pricePerKg,
        distance: Math.round(bestMarket.distance),
      },
      alternativeMarkets: marketsWithDistance.slice(1, 4).map((m) => ({
        name: m.marketName,
        location: m.location,
        pricePerKg: m.pricePerKg,
      })),
    }
  } catch (error) {
    console.error('Error getting market recommendation:', error)
    return getGenericMarketRecommendation(riskLevel)
  }
}

/**
 * Generic market recommendation when no specific data available
 */
function getGenericMarketRecommendation(riskLevel: string): MarketRecommendation {
  if (riskLevel === 'critical') {
    return {
      action: 'sell_immediately',
      message: '🚨 CRITICAL: Sell immediately at any available market to minimize losses.',
    }
  }
  if (riskLevel === 'high') {
    return {
      action: 'sell_immediately',
      message: '⚠️ HIGH RISK: Consider selling within 24 hours to avoid spoilage losses.',
    }
  }
  if (riskLevel === 'moderate') {
    return {
      action: 'monitor',
      message: '⏰ Monitor market prices. Be prepared to sell if storage conditions worsen.',
    }
  }
  return {
    action: 'hold',
    message: '✅ Storage conditions are good. Hold produce for better market prices.',
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

// ─── Early Warning System ──────────────────────────────────────────────────────

/**
 * Generate early warning if conditions are deteriorating
 */
export function generateEarlyWarning(
  riskLevel: string,
  tempTrend: TrendData,
  humidityTrend: TrendData,
  duration: DurationAnalysis
): { triggered: boolean; message: string; urgency: 'low' | 'medium' | 'high' } | undefined {
  // Check for rapid deterioration
  const rapidTempRise = tempTrend.direction === 'rising' && tempTrend.ratePerMinute > 0.2
  const rapidHumidityRise = humidityTrend.direction === 'rising' && humidityTrend.ratePerMinute > 0.3

  if (rapidTempRise || rapidHumidityRise) {
    const messages: string[] = []
    let urgency: 'low' | 'medium' | 'high' = 'medium'

    if (rapidTempRise) {
      messages.push(`Temperature rising rapidly (${tempTrend.ratePerMinute.toFixed(2)}°C/min)`)
      urgency = 'high'
    }
    if (rapidHumidityRise) {
      messages.push(`Humidity rising rapidly (${humidityTrend.ratePerMinute.toFixed(2)}%/min)`)
      urgency = 'high'
    }

    return {
      triggered: true,
      message: `⚠️ WARNING: ${messages.join('. ')} - Take action now to prevent spoilage!`,
      urgency,
    }
  }

  // Check for sustained bad conditions
  if (duration.severity === 'high' || duration.severity === 'critical') {
    return {
      triggered: true,
      message: `⚠️ WARNING: Poor storage conditions for ${duration.minutesInBadConditions} minutes. ${duration.severity === 'critical' ? 'Critical risk - act immediately!' : 'Risk increasing - intervention recommended.'}`,
      urgency: duration.severity === 'critical' ? 'high' : 'medium',
    }
  }

  return undefined
}

// ─── Main Prediction Function ──────────────────────────────────────────────────

/**
 * Generate comprehensive spoilage prediction with trend analysis
 */
export async function predictSpoilageEnhanced(
  storageUnitId: string,
  storageUnitName: string,
  storageLocation: string,
  latitude: number,
  longitude: number,
  commodityId: string,
  commodityName: string,
  quantityStored: number,
  unit: string,
  dateStored: Date,
  currentTemp: number,
  currentHumidity: number,
  historicalReadings: Array<{ recordedAt: Date; temperature: number; humidity: number }>,
  marketPricePerKg?: number
): Promise<SpoilagePredictionEnhanced> {
  // Calculate days in storage
  const now = new Date()
  const daysInStorage = Math.floor((now.getTime() - dateStored.getTime()) / (1000 * 60 * 60 * 24))

  // Extract temperature and humidity arrays for trend analysis
  const temps = historicalReadings.map((r) => r.temperature)
  const humidities = historicalReadings.map((r) => r.humidity)

  // Analyze trends
  const tempTrend = analyzeTrend(temps)
  const humidityTrend = analyzeTrend(humidities)

  // Analyze duration of bad conditions
  const duration = analyzeDuration(historicalReadings)

  // Calculate risk score
  const riskScore = calculateRiskScore(currentTemp, currentHumidity, tempTrend, humidityTrend, duration)
  const riskLevel = getRiskLevelFromScore(riskScore)

  // Calculate spoilage percentage
  const { percentage: spoilagePercentage, timeframeHours } = calculateSpoilagePercentage(
    riskScore,
    daysInStorage,
    currentTemp,
    currentHumidity
  )

  // Calculate spoilage quantity
  const estimatedSpoilageQuantity = (quantityStored * spoilagePercentage) / 100

  // Calculate economic loss
  let estimatedEconomicLoss: number | undefined
  if (marketPricePerKg) {
    let quantityInKg = quantityStored
    if (unit.toLowerCase().includes('bag')) quantityInKg = quantityStored * 90
    else if (unit.toLowerCase().includes('tonne')) quantityInKg = quantityStored * 1000

    estimatedEconomicLoss = (quantityInKg * spoilagePercentage / 100) * marketPricePerKg
  }

  // Generate recommendations
  const immediateActions = generateImmediateActions(
    riskLevel.level,
    currentTemp,
    currentHumidity,
    tempTrend,
    humidityTrend
  )

  const storageRecommendations = generateStorageRecommendations(duration, tempTrend, humidityTrend)

  // Get market recommendation
  const marketRecommendation = await getBestMarketRecommendation(
    commodityName,
    latitude,
    longitude,
    riskLevel.level
  )

  // Generate early warning
  const earlyWarning = generateEarlyWarning(riskLevel.level, tempTrend, humidityTrend, duration)

  // Get last reading time
  const lastReadingTime =
    historicalReadings.length > 0
      ? historicalReadings[0].recordedAt.toISOString()
      : new Date().toISOString()

  return {
    storageUnitId,
    storageUnitName,
    storageLocation,
    latitude,
    longitude,
    commodityId,
    commodityName,
    quantityStored,
    unit,
    dateStored,
    currentTemperature: currentTemp,
    currentHumidity,
    temperatureTrend: tempTrend,
    humidityTrend: humidityTrend,
    durationAnalysis: duration,
    riskLevel,
    estimatedSpoilagePercentage: spoilagePercentage,
    estimatedSpoilageQuantity,
    timeframeHours,
    marketPricePerKg,
    estimatedEconomicLoss,
    immediateActions,
    storageRecommendations,
    marketRecommendation,
    earlyWarning,
    lastReadingTime,
    readingsAnalyzed: historicalReadings.length,
  }
}

/**
 * Get historical readings for a storage unit
 */
export async function getHistoricalReadings(
  storageUnitId: string,
  minutes: number = TREND_WINDOW_MINUTES
): Promise<Array<{ recordedAt: Date; temperature: number; humidity: number }>> {
  const cutoffTime = new Date(Date.now() - minutes * 60 * 1000)

  const readings = await prisma.storageReading.findMany({
    where: {
      storageUnitId,
      recordedAt: {
        gte: cutoffTime,
      },
    },
    orderBy: { recordedAt: 'desc' },
  })

  return readings.map((r) => ({
    recordedAt: r.recordedAt,
    temperature: r.temperature,
    humidity: r.humidity,
  }))
}

/**
 * Get market price for commodity
 */
export async function getMarketPriceForCommodity(commodityName: string): Promise<number> {
  try {
    const markets = await prisma.market.findMany({
      where: {
        commodity: {
          contains: commodityName.toLowerCase().split(' ')[0],
          mode: 'insensitive',
        },
      },
      orderBy: { lastUpdated: 'desc' },
      take: 5,
    })

    if (markets.length > 0) {
      return markets.reduce((sum, m) => sum + m.pricePerKg, 0) / markets.length
    }

    // Fallback prices (KES per kg)
    const fallbackPrices: Record<string, number> = {
      maize: 45,
      beans: 80,
      wheat: 50,
      rice: 120,
      potatoes: 35,
      tomatoes: 60,
      onions: 50,
      cabbage: 30,
    }

    const normalized = commodityName.toLowerCase().trim()
    for (const [key, price] of Object.entries(fallbackPrices)) {
      if (normalized.includes(key)) {
        return price
      }
    }

    return 50 // Default
  } catch (error) {
    console.error('Error fetching market price:', error)
    return 50
  }
}
