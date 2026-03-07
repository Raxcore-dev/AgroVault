/**
 * AI Analysis Service
 *
 * Uses the RaxAI API to analyze storage conditions and generate:
 *   1. Spoilage risk assessments (risk level, reason, recommendation)
 *   2. Smart market selling recommendations (best market, price, reason)
 *
 * This service works alongside the rule-based spoilage detection service.
 * When storage conditions change, the AI provides a natural-language analysis
 * that enriches the existing threshold-based alerts.
 *
 * File: /lib/services/aiAnalysisService.ts
 */

import { RaxAI } from 'rax-ai'
import { prisma } from '@/lib/prisma'

// ─── Types ───

export interface AIStorageInput {
  commodity: string
  temperature: number
  humidity: number
  storage_duration_days: number
  location: string
}

export interface AISpoilageResult {
  risk_level: 'low' | 'medium' | 'high'
  risk_reason: string
  recommendation: string
}

export interface AIMarketInput {
  commodity: string
  location: string
  spoilage_risk: string
  markets: Array<{
    market: string
    location: string
    commodity: string
    price_per_kg: number
  }>
}

export interface AIMarketResult {
  action: 'sell' | 'hold' | 'monitor'
  recommended_market: string
  location: string
  price_per_kg: number
  reason: string
}

export interface AIFullAnalysis {
  spoilage: AISpoilageResult
  market: AIMarketResult | null
  raw_input: AIStorageInput
}

// ─── Cache to avoid re-analyzing identical conditions ───

interface AnalysisCache {
  result: AIFullAnalysis
  timestamp: number
}

const analysisCache = new Map<string, AnalysisCache>()
const CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutes

function getCacheKey(input: AIStorageInput): string {
  return `${input.commodity}:${Math.round(input.temperature)}:${Math.round(input.humidity)}:${input.storage_duration_days}:${input.location}`
}

// ─── RaxAI Client ───

function getRaxClient(): RaxAI | null {
  const apiKey = process.env.RAX_API_KEY
  if (!apiKey || apiKey === 'your_rax_api_key_here' || apiKey === '') {
    return null
  }
  return new RaxAI({ apiKey })
}

// ─── Spoilage Risk Analysis ───

/**
 * Send storage conditions to the AI and get a spoilage risk assessment.
 */
export async function analyzeStorageSpoilage(
  input: AIStorageInput
): Promise<AISpoilageResult> {
  const rax = getRaxClient()
  if (!rax) {
    // Fallback: return a basic rule-based assessment without AI
    return fallbackSpoilageAnalysis(input)
  }

  try {
    const systemPrompt = `You are an expert agricultural storage analyst specializing in post-harvest crop management in Kenya. Analyze storage conditions and assess spoilage risk. Always respond with valid JSON only, no markdown, no code fences.`

    const userPrompt = `Analyze these storage conditions and assess the spoilage risk:

Commodity: ${input.commodity}
Temperature: ${input.temperature}°C
Humidity: ${input.humidity}%
Storage Duration: ${input.storage_duration_days} days
Location: ${input.location}

Respond with ONLY this JSON structure (no other text):
{
  "risk_level": "low" or "medium" or "high",
  "risk_reason": "Detailed explanation of why this risk level was assigned, mentioning specific conditions",
  "recommendation": "Clear actionable advice for the farmer"
}`

    const response = await rax.chat({
      model: 'rax-4.0',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    })

    const text = extractResponseText(response)
    const parsed = parseJSON<AISpoilageResult>(text)

    if (parsed && parsed.risk_level && parsed.risk_reason) {
      // Normalize risk_level
      const validLevels = ['low', 'medium', 'high'] as const
      if (!validLevels.includes(parsed.risk_level as typeof validLevels[number])) {
        parsed.risk_level = 'medium'
      }
      return parsed
    }

    return fallbackSpoilageAnalysis(input)
  } catch (error) {
    console.error('[AI] Spoilage analysis failed:', error)
    return fallbackSpoilageAnalysis(input)
  }
}

// ─── Market Recommendation Analysis ───

/**
 * Ask the AI to recommend the best market for selling a commodity.
 */
