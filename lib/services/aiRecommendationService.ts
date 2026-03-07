/**
 * AI Harvest Recommendation Service
 *
 * Sends weather forecast + crop data to the RaxAI API and returns
 * actionable harvest recommendations for farmers.
 *
 * Falls back to rule-based logic when the AI is unavailable.
 */

import { RaxAI } from 'rax-ai'
import type { WeatherData } from './weatherService'
import type { WeatherRiskSummary } from './weatherAnalysisService'

// ─── Types ───

export interface HarvestInput {
  crop: string
  location: string
  harvest_ready: boolean
  weather_summary: string        // human-readable forecast summary
  rain_probability_3d: number
  rain_probability_7d: number
  temperature: number
  humidity: number
}

export type HarvestAction = 'harvest_early' | 'harvest_now' | 'delay_harvest' | 'monitor'

export interface HarvestRecommendation {
  action: HarvestAction
  recommendation: string
  message: string
  urgency: 'low' | 'medium' | 'high'
  best_harvest_window: string | null
}

export interface WeatherHarvestAnalysis {
  location: string
  crop: string
  recommendation: HarvestRecommendation
  weather_risk: string
  generated_at: string
}

// ─── Cache ───

interface RecCache {
  result: HarvestRecommendation
  timestamp: number
}

const recCache = new Map<string, RecCache>()
const CACHE_TTL = 15 * 60 * 1000 // 15 min

// ─── RaxAI Client ───

function getRaxClient(): RaxAI | null {
  const apiKey = process.env.RAX_API_KEY
  if (!apiKey || apiKey === '' || apiKey === 'your_rax_api_key_here') return null
  return new RaxAI({ apiKey })
}

// ─── AI Analysis ───

export async function getAIHarvestRecommendation(
  input: HarvestInput
): Promise<HarvestRecommendation> {
  const key = `${input.crop}:${input.location}:${input.rain_probability_3d}:${input.harvest_ready}`
  const cached = recCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result
  }

  const rax = getRaxClient()
  if (!rax) return fallbackRecommendation(input)

  try {
    const systemPrompt = `You are an expert agricultural advisor specializing in post-harvest management in Kenya. Given weather forecast data and crop information, provide harvest timing recommendations to minimize crop losses. Always respond with valid JSON only, no markdown, no code fences.`

    const userPrompt = `A farmer in ${input.location} needs harvest advice:

Crop: ${input.crop}
Harvest ready: ${input.harvest_ready ? 'Yes' : 'No'}
Current temperature: ${input.temperature}°C
Current humidity: ${input.humidity}%
Rain probability (next 3 days): ${input.rain_probability_3d}%
Rain probability (next 7 days): ${input.rain_probability_7d}%
Weather summary: ${input.weather_summary}

Respond with ONLY this JSON structure (no other text):
{
  "action": "harvest_early" or "harvest_now" or "delay_harvest" or "monitor",
  "recommendation": "Short one-line recommendation title",
  "message": "Detailed 2-3 sentence advice for the farmer explaining the reasoning and what they should do",
  "urgency": "low" or "medium" or "high",
  "best_harvest_window": "e.g. Monday – Wednesday or null if not applicable"
}`

    const response = await rax.chat({
      model: 'rax-4.0',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    })

    const text = extractResponseText(response)
    const parsed = parseJSON<HarvestRecommendation>(text)

    if (parsed && parsed.action && parsed.message) {
      const validActions: HarvestAction[] = ['harvest_early', 'harvest_now', 'delay_harvest', 'monitor']
      if (!validActions.includes(parsed.action)) parsed.action = 'monitor'

      recCache.set(key, { result: parsed, timestamp: Date.now() })
      return parsed
    }

    return fallbackRecommendation(input)
  } catch (err) {
    console.error('[AI] Harvest recommendation failed:', err)
    return fallbackRecommendation(input)
  }
}

/**
 * Build a complete harvest analysis combining weather data + AI.
 */
