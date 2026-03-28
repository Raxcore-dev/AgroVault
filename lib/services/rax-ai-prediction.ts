/**
 * RAX AI Prediction Service
 *
 * Integrates with RAX AI API for intelligent spoilage predictions.
 * Includes fallback to rule-based prediction if AI fails.
 */

import { TrendAnalysis } from './historical-data-service';
import { CommoditySensitivity, getCommoditySensitivity, getRiskMultiplier } from '@/lib/commodity-sensitivity';

export interface AIPredictionRequest {
  commodity: string;
  commoditySensitivity: CommoditySensitivity;
  currentTemperature: number;
  currentHumidity: number;
  trend: TrendAnalysis;
  location: string;
  quantityStored: number;
  daysInStorage: number;
}

export interface AIPredictionResponse {
  riskLevel: 'safe' | 'low' | 'moderate' | 'high' | 'critical';
  riskScore: number; // 0-100
  prediction: string;
  explanation: string;
  timeframeHours: number;
  recommendedActions: string[];
  marketRecommendation?: {
    action: 'hold' | 'monitor' | 'sell_soon' | 'sell_immediately';
    message: string;
    suggestedMarket?: {
      name: string;
      location: string;
      pricePerKg: number;
    };
  };
  earlyWarning: {
    triggered: boolean;
    message: string;
    urgency: 'low' | 'medium' | 'high';
  };
  confidence: number; // 0-1
  source: 'ai' | 'rule_based';
}

/**
 * Main prediction function - tries AI first, falls back to rule-based
 */
export async function predictSpoilageAI(
  request: AIPredictionRequest
): Promise<AIPredictionResponse> {
  try {
    // Try RAX AI prediction
    const aiResponse = await callRAXAI(request);
    if (aiResponse) {
      return { ...aiResponse, source: 'ai' };
    }
  } catch (error) {
    console.error('[RAX_AI] Prediction failed, using fallback:', error);
  }

  // Fallback to rule-based prediction
  return predictSpoilageRuleBased(request);
}

/**
 * Call RAX AI API for prediction
 */
async function callRAXAI(
  request: AIPredictionRequest
): Promise<AIPredictionResponse | null> {
  const apiKey = process.env.RAX_AI_API_KEY;
  const apiEndpoint = process.env.RAX_AI_ENDPOINT;

  // If no API key configured, return null to trigger fallback
  if (!apiKey || !apiEndpoint) {
    console.log('[RAX_AI] No API credentials configured, using fallback');
    return null;
  }

  try {
    const payload = {
      commodity: request.commodity,
      commodity_profile: {
        max_temp: request.commoditySensitivity.maxTemp,
        min_temp: request.commoditySensitivity.minTemp,
        max_humidity: request.commoditySensitivity.maxHumidity,
        min_humidity: request.commoditySensitivity.minHumidity,
        optimal_temp: request.commoditySensitivity.optimalTemp,
        optimal_humidity: request.commoditySensitivity.optimalHumidity,
        spoilage_time_hours: request.commoditySensitivity.spoilageTimeHours,
        risk_behavior: request.commoditySensitivity.riskBehavior,
        sensitivity_level: request.commoditySensitivity.sensitivityLevel,
      },
      current_conditions: {
        temperature: request.currentTemperature,
        humidity: request.currentHumidity,
      },
      trend_analysis: {
        temperature: {
          direction: request.trend.temperature.direction,
          rate_per_hour: request.trend.temperature.ratePerHour,
          change_percent: request.trend.temperature.changePercent,
          avg_value: request.trend.temperature.avgValue,
          max_value: request.trend.temperature.maxValue,
          min_value: request.trend.temperature.minValue,
        },
        humidity: {
          direction: request.trend.humidity.direction,
          rate_per_hour: request.trend.humidity.ratePerHour,
          change_percent: request.trend.humidity.changePercent,
          avg_value: request.trend.humidity.avgValue,
          max_value: request.trend.humidity.maxValue,
          min_value: request.trend.humidity.minValue,
        },
        duration: {
          minutes_analyzed: request.trend.duration.minutesAnalyzed,
          readings_count: request.trend.duration.readingsCount,
          data_quality: request.trend.duration.dataQuality,
        },
      },
      context: {
        location: request.location,
        quantity_stored: request.quantityStored,
        days_in_storage: request.daysInStorage,
      },
    };

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`RAX AI API error: ${response.status}`);
    }

    const data = await response.json();

    // Parse AI response
    return parseAIResponse(data, request);
  } catch (error) {
    console.error('[RAX_AI] API call failed:', error);
    return null;
  }
}

/**
 * Parse RAX AI response into our format
 */