export async function analyzeMarketRecommendation(
  input: AIMarketInput
): Promise<AIMarketResult | null> {
  if (input.markets.length === 0) return null

  const rax = getRaxClient()
  if (!rax) {
    return fallbackMarketRecommendation(input)
  }

  try {
    const systemPrompt = `You are an expert agricultural market analyst for Kenya. Given a farmer's commodity at risk of spoilage and nearby market data, recommend the best market to sell at. Consider price, proximity, and urgency due to spoilage risk. Always respond with valid JSON only, no markdown, no code fences.`

    const marketsFormatted = input.markets
      .map(
        (m) =>
          `- ${m.market} (${m.location}): ${m.commodity} at KES ${m.price_per_kg}/kg`
      )
      .join('\n')

    const userPrompt = `A farmer in ${input.location} has ${input.commodity} at ${input.spoilage_risk} spoilage risk.

Available markets:
${marketsFormatted}

Based on price, distance from ${input.location}, and spoilage urgency, recommend the best market.

Respond with ONLY this JSON structure (no other text):
{
  "action": "sell" or "hold" or "monitor",
  "recommended_market": "Market name",
  "location": "Market location",
  "price_per_kg": number,
  "reason": "Clear explanation of why this market is recommended"
}`

    const response = await rax.chat({
      model: 'rax-4.0',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    })

    const text = extractResponseText(response)
    const parsed = parseJSON<AIMarketResult>(text)

    if (parsed && parsed.recommended_market && parsed.reason) {
      return parsed
    }

    return fallbackMarketRecommendation(input)
  } catch (error) {
    console.error('[AI] Market recommendation failed:', error)
    return fallbackMarketRecommendation(input)
  }
}

// ─── Full Analysis Pipeline ───

/**
 * Run the complete AI analysis pipeline for a storage unit:
 *   1. Analyze spoilage risk
 *   2. If risk is high, fetch nearby markets and get AI market recommendation
 *   3. If risk is high, create an alert in the database
 *
 * Returns the combined AI analysis result.
 */
export async function runFullAnalysis(
  storageUnitId: string,
  commodityId: string
): Promise<AIFullAnalysis | null> {
  // Fetch the storage unit with latest reading and commodity
  const unit = await prisma.storageUnit.findUnique({
    where: { id: storageUnitId },
    include: {
      readings: { orderBy: { recordedAt: 'desc' }, take: 1 },
      commodities: { where: { id: commodityId } },
    },
  })

  if (!unit || unit.readings.length === 0 || unit.commodities.length === 0) {
    return null
  }

  const reading = unit.readings[0]
  const commodity = unit.commodities[0]

  const daysStored = Math.floor(
    (Date.now() - new Date(commodity.dateStored).getTime()) / (1000 * 60 * 60 * 24)
  )

  const normalizedName = commodity.commodityName
    .toLowerCase()
    .replace(/^(white|red|fresh|organic|hass|green|dried)\s+/i, '')
    .trim()

  const input: AIStorageInput = {
    commodity: normalizedName,
    temperature: reading.temperature,
    humidity: reading.humidity,
    storage_duration_days: daysStored,
    location: unit.location,
  }

  // Check cache
  const cacheKey = getCacheKey(input)
  const cached = analysisCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.result
  }

  // Step 1: Spoilage analysis
  const spoilage = await analyzeStorageSpoilage(input)

  // Step 2: Market recommendation (only if risk is high)
  let market: AIMarketResult | null = null
  if (spoilage.risk_level === 'high') {
    const nearbyMarkets = await prisma.market.findMany({
      where: {
        commodity: { equals: normalizedName, mode: 'insensitive' },
      },
    })

    if (nearbyMarkets.length > 0) {
      market = await analyzeMarketRecommendation({
        commodity: normalizedName,
        location: unit.location,
        spoilage_risk: spoilage.risk_level,
        markets: nearbyMarkets.map((m) => ({
          market: m.marketName,
          location: m.location,
          commodity: m.commodity,
          price_per_kg: m.pricePerKg,
        })),
      })
    }

    // Step 3: Create alert in the database
    await createAIAlert(unit, commodity, reading, spoilage, market)
  }

  const result: AIFullAnalysis = {
    spoilage,
    market,
    raw_input: input,
  }

  // Cache result
  analysisCache.set(cacheKey, { result, timestamp: Date.now() })

  return result
}

/**
 * Run AI analysis for all commodities in a storage unit.
 */
export async function analyzeStorageUnit(
  storageUnitId: string
): Promise<AIFullAnalysis[]> {
  const unit = await prisma.storageUnit.findUnique({
    where: { id: storageUnitId },
    include: { commodities: true },
  })

  if (!unit) return []

  const results: AIFullAnalysis[] = []

  for (const commodity of unit.commodities) {
    const result = await runFullAnalysis(storageUnitId, commodity.id)
    if (result) results.push(result)
  }

  return results
}

/**
 * Run AI analysis for all storage units belonging to a farmer.
 */
export async function analyzeAllForFarmer(
  farmerId: string
): Promise<AIFullAnalysis[]> {
  const units = await prisma.storageUnit.findMany({
    where: { farmerId },
    include: { commodities: true },
  })

  const results: AIFullAnalysis[] = []

  for (const unit of units) {
    for (const commodity of unit.commodities) {
      const result = await runFullAnalysis(unit.id, commodity.id)
      if (result) results.push(result)
    }
  }

  return results
}

// ─── Alert Creation ───

/**
 * Create a database alert when the AI detects high spoilage risk.
 * Avoids duplicates by checking for recent unread AI alerts.
 */
