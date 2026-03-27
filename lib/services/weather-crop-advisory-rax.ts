/**
 * Weather-Based Crop Advisory AI Service
 *
 * Analyzes weather forecasts and predicts their impact on stored commodities
 * using RAX AI. Generates actionable recommendations when weather threatens
 * stored crops.
 */

import { RaxAI } from 'rax-ai'
import { prisma } from '@/lib/prisma'
import { getWeatherByCoords } from './weatherService'
import { getHistoricalReadings } from './spoilage-prediction-enhanced'

// ─── Types ────────────────────────────────────────────────────────────────

export interface CurrentStorageConditions {
  temperature: number
  humidity: number
  recordedAt: Date
}

export interface CommodityAdvisory {
  commodityId: string
  commodityName: string
  quantity: number
  unit: string
  currentConditions: {
    temperature: number
    humidity: number
    spoilageRisk: number
    status: string
  }
  forecastedConditions: {
    temperature: number
    humidity: number
    forecastedSpoilageRisk: number
    riskChange: string
    causedBy: string
  }
  timeframe: {
    hoursToCritical: number
    actionDeadline: string
    window: string
  }
  recommendations: {
    primary: string
    secondary: string[]
    urgency: string
  }
  actions: Array<{
    action: string
    reason: string
    details?: string
    timeframe: string
  }>
  marketOpportunity: {
    recommended: boolean
    market?: string
    price?: number
    distance_km?: number
    trend?: string
    reasoning: string
    urgency?: string
  }
  aiAnalysis: string
  confidence_score: number
}

export interface WeatherImpactData {
  description: string
  duration: string
  expectedHumidityChange: string
  expectedTemperatureChange: string
  riskLevel: string
  affectedCommodities: string[]
  explanation: string
}

export interface WeatherCropAdvisoryResponse {
  success: boolean
  forecastPeriod: string
  weatherSummary: string
  currentDate: string
  forecastDate: string
  severity: string
  commodityAdvisories: CommodityAdvisory[]
  overallStrategy: string
  weatherImpact: WeatherImpactData
  alertedCommodities: number
  recommendedActions: string[]
  lastUpdated: string
  confidence: number
}

// ─── RAX AI Client ────────────────────────────────────────────────────────

function getRaxClient(): RaxAI | null {
  const apiKey = process.env.RAX_API_KEY
  if (!apiKey || apiKey === 'your_rax_api_key_here' || apiKey === '') {
    return null
  }
  return new RaxAI({ apiKey })
}

// ─── Cache ──────────────────────────────────────────────────────────────

interface CacheEntry {
  data: WeatherCropAdvisoryResponse
  timestamp: number
}

const advisoryCache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

// ─── Main Function ──────────────────────────────────────────────────────

/**
 * Main function to analyze weather impact on stored commodities
 */
