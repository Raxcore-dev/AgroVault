/**
 * AI-Powered Humidity Recommendation Engine
 * 
 * Analyzes humidity levels and provides intelligent recommendations
 * based on storage conditions, crop type, and risk level.
 */

export type HumidityStatus = 'safe' | 'moderate' | 'high'

export interface HumidityAnalysis {
  status: HumidityStatus
  risk_level: string
  recommendations: string[]
  immediate_actions: string[]
  preventive_measures: string[]
  ai_insight: string
}

// ─── Humidity Thresholds ──────────────────────────────────────────────────────

const HUMIDITY_THRESHOLDS = {
  SAFE_MIN: 40,
  SAFE_MAX: 65,
  MODERATE_MAX: 75,
  HIGH_THRESHOLD: 75,
} as const

// ─── Crop-Specific Humidity Tolerances ───────────────────────────────────────

const CROP_HUMIDITY_PROFILES: Record<string, { max_safe: number; critical: number }> = {
  maize: { max_safe: 65, critical: 75 },
  wheat: { max_safe: 60, critical: 70 },
  beans: { max_safe: 65, critical: 75 },
  rice: { max_safe: 70, critical: 80 },
  coffee: { max_safe: 62, critical: 72 },
  tea: { max_safe: 60, critical: 70 },
  sorghum: { max_safe: 65, critical: 75 },
  millet: { max_safe: 65, critical: 75 },
  default: { max_safe: 65, critical: 75 },
}

// ─── Status Classification ────────────────────────────────────────────────────

export function classifyHumidityStatus(humidity: number): HumidityStatus {
  if (humidity <= HUMIDITY_THRESHOLDS.SAFE_MAX) return 'safe'
  if (humidity <= HUMIDITY_THRESHOLDS.MODERATE_MAX) return 'moderate'
  return 'high'
}

// ─── AI Recommendation Engine ─────────────────────────────────────────────────

export function generateHumidityRecommendations(
  humidity: number,
  temperature: number,
  cropType?: string,
  storageDuration?: number,
): HumidityAnalysis {
  const status = classifyHumidityStatus(humidity)
  const crop = cropType?.toLowerCase() || 'default'
  const profile = CROP_HUMIDITY_PROFILES[crop] || CROP_HUMIDITY_PROFILES.default

  // High Risk (>75%)
  if (status === 'high') {
    return {
      status: 'high',
      risk_level: '🔴 High Risk',
      recommendations: [
        'Open ventilation systems immediately to improve airflow',
        'Dry the stored produce using mechanical dryers or sun drying',
        'Inspect for visible mold growth and contamination',
        'Reduce moisture by using dehumidifiers or drying equipment',
        'Consider emergency sale to prevent total loss',
        'Separate affected batches from healthy stock',
      ],
      immediate_actions: [
        '⚠️ URGENT: Open all vents and doors for maximum airflow',
        '⚠️ Turn on fans or ventilation systems',
        '⚠️ Check for water leaks or condensation sources',
        '⚠️ Remove any wet or damp produce immediately',
      ],
      preventive_measures: [
        'Install humidity monitoring sensors',
        'Implement automated ventilation controls',
        'Schedule regular moisture content testing',
        'Maintain proper spacing between storage bags/containers',
      ],
      ai_insight: generateAIInsight(humidity, temperature, crop, storageDuration, 'high'),
    }
  }

  // Moderate Risk (66-75%)
  if (status === 'moderate') {
    return {
      status: 'moderate',
      risk_level: '🟡 Moderate Risk',
      recommendations: [
        'Monitor humidity levels closely every 2-4 hours',
        'Increase airflow by opening vents partially',
        'Prepare drying measures in case levels rise',
        'Check storage unit for air circulation blockages',
        'Reduce new stock intake until conditions stabilize',
      ],
      immediate_actions: [
        '⚡ Increase ventilation gradually',
        '⚡ Monitor temperature to prevent condensation',
        '⚡ Inspect produce for early signs of moisture damage',
        '⚡ Document humidity trends for pattern analysis',
      ],
      preventive_measures: [
        'Schedule preventive maintenance for ventilation systems',
        'Consider installing exhaust fans',
        'Review storage unit insulation and sealing',
        'Plan for seasonal humidity variations',
      ],
      ai_insight: generateAIInsight(humidity, temperature, crop, storageDuration, 'moderate'),
    }
  }

  // Safe (40-65%)
  return {
    status: 'safe',
    risk_level: '🟢 Safe',
    recommendations: [
      'Continue current storage practices',
      'Maintain regular monitoring schedule',
      'Keep ventilation systems functional',
      'Document optimal conditions for future reference',
    ],
    immediate_actions: [],
    preventive_measures: [
      'Conduct weekly humidity checks',
      'Service ventilation equipment quarterly',
      'Train staff on humidity management',
      'Keep emergency drying equipment ready',
    ],
    ai_insight: generateAIInsight(humidity, temperature, crop, storageDuration, 'safe'),
  }
}

