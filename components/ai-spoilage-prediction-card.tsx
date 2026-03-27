/**
 * AI-Powered Spoilage Prediction Card
 *
 * Displays real-time predictive analysis with:
 * - AI risk assessment with confidence score
 * - Trend indicators (temperature & humidity)
 * - Early warning alerts
 * - Actionable recommendations
 * - Market suggestions
 * - Spoilage probability timeline
 */

'use client'

import React from 'react'
import {
  Thermometer,
  Droplets,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  AlertCircle,
  Clock,
  MapPin,
  Package,
  CheckCircle,
  Brain,
  Activity,
  Target,
  ArrowRight,
  Sparkles,
  ShoppingCart,
  TrendingUp as TrendingUpIcon,
  DollarSign,
} from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface TrendAnalysis {
  direction: 'rising' | 'falling' | 'stable'
  ratePerMinute: number
  changePercent: number
  volatility: 'low' | 'moderate' | 'high'
}

interface DurationExposure {
  minutesInHighRisk: number
  consecutiveBadReadings: number
  worstConditionDuration: string
}

interface EarlyWarning {
  triggered: boolean
  message: string
  urgency: 'low' | 'medium' | 'high'
  detectedPattern: string
}

interface MarketSuggestion {
  action: 'hold' | 'monitor_closely' | 'sell_soon' | 'sell_immediately'
  reason: string
  bestMarket?: {
    name: string
    location: string
    pricePerKg: number
    distance: number
  }
}

interface AIPrediction {
  riskLevel: 'safe' | 'warning' | 'high_risk' | 'critical'
  confidence: number
  spoilageProbability: number
  predictedTimeToSpoilage: string
  explanation: string
  primaryRiskFactors: string[]
  recommendations: string[]
  earlyWarning: EarlyWarning
  marketSuggestion?: MarketSuggestion
}

interface Prediction {
  storageUnitId: string
  storageUnitName: string
  location: string
  commodityName: string
  quantityStored: number
  unit: string
  daysInStorage: number
  temperature: number
  humidity: number
  temperatureTrend: TrendAnalysis
  humidityTrend: TrendAnalysis
  durationExposure: DurationExposure
  aiPrediction: AIPrediction
  marketIntelligence?: {
    marketAssessment: string
    urgencyLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM'
    recommendedAction: string
    nearbyMarkets: Array<{
      marketName: string
      distance_km: number
      currentPrice: number
      priceHistory: {
        '7dayTrend': string
        '30dayTrend': string
        direction: 'UP' | 'DOWN' | 'STABLE'
      }
      demandLevel: string
      aiInsight: string
    }>
    marketTrendAnalysis: string
    sellingStrategy: string
    potentialLossPreventionValue: number
    aiConfidence: number
    timestamp: string
  }
  estimatedLoss?: {
    percentage: number
    quantity: number
    value: number
  }
  readingsAnalyzed: number
  lastUpdated: string
}

interface AISpoilagePredictionCardProps {
  prediction: Prediction
}

// ─── Helper Functions ──────────────────────────────────────────────────────────

