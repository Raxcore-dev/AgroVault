/**
 * Post-Harvest Spoilage Prediction Service
 * 
 * Analyzes storage conditions and predicts potential crop loss.
 * Provides risk assessment, spoilage percentage estimates, and economic loss calculations.
 */

export interface SpoilageRiskLevel {
  level: 'safe' | 'moderate' | 'high'
  color: 'green' | 'orange' | 'red'
  label: string
}

export interface SpoilagePrediction {
  storageUnitId: string
  storageUnitName: string
  commodityId: string
  commodityName: string
  quantityStored: number
  unit: string
  dateStored: Date
  
  // Current conditions
  currentTemperature: number
  currentHumidity: number
  
  // Risk assessment
  riskLevel: SpoilageRiskLevel
  
  // Spoilage prediction
  estimatedSpoilagePercentage: number
  estimatedSpoilageQuantity: number
  timeframeHours: number
  
  // Economic impact
  marketPricePerKg?: number
  estimatedEconomicLoss?: number
  
  // Recommendations
  immediateActions: string[]
  marketRecommendation?: string
  
  // Alert priority
  shouldCreateAlert: boolean
  alertSeverity: 'warning' | 'danger'
}

/**
 * Determine risk level based on temperature and humidity
 */
export function assessRiskLevel(temperature: number, humidity: number): SpoilageRiskLevel {
  // High Risk: Temperature > 32°C OR Humidity > 75%
  if (temperature > 32 || humidity > 75) {
    return {
      level: 'high',
      color: 'red',
      label: 'High Risk'
    }
  }
  
  // Moderate Risk: Temperature 28-32°C OR Humidity 65-75%
  if ((temperature >= 28 && temperature <= 32) || (humidity >= 65 && humidity <= 75)) {
    return {
      level: 'moderate',
      color: 'orange',
      label: 'Moderate Risk'
    }
  }
  
  // Safe: Temperature < 28°C AND Humidity < 65%
  return {
    level: 'safe',
    color: 'green',
    label: 'Safe Conditions'
  }
}

/**
 * Calculate estimated spoilage percentage based on risk level and duration
 */
export function calculateSpoilagePercentage(
  riskLevel: SpoilageRiskLevel['level'],
  temperature: number,
  humidity: number,
  daysInStorage: number
): { percentage: number; timeframeHours: number } {
  let basePercentage = 0
  let timeframeHours = 72 // Default 3 days
  
  if (riskLevel === 'high') {
    // High risk: 10-25% spoilage
    // More severe conditions = higher percentage
    const tempFactor = Math.min((temperature - 32) / 10, 1) // 0-1 scale
    const humidityFactor = Math.min((humidity - 75) / 25, 1) // 0-1 scale
    const severityFactor = (tempFactor + humidityFactor) / 2
    
    basePercentage = 10 + (severityFactor * 15) // 10-25%
    timeframeHours = 48 // 2 days for high risk
    
    // Increase if already stored for long time
    if (daysInStorage > 30) {
      basePercentage += 5
    }
  } else if (riskLevel === 'moderate') {
    // Moderate risk: 5-10% spoilage
    const tempFactor = (temperature - 28) / 4 // 0-1 scale for 28-32°C
    const humidityFactor = (humidity - 65) / 10 // 0-1 scale for 65-75%
    const severityFactor = Math.max(tempFactor, humidityFactor)
    
    basePercentage = 5 + (severityFactor * 5) // 5-10%
    timeframeHours = 72 // 3 days for moderate risk
    
    if (daysInStorage > 45) {
      basePercentage += 3
    }
  } else {
    // Safe conditions: 0-2% natural spoilage
    basePercentage = daysInStorage > 60 ? 2 : 0
    timeframeHours = 168 // 7 days
  }
  
  return {
    percentage: Math.min(Math.round(basePercentage * 10) / 10, 30), // Cap at 30%, round to 1 decimal
    timeframeHours
  }
}

/**
 * Generate immediate action recommendations based on conditions
 */
