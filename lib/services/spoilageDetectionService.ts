/**
 * Spoilage Detection Service
 *
 * Evaluates storage conditions (temperature, humidity, storage duration, commodity type)
 * against configurable thresholds to classify spoilage risk and generate alerts.
 *
 * Risk levels: "low" | "medium" | "high"
 *
 * When risk is HIGH, an alert is created and the market recommendation service
 * is invoked to suggest the best nearby market for selling.
 */

import { prisma } from '@/lib/prisma'
import { getMarketRecommendation } from '@/lib/services/marketRecommendationService'
import { runFullAnalysis, type AIFullAnalysis } from '@/lib/services/aiAnalysisService'

// ─── Default Thresholds (fallback when DB thresholds not configured) ───

interface Threshold {
  minTemp: number
  maxTemp: number
  minHumidity: number
  maxHumidity: number
  maxStorageDays: number
}

const DEFAULT_THRESHOLDS: Record<string, Threshold> = {
  maize: { minTemp: 10, maxTemp: 30, minHumidity: 50, maxHumidity: 70, maxStorageDays: 120 },
  wheat: { minTemp: 10, maxTemp: 28, minHumidity: 50, maxHumidity: 65, maxStorageDays: 180 },
  beans: { minTemp: 10, maxTemp: 28, minHumidity: 40, maxHumidity: 65, maxStorageDays: 180 },
  rice: { minTemp: 10, maxTemp: 30, minHumidity: 55, maxHumidity: 70, maxStorageDays: 150 },
  tomatoes: { minTemp: 2, maxTemp: 12, minHumidity: 85, maxHumidity: 95, maxStorageDays: 14 },
  avocados: { minTemp: 5, maxTemp: 13, minHumidity: 85, maxHumidity: 95, maxStorageDays: 21 },
  default: { minTemp: 10, maxTemp: 30, minHumidity: 50, maxHumidity: 70, maxStorageDays: 120 },
}

export type RiskLevel = 'low' | 'medium' | 'high'

export interface SpoilageAssessment {
  storageUnitId: string
  storageUnitName: string
  commodityId: string
  commodityName: string
  riskLevel: RiskLevel
  temperature: number
  humidity: number
  daysStored: number
  maxStorageDays: number
  reasons: string[]
  recommendation?: {
    marketId: string
    marketName: string
    location: string
    pricePerKg: number
    distanceKm: number
  } | null
  aiAnalysis?: AIFullAnalysis | null
}

/**
 * Normalize commodity name to a key for threshold lookup.
 * Strips common prefixes like "White", "Red", "Fresh", etc.
 */
function normalizeCommodityName(name: string): string {
  return name
    .toLowerCase()
    .replace(/^(white|red|fresh|organic|hass|green|dried)\s+/i, '')
    .replace(/\s+/g, '')
    .trim()
}

/**
 * Get thresholds for a commodity, first checking DB then defaults.
 */
async function getThreshold(commodityName: string): Promise<Threshold> {
  const normalized = normalizeCommodityName(commodityName)

  // Try DB first
  const dbThreshold = await prisma.commodityThreshold.findFirst({
    where: {
      commodityName: {
        equals: normalized,
        mode: 'insensitive',
      },
    },
  })

  if (dbThreshold) {
    return {
      minTemp: dbThreshold.minTemp,
      maxTemp: dbThreshold.maxTemp,
      minHumidity: dbThreshold.minHumidity,
      maxHumidity: dbThreshold.maxHumidity,
      maxStorageDays: dbThreshold.maxStorageDays,
    }
  }

  // Fallback to defaults
  return DEFAULT_THRESHOLDS[normalized] ?? DEFAULT_THRESHOLDS['default']
}

/**
 * Classify spoilage risk based on how far conditions deviate from safe ranges.
 */