function parseAIResponse(
  data: any,
  request: AIPredictionRequest
): AIPredictionResponse {
  // Expected AI response format
  const riskLevel = mapRiskLevel(data.risk_level || 'moderate');
  
  return {
    riskLevel,
    riskScore: data.risk_score || calculateRiskScore(request),
    prediction: data.prediction || generatePrediction(request, riskLevel),
    explanation: data.explanation || generateExplanation(request),
    timeframeHours: data.timeframe_hours || 24,
    recommendedActions: data.recommended_actions || generateActions(request, riskLevel),
    marketRecommendation: data.market_recommendation ? {
      action: mapMarketAction(data.market_recommendation.action),
      message: data.market_recommendation.message,
      suggestedMarket: data.market_recommendation.suggested_market,
    } : undefined,
    earlyWarning: {
      triggered: data.early_warning?.triggered || false,
      message: data.early_warning?.message || '',
      urgency: (data.early_warning?.urgency as 'low' | 'medium' | 'high') || 'low',
    },
    confidence: data.confidence || 0.8,
    source: 'ai',
  };
}

/**
 * Rule-based fallback prediction system
 */
export function predictSpoilageRuleBased(
  request: AIPredictionRequest
): AIPredictionResponse {
  const { commodity, commoditySensitivity, currentTemperature, currentHumidity, trend } = request;
  
  // Calculate risk factors
  const riskFactors: string[] = [];
  let riskScore = 0;

  // Temperature risk
  const tempDeviation = Math.abs(currentTemperature - commoditySensitivity.optimalTemp);
  if (currentTemperature > commoditySensitivity.maxTemp) {
    riskScore += 30 * getRiskMultiplier(commoditySensitivity.sensitivityLevel);
    riskFactors.push(`Temperature ${currentTemperature}°C exceeds safe limit (${commoditySensitivity.maxTemp}°C)`);
  } else if (currentTemperature < commoditySensitivity.minTemp) {
    riskScore += 20 * getRiskMultiplier(commoditySensitivity.sensitivityLevel);
    riskFactors.push(`Temperature ${currentTemperature}°C below safe limit (${commoditySensitivity.minTemp}°C)`);
  } else if (tempDeviation > 5) {
    riskScore += 10;
    riskFactors.push(`Temperature deviates from optimal by ${tempDeviation.toFixed(1)}°C`);
  }

  // Humidity risk
  const humidityDeviation = Math.abs(currentHumidity - commoditySensitivity.optimalHumidity);
  if (currentHumidity > commoditySensitivity.maxHumidity) {
    riskScore += 30 * getRiskMultiplier(commoditySensitivity.sensitivityLevel);
    riskFactors.push(`Humidity ${currentHumidity}% exceeds safe limit (${commoditySensitivity.maxHumidity}%)`);
  } else if (currentHumidity < commoditySensitivity.minHumidity) {
    riskScore += 20 * getRiskMultiplier(commoditySensitivity.sensitivityLevel);
    riskFactors.push(`Humidity ${currentHumidity}% below safe limit (${commoditySensitivity.minHumidity}%)`);
  } else if (humidityDeviation > 10) {
    riskScore += 10;
    riskFactors.push(`Humidity deviates from optimal by ${humidityDeviation.toFixed(1)}%`);
  }

  // Trend risk
  if (trend.temperature.direction === 'rising' && trend.temperature.ratePerHour > 1) {
    riskScore += 20;
    riskFactors.push(`Temperature rising at ${trend.temperature.ratePerHour.toFixed(1)}°C/hour`);
  }
  if (trend.humidity.direction === 'rising' && trend.humidity.ratePerHour > 2) {
    riskScore += 15;
    riskFactors.push(`Humidity rising at ${trend.humidity.ratePerHour.toFixed(1)}%/hour`);
  }

  // Duration risk
  if (trend.duration.minutesAnalyzed >= 60 && trend.temperature.direction === 'rising') {
    riskScore += 10;
    riskFactors.push('Sustained rising temperature trend for over 1 hour');
  }

  // Cap risk score at 100
  riskScore = Math.min(100, riskScore);

  // Determine risk level
  let riskLevel: AIPredictionResponse['riskLevel'] = 'safe';
  if (riskScore >= 80) riskLevel = 'critical';
  else if (riskScore >= 60) riskLevel = 'high';
  else if (riskScore >= 40) riskLevel = 'moderate';
  else if (riskScore >= 20) riskLevel = 'low';

  // Generate prediction
  const prediction = generatePrediction(request, riskLevel);
  const explanation = riskFactors.length > 0 
    ? riskFactors.join('. ') 
    : 'All conditions within optimal range';

  // Generate recommended actions
  const recommendedActions = generateActions(request, riskLevel);

  // Early warning
  const earlyWarningTriggered = riskLevel === 'high' || riskLevel === 'critical' || 
    (trend.temperature.direction === 'rising' && trend.temperature.ratePerHour > 1);

  return {
    riskLevel,
    riskScore: Math.round(riskScore),
    prediction,
    explanation,
    timeframeHours: riskLevel === 'critical' ? 6 : riskLevel === 'high' ? 12 : 24,
    recommendedActions,
    marketRecommendation: generateMarketRecommendation(request, riskLevel),
    earlyWarning: {
      triggered: earlyWarningTriggered,
      message: earlyWarningTriggered 
        ? `⚠️ ${commodity} at risk - ${riskFactors[0] || 'Unfavorable conditions detected'}`
        : '',
      urgency: riskLevel === 'critical' ? 'high' : riskLevel === 'high' ? 'medium' : 'low',
    },
    confidence: 0.85,
    source: 'rule_based',
  };
}

