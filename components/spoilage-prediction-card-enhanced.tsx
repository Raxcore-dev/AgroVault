/**
 * Enhanced Spoilage Prediction Card Component
 * 
 * Displays comprehensive spoilage prediction with:
 * - Real-time trends
 * - Duration analysis
 * - Early warnings
 * - Market recommendations
 */

'use client'

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
  ArrowRight,
  ExternalLink,
} from 'lucide-react'

interface TrendData {
  direction: 'rising' | 'falling' | 'stable'
  ratePerMinute: number
  changePercent: number
}

interface Prediction {
  storageUnitId: string
  storageUnitName: string
  storageLocation: string
  commodityName: string
  quantityStored: number
  unit: string
  currentTemperature: number
  currentHumidity: number
  temperatureTrend: TrendData
  humidityTrend: TrendData
  riskLevel: {
    level: 'safe' | 'moderate' | 'high' | 'critical'
    color: 'green' | 'yellow' | 'orange' | 'red'
    label: string
    score: number
  }
  estimatedSpoilagePercentage: number
  estimatedSpoilageQuantity: number
  timeframeHours: number
  estimatedEconomicLoss?: number
  immediateActions: string[]
  marketRecommendation?: {
    action: 'hold' | 'monitor' | 'sell_soon' | 'sell_immediately'
    message: string
    bestMarket?: {
      name: string
      location: string
      pricePerKg: number
      distance: number
    }
  }
  earlyWarning?: {
    triggered: boolean
    message: string
    urgency: 'low' | 'medium' | 'high'
  }
  lastReadingTime: string
}

interface SpoilagePredictionCardEnhancedProps {
  prediction: Prediction
}