function classifyRisk(
  temperature: number,
  humidity: number,
  daysStored: number,
  threshold: Threshold
): { riskLevel: RiskLevel; reasons: string[] } {
  const reasons: string[] = []
  let score = 0

  // Temperature checks
  if (temperature > threshold.maxTemp + 5) {
    score += 3
    reasons.push(`Temperature critically high at ${temperature.toFixed(1)}°C (safe: ${threshold.minTemp}–${threshold.maxTemp}°C)`)
  } else if (temperature > threshold.maxTemp + 2) {
    score += 2
    reasons.push(`Temperature elevated at ${temperature.toFixed(1)}°C (safe max: ${threshold.maxTemp}°C)`)
  } else if (temperature > threshold.maxTemp) {
    score += 1
    reasons.push(`Temperature slightly above safe range at ${temperature.toFixed(1)}°C (safe max: ${threshold.maxTemp}°C)`)
  } else if (temperature < threshold.minTemp - 5) {
    score += 2
    reasons.push(`Temperature critically low at ${temperature.toFixed(1)}°C (safe min: ${threshold.minTemp}°C)`)
  } else if (temperature < threshold.minTemp) {
    score += 1
    reasons.push(`Temperature below safe range at ${temperature.toFixed(1)}°C (safe min: ${threshold.minTemp}°C)`)
  }

  // Humidity checks
  if (humidity > threshold.maxHumidity + 10) {
    score += 3
    reasons.push(`Humidity critically high at ${humidity.toFixed(1)}% (safe: ${threshold.minHumidity}–${threshold.maxHumidity}%). High risk of mold growth.`)
  } else if (humidity > threshold.maxHumidity + 5) {
    score += 2
    reasons.push(`Humidity elevated at ${humidity.toFixed(1)}% (safe max: ${threshold.maxHumidity}%)`)
  } else if (humidity > threshold.maxHumidity) {
    score += 1
    reasons.push(`Humidity slightly above safe range at ${humidity.toFixed(1)}% (safe max: ${threshold.maxHumidity}%)`)
  } else if (humidity < threshold.minHumidity - 10) {
    score += 2
    reasons.push(`Humidity critically low at ${humidity.toFixed(1)}% (safe min: ${threshold.minHumidity}%)`)
  } else if (humidity < threshold.minHumidity) {
    score += 1
    reasons.push(`Humidity below safe range at ${humidity.toFixed(1)}% (safe min: ${threshold.minHumidity}%)`)
  }

  // Storage duration checks
  if (daysStored > threshold.maxStorageDays * 1.5) {
    score += 3
    reasons.push(`Stored for ${daysStored} days — far exceeds recommended ${threshold.maxStorageDays} days`)
  } else if (daysStored > threshold.maxStorageDays) {
    score += 2
    reasons.push(`Stored for ${daysStored} days — exceeds recommended ${threshold.maxStorageDays} days`)
  } else if (daysStored > threshold.maxStorageDays * 0.8) {
    score += 1
    reasons.push(`Stored for ${daysStored} days — approaching max recommended ${threshold.maxStorageDays} days`)
  }

  // Classify risk level
  let riskLevel: RiskLevel = 'low'
  if (score >= 4) riskLevel = 'high'
  else if (score >= 2) riskLevel = 'medium'

  return { riskLevel, reasons }
}

/**
 * Evaluate spoilage risk for a single storage unit.
 * Returns assessments for each commodity stored.
 */
