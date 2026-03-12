/**
 * Travel Advisory Service
 *
 * Analyzes weather conditions at a destination market location and provides
 * travel recommendations for farmers transporting produce.
 *
 * Risk classification:
 *   Safe        → clear sky / light clouds / rain probability ≤ 30%
 *   Moderate    → moderate rain / high humidity / strong winds
 *   High Risk   → heavy rain / storm / flood risk / rain probability ≥ 70%
 */

import { getWeatherForecast, type WeatherData, type WeatherForecastDay } from './weatherService'
import { getMarketInsightsForFarmer, type MarketInsight } from './marketInsightsService'

// ─── Types ────────────────────────────────────────────────────────────────────

export type TravelRiskLevel = 'safe' | 'moderate' | 'high'

export interface TravelForecastSummary {
  /** Max rain probability across the next 24 h (day 0) */
  rain_probability_24h: number
  /** Max rain probability across the next 48 h (days 0–1) */
  rain_probability_48h: number
  rainfall_mm_24h: number
  wind_speed: number         // m/s – worst within 48 h
  temperature: number        // °C current
  humidity: number           // % current
  description: string        // e.g. "heavy rain"
  forecast_days: WeatherForecastDay[]
}

export interface TravelRecommendation {
  risk_level: TravelRiskLevel
  title: string
  message: string
  /** Short actionable instruction shown prominently */
  action: string
  /** Emoji indicator */
  icon: string
}

export interface MarketTravelAdvisory {
  market_location: string
  farmer_location: string
  weather: TravelForecastSummary
  recommendation: TravelRecommendation
  /** If market insight is available, combine price + weather */
  combined_insight: CombinedInsight | null
  fetched_at: string
}

export interface CombinedInsight {
  commodity: string
  price_per_kg: number
  price_trend: string
  demand_level: string
  market_name: string
  weather_summary: string
  final_recommendation: string
}

// ─── Risk classification ──────────────────────────────────────────────────────

function classifyRisk(forecast: TravelForecastSummary): TravelRiskLevel {
  const { rain_probability_24h, rainfall_mm_24h, wind_speed, description } = forecast

  const desc = description.toLowerCase()
  const isHeavy =
    desc.includes('heavy rain') ||
    desc.includes('thunderstorm') ||
    desc.includes('storm') ||
    desc.includes('hail')

  if (
    isHeavy ||
    rain_probability_24h >= 70 ||
    rainfall_mm_24h >= 20 ||
    wind_speed >= 15
  ) {
    return 'high'
  }

  const isModerate =
    desc.includes('moderate rain') ||
    desc.includes('rain showers') ||
    desc.includes('drizzle') ||
    desc.includes('overcast')

  if (
    isModerate ||
    (rain_probability_24h >= 40 && rain_probability_24h < 70) ||
    (rainfall_mm_24h >= 5 && rainfall_mm_24h < 20) ||
    (wind_speed >= 8 && wind_speed < 15) ||
    forecast.humidity >= 80
  ) {
    return 'moderate'
  }

  return 'safe'
}

// ─── Recommendation builder ───────────────────────────────────────────────────

function buildRecommendation(
  risk: TravelRiskLevel,
  location: string,
  forecast: TravelForecastSummary,
): TravelRecommendation {
  const { rain_probability_24h, description } = forecast

  switch (risk) {
    case 'safe':
      return {
        risk_level: 'safe',
        title: 'Safe Travel Conditions',
        message: `Weather conditions are favorable for transporting your produce to ${location}. Clear skies and low rainfall probability (${rain_probability_24h}%) make this a good time to travel.`,
        action: 'You can safely transport your produce to the market.',
        icon: '✅',
      }

    case 'moderate':
      return {
        risk_level: 'moderate',
        title: 'Moderate Weather Warning',
        message: `Light to moderate rainfall is expected in ${location} within the next 24 hours (${rain_probability_24h}% probability). Road conditions may be slightly affected.`,
        action: 'Ensure your produce is well covered and protected during transportation. Travel is possible but exercise caution.',
        icon: '⚠️',
      }

    case 'high':
      return {
        risk_level: 'high',
        title: 'High Risk — Travel Not Recommended',
        message: `Heavy rainfall is expected in ${location} within the next 24 hours (${rain_probability_24h}% probability, ${description}). This may damage your crops and make roads impassable.`,
        action: 'Delay transporting your produce until weather conditions improve. Monitor the forecast and plan travel for a dry window.',
        icon: '🚨',
      }
  }
}

// ─── Combined price + weather insight ────────────────────────────────────────