/**
 * Generate prediction text
 */
function generatePrediction(
  request: AIPredictionRequest,
  riskLevel: AIPredictionResponse['riskLevel']
): string {
  const { commodity, trend } = request;
  
  const riskText = {
    critical: `🔴 Critical risk of spoilage for ${commodity} within 6 hours`,
    high: `🟠 High risk of spoilage for ${commodity} within 12-24 hours`,
    moderate: `🟡 Moderate risk - monitor ${commodity} closely for next 24 hours`,
    low: `🟢 Low risk - ${commodity} conditions acceptable but should be monitored`,
    safe: `✅ Safe - ${commodity} in optimal conditions`,
  };

  if (trend.temperature.direction === 'rising') {
    return `${riskText[riskLevel]}. Temperature rising trend detected.`;
  }
  
  return riskText[riskLevel];
}

/**
 * Generate explanation text
 */
function generateExplanation(request: AIPredictionRequest): string {
  const { commodity, commoditySensitivity, currentTemperature, currentHumidity } = request;
  
  return `${commodity} requires ${commoditySensitivity.optimalTemp}°C and ${commoditySensitivity.optimalHumidity}% humidity. ` +
    `Current: ${currentTemperature}°C, ${currentHumidity}%.`;
}

/**
 * Generate recommended actions
 */
function generateActions(
  request: AIPredictionRequest,
  riskLevel: AIPredictionResponse['riskLevel']
): string[] {
  const actions: string[] = [];

  if (riskLevel === 'critical') {
    actions.push('🚨 Immediate action required - remove from storage');
    actions.push('Sell immediately at nearest market');
    actions.push('Consider emergency cooling or processing');
  } else if (riskLevel === 'high') {
    actions.push('⚠️ Increase monitoring frequency');
    actions.push('Improve ventilation immediately');
    actions.push('Prepare for quick sale');
    actions.push('Consider relocation to cooler storage');
  } else if (riskLevel === 'moderate') {
    actions.push('📊 Monitor conditions every 30 minutes');
    actions.push('Check ventilation system');
    actions.push('Review market prices for potential sale');
  } else {
    actions.push('✅ Continue regular monitoring');
    actions.push('Maintain current storage conditions');
  }

  return actions;
}

/**
 * Generate market recommendation
 */
function generateMarketRecommendation(
  request: AIPredictionRequest,
  riskLevel: AIPredictionResponse['riskLevel']
): AIPredictionResponse['marketRecommendation'] | undefined {
  if (riskLevel === 'safe' || riskLevel === 'low') {
    return {
      action: 'hold',
      message: 'Conditions optimal - hold for better market prices',
    };
  }

  if (riskLevel === 'moderate') {
    return {
      action: 'monitor',
      message: 'Monitor market prices - be ready to sell if conditions worsen',
    };
  }

  if (riskLevel === 'high') {
    return {
      action: 'sell_soon',
      message: 'Sell within 24 hours to minimize losses',
    };
  }

  return {
    action: 'sell_immediately',
    message: 'Emergency sale recommended - prioritize nearest market',
  };
}

/**
 * Calculate risk score (used as fallback)
 */
function calculateRiskScore(request: AIPredictionRequest): number {
  const { currentTemperature, currentHumidity, commoditySensitivity } = request;
  
  let score = 50; // Base score
  
  // Adjust based on conditions
  const tempDiff = Math.abs(currentTemperature - commoditySensitivity.optimalTemp);
  const humidityDiff = Math.abs(currentHumidity - commoditySensitivity.optimalHumidity);
  
  score += tempDiff * 2;
  score += humidityDiff * 1;
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Map AI risk level to our format
 */
function mapRiskLevel(level: string): AIPredictionResponse['riskLevel'] {
  const mapping: Record<string, AIPredictionResponse['riskLevel']> = {
    'safe': 'safe',
    'low': 'low',
    'moderate': 'moderate',
    'high': 'high',
    'critical': 'critical',
  };
  return mapping[level.toLowerCase()] || 'moderate';
}

/**
 * Map AI market action to our format
 */
function mapMarketAction(action: string): 'hold' | 'monitor' | 'sell_soon' | 'sell_immediately' {
  const mapping: Record<string, 'hold' | 'monitor' | 'sell_soon' | 'sell_immediately'> = {
    'hold': 'hold',
    'monitor': 'monitor',
    'sell_soon': 'sell_soon',
    'sell_immediately': 'sell_immediately',
    'sell_now': 'sell_immediately',
  };
  return mapping[action.toLowerCase()] || 'monitor';
}
