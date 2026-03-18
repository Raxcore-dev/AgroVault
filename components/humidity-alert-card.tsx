'use client'

import { AlertTriangle, Droplets, Thermometer, TrendingUp, Clock, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HumidityAnalysis {
  status: 'safe' | 'moderate' | 'high'
  risk_level: string
  recommendations: string[]
  immediate_actions: string[]
  preventive_measures: string[]
  ai_insight: string
}

interface HumidityAlertCardProps {
  storageUnitName: string | null
  storageUnitLocation: string | null
  humidity: number
  temperature: number
  timestamp: string
  analysis: HumidityAnalysis
  riskScore: number
  alertPriority: string
  cropType?: string
  storageDuration?: number
  onDismiss?: () => void
}

export function HumidityAlertCard({
  storageUnitName,
  storageUnitLocation,
  humidity,
  temperature,
  timestamp,
  analysis,
  riskScore,
  alertPriority,
  cropType,
  storageDuration,
  onDismiss,
}: HumidityAlertCardProps) {
  const isHighRisk = analysis.status === 'high'
  const isModerate = analysis.status === 'moderate'

  return (
    <div
      className={cn(
        'rounded-xl border p-5 space-y-4 transition-all',
        isHighRisk && 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30',
        isModerate && 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30',
        !isHighRisk && !isModerate && 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30',
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div
            className={cn(
              'rounded-full p-2 shrink-0',
              isHighRisk && 'bg-red-100 dark:bg-red-900/40',
              isModerate && 'bg-amber-100 dark:bg-amber-900/40',
              !isHighRisk && !isModerate && 'bg-emerald-100 dark:bg-emerald-900/40',
            )}
          >
            {isHighRisk || isModerate ? (
              <AlertTriangle
                className={cn(
                  'h-5 w-5',
                  isHighRisk && 'text-red-600 dark:text-red-400',
                  isModerate && 'text-amber-600 dark:text-amber-400',
                )}
              />
            ) : (
              <Droplets className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-semibold text-foreground">
                {storageUnitName || 'Storage Unit'}
              </h3>
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                  isHighRisk && 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
                  isModerate && 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
                  !isHighRisk && !isModerate && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
                )}
              >
                {analysis.risk_level}
              </span>
            </div>
            {storageUnitLocation && (
              <p className="text-xs text-muted-foreground mt-0.5">{storageUnitLocation}</p>
            )}
            {cropType && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Crop: {cropType} {storageDuration && `• ${storageDuration} days in storage`}
              </p>
            )}
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="rounded-lg p-1 hover:bg-background/60 transition-colors shrink-0"
            aria-label="Dismiss alert"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Current Conditions */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-background/60 p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
            <Droplets className="h-3.5 w-3.5" />
            Humidity
          </div>
          <p
            className={cn(
              'text-xl font-bold',
              humidity > 75 && 'text-red-600',
              humidity > 65 && humidity <= 75 && 'text-amber-600',
              humidity <= 65 && 'text-emerald-600',
            )}
          >
            {humidity.toFixed(1)}%
          </p>
        </div>
        <div className="rounded-lg bg-background/60 p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
            <Thermometer className="h-3.5 w-3.5" />
            Temperature
          </div>
          <p className="text-xl font-bold text-foreground">{temperature.toFixed(1)}°C</p>
        </div>
        <div className="rounded-lg bg-background/60 p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
            <TrendingUp className="h-3.5 w-3.5" />
            Risk Score
          </div>
          <p
            className={cn(
              'text-xl font-bold',
              riskScore >= 70 && 'text-red-600',
              riskScore >= 50 && riskScore < 70 && 'text-amber-600',
              riskScore < 50 && 'text-emerald-600',
            )}
          >
            {riskScore}
          </p>
        </div>
      </div>

      {/* AI Insight */}
      <div
        className={cn(
          'rounded-lg p-3 border',
          isHighRisk && 'border-red-200 bg-red-100/50 dark:border-red-800 dark:bg-red-900/20',
          isModerate && 'border-amber-200 bg-amber-100/50 dark:border-amber-800 dark:bg-amber-900/20',
          !isHighRisk && !isModerate && 'border-emerald-200 bg-emerald-100/50 dark:border-emerald-800 dark:bg-emerald-900/20',
        )}
      >
        <p className="text-xs font-medium text-muted-foreground mb-1">🤖 AI Analysis</p>
        <p className="text-sm text-foreground leading-relaxed">{analysis.ai_insight}</p>
      </div>

      {/* Immediate Actions */}
      {analysis.immediate_actions.length > 0 && (
        <div>
          <h4
            className={cn(
              'text-sm font-semibold mb-2 flex items-center gap-1.5',
              isHighRisk && 'text-red-700 dark:text-red-300',
              isModerate && 'text-amber-700 dark:text-amber-300',
            )}
          >
            <AlertTriangle className="h-4 w-4" />
            Immediate Actions Required
          </h4>
          <ul className="space-y-1.5">
            {analysis.immediate_actions.map((action, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <span className="shrink-0 mt-0.5">•</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-2">Recommended Actions</h4>
          <ul className="space-y-1.5">
            {analysis.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="shrink-0 mt-0.5">✓</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Preventive Measures */}
      {analysis.preventive_measures.length > 0 && !isHighRisk && (
        <details className="group">
          <summary className="text-sm font-semibold text-foreground cursor-pointer hover:text-primary transition-colors">
            Preventive Measures ▾
          </summary>
          <ul className="mt-2 space-y-1.5 pl-4">
            {analysis.preventive_measures.map((measure, i) => (
              <li key={i} className="text-sm text-muted-foreground">
                • {measure}
              </li>
            ))}
          </ul>
        </details>
      )}

      {/* Timestamp */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {new Date(timestamp).toLocaleString()}
        </span>
        <span className="font-medium">Priority: {alertPriority.toUpperCase()}</span>
      </div>
    </div>
  )
}