async function createAIAlert(
  unit: { id: string; name: string },
  commodity: { id: string; commodityName: string },
  reading: { temperature: number; humidity: number },
  spoilage: AISpoilageResult,
  market: AIMarketResult | null
): Promise<void> {
  // Check for existing recent AI alert to avoid duplicates
  const existingAlert = await prisma.alert.findFirst({
    where: {
      storageUnitId: unit.id,
      commodityId: commodity.id,
      alertType: 'ai_spoilage_risk',
      isRead: false,
      timestamp: { gte: new Date(Date.now() - 6 * 60 * 60 * 1000) },
    },
  })

  if (existingAlert) return

  // Build alert message
  let message = `High ${spoilage.risk_reason.toLowerCase().includes('mold') ? 'mold growth' : 'spoilage'} risk detected in ${unit.name} due to high temperature (${reading.temperature.toFixed(1)}°C) and humidity (${reading.humidity.toFixed(1)}%).`

  let recommendedAction: string | null = null
  let recommendedMarketId: string | null = null

  if (market && market.action === 'sell') {
    recommendedAction = `Sell immediately at ${market.recommended_market} (${market.location}) where the current price is KES ${market.price_per_kg}/kg. ${market.reason}`

    // Find market ID
    const marketRecord = await prisma.market.findFirst({
      where: {
        marketName: { equals: market.recommended_market, mode: 'insensitive' },
      },
    })
    if (marketRecord) {
      recommendedMarketId = marketRecord.id
    }
  }

  await prisma.alert.create({
    data: {
      storageUnitId: unit.id,
      commodityId: commodity.id,
      alertType: 'ai_spoilage_risk',
      message,
      severity: 'danger',
      spoilageRisk: spoilage.risk_level,
      recommendedAction,
      recommendedMarketId,
    },
  })
}

// ─── Helpers ───

/**
 * Extract text from various RaxAI response formats.
 */
function extractResponseText(response: unknown): string {
  const r = response as Record<string, unknown>

  // Standard OpenAI-style
  if (
    r.choices &&
    Array.isArray(r.choices) &&
    r.choices[0] &&
    (r.choices[0] as Record<string, unknown>).message
  ) {
    const msg = (r.choices[0] as Record<string, unknown>).message as Record<string, unknown>
    if (typeof msg.content === 'string') return msg.content
  }

  if (typeof r.content === 'string') return r.content
  if (typeof r.text === 'string') return r.text
  if (typeof r.message === 'string') return r.message

  return JSON.stringify(response)
}

/**
 * Safely parse JSON from AI response text, handling markdown fences.
 */
function parseJSON<T>(text: string): T | null {
  try {
    // Strip markdown code fences if present
    let cleaned = text.trim()
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

// ─── Fallback Analyses (when AI is unavailable) ───

function fallbackSpoilageAnalysis(input: AIStorageInput): AISpoilageResult {
  let risk_level: 'low' | 'medium' | 'high' = 'low'
  const issues: string[] = []

  if (input.temperature > 32) {
    issues.push(`high temperature (${input.temperature}°C)`)
  } else if (input.temperature > 28) {
    issues.push(`elevated temperature (${input.temperature}°C)`)
  }

  if (input.humidity > 75) {
    issues.push(`high humidity (${input.humidity}%)`)
  } else if (input.humidity > 70) {
    issues.push(`elevated humidity (${input.humidity}%)`)
  }

  if (input.storage_duration_days > 120) {
    issues.push(`extended storage duration (${input.storage_duration_days} days)`)
  }

  if (issues.length >= 2 && (input.temperature > 32 || input.humidity > 75)) {
    risk_level = 'high'
  } else if (issues.length >= 1) {
    risk_level = 'medium'
  }

  const risk_reason =
    issues.length > 0
      ? `${issues.join(' and ')} increase spoilage risk for ${input.commodity}.`
      : `Storage conditions for ${input.commodity} are within safe ranges.`

  const recommendation =
    risk_level === 'high'
      ? 'Sell quickly to avoid spoilage.'
      : risk_level === 'medium'
        ? 'Monitor conditions closely and consider selling soon.'
        : 'Continue monitoring. Conditions are safe.'

  return { risk_level, risk_reason, recommendation }
}

function fallbackMarketRecommendation(input: AIMarketInput): AIMarketResult | null {
  if (input.markets.length === 0) return null

  // Pick the market with the highest price
  const best = input.markets.sort((a, b) => b.price_per_kg - a.price_per_kg)[0]

  return {
    action: input.spoilage_risk === 'high' ? 'sell' : 'monitor',
    recommended_market: best.market,
    location: best.location,
    price_per_kg: best.price_per_kg,
    reason: `Highest price and closest market, recommended due to ${input.spoilage_risk} spoilage risk.`,
  }
}

/**
 * Clear the analysis cache.
 */
export function clearAnalysisCache(): void {
  analysisCache.clear()
}
