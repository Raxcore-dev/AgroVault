/**
 * AI-Powered Real-Time Spoilage Prediction Service
 *
 * Uses RAX AI to analyze:
 * - Real-time temperature and humidity data
 * - Historical trends (increasing/decreasing patterns)
 * - Duration of exposure to risky conditions
 * - Commodity-specific thresholds
 * - Location-based environmental factors
 *
 * Returns predictive risk assessment BEFORE spoilage occurs
 */

import { RaxAI } from 'rax-ai'
import { prisma } from '@/lib/prisma'

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface SensorDataPoint {
  temperature: number
  humidity: number
  timestamp: Date
}

export interface TrendAnalysis {
  direction: 'rising' | 'falling' | 'stable'
  ratePerMinute: number
  changePercent: number
  volatility: 'low' | 'moderate' | 'high'
}

export interface DurationExposure {
  minutesInHighRisk: number
  consecutiveBadReadings: number
  worstConditionDuration: string
}

export interface CommodityProfile {
  name: string
  optimalTempRange: { min: number; max: number }
  optimalHumidityRange: { min: number; max: number }
  maxStorageDays: number
  spoilageSensitivity: 'low' | 'medium' | 'high'
}

export interface AIPredictionInput {
  commodity: string
  currentTemperature: number
  currentHumidity: number
  temperatureTrend: TrendAnalysis
  humidityTrend: TrendAnalysis
  durationExposure: DurationExposure
  location: string
  daysInStorage: number
  quantityStored: number
  unit: string
}

export interface AIPredictionOutput {
  riskLevel: 'safe' | 'warning' | 'high_risk' | 'critical'
  confidence: number // 0-100
  spoilageProbability: number // 0-100%
  predictedTimeToSpoilage: string
  explanation: string
  primaryRiskFactors: string[]
  recommendations: string[]
  earlyWarning: {
    triggered: boolean
    message: string
    urgency: 'low' | 'medium' | 'high'
    detectedPattern: string
  }
  marketSuggestion?: {
    action: 'hold' | 'monitor_closely' | 'sell_soon' | 'sell_immediately'
    reason: string
    bestMarket?: {
      name: string
      location: string
      pricePerKg: number
      distance: number
    }
  }
}

export interface ComprehensivePrediction {
  storageUnitId: string
  storageUnitName: string
  location: string
  commodityName: string
  quantityStored: number
  unit: string
  daysInStorage: number
  
  // Current conditions
  temperature: number
  humidity: number
  
  // Trend analysis
  temperatureTrend: TrendAnalysis
  humidityTrend: TrendAnalysis
  
  // Duration analysis
  durationExposure: DurationExposure
  
  // AI Prediction
  aiPrediction: AIPredictionOutput
  
  // Economic impact
  estimatedLoss?: {
    percentage: number
    quantity: number
    value: number
  }
  
