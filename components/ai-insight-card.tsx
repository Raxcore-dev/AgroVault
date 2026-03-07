'use client'

import { useState } from 'react'
import {
  Brain,
  ShieldAlert,
  TrendingUp,
  Store,
  MapPin,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Loader2,
} from 'lucide-react'

export interface AIAnalysis {
  spoilage: {
    risk_level: 'low' | 'medium' | 'high'
    risk_reason: string
    recommendation: string
  }
  market: {
    action: 'sell' | 'hold' | 'monitor'
    recommended_market: string
    location: string
    price_per_kg: number
    reason: string
  } | null
  raw_input: {
    commodity: string
    temperature: number
    humidity: number
    storage_duration_days: number
    location: string
  }
}

interface AIInsightCardProps {
  analysis: AIAnalysis
  storageUnitName: string
  commodityName: string
  storageUnitId?: string
  commodityId?: string
  onReanalyze?: (storageUnitId: string, commodityId: string) => void
  isReanalyzing?: boolean
}

const riskColors = {
  high: {
    gradient: 'from-red-500/10 to-orange-500/10',
    border: 'border-red-300 dark:border-red-700',
    badge: 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200',
    glow: 'shadow-red-500/10',
    dot: 'bg-red-500',
  },
  medium: {
    gradient: 'from-amber-500/10 to-yellow-500/10',
    border: 'border-amber-300 dark:border-amber-700',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200',
    glow: 'shadow-amber-500/10',
    dot: 'bg-amber-500',
  },
  low: {
    gradient: 'from-green-500/10 to-emerald-500/10',
    border: 'border-green-300 dark:border-green-700',
    badge: 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-200',
    glow: 'shadow-green-500/10',
    dot: 'bg-green-500',
  },
}

const actionColors = {
  sell: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  hold: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  monitor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
}

export function AIInsightCard({
  analysis,
  storageUnitName,
  commodityName,
  storageUnitId,
  commodityId,
  onReanalyze,
  isReanalyzing,
}: AIInsightCardProps) {
  const [expanded, setExpanded] = useState(false)
  const risk = analysis.spoilage.risk_level
  const colors = riskColors[risk]

  return (
    <div
      className={`rounded-xl border ${colors.border} bg-gradient-to-br ${colors.gradient} p-5 shadow-lg ${colors.glow} transition-all hover:shadow-xl`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Brain className="h-5 w-5 text-primary" />
            <Sparkles className="h-2.5 w-2.5 text-primary absolute -top-1 -right-1" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">
              {storageUnitName}
            </h3>
            <p className="text-xs text-muted-foreground">{commodityName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors.badge}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${colors.dot} animate-pulse`} />
            AI: {risk.toUpperCase()}
          </span>
          {onReanalyze && storageUnitId && commodityId && (
            <button
              onClick={() => onReanalyze(storageUnitId, commodityId)}
              disabled={isReanalyzing}
              className="rounded-full p-1 hover:bg-white/30 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
              title="Re-analyze with AI"
            >
              {isReanalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* AI Risk Reason */}
      <div className="mb-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            AI Risk Assessment
          </span>
        </div>
        <p className="text-sm text-foreground leading-relaxed">
          {analysis.spoilage.risk_reason}
        </p>
      </div>

      {/* AI Recommendation */}
      <div className="rounded-lg bg-white/50 dark:bg-white/5 p-3 mb-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-[11px] font-medium text-primary uppercase tracking-wider">
            AI Recommendation
          </span>
        </div>
        <p className="text-sm text-foreground">{analysis.spoilage.recommendation}</p>
      </div>

      {/* Market Recommendation (when available) */}
      {analysis.market && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Store className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-primary">
                AI Market Recommendation
              </span>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                actionColors[analysis.market.action]
              }`}
            >
              {analysis.market.action}
            </span>
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">
            {analysis.market.recommended_market}
          </p>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {analysis.market.location}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs font-semibold text-green-700 dark:text-green-400">
                KES {analysis.market.price_per_kg}/kg
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {analysis.market.reason}
          </p>
        </div>
      )}

      {/* Expandable raw data */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
      >
        {expanded ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
        {expanded ? 'Hide' : 'Show'} analysis input
      </button>

      {expanded && (
        <div className="mt-2 rounded-lg bg-white/40 dark:bg-white/5 p-3 grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-muted-foreground">Commodity</span>
            <p className="text-xs font-medium capitalize">
              {analysis.raw_input.commodity}
            </p>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground">Location</span>
            <p className="text-xs font-medium">{analysis.raw_input.location}</p>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground">Temperature</span>
            <p className="text-xs font-medium">
              {analysis.raw_input.temperature.toFixed(1)}°C
            </p>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground">Humidity</span>
            <p className="text-xs font-medium">
              {analysis.raw_input.humidity.toFixed(1)}%
            </p>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground">Days Stored</span>
            <p className="text-xs font-medium">
              {analysis.raw_input.storage_duration_days} days
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export function AIInsightSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-5 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-5 w-5 rounded bg-muted" />
          <div>
            <div className="h-4 w-28 rounded bg-muted mb-1" />
            <div className="h-3 w-16 rounded bg-muted" />
          </div>
        </div>
        <div className="h-5 w-20 rounded-full bg-muted" />
      </div>
      <div className="space-y-2 mb-3">
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-4/5 rounded bg-muted" />
      </div>
      <div className="rounded-lg bg-muted/40 p-3 mb-3">
        <div className="h-3 w-full rounded bg-muted mb-1" />
        <div className="h-3 w-3/4 rounded bg-muted" />
      </div>
      <div className="h-3 w-24 rounded bg-muted" />
    </div>
  )
}