// ─── AI Insight Generator ─────────────────────────────────────────────────────

function generateAIInsight(
  humidity: number,
  temperature: number,
  crop: string,
  storageDuration: number | undefined,
  status: HumidityStatus,
): string {
  const profile = CROP_HUMIDITY_PROFILES[crop] || CROP_HUMIDITY_PROFILES.default
  const durationText = storageDuration ? ` after ${storageDuration} days of storage` : ''

  // High Risk Insights
  if (status === 'high') {
    const moldRisk = humidity > 80 ? 'extremely high' : 'high'
    const aflatoxinWarning = ['maize', 'beans', 'wheat'].includes(crop)
      ? ' Aflatoxin contamination risk is critical for this crop.'
      : ''

    if (temperature > 30) {
      return `Critical conditions detected${durationText}. Humidity at ${humidity.toFixed(1)}% combined with temperature of ${temperature.toFixed(1)}°C creates ${moldRisk} mold growth risk.${aflatoxinWarning} Immediate drying is essential to prevent total crop loss. Consider emergency market sale if drying is not possible within 24 hours.`
    }

    return `High humidity detected for ${crop} storage${durationText}. At ${humidity.toFixed(1)}%, mold growth risk is ${moldRisk}.${aflatoxinWarning} Immediate action required to reduce moisture levels below ${profile.max_safe}% to prevent spoilage and maintain market value.`
  }

  // Moderate Risk Insights
  if (status === 'moderate') {
    const timeframe = humidity > 70 ? '12-24 hours' : '24-48 hours'
    return `Humidity levels at ${humidity.toFixed(1)}% are approaching critical thresholds for ${crop}${durationText}. Current conditions may lead to quality degradation within ${timeframe}. Proactive ventilation and monitoring will prevent escalation to high-risk status. Target humidity: ${profile.max_safe}% or below.`
  }

  // Safe Insights
  const qualityNote = humidity < 50 ? ' Excellent conditions for long-term storage.' : ' Conditions are within optimal range.'
  return `Storage conditions are optimal for ${crop}${durationText}. Humidity at ${humidity.toFixed(1)}% and temperature at ${temperature.toFixed(1)}°C are well within safe parameters.${qualityNote} Continue current practices to maintain crop quality and market value.`
}

// ─── Risk Score Calculator ────────────────────────────────────────────────────

export function calculateHumidityRiskScore(
  humidity: number,
  temperature: number,
  storageDuration?: number,
): number {
  let score = 0

  // Humidity contribution (0-50 points)
  if (humidity > 85) score += 50
  else if (humidity > 75) score += 40
  else if (humidity > 65) score += 25
  else if (humidity > 55) score += 10
  else score += 0

  // Temperature contribution (0-30 points)
  if (temperature > 35) score += 30
  else if (temperature > 30) score += 20
  else if (temperature > 25) score += 10
  else score += 0

  // Storage duration contribution (0-20 points)
  if (storageDuration) {
    if (storageDuration > 90) score += 20
    else if (storageDuration > 60) score += 15
    else if (storageDuration > 30) score += 10
    else score += 5
  }

  return Math.min(score, 100)
}

// ─── Alert Priority ───────────────────────────────────────────────────────────

export function getAlertPriority(status: HumidityStatus, riskScore: number): 'low' | 'medium' | 'high' | 'critical' {
  if (status === 'high' && riskScore >= 70) return 'critical'
  if (status === 'high') return 'high'
  if (status === 'moderate' && riskScore >= 50) return 'high'
  if (status === 'moderate') return 'medium'
  return 'low'
}