export async function analyzeWeatherImpactOnCommodities(
  storageUnitId: string,
  farmerId: string,
  latitude: number,
  longitude: number,
  location: string
): Promise<WeatherCropAdvisoryResponse> {
  try {
    // Check cache
    const cacheKey = `weather-advisory-${storageUnitId}`
    const cached = advisoryCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data
    }

    // Get all data in parallel
    const [commodities, currentReadings, forecast] = await Promise.all([
      getCommoditiesInStorage(storageUnitId),
      getCurrentStorageReadings(storageUnitId),
      getWeatherForecast(latitude, longitude, location),
    ])

    // If no commodities or readings, return empty advisory
    if (commodities.length === 0 || !currentReadings) {
      return {
        success: true,
        forecastPeriod: 'Next 7 days',
        weatherSummary: 'No commodities in storage',
        currentDate: new Date().toISOString(),
        forecastDate: new Date().toISOString(),
        severity: 'NONE',
        commodityAdvisories: [],
        overallStrategy: 'No action needed - no commodities in storage',
        weatherImpact: {
          description: 'N/A',
          duration: 'N/A',
          expectedHumidityChange: 'N/A',
          expectedTemperatureChange: 'N/A',
          riskLevel: 'NONE',
          affectedCommodities: [],
          explanation: 'No commodities to analyze',
        },
        alertedCommodities: 0,
        recommendedActions: [],
        lastUpdated: new Date().toISOString(),
        confidence: 0,
      }
    }

    // Call RAX AI for comprehensive analysis
    const aiResponse = await callRaxAIForWeatherImpact(
      commodities,
      currentReadings,
      forecast,
      location
    )

    // Parse advisories from AI response
    const commodityAdvisories = await Promise.all(
      commodities.map(async (commodity) =>
        generateCommodityAdvisory(
          commodity,
          currentReadings,
          forecast,
          aiResponse,
          location
        )
      )
    )

    // Calculate overall severity
    const maxUrgency = commodityAdvisories.reduce((max, advisory) => {
      const urgencies = ['SAFE', 'MONITOR', 'WARNING', 'HIGH', 'CRITICAL']
      const currentIndex = urgencies.indexOf(advisory.recommendations.urgency)
      const maxIndex = urgencies.indexOf(max)
      return currentIndex > maxIndex ? advisory.recommendations.urgency : max
    }, 'SAFE')

    const alertedCount = commodityAdvisories.filter(
      (a) => a.recommendations.urgency !== 'SAFE'
    ).length

    const response: WeatherCropAdvisoryResponse = {
      success: true,
      forecastPeriod: 'Next 7 days',
      weatherSummary: forecast[0]?.date || 'N/A',
      currentDate: new Date().toISOString(),
      forecastDate: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      severity: maxUrgency,
      commodityAdvisories,
      overallStrategy: (aiResponse.overallStrategy as string) || 'Monitor storage conditions',
      weatherImpact: {
        description: `Temperature: ${forecast[0]?.temperature_min || 0}°C - ${forecast[0]?.temperature_max || 0}°C`,
        duration: (aiResponse.weatherDuration as string) || '3-6 hours',
        expectedHumidityChange: `${currentReadings.humidity}% → ${(aiResponse.expectedHumidity as number) || currentReadings.humidity}%`,
        expectedTemperatureChange: `${currentReadings.temperature}°C → ${(aiResponse.expectedTemperature as number) || currentReadings.temperature}°C`,
        riskLevel: maxUrgency,
        affectedCommodities: commodityAdvisories
          .filter((a) => a.recommendations.urgency !== 'SAFE')
          .map((a) => a.commodityName),
        explanation: (aiResponse.weatherExplanation as string) || 'Weather conditions will impact storage',
      },
      alertedCommodities: alertedCount,
      recommendedActions: extractRecommendedActions(commodityAdvisories),
      lastUpdated: new Date().toISOString(),
      confidence: calculateAverageConfidence(commodityAdvisories),
    }

    // Cache result
    advisoryCache.set(cacheKey, {
      data: response,
      timestamp: Date.now(),
    })

    return response
  } catch (error) {
    console.error('Weather crop advisory error:', error)
    throw error
  }
}

// ─── Helper Functions ────────────────────────────────────────────────────

/**
 * Get all commodities currently in storage
 */
async function getCommoditiesInStorage(storageUnitId: string) {
  const commodities = await prisma.commodity.findMany({
    where: {
      storageUnitId,
      quantity: { gt: 0 },
    },
  })
  return commodities
}

/**
 * Get current storage readings
 */
async function getCurrentStorageReadings(
  storageUnitId: string
): Promise<CurrentStorageConditions | null> {
  const reading = await prisma.storageReading.findFirst({
    where: { storageUnitId },
    orderBy: { recordedAt: 'desc' },
  })

  if (!reading) return null

  return {
    temperature: reading.temperature,
    humidity: reading.humidity,
    recordedAt: reading.recordedAt,
  }
}

/**
 * Get weather forecast
 */