function formatKES(amount: number): string {
  return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function formatTimeframe(hours: number): string {
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}

function TrendIndicator({ trend }: { trend: TrendData }) {
  if (trend.direction === 'rising') {
    return (
      <span className="inline-flex items-center gap-1 text-red-600 text-xs font-medium">
        <TrendingUp className="h-3 w-3" />
        +{trend.ratePerMinute.toFixed(2)}/min
      </span>
    )
  }
  if (trend.direction === 'falling') {
    return (
      <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
        <TrendingDown className="h-3 w-3" />
        {trend.ratePerMinute.toFixed(2)}/min
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
      <Minus className="h-3 w-3" />
      Stable
    </span>
  )
}

function RiskBadge({ level, score }: { level: string; score: number }) {
  const styles: Record<string, string> = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    moderate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    safe: 'bg-green-100 text-green-800 border-green-200',
  }

  const icons: Record<string, JSX.Element> = {
    critical: <AlertTriangle className="h-4 w-4" />,
    high: <AlertTriangle className="h-4 w-4" />,
    moderate: <AlertCircle className="h-4 w-4" />,
    safe: <CheckCircle className="h-4 w-4" />,
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${styles[level]}`}>
      {icons[level]}
      {level.charAt(0).toUpperCase() + level.slice(1)} Risk (Score: {score})
    </span>
  )
}

export function SpoilagePredictionCardEnhanced({ prediction }: SpoilagePredictionCardEnhancedProps) {
  const {
    storageUnitName,
    storageLocation,
    commodityName,
    quantityStored,
    unit,
    currentTemperature,
    currentHumidity,
    temperatureTrend,
    humidityTrend,
    riskLevel,
    estimatedSpoilagePercentage,
    estimatedSpoilageQuantity,
    timeframeHours,
    estimatedEconomicLoss,
    immediateActions,
    marketRecommendation,
    earlyWarning,
  } = prediction

  const riskColors: Record<string, string> = {
    critical: 'border-red-300 bg-red-50',
    high: 'border-orange-300 bg-orange-50',
    moderate: 'border-yellow-300 bg-yellow-50',
    safe: 'border-green-300 bg-green-50',
  }

  return (
    <div className={`card-elevated rounded-lg border overflow-hidden ${riskColors[riskLevel.level]}`}>
      {/* Header */}
      <div className="border-b border-border bg-background/50 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-foreground truncate">{storageUnitName}</h3>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate">{storageLocation}</span>
            </div>
          </div>
          <RiskBadge level={riskLevel.level} score={riskLevel.score} />
        </div>
      </div>

      {/* Commodity Info */}
      <div className="px-5 py-4 border-b border-border bg-background/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Commodity</p>
            <p className="font-medium text-foreground">{commodityName}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Quantity</p>
            <p className="font-medium text-foreground">
              {quantityStored.toLocaleString()} {unit}
            </p>
          </div>
        </div>
      </div>

      {/* Current Conditions */}
      <div className="px-5 py-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Temperature */}
          <div className="rounded-lg bg-white border border-border p-3">
            <div className="flex items-center gap-2 mb-2">
              <Thermometer className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-muted-foreground">Temperature</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-foreground">{currentTemperature.toFixed(1)}°C</span>
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
              <span className="text-2xl font-bold text-foreground">{currentHumidity.toFixed(1)}%</span>
              <TrendIndicator trend={humidityTrend} />
            </div>
          </div>
        </div>

        {/* Early Warning */}
        {earlyWarning?.triggered && (
          <div className={`mb-4 rounded-lg border-2 p-3 ${
            earlyWarning.urgency === 'high'
              ? 'bg-red-50 border-red-200'
              : 'bg-amber-50 border-amber-200'
          }`}>
            <div className="flex items-start gap-2">
              <AlertCircle className={`h-4 w-4 mt-0.5 ${
                earlyWarning.urgency === 'high' ? 'text-red-600' : 'text-amber-600'
              }`} />
              <p className={`text-sm font-medium ${
                earlyWarning.urgency === 'high' ? 'text-red-800' : 'text-amber-800'
              }`}>
                {earlyWarning.message}
              </p>
            </div>
          </div>
        )}

        {/* Spoilage Prediction */}
        <div className="rounded-lg bg-white border border-border p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-semibold text-foreground">Spoilage Prediction</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Estimated Loss</p>
              <p className="text-lg font-bold text-red-600">{estimatedSpoilagePercentage.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">
                {estimatedSpoilageQuantity.toFixed(1)} {unit}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Timeframe</p>
              <p className="text-lg font-bold text-foreground">{formatTimeframe(timeframeHours)}</p>
              <p className="text-xs text-muted-foreground">Until critical</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Economic Impact</p>
              <p className="text-lg font-bold text-red-600">
                {estimatedEconomicLoss ? formatKES(estimatedEconomicLoss) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Market Recommendation */}
        {marketRecommendation && (
          <div className={`rounded-lg border-2 p-4 mb-4 ${
            marketRecommendation.action === 'sell_immediately'
              ? 'bg-red-50 border-red-200'
              : marketRecommendation.action === 'sell_soon'
              ? 'bg-orange-50 border-orange-200'
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-start gap-2 mb-2">
              <MapPin className={`h-4 w-4 mt-0.5 ${
                marketRecommendation.action === 'sell_immediately'
                  ? 'text-red-600'
                  : marketRecommendation.action === 'sell_soon'
                  ? 'text-orange-600'
                  : 'text-blue-600'
              }`} />
              <div className="flex-1">
                <p className={`text-sm font-semibold ${
                  marketRecommendation.action === 'sell_immediately'
                    ? 'text-red-800'
                    : marketRecommendation.action === 'sell_soon'
                    ? 'text-orange-800'
                    : 'text-blue-800'
                }`}>
                  Market Recommendation
                </p>
                <p className={`text-sm mt-1 ${
                  marketRecommendation.action === 'sell_immediately'
                    ? 'text-red-700'
                    : marketRecommendation.action === 'sell_soon'
                    ? 'text-orange-700'
                    : 'text-blue-700'
                }`}>
                  {marketRecommendation.message}
                </p>
              </div>
            </div>
            {marketRecommendation.bestMarket && (
              <div className="mt-3 flex items-center gap-3 text-sm">
                <span className="font-medium text-foreground">
                  🏪 {marketRecommendation.bestMarket.name}
                </span>
                <span className="text-muted-foreground">
                  {marketRecommendation.bestMarket.pricePerKg.toFixed(2)} KES/kg
                </span>
                <span className="text-muted-foreground">
                  ({marketRecommendation.bestMarket.distance} km)
                </span>
              </div>
            )}
          </div>
        )}

        {/* Immediate Actions */}
        {immediateActions.length > 0 && (
          <div className="rounded-lg bg-white border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-semibold text-foreground">Recommended Actions</span>
            </div>
            <ul className="space-y-2">
              {immediateActions.slice(0, 4).map((action, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary mt-0.5">•</span>
                  {action}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