  // Metadata
  readingsAnalyzed: number
  lastUpdated: string
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const COMMODITY_PROFILES: Record<string, CommodityProfile> = {
  maize: {
    name: 'Maize',
    optimalTempRange: { min: 15, max: 25 },
    optimalHumidityRange: { min: 12, max: 14 }, // Grain moisture content
    maxStorageDays: 180,
    spoilageSensitivity: 'high',
  },
  beans: {
    name: 'Beans',
    optimalTempRange: { min: 15, max: 25 },
    optimalHumidityRange: { min: 12, max: 14 },
    maxStorageDays: 180,
    spoilageSensitivity: 'high',
  },
  wheat: {
    name: 'Wheat',
    optimalTempRange: { min: 15, max: 25 },
    optimalHumidityRange: { min: 12, max: 13.5 },
    maxStorageDays: 365,
    spoilageSensitivity: 'medium',
  },
  rice: {
    name: 'Rice',
    optimalTempRange: { min: 14, max: 22 },
    optimalHumidityRange: { min: 12, max: 14 },
    maxStorageDays: 365,
    spoilageSensitivity: 'medium',
  },
  potatoes: {
    name: 'Potatoes',
    optimalTempRange: { min: 4, max: 10 },
    optimalHumidityRange: { min: 85, max: 90 }, // Ambient humidity for storage
    maxStorageDays: 120,
    spoilageSensitivity: 'high',
  },
  tomatoes: {
    name: 'Tomatoes',
    optimalTempRange: { min: 12, max: 18 },
    optimalHumidityRange: { min: 85, max: 90 },
    maxStorageDays: 21,
    spoilageSensitivity: 'high',
  },
  onions: {
    name: 'Onions',
    optimalTempRange: { min: 0, max: 5 },
    optimalHumidityRange: { min: 65, max: 70 },
    maxStorageDays: 180,
    spoilageSensitivity: 'medium',
  },
  cabbage: {
    name: 'Cabbage',
    optimalTempRange: { min: 0, max: 5 },
    optimalHumidityRange: { min: 90, max: 95 },
    maxStorageDays: 90,
    spoilageSensitivity: 'high',
  },
}

const DEFAULT_PROFILE: CommodityProfile = {
  name: 'Generic Crop',
  optimalTempRange: { min: 15, max: 25 },
  optimalHumidityRange: { min: 60, max: 70 },
  maxStorageDays: 90,
  spoilageSensitivity: 'medium',
}

// ─── Helper Functions ──────────────────────────────────────────────────────────

/**
 * Get commodity profile or default
 */
function getCommodityProfile(commodityName: string): CommodityProfile {
  const normalized = commodityName.toLowerCase().trim()
  
  for (const [key, profile] of Object.entries(COMMODITY_PROFILES)) {
    if (normalized.includes(key)) {
      return profile
    }
  }
  
  return DEFAULT_PROFILE
}

/**
 * Analyze trend from historical readings
 */
export function analyzeTrend(readings: SensorDataPoint[]): TrendAnalysis {
  if (readings.length < 2) {
    return { direction: 'stable', ratePerMinute: 0, changePercent: 0, volatility: 'low' }
  }

  const temps = readings.map(r => r.temperature)
  const humidities = readings.map(r => r.humidity)
  
  // Calculate trend direction
  const firstHalf = readings.slice(0, Math.floor(readings.length / 2))
  const secondHalf = readings.slice(Math.floor(readings.length / 2))

  const avgFirstTemp = firstHalf.reduce((a, b) => a + b.temperature, 0) / firstHalf.length
  const avgSecondTemp = secondHalf.reduce((a, b) => a + b.temperature, 0) / secondHalf.length
  
  const avgFirstHum = firstHalf.reduce((a, b) => a + b.humidity, 0) / firstHalf.length
  const avgSecondHum = secondHalf.reduce((a, b) => a + b.humidity, 0) / secondHalf.length

  const tempChange = avgSecondTemp - avgFirstTemp
  const humChange = avgSecondHum - avgFirstHum
  
  // Time span in minutes
  const timeSpan = readings.length > 1 
    ? (readings[0].timestamp.getTime() - readings[readings.length - 1].timestamp.getTime()) / (1000 * 60)
    : 30

  const tempRatePerMinute = tempChange / timeSpan
  const humRatePerMinute = humChange / timeSpan
  
  const tempChangePercent = (tempChange / avgFirstTemp) * 100
  const humChangePercent = (humChange / avgFirstHum) * 100

  // Determine primary trend direction (focus on humidity as it's more critical)
  let direction: 'rising' | 'falling' | 'stable' = 'stable'
  const maxChangePercent = Math.max(Math.abs(tempChangePercent), Math.abs(humChangePercent))
  
  if (maxChangePercent > 3) {
    if (Math.abs(humChangePercent) >= Math.abs(tempChangePercent)) {
      direction = humChange > 0 ? 'rising' : 'falling'
    } else {
      direction = tempChange > 0 ? 'rising' : 'falling'
    }
  }

  // Calculate volatility (standard deviation)
  const tempVariance = temps.reduce((sum, t) => sum + Math.pow(t - avgSecondTemp, 2), 0) / temps.length
  const tempStdDev = Math.sqrt(tempVariance)
  const volatility: 'low' | 'moderate' | 'high' = 
    tempStdDev < 1 ? 'low' : tempStdDev < 3 ? 'moderate' : 'high'

  return {
    direction,
    ratePerMinute: humRatePerMinute, // Primary rate is humidity
    changePercent: humChangePercent,
    volatility,
  }
}

/**
 * Analyze duration of exposure to risky conditions
 */
export function analyzeDurationExposure(
  readings: SensorDataPoint[],
  commodityProfile: CommodityProfile
): DurationExposure {
  if (readings.length === 0) {
    return {
      minutesInHighRisk: 0,
      consecutiveBadReadings: 0,
      worstConditionDuration: '0 minutes',
    }
  }

  let minutesInHighRisk = 0
  let consecutiveBadReadings = 0
  let maxConsecutiveBad = 0

  for (let i = 0; i < readings.length; i++) {
    const reading = readings[i]
    const isBadCondition = 
      reading.temperature > commodityProfile.optimalTempRange.max ||
      reading.humidity > commodityProfile.optimalHumidityRange.max ||
      reading.humidity < commodityProfile.optimalHumidityRange.min

    if (isBadCondition) {
      consecutiveBadReadings++
      maxConsecutiveBad = Math.max(maxConsecutiveBad, consecutiveBadReadings)
      
      // Estimate time in bad conditions (assuming ~10 second intervals)
      minutesInHighRisk += 0.167 // 10 seconds = 0.167 minutes
    } else {
      consecutiveBadReadings = 0
    }
  }

  const worstConditionDuration = `${Math.round(minutesInHighRisk)} minutes`

  return {
    minutesInHighRisk,
    consecutiveBadReadings: maxConsecutiveBad,
    worstConditionDuration,
  }
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

  // Standard OpenAI-style
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
    // Remove markdown code fences
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '')
    }
    return JSON.parse(cleaned) as T
  } catch {
    // Try to find JSON object in the text
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

// ─── AI Prediction Engine ──────────────────────────────────────────────────────

/**
 * Generate AI-powered spoilage prediction using RAX AI
 */
export async function generateAIPrediction(
  input: AIPredictionInput
): Promise<AIPredictionOutput> {
  const rax = getRaxClient()
  
  if (!rax) {
    // Fallback to rule-based prediction
    return fallbackRuleBasedPrediction(input)
  }

  try {
    const commodityProfile = getCommodityProfile(input.commodity)
    
    const systemPrompt = `You are an expert agricultural AI specializing in post-harvest spoilage prediction for Kenyan farmers. 
Your role is to analyze real-time sensor data, detect trends, and predict spoilage risk BEFORE it happens.
Always respond with valid JSON only, no markdown, no code fences.

Key principles:
1. Early detection is critical - identify risks before they become critical
2. Consider trends, not just current values
3. Duration of exposure matters more than momentary spikes
4. Provide actionable, specific recommendations
5. Consider the economic impact on the farmer`

    const userPrompt = `Analyze these storage conditions and predict spoilage risk:

COMMODITY: ${input.commodity}
- Optimal temperature: ${commodityProfile.optimalTempRange.min}-${commodityProfile.optimalTempRange.max}°C
- Optimal humidity: ${commodityProfile.optimalHumidityRange.min}-${commodityProfile.optimalHumidityRange.max}%
- Sensitivity: ${commodityProfile.spoilageSensitivity}
- Days in storage: ${input.daysInStorage}

CURRENT CONDITIONS:
- Temperature: ${input.currentTemperature}°C
- Humidity: ${input.currentHumidity}%

TREND ANALYSIS:
- Overall trend: ${input.temperatureTrend.direction} (temperature ${input.temperatureTrend.direction === 'rising' ? 'increasing' : input.temperatureTrend.direction === 'falling' ? 'decreasing' : 'stable'})
- Temperature rate: ${input.temperatureTrend.ratePerMinute.toFixed(3)}°C/min (${input.temperatureTrend.changePercent.toFixed(1)}% change)
- Humidity rate: ${input.humidityTrend.ratePerMinute.toFixed(3)}%/min (${input.humidityTrend.changePercent.toFixed(1)}% change)
- Volatility: ${input.temperatureTrend.volatility}

DURATION EXPOSURE:
- Time in high-risk conditions: ${input.durationExposure.minutesInHighRisk} minutes
- Consecutive bad readings: ${input.durationExposure.consecutiveBadReadings}
- Worst condition duration: ${input.durationExposure.worstConditionDuration}

LOCATION: ${input.location}, Kenya
QUANTITY: ${input.quantityStored} ${input.unit}

Respond with ONLY this JSON structure (no other text):
{
  "riskLevel": "safe" | "warning" | "high_risk" | "critical",
  "confidence": number (0-100),
  "spoilageProbability": number (0-100),
  "predictedTimeToSpoilage": string (e.g., "24-48 hours", "5-7 days", "No immediate risk"),
  "explanation": string (detailed explanation of the risk assessment),
  "primaryRiskFactors": array of strings (top 3-5 risk factors),
  "recommendations": array of strings (3-5 actionable recommendations),
  "earlyWarning": {
    "triggered": boolean,
    "message": string,
    "urgency": "low" | "medium" | "high",
    "detectedPattern": string (e.g., "Rising humidity trend", "Sustained high temperature")
  },
  "marketSuggestion": {
    "action": "hold" | "monitor_closely" | "sell_soon" | "sell_immediately",
    "reason": string,
    "bestMarket": {
      "name": string,
      "location": string,
      "pricePerKg": number,
      "distance": number
    } (optional, include only if selling is recommended)
  }
}`

    const response = await rax.chat({
      model: 'rax-4.0',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    })

    const text = extractResponseText(response)
    const parsed = parseJSON<AIPredictionOutput>(text)

    if (parsed && parsed.riskLevel && parsed.explanation) {
      // Validate and normalize response
      const validRiskLevels = ['safe', 'warning', 'high_risk', 'critical'] as const
      if (!validRiskLevels.includes(parsed.riskLevel as typeof validRiskLevels[number])) {
        parsed.riskLevel = 'warning'
      }
      
      // Ensure confidence is in valid range
      parsed.confidence = Math.min(Math.max(parsed.confidence || 50, 0), 100)
      parsed.spoilageProbability = Math.min(Math.max(parsed.spoilageProbability || 0, 0), 100)
      
      return parsed
    }

    return fallbackRuleBasedPrediction(input)
  } catch (error) {
    console.error('[AI Spoilage Prediction] Error:', error)
    return fallbackRuleBasedPrediction(input)
  }
}

/**
 * Fallback rule-based prediction when AI is unavailable
 */
function fallbackRuleBasedPrediction(input: AIPredictionInput): AIPredictionOutput {
  const commodityProfile = getCommodityProfile(input.commodity)
  
  let riskLevel: 'safe' | 'warning' | 'high_risk' | 'critical' = 'safe'
  let confidence = 70
  let spoilageProbability = 0
  const riskFactors: string[] = []
  const recommendations: string[] = []
  let earlyWarningTriggered = false
  let earlyWarningMessage = ''
  let earlyWarningUrgency: 'low' | 'medium' | 'high' = 'low'
  let detectedPattern = 'Normal conditions'

  // Temperature assessment
  const tempDeviation = input.currentTemperature - commodityProfile.optimalTempRange.max
  if (tempDeviation > 10) {
    riskFactors.push(`Critical temperature: ${input.currentTemperature}°C (optimal: ${commodityProfile.optimalTempRange.max}°C max)`)
    spoilageProbability += 40
    recommendations.push('🌡️ URGENT: Reduce temperature immediately - activate cooling or ventilation')
  } else if (tempDeviation > 5) {
    riskFactors.push(`High temperature: ${input.currentTemperature}°C`)
    spoilageProbability += 25
    recommendations.push('🌡️ Improve ventilation to reduce temperature')
  } else if (tempDeviation > 0) {
    riskFactors.push(`Temperature slightly above optimal`)
    spoilageProbability += 10
    recommendations.push('🌡️ Monitor temperature closely')
  }

  // Humidity assessment
  const humDeviation = input.currentHumidity - commodityProfile.optimalHumidityRange.max
  if (humDeviation > 15) {
    riskFactors.push(`Critical humidity: ${input.currentHumidity}% (optimal: ${commodityProfile.optimalHumidityRange.max}% max)`)
    spoilageProbability += 40
    recommendations.push('💧 URGENT: Reduce humidity - use dehumidifiers or increase air circulation')
  } else if (humDeviation > 8) {
    riskFactors.push(`High humidity: ${input.currentHumidity}%`)
    spoilageProbability += 25
    recommendations.push('💧 Reduce humidity urgently to prevent mold growth')
  } else if (humDeviation > 0) {
    riskFactors.push(`Humidity slightly above optimal`)
    spoilageProbability += 10
    recommendations.push('💧 Monitor humidity levels')
  }

  // Trend assessment
  if (input.humidityTrend.direction === 'rising' && input.humidityTrend.changePercent > 10) {
    riskFactors.push(`Rapidly increasing humidity (+${input.humidityTrend.changePercent.toFixed(1)}%)`)
    spoilageProbability += 20
    recommendations.push('📈 Humidity rising rapidly - improve ventilation immediately')
    earlyWarningTriggered = true
    detectedPattern = 'Rising humidity trend'
    earlyWarningUrgency = 'high'
  } else if (input.temperatureTrend.direction === 'rising' && input.temperatureTrend.changePercent > 8) {
    riskFactors.push(`Rapidly increasing temperature (+${input.temperatureTrend.changePercent.toFixed(1)}%)`)
    spoilageProbability += 15
    recommendations.push('📈 Temperature rising - check for heat sources')
    earlyWarningTriggered = true
    detectedPattern = 'Rising temperature trend'
    earlyWarningUrgency = 'medium'
  }

  // Duration assessment
  if (input.durationExposure.minutesInHighRisk > 30) {
    riskFactors.push(`Extended exposure to poor conditions (${input.durationExposure.minutesInHighRisk} minutes)`)
    spoilageProbability += 15
    recommendations.push('⏱️ Prolonged poor conditions - immediate intervention needed')
  }

  // Determine risk level
  if (spoilageProbability >= 60) {
    riskLevel = 'critical'
    confidence = 85
    earlyWarningMessage = '🚨 CRITICAL: Spoilage risk extremely high - take immediate action!'
  } else if (spoilageProbability >= 40) {
    riskLevel = 'high_risk'
    confidence = 75
    earlyWarningMessage = '⚠️ HIGH RISK: Conditions favorable for spoilage - act now!'
  } else if (spoilageProbability >= 20) {
    riskLevel = 'warning'
    confidence = 65
    earlyWarningMessage = '⚠️ Conditions becoming unfavorable - monitor closely'
    earlyWarningTriggered = true
    earlyWarningUrgency = 'low'
  }

  // Calculate predicted time to spoilage
  let predictedTimeToSpoilage = 'No immediate risk'
  if (riskLevel === 'critical') {
    predictedTimeToSpoilage = '6-24 hours'
  } else if (riskLevel === 'high_risk') {
    predictedTimeToSpoilage = '24-48 hours'
  } else if (riskLevel === 'warning') {
    predictedTimeToSpoilage = '3-7 days'
  }

  // Generate explanation
  const explanation = `Based on current conditions (${input.currentTemperature}°C, ${input.currentHumidity}% humidity) and ${input.commodity} storage requirements, the risk level is ${riskLevel.replace('_', ' ')}. ${riskFactors.length > 0 ? 'Key concerns: ' + riskFactors.slice(0, 2).join('. ') + '.' : 'Conditions are within acceptable ranges.'}`

  // Market suggestion
  let marketSuggestion: AIPredictionOutput['marketSuggestion'] = {
    action: 'hold',
    reason: 'Storage conditions are acceptable. Hold for better market prices.',
  }
  
  if (riskLevel === 'critical') {
    marketSuggestion = {
      action: 'sell_immediately',
      reason: 'Critical spoilage risk - sell immediately to minimize losses',
    }
  } else if (riskLevel === 'high_risk') {
    marketSuggestion = {
      action: 'sell_soon',
      reason: 'High spoilage risk - consider selling within 24-48 hours',
    }
  }

  if (earlyWarningTriggered && !earlyWarningMessage) {
    earlyWarningMessage = `⚠️ ${detectedPattern} detected - conditions may worsen soon`
  }

  return {
    riskLevel,
    confidence,
    spoilageProbability: Math.min(spoilageProbability, 100),
    predictedTimeToSpoilage,
    explanation,
    primaryRiskFactors: riskFactors.length > 0 ? riskFactors : ['No significant risk factors detected'],
    recommendations: recommendations.length > 0 ? recommendations : ['✅ Maintain current storage conditions', '📊 Continue regular monitoring'],
    earlyWarning: {
      triggered: earlyWarningTriggered,
      message: earlyWarningMessage || 'No early warnings at this time',
      urgency: earlyWarningUrgency,
      detectedPattern,
    },
    marketSuggestion,
  }
}

// ─── Main Prediction Function ──────────────────────────────────────────────────

/**
 * Generate comprehensive AI-powered spoilage prediction
 */
export async function predictSpoilageWithAI(
  storageUnitId: string,
  storageUnitName: string,
  location: string,
  commodityId: string,
  commodityName: string,
  quantityStored: number,
  unit: string,
  dateStored: Date,
  currentTemp: number,
  currentHumidity: number,
  historicalReadings: SensorDataPoint[]
): Promise<ComprehensivePrediction> {
  // Calculate days in storage
  const daysInStorage = Math.floor((Date.now() - dateStored.getTime()) / (1000 * 60 * 60 * 24))
  
  // Get commodity profile
  const commodityProfile = getCommodityProfile(commodityName)
  
  // Analyze trends
  const tempTrend = analyzeTrend(historicalReadings)
  const humTrend = analyzeTrend(historicalReadings.map(r => ({
    temperature: r.humidity, // Reuse humidity as "temperature" for trend calculation
    humidity: r.humidity,
    timestamp: r.timestamp,
  })))
  
  // Analyze duration exposure
  const durationExposure = analyzeDurationExposure(historicalReadings, commodityProfile)
  
  // Prepare AI input
  const aiInput: AIPredictionInput = {
    commodity: commodityName,
    currentTemperature: currentTemp,
    currentHumidity,
    temperatureTrend: tempTrend,
    humidityTrend: humTrend,
    durationExposure,
    location,
    daysInStorage,
    quantityStored,
    unit,
  }
  
  // Generate AI prediction
  const aiPrediction = await generateAIPrediction(aiInput)
  
  // Calculate estimated loss
  let estimatedLoss: ComprehensivePrediction['estimatedLoss']
  if (aiPrediction.spoilageProbability > 0) {
    const spoilagePercentage = aiPrediction.spoilageProbability / 100
    let quantityInKg = quantityStored
    if (unit.toLowerCase().includes('bag')) quantityInKg = quantityStored * 90
    else if (unit.toLowerCase().includes('tonne')) quantityInKg = quantityStored * 1000
    
    // Get market price
    const marketPrice = await getMarketPriceForCommodity(commodityName)
    const value = quantityInKg * spoilagePercentage * marketPrice
    
    estimatedLoss = {
      percentage: aiPrediction.spoilageProbability,
      quantity: quantityInKg * spoilagePercentage,
      value,
    }
  }
  
  return {
    storageUnitId,
    storageUnitName,
    location,
    commodityName,
    quantityStored,
    unit,
    daysInStorage,
    temperature: currentTemp,
    humidity: currentHumidity,
    temperatureTrend: tempTrend,
    humidityTrend: humTrend,
    durationExposure,
    aiPrediction,
    estimatedLoss,
    readingsAnalyzed: historicalReadings.length,
    lastUpdated: new Date().toISOString(),
  }
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

/**
 * Get historical readings from database
 */
export async function getHistoricalSensorReadings(
  storageUnitId: string,
  limit: number = 20
): Promise<SensorDataPoint[]> {
  try {
    const readings = await prisma.storageReading.findMany({
      where: { storageUnitId },
      orderBy: { recordedAt: 'desc' },
      take: limit,
    })

    return readings.map(r => ({
      temperature: r.temperature,
      humidity: r.humidity,
      timestamp: r.recordedAt,
    }))
  } catch (error) {
    console.error('Error fetching historical readings:', error)
    return []
  }
}

/**
 * Clear any cached data (if needed)
 */
export function clearPredictionCache(): void {
  // Implementation if caching is added later
}