async function getWeatherForecast(
  latitude: number,
  longitude: number,
  location: string
) {
  try {
    const weather = await getWeatherByCoords(latitude, longitude, location)
    return weather.forecast || []
  } catch {
    return []
  }
}

/**
 * Calculate spoilage risk for forecasted conditions
 */
function calculateForecastedRisk(
  commodity: any,
  currentTemp: number,
  currentHumidity: number,
  forecastTemp: number,
  forecastHumidity: number
): number {
  // Simple risk calculation based on conditions
  let currentRisk = 0
  let forecastRisk = 0

  // Current risk
  if (currentTemp > 30 || currentHumidity > 75) currentRisk = 50
  else if (currentTemp > 25 || currentHumidity > 65) currentRisk = 30
  else currentRisk = 10

  // Forecasted risk (conditions expected)
  if (forecastTemp > 30 || forecastHumidity > 75) forecastRisk = 70
  else if (forecastTemp > 25 || forecastHumidity > 65) forecastRisk = 40
  else forecastRisk = 15

  return Math.min(forecastRisk, 100)
}

/**
 * Call RAX AI for comprehensive weather impact analysis
 */
async function callRaxAIForWeatherImpact(
  commodities: Array<{ commodityName: string; quantity: number; unit: string; dateStored: Date }>,
  currentConditions: CurrentStorageConditions,
  forecast: Array<{ date: string; temperature_min: number; temperature_max: number; humidity: number; rain_probability: number }>,
  location: string
): Promise<Record<string, unknown>> {
  const rax = getRaxClient()

  if (!rax) {
    // Fallback to empty analysis
    return {
      overallStrategy: 'AI analysis unavailable',
      maxUrgency: 'MONITOR',
      affectedCommodities: [],
      recommendations: [],
    }
  }

  const commodityList = commodities
    .map(
      (c) =>
        `- ${c.commodityName}: ${c.quantity} ${c.unit} (${Math.round(
          (Date.now() - c.dateStored.getTime()) / (1000 * 60 * 60 * 24)
        )} days in storage)`
    )
    .join('\n')

  const forecastList = forecast
    .slice(0, 3)
    .map(
      (f) =>
        `- ${f.date}: ${f.temperature_min}°C to ${f.temperature_max}°C, ${f.humidity}% humidity, ${f.rain_probability}% rain chance`
    )
    .join('\n')

  const userPrompt = `You are an expert agricultural meteorologist and crop storage specialist for Kenya.
Your task is to analyze weather forecasts and predict their impact on stored crops.

FARMER'S LOCATION: ${location}

STORED COMMODITIES:
${commodityList}

CURRENT STORAGE CONDITIONS:
- Temperature: ${currentConditions.temperature}°C
- Humidity: ${currentConditions.humidity}%
- Last recorded: ${new Date().toLocaleString()}

WEATHER FORECAST (Next 3 days):
${forecastList}

YOUR ANALYSIS:
1. How will the forecasted weather change storage conditions?
2. What's the overall risk level? (SAFE, MONITOR, WARNING, HIGH, CRITICAL)
3. For which commodities is action needed?
4. What are the PRIMARY recommended actions?
5. Should farmers sell immediately? Why or why not?
6. If weather will worsen conditions, estimate hours to critical state
7. Quantify the potential loss if no action is taken
8. What's the overall strategy?

Respond with ONLY this JSON structure (no markdown, no code fences):
{
  "overallStrategy": "Clear action plan",
  "maxUrgency": "SAFE/MONITOR/WARNING/HIGH/CRITICAL",
  "affectedCommodities": ["commodity names"],
  "recommendations": [
    {
      "commodity": "name",
      "primary": "PRIMARY_ACTION",
      "secondary": ["action1", "action2"],
      "urgency": "LEVEL",
      "hoursToCritical": 0,
      "reasoning": "explanation"
    }
  ],
  "expectedTemperature": 27,
  "expectedHumidity": 85,
  "weatherDuration": "3-6 hours",
  "weatherExplanation": "why conditions will change"
}`

  try {
    const response = await rax.chat({
      model: 'rax-4.0',
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    })

    // Extract text from response
    let content = ''
    const r = response as unknown as Record<string, unknown>
    if (r.choices && Array.isArray(r.choices) && r.choices[0]) {
      const choice = r.choices[0] as Record<string, unknown>
      if (choice.message) {
        const msg = choice.message as Record<string, unknown>
        if (typeof msg.content === 'string') content = msg.content
      }
    }
    if (!content && typeof r.content === 'string') content = r.content
    if (!content && typeof r.text === 'string') content = r.text

    // Try to parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    return {
      overallStrategy: content,
      maxUrgency: 'WARNING',
      affectedCommodities: [],
      recommendations: [],
    }
  } catch (error) {
    console.error('RAX AI error:', error)
    return {
      overallStrategy: 'Unable to analyze weather impact at this time',
      maxUrgency: 'MONITOR',
      affectedCommodities: [],
      recommendations: [],
    }
  }
}