export async function analyzeHarvestTiming(
  weather: WeatherData,
  riskSummary: WeatherRiskSummary,
  crops: Array<{ name: string; harvestReady: boolean }>
): Promise<WeatherHarvestAnalysis[]> {
  const results: WeatherHarvestAnalysis[] = []

  // Build a human-readable weather summary
  const highRainDays = weather.forecast
    .filter((d) => d.rain_probability > 60)
    .map((d) => d.day)
  const weatherSummary = highRainDays.length > 0
    ? `Heavy rain expected on ${highRainDays.join(', ')}. ${riskSummary.safe_harvest_window ? `Best dry window: ${riskSummary.safe_harvest_window}.` : 'No extended dry window found.'}`
    : `Mostly dry conditions expected. ${riskSummary.safe_harvest_window ? `Safe harvest window: ${riskSummary.safe_harvest_window}.` : ''}`

  for (const crop of crops) {
    const input: HarvestInput = {
      crop: crop.name,
      location: weather.location,
      harvest_ready: crop.harvestReady,
      weather_summary: weatherSummary,
      rain_probability_3d: riskSummary.rain_forecast_next_3_days,
      rain_probability_7d: riskSummary.rain_forecast_next_7_days,
      temperature: weather.current.temperature,
      humidity: weather.current.humidity,
    }

    const recommendation = await getAIHarvestRecommendation(input)

    results.push({
      location: weather.location,
      crop: crop.name,
      recommendation,
      weather_risk: riskSummary.overall_risk,
      generated_at: new Date().toISOString(),
    })
  }

  return results
}

// ─── Helpers ───

function extractResponseText(response: unknown): string {
  const r = response as Record<string, unknown>
  if (
    r.choices && Array.isArray(r.choices) && r.choices[0] &&
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
      try { return JSON.parse(match[0]) as T } catch { return null }
    }
    return null
  }
}

// ─── Fallback ───

function fallbackRecommendation(input: HarvestInput): HarvestRecommendation {
  if (input.rain_probability_3d > 70 && input.harvest_ready) {
    return {
      action: 'harvest_early',
      recommendation: 'Harvest early to avoid rain damage',
      message: `Heavy rains are expected within the next 3 days (${input.rain_probability_3d}% probability) in ${input.location}. Since your ${input.crop} is ready for harvest, harvest immediately to prevent spoilage and quality loss from excess moisture.`,
      urgency: 'high',
      best_harvest_window: 'Today – Tomorrow',
    }
  }

  if (input.rain_probability_3d > 70 && !input.harvest_ready) {
    return {
      action: 'monitor',
      recommendation: 'Rain expected – prepare for harvest soon',
      message: `Heavy rains approaching ${input.location} in the next 3 days. Your ${input.crop} is not yet ready for harvest. Monitor crop maturity closely and prepare to harvest as soon as it is ready to minimize rain exposure.`,
      urgency: 'medium',
      best_harvest_window: null,
    }
  }

  if (input.rain_probability_7d > 50 && input.harvest_ready) {
    return {
      action: 'harvest_now',
      recommendation: 'Harvest within the next few days',
      message: `Rain is likely later this week (${input.rain_probability_7d}% probability). If your ${input.crop} is mature, plan to harvest in the next 1-2 days for best results. Ensure drying and storage facilities are ready.`,
      urgency: 'medium',
      best_harvest_window: 'Next 1-2 days',
    }
  }

  if (input.harvest_ready) {
    return {
      action: 'harvest_now',
      recommendation: 'Good conditions for harvesting',
      message: `Weather conditions in ${input.location} look favorable for harvesting ${input.crop}. Proceed with harvest at your convenience. Conditions are dry with low rain probability.`,
      urgency: 'low',
      best_harvest_window: 'This week',
    }
  }

  return {
    action: 'monitor',
    recommendation: 'Continue monitoring crop maturity',
    message: `Current weather in ${input.location} is stable. Continue monitoring your ${input.crop} for harvest readiness. No immediate weather threats detected.`,
    urgency: 'low',
    best_harvest_window: null,
  }
}
