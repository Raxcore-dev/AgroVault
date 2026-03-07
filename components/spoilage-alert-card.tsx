'use client'

import { AlertTriangle, Thermometer, Droplets, Clock, TrendingDown, TrendingUp } from 'lucide-react'

export interface SpoilageAssessment {
  storageUnitId: string
  storageUnitName: string
  commodityId: string
  commodityName: string
  riskLevel: 'low' | 'medium' | 'high'
  temperature: number
  humidity: number
  daysStored: number
  maxStorageDays: number
  reasons: string[]
  recommendation?: {
    marketId: string
    marketName: string
    location: string
    pricePerKg: number
    distanceKm: number
  } | null
}

const riskConfig = {
  high: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800',
    badge: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    icon: 'text-red-600 dark:text-red-400',
    label: 'HIGH RISK',
  },
  medium: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
    icon: 'text-amber-600 dark:text-amber-400',
    label: 'MEDIUM RISK',
  },
  low: {
    bg: 'bg-green-50 dark:bg-green-950/30',
    border: 'border-green-200 dark:border-green-800',
    badge: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    icon: 'text-green-600 dark:text-green-400',
    label: 'LOW RISK',
  },
}

export function SpoilageAlertCard({ assessment }: { assessment: SpoilageAssessment }) {
  const config = riskConfig[assessment.riskLevel]
  const storageProgress = Math.min(
    100,
    Math.round((assessment.daysStored / assessment.maxStorageDays) * 100)
  )

  return (
    <div className={`rounded-xl border ${config.border} ${config.bg} p-5`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className={`h-5 w-5 ${config.icon}`} />
          <div>
            <h3 className="font-semibold text-foreground text-sm">
              {assessment.storageUnitName}
            </h3>
            <p className="text-xs text-muted-foreground">
              {assessment.commodityName}
            </p>
          </div>
        </div>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.badge}`}>
          {config.label}
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="rounded-lg bg-white/60 dark:bg-white/5 p-2.5">
          <div className="flex items-center gap-1 mb-1">
            <Thermometer className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground">Temp</span>
          </div>
          <p className="text-sm font-bold text-foreground">
            {assessment.temperature.toFixed(1)}°C
          </p>
        </div>
        <div className="rounded-lg bg-white/60 dark:bg-white/5 p-2.5">
          <div className="flex items-center gap-1 mb-1">
            <Droplets className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground">Humidity</span>
          </div>
          <p className="text-sm font-bold text-foreground">
            {assessment.humidity.toFixed(1)}%
          </p>
        </div>
        <div className="rounded-lg bg-white/60 dark:bg-white/5 p-2.5">
          <div className="flex items-center gap-1 mb-1">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground">Stored</span>
          </div>
          <p className="text-sm font-bold text-foreground">
            {assessment.daysStored}d
          </p>
        </div>
      </div>

      {/* Storage duration progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
          <span>Storage Duration</span>
          <span>{assessment.daysStored} / {assessment.maxStorageDays} days</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/60 dark:bg-white/10 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              storageProgress > 100
                ? 'bg-red-500'
                : storageProgress > 80
                ? 'bg-amber-500'
                : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(storageProgress, 100)}%` }}
          />
        </div>
      </div>

      {/* Reasons */}
      {assessment.reasons.length > 0 && (
        <div className="mb-3">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
            Issues Detected
          </p>
          <ul className="space-y-1">
            {assessment.reasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-foreground/80">
                <span className={`mt-1 h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                  assessment.riskLevel === 'high' ? 'bg-red-500' : assessment.riskLevel === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                }`} />
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Market Recommendation */}
      {assessment.recommendation && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 mt-3">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <p className="text-xs font-semibold text-primary">Market Recommendation</p>
          </div>
          <p className="text-sm text-foreground">
            Sell immediately at{' '}
            <span className="font-bold">{assessment.recommendation.marketName}</span>
            {' '}({assessment.recommendation.location})
          </p>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-green-600" />
              <span className="text-xs font-semibold text-green-700 dark:text-green-400">
                KES {assessment.recommendation.pricePerKg}/kg
              </span>
            </div>
            {assessment.recommendation.distanceKm > 0 && (
              <span className="text-xs text-muted-foreground">
                {assessment.recommendation.distanceKm} km away
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function SpoilageAlertSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded bg-muted" />
          <div>
            <div className="h-4 w-32 rounded bg-muted mb-1" />
            <div className="h-3 w-20 rounded bg-muted" />
          </div>
        </div>
        <div className="h-5 w-20 rounded-full bg-muted" />
      </div>
      <div className="grid grid-cols-3 gap-3 mb-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 rounded-lg bg-muted" />
        ))}
      </div>
      <div className="h-1.5 rounded-full bg-muted mb-3" />
      <div className="space-y-1.5">
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-3/4 rounded bg-muted" />
      </div>
    </div>
  )
}