/**
 * Generate commodity-specific advisory
 */
async function generateCommodityAdvisory(
  commodity: { id?: string; commodityName: string; quantity: number; unit: string; dateStored: Date },
  currentReadings: CurrentStorageConditions,
  forecast: Array<{ date: string; temperature_min: number; temperature_max: number; humidity: number; rain_probability: number }>,
  aiResponse: Record<string, unknown>,
  location: string
): Promise<CommodityAdvisory> {
  const currentRisk = calculateForecastedRisk(
    commodity,
    currentReadings.temperature,
    currentReadings.humidity,
    currentReadings.temperature,
    currentReadings.humidity
  )

  const forecastRisk = calculateForecastedRisk(
    commodity,
    currentReadings.temperature,
    currentReadings.humidity,
    forecast[0]?.temperature_max || currentReadings.temperature,
    forecast[0]?.humidity || currentReadings.humidity
  )

  const riskChange = forecastRisk - currentRisk

  // Find commodity in AI recommendations
  const recommendations = aiResponse.recommendations as Array<{ commodity?: string; primary?: string; secondary?: string[]; urgency?: string; hoursToCritical?: number; reasoning?: string }> | undefined
  const aiRecommendation = recommendations?.find(
    (r) => r.commodity?.toLowerCase() === commodity.commodityName.toLowerCase()
  ) || {
    primary: 'MONITOR_CLOSELY',
    secondary: ['INCREASE_VENTILATION'],
    urgency: 'MONITOR',
    hoursToCritical: 24,
    reasoning: 'Monitor storage conditions',
  }

  const urgencyLevel = aiRecommendation.urgency || 'MONITOR'
  const hoursToCritical = aiRecommendation.hoursToCritical || 24

  return {
    commodityId: commodity.id || `${commodity.commodityName}-${Date.now()}`,
    commodityName: commodity.commodityName,
    quantity: commodity.quantity,
    unit: commodity.unit,
    currentConditions: {
      temperature: currentReadings.temperature,
      humidity: currentReadings.humidity,
      spoilageRisk: currentRisk,
      status: getRiskStatus(currentRisk),
    },
    forecastedConditions: {
      temperature: forecast[0]?.temperature_max || currentReadings.temperature,
      humidity: forecast[0]?.humidity || currentReadings.humidity,
      forecastedSpoilageRisk: forecastRisk,
      riskChange: `${riskChange > 0 ? '+' : ''}${Math.round(riskChange)}%`,
      causedBy: `Weather: ${Math.round(forecast[0]?.temperature_max || currentReadings.temperature)}°C, ${forecast[0]?.humidity || currentReadings.humidity}% humidity`,
    },
    timeframe: {
      hoursToCritical,
      actionDeadline: `Within ${Math.max(1, Math.floor(hoursToCritical / 2))} hours`,
      window: hoursToCritical > 12 ? 'Tomorrow' : 'Today',
    },
    recommendations: {
      primary: aiRecommendation.primary || 'MONITOR_CLOSELY',
      secondary: aiRecommendation.secondary || ['INCREASE_VENTILATION'],
      urgency: urgencyLevel,
    },
    actions: generateActions(
      urgencyLevel,
      commodity.commodityName,
      currentReadings,
      forecast[0]
    ),
    marketOpportunity: {
      recommended: urgencyLevel === 'CRITICAL' || urgencyLevel === 'HIGH',
      reasoning: aiRecommendation.reasoning || 'Monitor market prices',
    },
    aiAnalysis: aiRecommendation.reasoning || 'Standard monitoring recommended',
    confidence_score: 0.85,
  }
}

