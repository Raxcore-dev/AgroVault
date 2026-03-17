/**
 * Spoilage Prediction Card Component
 * 
 * Displays spoilage risk predictions for commodities in storage.
 * Shows risk level, estimated losses, and actionable recommendations.
 */

'use client'

import { AlertTriangle, TrendingDown, DollarSign, Clock, ThermometerSun, Droplets, Package, ArrowRight } from 'lucide-react'
import { formatKES, formatTimeframe } from '@/lib/services/spoilage-prediction'

interface SpoilagePredictionCardProps {
  prediction: {
    storageUnitName: string
    storageLocation: string
    commodityName: string
    quantityStored: number
    unit: string
    currentTemperature: number
    currentHumidity: number
    riskLevel: {
      level: 'safe' | 'moderate' | 'high'
      color: 'green' | 'orange' | 'red'
      label: string
    }
    estimatedSpoilagePercentage: number
    estimatedSpoilageQuantity: number
    timeframeHours: number
    estimatedEconomicLoss?: number
    immediateActions: string[]
    marketRecommendation?: string
    lastReadingTime: string
  }
}

export function SpoilagePredictionCard({ prediction }: SpoilagePredictionCardProps) {
  const {
    storageUnitName,
    storageLocation,
    commodityName,
    quantityStored,
    unit,
    currentTemperature,
    currentHumidity,
    riskLevel,
    estimatedSpoilagePercentage,
    estimatedSpoilageQuantity,
    timeframeHours,
    estimatedEconomicLoss,
    immediateActions,
    marketRecommendation
  } = prediction

  // Color classes based on risk level
  const riskColors = {
    safe: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      badge: 'bg-green-100 text-green-800',
      icon: 'text-green-600'
    },
    moderate: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-700',
      badge: 'bg-orange-100 text-orange-800',
      icon: 'text-orange-600'
    },
    high: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      badge: 'bg-red-100 text-red-800',
      icon: 'text-red-600'
    }
  }

  const colors = riskColors[riskLevel.level]

  return (
    <div className={`card-elevated rounded-xl border-2 ${colors.border} ${colors.bg} overflow-hidden`}>
      {/* Header */}
      <div className="p-5 border-b border-border bg-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold text-foreground">{storageUnitName}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{storageLocation}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.badge}`}>
            {riskLevel.label}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-foreground">{commodityName}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{quantityStored} {unit}</span>
          </div>
        </div>
      </div>

      {/* Current Conditions */}
      <div className="p-5 bg-white border-b border-border">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Current Conditions</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <ThermometerSun className={`h-5 w-5 ${colors.icon}`} />
            <div>
              <p className="text-xs text-muted-foreground">Temperature</p>
              <p className={`text-lg font-bold ${colors.text}`}>{currentTemperature}°C</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Droplets className={`h-5 w-5 ${colors.icon}`} />
            <div>
              <p className="text-xs text-muted-foreground">Humidity</p>
              <p className={`text-lg font-bold ${colors.text}`}>{currentHumidity}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Spoilage Prediction */}
      {riskLevel.level !== 'safe' && (
        <div className={`p-5 ${colors.bg}`}>
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className={`h-5 w-5 ${colors.icon} mt-0.5`} />
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-1">Spoilage Risk Detected</h4>
              <p className="text-sm text-muted-foreground">
                If current conditions persist for {formatTimeframe(timeframeHours)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className={`rounded-lg border ${colors.border} bg-white p-3`}>
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className={`h-4 w-4 ${colors.icon}`} />
                <p className="text-xs text-muted-foreground">Estimated Spoilage</p>
              </div>
              <p className={`text-2xl font-bold ${colors.text}`}>{estimatedSpoilagePercentage}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                ≈ {estimatedSpoilageQuantity.toFixed(1)} {unit}
              </p>
            </div>

            {estimatedEconomicLoss && (
              <div className={`rounded-lg border ${colors.border} bg-white p-3`}>
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className={`h-4 w-4 ${colors.icon}`} />
                  <p className="text-xs text-muted-foreground">Potential Loss</p>
                </div>
                <p className={`text-xl font-bold ${colors.text}`}>
                  {formatKES(estimatedEconomicLoss)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Economic impact</p>
              </div>
            )}
          </div>

          {/* Immediate Actions */}
          <div className="mb-4">
            <h5 className="text-xs font-semibold text-foreground uppercase mb-2">Immediate Actions</h5>
            <ul className="space-y-1.5">
              {immediateActions.map((action, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                  <ArrowRight className={`h-4 w-4 ${colors.icon} mt-0.5 shrink-0`} />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Market Recommendation */}
          {marketRecommendation && (
            <div className={`rounded-lg border ${colors.border} bg-white p-3`}>
              <div className="flex items-start gap-2">
                <Clock className={`h-4 w-4 ${colors.icon} mt-0.5`} />
                <div>
                  <p className="text-xs font-semibold text-foreground mb-1">Market Recommendation</p>
                  <p className="text-sm text-muted-foreground">{marketRecommendation}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Safe Conditions Message */}
      {riskLevel.level === 'safe' && (
        <div className="p-5 bg-green-50">
          <div className="flex items-center gap-2 text-green-700">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-sm font-medium">Storage conditions are optimal. Continue monitoring regularly.</p>
          </div>
        </div>
      )}
    </div>
  )
}