export async function evaluateStorageUnit(storageUnitId: string): Promise<SpoilageAssessment[]> {
  const unit = await prisma.storageUnit.findUnique({
    where: { id: storageUnitId },
    include: {
      commodities: true,
      readings: { orderBy: { recordedAt: 'desc' }, take: 1 },
    },
  })

  if (!unit || unit.readings.length === 0 || unit.commodities.length === 0) {
    return []
  }

  const latestReading = unit.readings[0]
  const assessments: SpoilageAssessment[] = []

  for (const commodity of unit.commodities) {
    const threshold = await getThreshold(commodity.commodityName)
    const daysStored = Math.floor(
      (Date.now() - new Date(commodity.dateStored).getTime()) / (1000 * 60 * 60 * 24)
    )

    const { riskLevel, reasons } = classifyRisk(
      latestReading.temperature,
      latestReading.humidity,
      daysStored,
      threshold
    )

    const assessment: SpoilageAssessment = {
      storageUnitId: unit.id,
      storageUnitName: unit.name,
      commodityId: commodity.id,
      commodityName: commodity.commodityName,
      riskLevel,
      temperature: latestReading.temperature,
      humidity: latestReading.humidity,
      daysStored,
      maxStorageDays: threshold.maxStorageDays,
      reasons,
    }

    // If HIGH risk, get market recommendation
    if (riskLevel === 'high') {
      const recommendation = await getMarketRecommendation(
        normalizeCommodityName(commodity.commodityName),
        unit.latitude,
        unit.longitude,
        unit.location
      )
      assessment.recommendation = recommendation
    }

    // Run AI analysis (for any risk level) to get AI-powered insights
    try {
      const aiResult = await runFullAnalysis(unit.id, commodity.id)
      assessment.aiAnalysis = aiResult

      // If AI says high-risk but rule-based says low/medium, escalate
      if (aiResult && aiResult.spoilage.risk_level === 'high' && riskLevel !== 'high') {
        assessment.riskLevel = 'high'
        assessment.reasons.push(`AI analysis: ${aiResult.spoilage.risk_reason}`)
        // Fetch market recommendation since we escalated
        if (!assessment.recommendation) {
          const recommendation = await getMarketRecommendation(
            normalizeCommodityName(commodity.commodityName),
            unit.latitude,
            unit.longitude,
            unit.location
          )
          assessment.recommendation = recommendation
        }
      }
    } catch (aiErr) {
      console.error('[AI] Analysis failed for unit', unit.id, aiErr)
      assessment.aiAnalysis = null
    }

    assessments.push(assessment)
  }

  return assessments
}

/**
 * Evaluate all storage units for a farmer and generate alerts for HIGH risk cases.
 * Returns all assessments.
 */
export async function evaluateAllForFarmer(farmerId: string): Promise<SpoilageAssessment[]> {
  const units = await prisma.storageUnit.findMany({
    where: { farmerId },
    select: { id: true },
  })

  const allAssessments: SpoilageAssessment[] = []

  for (const unit of units) {
    const assessments = await evaluateStorageUnit(unit.id)
    allAssessments.push(...assessments)
  }

  return allAssessments
}

/**
 * Generate spoilage alerts for a storage unit after conditions change.
 * Called from the readings API when new sensor data arrives.
 */
export async function generateSpoilageAlerts(storageUnitId: string): Promise<void> {
  const assessments = await evaluateStorageUnit(storageUnitId)

  for (const assessment of assessments) {
    if (assessment.riskLevel !== 'high') continue

    // Check if a similar unread alert already exists (avoid duplicates)
    const existingAlert = await prisma.alert.findFirst({
      where: {
        storageUnitId: assessment.storageUnitId,
        commodityId: assessment.commodityId,
        alertType: 'spoilage_risk',
        isRead: false,
        timestamp: { gte: new Date(Date.now() - 6 * 60 * 60 * 1000) }, // within last 6 hours
      },
    })

    if (existingAlert) continue

    // Build alert message
    const reasonText = assessment.reasons.join('. ')
    let message = `High spoilage risk detected for ${assessment.commodityName} in ${assessment.storageUnitName}. ${reasonText}.`

    let recommendedAction: string | null = null
    let recommendedMarketId: string | null = null

    if (assessment.recommendation) {
      const rec = assessment.recommendation
      recommendedAction = `Sell immediately at ${rec.marketName} (${rec.location}) where the current price is KES ${rec.pricePerKg}/kg.`
      recommendedMarketId = rec.marketId
      message += ` We recommend selling immediately at ${rec.marketName} where the current price is KES ${rec.pricePerKg}/kg.`
    }

    await prisma.alert.create({
      data: {
        storageUnitId: assessment.storageUnitId,
        commodityId: assessment.commodityId,
        alertType: 'spoilage_risk',
        message,
        severity: 'danger',
        spoilageRisk: assessment.riskLevel,
        recommendedAction,
        recommendedMarketId,
      },
    })
  }
}
