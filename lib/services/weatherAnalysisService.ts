/**
 * Weather Analysis Service
 *
 * Analyzes weather forecast data to detect weather-related risks
 * that could affect harvested or stored produce.
 *
 * Risk rules:
 *   - rain_probability > 70% within 3 days  → heavy_rain_expected  (high)
 *   - rain_probability > 50% within 5 days  → rain_likely          (medium)
 *   - wind_speed > 15 m/s                   → strong_winds         (high)
 *   - temperature > 35°C for 3+ days        → heat_wave            (high)
 *   - humidity > 85% for 3+ days            → high_humidity_spell  (medium)
 */

import type { WeatherData, WeatherForecastDay } from './weatherService'

// ─── Types ───

export type WeatherRiskLevel = 'low' | 'medium' | 'high'
export type WeatherRiskType =
  | 'heavy_rain_expected'
  | 'rain_likely'
  | 'strong_winds'
  | 'heat_wave'
  | 'high_humidity_spell'
  | 'none'

export interface WeatherAlert {
  risk_type: WeatherRiskType
  risk_level: WeatherRiskLevel
  title: string
  message: string
  affected_days: string[]     // day names
  start_date: string          // ISO date
  severity_score: number      // 0-100
}

export interface WeatherRiskSummary {
  overall_risk: WeatherRiskLevel
  alerts: WeatherAlert[]
  safe_harvest_window: string | null  // e.g. "Monday – Tuesday" or null if none
  rain_forecast_next_3_days: number   // max probability
  rain_forecast_next_7_days: number
}

// ─── Analysis ───

/**
 * Analyze a weather forecast and return a risk summary with alerts.
 */
export function analyzeWeatherRisks(weather: WeatherData): WeatherRiskSummary {
  const { forecast } = weather
  const alerts: WeatherAlert[] = []

  if (forecast.length === 0) {
    return {
      overall_risk: 'low',
      alerts: [],
      safe_harvest_window: null,
      rain_forecast_next_3_days: 0,
      rain_forecast_next_7_days: 0,
    }
  }

  // ─── Rule 1: Heavy rain within 3 days ───
  const next3 = forecast.slice(0, 3)
  const next5 = forecast.slice(0, 5)
  const heavyRainDays3 = next3.filter((d) => d.rain_probability > 70)
  const rainLikelyDays5 = next5.filter((d) => d.rain_probability > 50)

  if (heavyRainDays3.length > 0) {
    const maxProb = Math.max(...heavyRainDays3.map((d) => d.rain_probability))
    alerts.push({
      risk_type: 'heavy_rain_expected',
      risk_level: 'high',
      title: 'Heavy Rainfall Expected',
      message: `Heavy rain (up to ${maxProb}% probability) is expected within the next 3 days. This could damage unharvested crops and increase post-harvest spoilage. Consider harvesting ready crops immediately.`,
      affected_days: heavyRainDays3.map((d) => d.day),
      start_date: heavyRainDays3[0].date,
      severity_score: Math.min(100, maxProb + 10),
    })
  } else if (rainLikelyDays5.length >= 2) {
    const maxProb = Math.max(...rainLikelyDays5.map((d) => d.rain_probability))
    alerts.push({
      risk_type: 'rain_likely',
      risk_level: 'medium',
      title: 'Rainfall Likely This Week',
      message: `Rain is likely (${maxProb}% probability) on ${rainLikelyDays5.length} of the next 5 days. Monitor stored produce humidity and plan harvesting around dry windows.`,
      affected_days: rainLikelyDays5.map((d) => d.day),
      start_date: rainLikelyDays5[0].date,
      severity_score: Math.min(80, maxProb),
    })
  }

  // ─── Rule 2: Strong winds ───
  const windyDays = forecast.filter((d) => d.wind_speed > 15)
  if (windyDays.length > 0) {
    alerts.push({
      risk_type: 'strong_winds',
      risk_level: 'high',
      title: 'Strong Winds Expected',
      message: `Wind speeds exceeding 15 m/s expected on ${windyDays.map((d) => d.day).join(', ')}. Secure stored produce and cover open drying areas.`,
      affected_days: windyDays.map((d) => d.day),
      start_date: windyDays[0].date,
      severity_score: 75,
    })
  }

  // ─── Rule 3: Heat wave ───
  const hotDays = forecast.filter((d) => d.temperature_max > 35)
  if (hotDays.length >= 3) {
    alerts.push({
      risk_type: 'heat_wave',
      risk_level: 'high',
      title: 'Heat Wave Warning',
      message: `Temperatures above 35°C expected for ${hotDays.length} consecutive days. This accelerates spoilage in stored grains. Ensure ventilation and consider selling soon.`,
      affected_days: hotDays.map((d) => d.day),
      start_date: hotDays[0].date,
      severity_score: 85,
    })
  }

  // ─── Rule 4: High humidity spell ───
  const humidDays = forecast.filter((d) => d.humidity > 85)
  if (humidDays.length >= 3) {
    alerts.push({
      risk_type: 'high_humidity_spell',
      risk_level: 'medium',
      title: 'Prolonged High Humidity',
      message: `Humidity above 85% expected for ${humidDays.length} days. This creates ideal conditions for mold growth on stored produce.`,
      affected_days: humidDays.map((d) => d.day),
      start_date: humidDays[0].date,
      severity_score: 65,
    })
  }

  // ─── Calculate stats ───
  const maxRain3 = next3.length > 0
    ? Math.max(...next3.map((d) => d.rain_probability))
    : 0
  const maxRain7 = forecast.length > 0
    ? Math.max(...forecast.map((d) => d.rain_probability))
    : 0

  // ─── Determine overall risk ───
  let overall_risk: WeatherRiskLevel = 'low'
  if (alerts.some((a) => a.risk_level === 'high')) {
    overall_risk = 'high'
  } else if (alerts.some((a) => a.risk_level === 'medium')) {
    overall_risk = 'medium'
  }

  // ─── Find safe harvest window ───
  const safeWindow = findSafeHarvestWindow(forecast)

  return {
    overall_risk,
    alerts,
    safe_harvest_window: safeWindow,
    rain_forecast_next_3_days: maxRain3,
    rain_forecast_next_7_days: maxRain7,
  }
}

/**
 * Find a consecutive window of dry days (rain_probability < 30%)
 * suitable for harvesting.
 */
function findSafeHarvestWindow(forecast: WeatherForecastDay[]): string | null {
  let windowStart: number | null = null
  let bestStart = -1
  let bestLen = 0
  let currentLen = 0

  for (let i = 0; i < forecast.length; i++) {
    if (forecast[i].rain_probability < 30) {
      if (windowStart === null) windowStart = i
      currentLen++
      if (currentLen > bestLen) {
        bestLen = currentLen
        bestStart = windowStart
      }
    } else {
      windowStart = null
      currentLen = 0
    }
  }

  if (bestLen >= 2 && bestStart >= 0) {
    const startDay = forecast[bestStart].day
    const endDay = forecast[bestStart + bestLen - 1].day
    return `${startDay} – ${endDay}`
  }

  if (bestLen === 1 && bestStart >= 0) {
    return forecast[bestStart].day
  }

  return null
}