/**
 * Generate specific action items
 */
function generateActions(
  urgency: string,
  commodityName: string,
  currentReadings: CurrentStorageConditions,
  forecast: { humidity?: number; temperature_max?: number }
): Array<{ action: string; reason: string; details?: string; timeframe: string }> {
  const actions: Array<{ action: string; reason: string; details?: string; timeframe: string }> = []

  if (urgency === 'CRITICAL') {
    actions.push({
      action: 'Sell immediately',
      reason: `${commodityName} is at critical spoilage risk`,
      details: `Weather forecast shows worsening conditions (humidity rising to ${forecast?.humidity || 'high'}%)`,
      timeframe: 'Next 2 hours',
    })
    actions.push({
      action: 'If selling not possible: Increase ventilation immediately',
      reason: 'Open all vents to reduce humidity',
      timeframe: 'Immediately',
    })
  } else if (urgency === 'HIGH') {
    actions.push({
      action: 'Prepare for immediate sale',
      reason: 'Weather conditions will deteriorate',
      timeframe: 'Next 4 hours',
    })
    actions.push({
      action: 'Increase ventilation',
      reason: 'Improve air circulation before weather hits',
      timeframe: 'Next 2 hours',
    })
  } else if (urgency === 'WARNING') {
    actions.push({
      action: 'Monitor closely every 2 hours',
      reason: 'Conditions may worsen',
      timeframe: 'Continuous',
    })
    actions.push({
      action: 'Prepare contingency plans',
      reason: 'Be ready to act if conditions deteriorate',
      timeframe: 'Next 4 hours',
    })
  } else {
    actions.push({
      action: 'Continue normal monitoring',
      reason: 'Conditions are stable',
      timeframe: 'Regular schedule',
    })
  }

  return actions
}

/**
 * Get risk status label
 */
function getRiskStatus(riskScore: number): string {
  if (riskScore >= 80) return 'CRITICAL'
  if (riskScore >= 60) return 'HIGH_RISK'
  if (riskScore >= 40) return 'MODERATE_RISK'
  if (riskScore >= 20) return 'LOW_RISK'
  return 'SAFE'
}

/**
 * Extract top recommended actions
 */
function extractRecommendedActions(
  advisories: CommodityAdvisory[]
): string[] {
  const actions: string[] = []

  advisories.forEach((advisory) => {
    if (advisory.recommendations.urgency === 'CRITICAL') {
      actions.push(
        `Sell ${advisory.commodityName} immediately - risk critical`
      )
    } else if (advisory.recommendations.urgency === 'HIGH') {
      actions.push(
        `Prepare ${advisory.commodityName} for immediate sale`
      )
    } else if (advisory.recommendations.urgency === 'WARNING') {
      actions.push(
        `Monitor ${advisory.commodityName} closely - conditions may worsen`
      )
    }
  })

  return actions.slice(0, 3) // Return top 3 actions
}

/**
 * Calculate average confidence across advisories
 */
function calculateAverageConfidence(advisories: CommodityAdvisory[]): number {
  if (advisories.length === 0) return 0
  const total = advisories.reduce((sum, a) => sum + a.confidence_score, 0)
  return Math.round((total / advisories.length) * 100) / 100
}
