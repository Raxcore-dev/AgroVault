'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRoleGuard } from '@/hooks/use-role-guard'
import Link from 'next/link'
import {
  MapPin,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Package,
  Store,
  AlertTriangle,
  Clock,
  Navigation,
} from 'lucide-react'
import type { MarketInsight } from '@/lib/services/marketInsightsService'

// ─── Demand Badge ──────────────────────────────────────────────────────────────

function DemandBadge({ level }: { level: 'high' | 'medium' | 'low' }) {
  const styles: Record<string, string> = {
    high:   'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-amber-100 text-amber-800 border-amber-200',
    low:    'bg-red-100 text-red-800 border-red-200',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[level]}`}
    >
      {level.charAt(0).toUpperCase() + level.slice(1)} Demand
    </span>
  )
}

// ─── Trend Badge ───────────────────────────────────────────────────────────────

function TrendBadge({ trend }: { trend: 'increasing' | 'stable' | 'decreasing' }) {
  const config: Record<string, { icon: typeof TrendingUp; color: string; label: string }> = {
    increasing: { icon: TrendingUp,   color: 'text-green-700 bg-green-50 border-green-200', label: 'Increasing' },
    stable:     { icon: Minus,        color: 'text-blue-700 bg-blue-50 border-blue-200',    label: 'Stable'     },
    decreasing: { icon: TrendingDown, color: 'text-red-700 bg-red-50 border-red-200',       label: 'Decreasing' },
  }
  const { icon: Icon, color, label } = config[trend]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${color}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  )
}

// ─── Insight Card ──────────────────────────────────────────────────────────────

function InsightCard({ insight }: { insight: MarketInsight }) {
  const riskBorder = insight.hasSpoilageRisk ? 'border-red-300' : 'border-border'
  const headerBg   = insight.hasSpoilageRisk ? 'bg-red-50'      : 'bg-muted/30'
  const footerBg   = insight.hasSpoilageRisk
    ? 'bg-red-50 border-red-100'
    : 'bg-primary/5 border-primary/10'
  const recColor   = insight.hasSpoilageRisk ? 'text-red-800' : 'text-foreground'

  const trendColor =
    insight.priceTrend === 'increasing' ? 'text-green-700' :
    insight.priceTrend === 'decreasing' ? 'text-red-700'   : 'text-blue-700'

  return (
    <div className={`card-elevated rounded-xl overflow-hidden border ${riskBorder} flex flex-col`}>
      {/* Header */}
      <div className={`px-5 py-4 flex items-start justify-between gap-3 ${headerBg}`}>
        <div className="flex items-start gap-2 min-w-0">
          {insight.hasSpoilageRisk && (
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
          )}
          <div className="min-w-0">
            <h3 className="text-base font-bold text-foreground truncate">
              {insight.commodityName}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground flex items-center gap-1">
              <Package className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {insight.quantity.toLocaleString()} kg &middot; {insight.storageUnitName}
              </span>
            </p>
          </div>
        </div>
        <DemandBadge level={insight.demandLevel} />
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-3 flex-1">
        {/* Current price */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Current Price</span>
          <span className="text-xl font-bold text-foreground">
            KES {insight.pricePerKg.toFixed(2)}
            <span className="text-sm font-normal text-muted-foreground">/kg</span>
          </span>
        </div>

        {/* Previous price */}
        {insight.previousPricePerKg != null && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Previous Price</span>
            <span className="text-sm text-foreground">
              KES {insight.previousPricePerKg.toFixed(2)}/kg
            </span>
          </div>
        )}

        {/* Trend */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Price Trend</span>
          <TrendBadge trend={insight.priceTrend} />
        </div>

        {/* Trend detail */}
        {insight.previousPricePerKg != null && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Trend Detail</span>
            <span className={`text-sm font-medium ${trendColor}`}>
              {insight.trendLabel}
            </span>
          </div>
        )}

        <div className="border-t border-border" />

        {/* Best market */}
        <div className="flex items-start justify-between gap-3">
          <span className="text-sm text-muted-foreground shrink-0">Recommended Market</span>
          <div className="text-right min-w-0">
            <p className="text-sm font-semibold text-foreground">{insight.marketName}</p>
            <p className="text-xs text-muted-foreground flex items-center justify-end gap-1 mt-0.5">
              <MapPin className="h-3 w-3 shrink-0" />
              {insight.marketLocation} &middot; {insight.distanceKm} km
            </p>
          </div>
        </div>

        {/* Last updated */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Last Updated</span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {insight.lastUpdated}
          </span>
        </div>
      </div>

      {/* Recommendation footer */}
      <div className={`px-5 py-3 border-t ${footerBg}`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
          Recommendation
        </p>
        <p className={`text-sm font-medium leading-relaxed ${recColor}`}>
          {insight.recommendation}
        </p>
      </div>
    </div>
  )
}

// ─── Skeleton Loader ───────────────────────────────────────────────────────────

function InsightSkeleton() {
  return (
    <div className="card-elevated rounded-xl overflow-hidden animate-pulse">
      <div className="bg-muted/50 px-5 py-4 flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="h-3 w-48 rounded bg-muted" />
        </div>
        <div className="h-6 w-24 rounded-full bg-muted" />
      </div>
      <div className="px-5 py-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="h-3 w-28 rounded bg-muted" />
            <div className="h-3 w-20 rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="px-5 py-3 bg-muted/30 border-t border-border space-y-2">
        <div className="h-2 w-20 rounded bg-muted" />
        <div className="h-3 w-full rounded bg-muted" />
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function MarketInsightsPage() {
  const { allowed, isLoading: roleLoading } = useRoleGuard('farmer')
  const { token } = useAuth()

  const [insights, setInsights]           = useState<MarketInsight[]>([])
  const [farmerLocation, setFarmerLocation] = useState('')
  const [lastRefreshed, setLastRefreshed]  = useState<string | null>(null)
  const [loading, setLoading]             = useState(true)
  const [refreshing, setRefreshing]       = useState(false)
  const [error, setError]                 = useState<string | null>(null)

  const fetchInsights = useCallback(
    async (forceRefresh = false) => {
      if (!token) return
      try {
        const res = await fetch('/api/market-insights', {
          method: forceRefresh ? 'POST' : 'GET',
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Request failed')
        const data = await res.json()
        setInsights(data.insights ?? [])
        setFarmerLocation(data.farmerLocation ?? '')
        setLastRefreshed(data.lastRefreshed ?? null)
        setError(null)
      } catch {
        setError('Failed to load market insights. Please try refreshing.')
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [token],
  )

  useEffect(() => {
    fetchInsights()
    // Auto-refresh every 15 minutes
    const id = setInterval(() => fetchInsights(), 15 * 60 * 1000)
    return () => clearInterval(id)
  }, [fetchInsights])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchInsights(true)
  }

  if (roleLoading || !allowed) return null

  // ── Computed stats ────────────────────────────────────────────────────────────
  const highDemandCount = insights.filter((i) => i.demandLevel === 'high').length
  const increasingCount  = insights.filter((i) => i.priceTrend === 'increasing').length
  const spoilageCount   = insights.filter((i) => i.hasSpoilageRisk).length

  const refreshedAt = lastRefreshed
    ? new Date(lastRefreshed).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })
    : null

  // Sort: spoilage-risk first → high demand → others
  const demandOrder = { high: 0, medium: 1, low: 2 } as const
  const sortedInsights = [...insights].sort((a, b) => {
    if (a.hasSpoilageRisk !== b.hasSpoilageRisk) return a.hasSpoilageRisk ? -1 : 1
    return demandOrder[a.demandLevel] - demandOrder[b.demandLevel]
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-6 lg:px-8">

        {/* ── Page Header ── */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-xs mb-2">
              <Store className="h-3.5 w-3.5" />
              Farmer Market Intelligence
            </div>
            <h1 className="text-2xl font-bold text-foreground">Market Insights</h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {farmerLocation && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {farmerLocation}
                </span>
              )}
              {refreshedAt && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Prices fetched at {refreshedAt}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="btn-primary inline-flex items-center gap-2 text-sm disabled:opacity-50 self-start md:self-auto"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Prices'}
          </button>
        </div>

        {/* ── Summary Stats ── */}
        {!loading && insights.length > 0 && (
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="card-elevated rounded-xl p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Commodities Tracked
              </p>
              <p className="mt-2 text-2xl font-bold text-foreground">{insights.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Across your storage units</p>
            </div>
            <div className="card-elevated rounded-xl p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                High Demand
              </p>
              <p className="mt-2 text-2xl font-bold text-green-600">{highDemandCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Commodities in high demand</p>
            </div>
            <div className="card-elevated rounded-xl p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Prices Rising
              </p>
              <p className="mt-2 text-2xl font-bold text-blue-600">{increasingCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Favourable price trend</p>
            </div>
            <div
              className={`card-elevated rounded-xl p-4 ${
                spoilageCount > 0 ? 'border border-red-200 bg-red-50/50' : ''
              }`}
            >
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Spoilage Alerts
              </p>
              <p
                className={`mt-2 text-2xl font-bold ${
                  spoilageCount > 0 ? 'text-red-600' : 'text-foreground'
                }`}
              >
                {spoilageCount}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Require immediate action</p>
            </div>
          </div>
        )}

        {/* ── Error State ── */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800">Unable to load market insights</p>
              <p className="text-sm text-red-700 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* ── Loading Skeletons ── */}
        {loading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => <InsightSkeleton key={i} />)}
          </div>
        )}

        {/* ── Empty State ── */}
        {!loading && !error && insights.length === 0 && (
          <div className="card-elevated rounded-xl p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground opacity-40 mb-4" />
            <h3 className="text-base font-semibold text-foreground mb-1">No commodities found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Add commodities to your storage units to see market insights and
              personalised selling recommendations.
            </p>
          </div>
        )}

        {/* ── Content ── */}
        {!loading && insights.length > 0 && (
          <>
            {/* Spoilage urgency banner */}
            {spoilageCount > 0 && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800">
                    Urgent: Spoilage Risk Detected
                  </p>
                  <p className="text-sm text-red-700 mt-0.5">
                    {spoilageCount} commodit{spoilageCount === 1 ? 'y requires' : 'ies require'}{' '}
                    immediate action. Review the highlighted cards below and sell before further
                    deterioration.
                  </p>
                </div>
              </div>
            )}

            {/* Insight cards grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sortedInsights.map((insight, idx) => (
                <InsightCard
                  key={`${insight.normalizedCommodity}-${idx}`}
                  insight={insight}
                />
              ))}
            </div>

            {/* Summary table */}
            <div className="mt-8 card-elevated rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="text-base font-semibold text-foreground">
                  Market Insights Summary
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  All commodity market data for your location at a glance
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      {[
                        'Commodity', 'Market', 'Price / kg', 'Demand',
                        'Price Trend', 'Recommendation', 'Last Updated',
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {sortedInsights.map((insight, idx) => (
                      <tr
                        key={idx}
                        className={`hover:bg-muted/20 transition-colors ${
                          insight.hasSpoilageRisk ? 'bg-red-50/40' : ''
                        }`}
                      >
                        <td className="px-5 py-3 font-medium text-foreground whitespace-nowrap">
                          {insight.hasSpoilageRisk && (
                            <AlertTriangle className="inline h-3.5 w-3.5 text-red-500 mr-1 -mt-0.5" />
                          )}
                          {insight.commodityName}
                        </td>
                        <td className="px-5 py-3 text-muted-foreground whitespace-nowrap">
                          {insight.marketName}
                          <span className="text-xs ml-1 text-muted-foreground/70">
                            · {insight.marketLocation}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-semibold text-foreground whitespace-nowrap">
                          KES {insight.pricePerKg.toFixed(2)}
                        </td>
                        <td className="px-5 py-3">
                          <DemandBadge level={insight.demandLevel} />
                        </td>
                        <td className="px-5 py-3">
                          <TrendBadge trend={insight.priceTrend} />
                        </td>
                        <td className="px-5 py-3 text-xs text-muted-foreground max-w-xs">
                          {insight.recommendation}
                        </td>
                        <td className="px-5 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {insight.lastUpdated}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ── Travel Advisory CTA ── */}
        {!loading && (
          <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Navigation className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">Ready to transport your produce?</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Before heading to the market, check the <strong>Market Travel Advisory</strong> to see
                  weather conditions at your destination and get a combined weather + price recommendation.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/market-travel-advisory"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 shrink-0"
            >
              <Navigation className="h-4 w-4" />
              Check Travel Advisory
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