export function generateImmediateActions(
  riskLevel: SpoilageRiskLevel['level'],
  temperature: number,
  humidity: number
): string[] {
  const actions: string[] = []
  
  if (riskLevel === 'high') {
    if (temperature > 32) {
      actions.push('🌡️ Reduce storage temperature immediately - improve cooling or ventilation')
    }
    if (humidity > 75) {
      actions.push('💧 Reduce humidity urgently - use dehumidifiers or improve air circulation')
      actions.push('☀️ Dry the produce if possible - spread in sun or use mechanical dryers')
    }
    actions.push('🔍 Inspect produce for early signs of spoilage')
    actions.push('📦 Consider moving produce to better storage facility')
  } else if (riskLevel === 'moderate') {
    if (temperature >= 28) {
      actions.push('🌡️ Improve ventilation to lower temperature')
    }
    if (humidity >= 65) {
      actions.push('💧 Monitor humidity levels closely and improve air flow')
    }
    actions.push('👀 Increase inspection frequency')
  } else {
    actions.push('✅ Maintain current storage conditions')
    actions.push('📊 Continue regular monitoring')
  }
  
  return actions
}

/**
 * Generate market recommendation based on risk level
 */
export function generateMarketRecommendation(
  riskLevel: SpoilageRiskLevel['level'],
  spoilagePercentage: number,
  timeframeHours: number
): string | undefined {
  if (riskLevel === 'high' && spoilagePercentage >= 10) {
    const days = Math.floor(timeframeHours / 24)
    return `⚠️ Consider selling the produce within the next ${days} day${days !== 1 ? 's' : ''} to avoid losses. Even at a slightly lower price, selling now is better than losing ${spoilagePercentage}% to spoilage.`
  }
  
  if (riskLevel === 'moderate' && spoilagePercentage >= 7) {
    return `⏰ Monitor market prices closely. If conditions don't improve within 48 hours, consider selling to minimize potential losses.`
  }
  
  return undefined
}

/**
 * Main function to predict spoilage for a commodity
 */
export function predictSpoilage(
  storageUnitId: string,
  storageUnitName: string,
  commodityId: string,
  commodityName: string,
  quantityStored: number,
  unit: string,
  dateStored: Date,
  currentTemperature: number,
  currentHumidity: number,
  marketPricePerKg?: number
): SpoilagePrediction {
  // Calculate days in storage
  const now = new Date()
  const daysInStorage = Math.floor((now.getTime() - dateStored.getTime()) / (1000 * 60 * 60 * 24))
  
  // Assess risk level
  const riskLevel = assessRiskLevel(currentTemperature, currentHumidity)
  
  // Calculate spoilage percentage
  const { percentage, timeframeHours } = calculateSpoilagePercentage(
    riskLevel.level,
    currentTemperature,
    currentHumidity,
    daysInStorage
  )
  
  // Calculate spoilage quantity
  const estimatedSpoilageQuantity = (quantityStored * percentage) / 100
  
  // Calculate economic loss if price is available
  let estimatedEconomicLoss: number | undefined
  if (marketPricePerKg) {
    // Convert to kg if needed
    let quantityInKg = quantityStored
    if (unit.toLowerCase() === 'bag' || unit.toLowerCase() === 'bags') {
      quantityInKg = quantityStored * 90 // Assume 90kg per bag
    } else if (unit.toLowerCase() === 'tonne' || unit.toLowerCase() === 'tonnes') {
      quantityInKg = quantityStored * 1000
    }
    
    const spoilageInKg = (quantityInKg * percentage) / 100
    estimatedEconomicLoss = spoilageInKg * marketPricePerKg
  }
  
  // Generate recommendations
  const immediateActions = generateImmediateActions(riskLevel.level, currentTemperature, currentHumidity)
  const marketRecommendation = generateMarketRecommendation(riskLevel.level, percentage, timeframeHours)
  
  // Determine if alert should be created
  const shouldCreateAlert = percentage >= 10 || riskLevel.level === 'high'
  const alertSeverity = percentage >= 15 || riskLevel.level === 'high' ? 'danger' : 'warning'
  
  return {
    storageUnitId,
    storageUnitName,
    commodityId,
    commodityName,
    quantityStored,
    unit,
    dateStored,
    currentTemperature,
    currentHumidity,
    riskLevel,
    estimatedSpoilagePercentage: percentage,
    estimatedSpoilageQuantity,
    timeframeHours,
    marketPricePerKg,
    estimatedEconomicLoss,
    immediateActions,
    marketRecommendation,
    shouldCreateAlert,
    alertSeverity
  }
}

/**
 * Format currency in KES
 */
export function formatKES(amount: number): string {
  return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

/**
 * Format timeframe in human-readable format
 */
export function formatTimeframe(hours: number): string {
  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`
  }
  const days = Math.floor(hours / 24)
  return `${days} day${days !== 1 ? 's' : ''}`
}