function buildCombinedInsight(
  insight: MarketInsight,
  risk: TravelRiskLevel,
  forecast: TravelForecastSummary,
): CombinedInsight {
  const weatherSummary =
    risk === 'safe'
      ? `Clear weather expected (${forecast.rain_probability_24h}% rain probability).`
      : risk === 'moderate'
      ? `Light rain expected (${forecast.rain_probability_24h}% rain probability).`
      : `Heavy rain expected (${forecast.rain_probability_24h}% rain probability, ${forecast.description}).`

  let finalRec: string

  if (risk === 'safe') {
    if (insight.priceTrend === 'increasing' && insight.demandLevel === 'high') {
      finalRec = `Market price for ${insight.commodityName} in ${insight.marketLocation} is KES ${insight.pricePerKg.toFixed(0)}/kg and rising. Weather is clear — ideal conditions to transport and sell now.`
    } else if (insight.priceTrend === 'decreasing') {
      finalRec = `Market price for ${insight.commodityName} is declining (KES ${insight.pricePerKg.toFixed(0)}/kg). Weather is clear — transport soon before prices drop further.`
    } else {
      finalRec = `Market price for ${insight.commodityName} in ${insight.marketLocation} is KES ${insight.pricePerKg.toFixed(0)}/kg. Weather is favorable — good time to transport your produce.`
    }
  } else if (risk === 'moderate') {
    if (insight.priceTrend === 'increasing' && insight.demandLevel === 'high') {
      finalRec = `Market price for ${insight.commodityName} is KES ${insight.pricePerKg.toFixed(0)}/kg and demand is high. Light rain is expected — ensure produce is well protected while transporting.`
    } else {
      finalRec = `Market price for ${insight.commodityName} is KES ${insight.pricePerKg.toFixed(0)}/kg. Light rainfall is expected in ${insight.marketLocation}. Protect your produce if travelling.`
    }
  } else {
    if (insight.hasSpoilageRisk) {
      finalRec = `Your ${insight.commodityName} has a high spoilage risk (KES ${insight.pricePerKg.toFixed(0)}/kg at ${insight.marketName}). Although heavy rain is expected, consider partial transport with full protection to avoid total loss.`
    } else if (insight.priceTrend === 'increasing') {
      finalRec = `Although the price for ${insight.commodityName} is favorable (KES ${insight.pricePerKg.toFixed(0)}/kg and rising), heavy rain is expected in ${insight.marketLocation}. Consider delaying transport until weather conditions improve.`
    } else {
      finalRec = `Heavy rain is expected in ${insight.marketLocation}. It is recommended to delay transporting your ${insight.commodityName} until weather conditions improve to avoid crop damage and road hazards.`
    }
  }

  return {
    commodity: insight.commodityName,
    price_per_kg: insight.pricePerKg,
    price_trend: insight.priceTrend,
    demand_level: insight.demandLevel,
    market_name: insight.marketName,
    weather_summary: weatherSummary,
    final_recommendation: finalRec,
  }
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Generate a complete Market Travel Advisory for a farmer heading to a
 * specific market/destination location.
 *
 * @param marketLocation  - e.g. "Kibuye Market, Kisumu" or "Kisumu"
 * @param farmerLocation  - farmer's current location (optional, for context)
 * @param userId          - farmer user ID (used to fetch market insights; optional)
 */
export async function getMarketTravelAdvisory(
  marketLocation: string,
  farmerLocation: string,
  userId?: string,
): Promise<MarketTravelAdvisory> {
  const weather = await getWeatherForecast(marketLocation)
  const forecast = summariseForecast(weather)
  const risk = classifyRisk(forecast)
  const recommendation = buildRecommendation(risk, marketLocation, forecast)

  let combined: CombinedInsight | null = null

  if (userId) {
    try {
      const { insights } = await getMarketInsightsForFarmer(userId)
      // Match insight whose market location is closest to the destination
      const match = insights.find(
        (i) =>
          i.marketLocation.toLowerCase().includes(marketLocation.toLowerCase().split(',')[0].trim()) ||
          marketLocation.toLowerCase().includes(i.marketLocation.toLowerCase().split(' ')[0].trim()),
      ) ?? insights[0] ?? null

      if (match) {
        combined = buildCombinedInsight(match, risk, forecast)
      }
    } catch {
      // market insights are optional — don't fail the advisory
    }
  }

  return {
    market_location: marketLocation,
    farmer_location: farmerLocation,
    weather: forecast,
    recommendation,
    combined_insight: combined,
    fetched_at: new Date().toISOString(),
  }
}

// ─── Forecast summariser ──────────────────────────────────────────────────────

function summariseForecast(weather: WeatherData): TravelForecastSummary {
  const next48 = weather.forecast.slice(0, 2)
  const next24 = weather.forecast.slice(0, 1)

  const rainProb24 = next24.length
    ? Math.max(...next24.map((d) => d.rain_probability))
    : weather.current.humidity > 80 ? 60 : 10

  const rainProb48 = next48.length
    ? Math.max(...next48.map((d) => d.rain_probability))
    : rainProb24

  const rainfallMm24 = next24.length
    ? next24.reduce((s, d) => s + d.rainfall_mm, 0)
    : 0

  const worstWind = next48.length
    ? Math.max(...next48.map((d) => d.wind_speed))
    : weather.current.wind_speed

  return {
    rain_probability_24h: rainProb24,
    rain_probability_48h: rainProb48,
    rainfall_mm_24h: rainfallMm24,
    wind_speed: worstWind,
    temperature: weather.current.temperature,
    humidity: weather.current.humidity,
    description: next24[0]?.description ?? weather.current.description,
    forecast_days: weather.forecast.slice(0, 3),
  }
}

// ─── Known Kenyan markets/locations for autocomplete ─────────────────────────

export const KENYAN_MARKET_LOCATIONS = [
  // ── All 47 counties ──────────────────────────────────────────────────────
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu',
  'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho',
  'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui',
  'Kwale', 'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera',
  'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Murang\'a', 'Nairobi',
  'Nakuru', 'Nandi', 'Narok', 'Nyandarua', 'Nyamira', 'Nyeri',
  'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi',
  'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot',
  // ── Major named markets ──────────────────────────────────────────────────
  'Kibuye Market, Kisumu',
  'Kongowea Market, Mombasa',
  'Wakulima Market, Nairobi',
  'Marikiti Market, Mombasa',
  'Karatina Market, Nyeri',
  'Eldoret Municipal Market',
  'Nakuru Municipal Market',
  'Githurai Market, Nairobi',
  'Kawangware Market, Nairobi',
  'Kitale Market, Trans Nzoia',
  'Kisii Municipal Market',
  'Meru Municipal Market',
  'Embu Municipal Market',
  'Garissa County Market',
]