function formatKES(amount: number): string {
  return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function formatQuantity(amount: number, unit: string): string {
  if (amount >= 1000 && unit.toLowerCase().includes('kg')) {
    return `${(amount / 1000).toFixed(1)} tonnes`
  }
  return `${amount.toLocaleString()} ${unit}`
}

function getRiskColor(riskLevel: string): string {
  const colors: Record<string, string> = {
    safe: 'text-green-600 bg-green-50 border-green-200',
    warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    high_risk: 'text-orange-600 bg-orange-50 border-orange-200',
    critical: 'text-red-600 bg-red-50 border-red-200',
  }
  return colors[riskLevel] || colors.safe
}

function getRiskIcon(riskLevel: string) {
  const icons: Record<string, React.ReactNode> = {
    safe: <CheckCircle className="h-5 w-5" />,
    warning: <AlertCircle className="h-5 w-5" />,
    high_risk: <AlertTriangle className="h-5 w-5" />,
    critical: <AlertTriangle className="h-5 w-5" />,
  }
  return icons[riskLevel] || icons.safe
}

function getRiskLabel(riskLevel: string): string {
  const labels: Record<string, string> = {
    safe: 'Safe',
    warning: 'Warning',
    high_risk: 'High Risk',
    critical: 'Critical',
  }
  return labels[riskLevel] || riskLevel
}

function TrendIndicator({ trend }: { trend: TrendAnalysis }) {
  const isRising = trend.direction === 'rising'
  const isFalling = trend.direction === 'falling'
  
  return (
    <div className="flex items-center gap-2">
      {isRising && (
        <span className="inline-flex items-center gap-1 text-red-600 text-xs font-medium">
          <TrendingUp className="h-3.5 w-3.5" />
          Rising
        </span>
      )}
      {isFalling && (
        <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
          <TrendingDown className="h-3.5 w-3.5" />
          Falling
        </span>
      )}
      {!isRising && !isFalling && (
        <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
          <Minus className="h-3.5 w-3.5" />
          Stable
        </span>
      )}
      <span className="text-xs text-muted-foreground">
        {trend.changePercent > 0 ? '+' : ''}{trend.changePercent.toFixed(1)}%
      </span>
    </div>
  )
}

function ConfidenceGauge({ confidence }: { confidence: number }) {
  const circumference = 2 * Math.PI * 16
  const strokeDashoffset = circumference - (confidence / 100) * circumference
  
  return (
    <div className="relative h-10 w-10">
      <svg className="h-10 w-10 transform -rotate-90">
        <circle
          className="text-muted-foreground/20"
          strokeWidth="4"
          stroke="currentColor"
          fill="transparent"
          r="16"
          cx="20"
          cy="20"
        />
        <circle
          className="text-primary transition-all duration-500"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="16"
          cx="20"
          cy="20"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
        {Math.round(confidence)}%
      </span>
    </div>
  )
}

function SpoilageProbabilityBar({ probability }: { probability: number }) {
  const getColor = () => {
    if (probability >= 70) return 'bg-red-500'
    if (probability >= 40) return 'bg-orange-500'
    if (probability >= 20) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground">Spoilage Probability</span>
        <span className="text-sm font-bold">{probability.toFixed(0)}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getColor()}`}
          style={{ width: `${probability}%` }}
        />
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function AISpoilagePredictionCard({ prediction }: AISpoilagePredictionCardProps) {
  const {
    storageUnitName,
    location,
    commodityName,
    quantityStored,
    unit,
    daysInStorage,
    temperature,
    humidity,
    temperatureTrend,
    humidityTrend,
    durationExposure,
    aiPrediction,
    marketIntelligence,
    estimatedLoss,
    readingsAnalyzed,
  } = prediction

  const {
    riskLevel,
    confidence,
    spoilageProbability,
    predictedTimeToSpoilage,
    explanation,
    primaryRiskFactors,
    recommendations,
    earlyWarning,
    marketSuggestion,
  } = aiPrediction

  const riskColorClass = getRiskColor(riskLevel)

  return (
    <div className={`card-elevated rounded-xl border-2 overflow-hidden transition-all ${riskColorClass}`}>
      {/* Header with Risk Badge */}
      <div className="border-b border-border bg-background/50 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-foreground truncate">{storageUnitName}</h3>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate">{location}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <ConfidenceGauge confidence={confidence} />
            <div className={`px-3 py-1.5 rounded-full border font-semibold text-sm flex items-center gap-1.5 ${riskColorClass}`}>
              {getRiskIcon(riskLevel)}
              {getRiskLabel(riskLevel)}
            </div>
          </div>
        </div>
      </div>

      {/* Commodity Info */}
      <div className="px-5 py-3 border-b border-border bg-background/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Commodity</p>
            <p className="font-medium text-foreground">{commodityName}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Quantity</p>
            <p className="font-medium text-foreground">
              {formatQuantity(quantityStored, unit)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Storage Duration</p>
            <p className="font-medium text-foreground">{daysInStorage} days</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Current Conditions */}
        <div className="grid grid-cols-2 gap-4">
          {/* Temperature */}
          <div className="rounded-lg bg-white border border-border p-3">
            <div className="flex items-center gap-2 mb-2">
              <Thermometer className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-muted-foreground">Temperature</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-foreground">{temperature.toFixed(1)}°C</span>
              <TrendIndicator trend={temperatureTrend} />
            </div>
          </div>

          {/* Humidity */}
          <div className="rounded-lg bg-white border border-border p-3">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-muted-foreground">Humidity</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-foreground">{humidity.toFixed(1)}%</span>
              <TrendIndicator trend={humidityTrend} />
            </div>
          </div>
        </div>

        {/* AI Prediction Section */}
        <div className="rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-primary">AI Prediction Analysis</span>
            <Sparkles className="h-3.5 w-3.5 text-primary/60" />
          </div>

          {/* Spoilage Probability */}
          <SpoilageProbabilityBar probability={spoilageProbability} />

          {/* Predicted Time */}
          <div className="mt-3 flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Predicted time to spoilage:</span>
            <span className="font-semibold">{predictedTimeToSpoilage}</span>
          </div>

          {/* Explanation */}
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            {explanation}
          </p>
        </div>

        {/* Early Warning */}
        {earlyWarning.triggered && (
          <div className={`rounded-lg border-2 p-4 ${
            earlyWarning.urgency === 'high'
              ? 'bg-red-50 border-red-200'
              : earlyWarning.urgency === 'medium'
              ? 'bg-orange-50 border-orange-200'
              : 'bg-amber-50 border-amber-200'
          }`}>
            <div className="flex items-start gap-3">
              <Activity className={`h-5 w-5 mt-0.5 ${
                earlyWarning.urgency === 'high' ? 'text-red-600' : 'text-amber-600'
              }`} />
              <div className="flex-1">
                <p className={`text-sm font-bold ${
                  earlyWarning.urgency === 'high' ? 'text-red-800' : 'text-amber-800'
                }`}>
                  ⚠️ Early Warning: {earlyWarning.urgency === 'high' ? 'Immediate Action Required' : 'Conditions Deteriorating'}
                </p>
                <p className={`text-sm mt-1 ${
                  earlyWarning.urgency === 'high' ? 'text-red-700' : 'text-amber-700'
                }`}>
                  {earlyWarning.message}
                </p>
                <p className="text-xs mt-2 text-muted-foreground">
                  Pattern detected: {earlyWarning.detectedPattern}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Risk Factors */}
        {primaryRiskFactors.length > 0 && primaryRiskFactors[0] !== 'No significant risk factors detected' && (
          <div className="rounded-lg bg-white border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-red-500" />
              <span className="text-sm font-semibold text-foreground">Risk Factors</span>
            </div>
            <ul className="space-y-1.5">
              {primaryRiskFactors.slice(0, 4).map((factor, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-red-500 mt-1">•</span>
                  {factor}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="rounded-lg bg-white border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-semibold text-foreground">Recommended Actions</span>
            </div>
            <ul className="space-y-2">
              {recommendations.map((action, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  {action}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Market Suggestion */}
        {marketSuggestion && (
          <div className={`rounded-lg border-2 p-4 ${
            marketSuggestion.action === 'sell_immediately'
              ? 'bg-red-50 border-red-200'
              : marketSuggestion.action === 'sell_soon'
              ? 'bg-orange-50 border-orange-200'
              : marketSuggestion.action === 'monitor_closely'
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-start gap-2 mb-2">
              <MapPin className={`h-4 w-4 mt-0.5 ${
                marketSuggestion.action === 'sell_immediately'
                  ? 'text-red-600'
                  : marketSuggestion.action === 'sell_soon'
                  ? 'text-orange-600'
                  : 'text-blue-600'
              }`} />
              <div className="flex-1">
                <p className={`text-sm font-bold ${
                  marketSuggestion.action === 'sell_immediately'
                    ? 'text-red-800'
                    : marketSuggestion.action === 'sell_soon'
                    ? 'text-orange-800'
                    : 'text-blue-800'
                }`}>
                  Market Recommendation
                </p>
                <p className={`text-sm mt-1 ${
                  marketSuggestion.action === 'sell_immediately'
                    ? 'text-red-700'
                    : marketSuggestion.action === 'sell_soon'
                    ? 'text-orange-700'
                    : 'text-blue-700'
                }`}>
                  {marketSuggestion.action.replace(/_/g, ' ').toUpperCase()}: {marketSuggestion.reason}
                </p>
              </div>
            </div>
            {marketSuggestion.bestMarket && (
              <div className="mt-3 rounded bg-white/50 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">
                    🏪 {marketSuggestion.bestMarket.name}
                  </span>
                  <span className="text-green-600 font-bold">
                    {marketSuggestion.bestMarket.pricePerKg.toFixed(2)} KES/kg
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>📍 {marketSuggestion.bestMarket.location}</span>
                  <span>📏 {marketSuggestion.bestMarket.distance} km</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MARKET INTELLIGENCE - AI-Powered Market Insights */}
        {marketIntelligence && (
          <div className={`rounded-xl border-2 overflow-hidden ${
            marketIntelligence.urgencyLevel === 'CRITICAL'
              ? 'bg-red-50 border-red-300'
              : marketIntelligence.urgencyLevel === 'HIGH'
              ? 'bg-orange-50 border-orange-300'
              : 'bg-yellow-50 border-yellow-300'
          }`}>
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <h4 className="font-bold text-primary">📊 AI MARKET INTELLIGENCE</h4>
                <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-bold ${
                  marketIntelligence.urgencyLevel === 'CRITICAL'
                    ? 'bg-red-600 text-white'
                    : marketIntelligence.urgencyLevel === 'HIGH'
                    ? 'bg-orange-600 text-white'
                    : 'bg-yellow-600 text-white'
                }`}>
                  {marketIntelligence.urgencyLevel} URGENCY
                </span>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Market Assessment */}
              <div className="rounded-lg bg-white border border-border p-3">
                <p className="text-sm font-semibold text-foreground mb-2">Market Assessment</p>
                <p className="text-sm text-muted-foreground">{marketIntelligence.marketAssessment}</p>
              </div>

              {/* Selling Strategy */}
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-primary" />
                  <p className="text-sm font-bold text-primary">AI-Generated Selling Strategy</p>
                </div>
                <p className="text-sm text-muted-foreground">{marketIntelligence.sellingStrategy}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  💡 AI Confidence: {marketIntelligence.aiConfidence}%
                </p>
              </div>

              {/* Recommended Action */}
              <div className="rounded-lg bg-green-50 border border-green-200 p-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-green-800">Recommended Action</p>
                    <p className="text-sm text-green-700 mt-1">{marketIntelligence.recommendedAction}</p>
                  </div>
                </div>
              </div>

              {/* Nearby Markets */}
              {marketIntelligence.nearbyMarkets.length > 0 && (
                <div className="rounded-lg bg-white border border-border p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="h-4 w-4 text-primary" />
                    <p className="text-sm font-bold text-foreground">Nearby Markets (Ranked by AI)</p>
                  </div>
                  <div className="space-y-3">
                    {marketIntelligence.nearbyMarkets.slice(0, 5).map((market: {
                      marketName: string
                      distance_km: number
                      currentPrice: number
                      priceHistory: {
                        '7dayTrend': string
                        '30dayTrend': string
                        direction: 'UP' | 'DOWN' | 'STABLE'
                      }
                      demandLevel: string
                      aiInsight: string
                    }, index: number) => (
                      <div
                        key={index}
                        className={`rounded-lg border-2 p-3 ${
                          index === 0
                            ? 'bg-green-50 border-green-300'
                            : 'bg-muted/30 border-border'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg font-bold text-foreground">
                                {index === 0 ? '🏆' : `#${index + 1}`} {market.marketName}
                              </span>
                              {index === 0 && (
                                <span className="px-2 py-0.5 bg-green-600 text-white text-xs font-bold rounded-full">
                                  BEST CHOICE
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>📏 {market.distance_km} km</span>
                              <span>💰 KES {market.currentPrice}/kg</span>
                              <span className={`flex items-center gap-1 ${
                                market.priceHistory.direction === 'UP'
                                  ? 'text-green-600'
                                  : market.priceHistory.direction === 'DOWN'
                                  ? 'text-red-600'
                                  : 'text-muted-foreground'
                              }`}>
                                <TrendingUpIcon className="h-3 w-3" />
                                7d: {market.priceHistory['7dayTrend']}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              market.demandLevel === 'high'
                                ? 'bg-green-100 text-green-700'
                                : market.demandLevel === 'medium'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {market.demandLevel.toUpperCase()} DEMAND
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          💡 {market.aiInsight}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Market Trend Analysis */}
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUpIcon className="h-4 w-4 text-blue-600" />
                  <p className="text-sm font-bold text-blue-800">Market Trend Analysis</p>
                </div>
                <p className="text-sm text-blue-700">{marketIntelligence.marketTrendAnalysis}</p>
              </div>

              {/* Potential Loss Prevention */}
              {marketIntelligence.potentialLossPreventionValue > 0 && (
                <div className="rounded-lg bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-6 w-6 text-green-600" />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-green-800">POTENTIAL LOSS PREVENTION VALUE</p>
                      <p className="text-2xl font-bold text-green-700">
                        KES {marketIntelligence.potentialLossPreventionValue.toLocaleString()}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Amount you could save by acting on this recommendation
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Estimated Loss */}
        {estimatedLoss && estimatedLoss.value > 0 && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-bold text-red-800">Estimated Economic Loss</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-red-600">Percentage</p>
                <p className="text-lg font-bold text-red-700">{estimatedLoss.percentage.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-xs text-red-600">Quantity</p>
                <p className="text-lg font-bold text-red-700">
                  {formatQuantity(estimatedLoss.quantity, unit)}
                </p>
              </div>
              <div>
                <p className="text-xs text-red-600">Value</p>
                <p className="text-lg font-bold text-red-700">{formatKES(estimatedLoss.value)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Duration Exposure */}
        {durationExposure.minutesInHighRisk > 0 && (
          <div className="rounded-lg bg-muted/50 border border-border p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>⏱️ Time in high-risk conditions</span>
              <span className="font-medium">{durationExposure.worstConditionDuration}</span>
            </div>
          </div>
        )}

        {/* Footer - Data Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
          <span>📊 {readingsAnalyzed} readings analyzed</span>
          <span className="flex items-center gap-1">
            <Brain className="h-3 w-3" />
            AI-Powered Prediction
          </span>
        </div>
      </div>
    </div>
  )
}
