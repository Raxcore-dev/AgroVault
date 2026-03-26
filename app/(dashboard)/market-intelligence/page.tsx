'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useAuth } from '@/lib/auth-context'
import {
  MapPin,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  BarChart3,
  AlertCircle,
  Clock,
  Globe,
  Navigation,
} from 'lucide-react'
import type { NationalMarketEntry } from '@/lib/services/marketInsightsService'

// ─── Types from API response ───────────────────────────────────────────────────

interface UserLocation {
  county: string | null
  region: string | null
  lat: number
  lng: number
}

interface ApiResponse {
  markets: NationalMarketEntry[]
  lastRefreshed: string
  userLocation: UserLocation | null
}

// ─── Demand Badge ──────────────────────────────────────────────────────────────

function DemandBadge({ level }: { level: 'high' | 'medium' | 'low' }) {
  const styles: Record<string, string> = {
    high:   'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-amber-100 text-amber-800 border-amber-200',
    low:    'bg-red-100 text-red-800 border-red-200',
  }
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[level]}`}>
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  )
}

// ─── Trend Icon ────────────────────────────────────────────────────────────────

function TrendCell({ trend, label }: { trend: 'increasing' | 'stable' | 'decreasing'; label: string }) {
  const config: Record<string, { icon: typeof TrendingUp; cls: string }> = {
    increasing: { icon: TrendingUp,   cls: 'text-green-700' },
    stable:     { icon: Minus,        cls: 'text-blue-700'  },
    decreasing: { icon: TrendingDown, cls: 'text-red-700'   },
  }
  const { icon: Icon, cls } = config[trend]
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-medium ${cls}`}>
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </span>
  )
}

// ─── Summary Stat Card ─────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string
  value: string
  sub?: string
  icon: typeof Globe
  color: string
}) {
  return (
    <div className="card-elevated rounded-xl border border-border p-5 flex items-start gap-4">
      <div className={`rounded-lg p-2.5 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground mt-0.5 truncate">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function MarketIntelligencePage() {
  const { token, user } = useAuth()

  const [data, setData]           = useState<ApiResponse | null>(null)
  const [loading, setLoading]     = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [search, setSearch]       = useState('')
  const [filterCounty, setFilterCounty] = useState('')
  const [filterTrend, setFilterTrend]   = useState('')

  const fetchData = useCallback(async (showRefreshing = false) => {
    if (!token) return
    if (showRefreshing) setRefreshing(true)
    else setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/market-intelligence', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
      if (!res.ok) throw new Error('Failed to load market data')
      const json: ApiResponse = await res.json()
      setData(json)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [token])

  useEffect(() => { fetchData() }, [fetchData])

  // Auto-refresh every 15 minutes
  useEffect(() => {
    const id = setInterval(() => fetchData(true), 15 * 60 * 1000)
    return () => clearInterval(id)
  }, [fetchData])

  // ── Derived data ─────────────────────────────────────────────────────────────

  const markets = data?.markets ?? []

  const allCounties = useMemo(
    () => Array.from(new Set(markets.map((m) => m.county))).sort(),
    [markets],
  )

  const filtered = useMemo(() => {
    let list = markets
    const q = search.toLowerCase()
    if (q) list = list.filter((m) => m.commodity.toLowerCase().includes(q) || m.marketName.toLowerCase().includes(q) || m.county.toLowerCase().includes(q))
    if (filterCounty) list = list.filter((m) => m.county === filterCounty)
    if (filterTrend)  list = list.filter((m) => m.priceTrend === filterTrend)
    return list
  }, [markets, search, filterCounty, filterTrend])

  // Summary stats
  const totalMarkets   = markets.length
  const rising         = markets.filter((m) => m.priceTrend === 'increasing').length
  const falling        = markets.filter((m) => m.priceTrend === 'decreasing').length
  const highDemand     = markets.filter((m) => m.demandLevel === 'high').length
  const avgPrice       = markets.length
    ? (markets.reduce((s, m) => s + m.pricePerKg, 0) / markets.length).toFixed(2)
    : '—'

  const topCommodity = useMemo(() => {
    const map = new Map<string, number>()
    markets.filter((m) => m.demandLevel === 'high').forEach((m) => {
      map.set(m.commodity, (map.get(m.commodity) ?? 0) + 1)
    })
    let top = '—'
    let max = 0
    map.forEach((count, name) => { if (count > max) { max = count; top = name } })
    return top
  }, [markets])

  const locationLabel = data?.userLocation?.county
    ? `${data.userLocation.county}${data.userLocation.region ? `, ${data.userLocation.region}` : ''}`
    : null

  // ── Render ────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <p className="text-sm">Loading national market data…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="card-elevated rounded-xl border border-red-200 bg-red-50 p-8 max-w-sm w-full text-center">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <p className="font-semibold text-red-800">Could not load market data</p>
          <p className="text-sm text-red-600 mt-1">{error}</p>
          <button
            onClick={() => fetchData()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen space-y-6 p-4 sm:p-6 lg:p-8">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            National Market Intelligence
          </h1>
          <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1">
            {locationLabel ? (
              <>
                <Navigation className="h-3.5 w-3.5 shrink-0 text-primary" />
                Sorted by proximity to <strong className="ml-1">{locationLabel}</strong>
              </>
            ) : (
              <>
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                Covering all Kenyan counties &mdash; enable location for distance sorting
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {data?.lastRefreshed && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Updated {new Date(data.lastRefreshed).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Markets"      value={totalMarkets.toString()} sub={`${allCounties.length} counties`}     icon={Globe}       color="bg-primary/10 text-primary" />
        <StatCard label="Avg Price/kg"       value={`KES ${avgPrice}`}       sub="across all commodities"               icon={BarChart3}   color="bg-blue-50 text-blue-700" />
        <StatCard label="Rising Prices"      value={rising.toString()}        sub={`${falling} falling`}                 icon={TrendingUp}  color="bg-green-50 text-green-700" />
        <StatCard label="High-Demand Leader" value={topCommodity}             sub={`${highDemand} high-demand entries`} icon={TrendingUp}  color="bg-amber-50 text-amber-700" />
      </div>

      {/* ── Filters ── */}
      <div className="card-elevated rounded-xl border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search commodity, market or county…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          {/* County filter */}
          <select
            value={filterCounty}
            onChange={(e) => setFilterCounty(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-w-[160px]"
          >
            <option value="">All Counties</option>
            {allCounties.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {/* Trend filter */}
          <select
            value={filterTrend}
            onChange={(e) => setFilterTrend(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-w-[150px]"
          >
            <option value="">All Trends</option>
            <option value="increasing">↑ Rising</option>
            <option value="stable">→ Stable</option>
            <option value="decreasing">↓ Falling</option>
          </select>
        </div>
      </div>

      {/* ── Market Table ── */}
      <div className="card-elevated rounded-xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/20">
          <h2 className="font-semibold text-foreground">
            Market Price Board
          </h2>
          <span className="text-xs text-muted-foreground">
            {filtered.length} of {totalMarkets} entries
          </span>
        </div>

        {/* Mobile cards */}
        <div className="divide-y divide-border sm:hidden">
          {filtered.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">No markets match your filters.</p>
          ) : (
            filtered.map((m) => (
              <div key={m.id} className="px-4 py-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-foreground">{m.commodity}</p>
                    <p className="text-xs text-muted-foreground">{m.marketName}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-0.5 mt-0.5">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {m.county}
                      {m.distanceKm != null && (
                        <span className="ml-1 text-primary font-medium">({m.distanceKm} km)</span>
                      )}
                    </p>
                  </div>
                  <DemandBadge level={m.demandLevel} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-foreground">
                    KES {m.pricePerKg.toFixed(2)}<span className="text-xs font-normal text-muted-foreground">/kg</span>
                  </span>
                  <TrendCell trend={m.priceTrend} label={m.trendLabel} />
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3 shrink-0" />
                  {m.lastUpdated}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/10">
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">Commodity</th>
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">Market</th>
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">County</th>
                <th className="px-5 py-3 text-right font-semibold text-muted-foreground">Price/kg</th>
                <th className="px-5 py-3 text-center font-semibold text-muted-foreground">Demand</th>
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">Trend</th>
                {locationLabel && (
                  <th className="px-5 py-3 text-right font-semibold text-muted-foreground">Distance</th>
                )}
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={locationLabel ? 8 : 7} className="px-5 py-10 text-center text-muted-foreground">
                    No markets match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3 font-semibold text-foreground">{m.commodity}</td>
                    <td className="px-5 py-3 text-muted-foreground">{m.marketName}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                        {m.county}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="font-bold text-foreground">KES {m.pricePerKg.toFixed(2)}</span>
                      {m.previousPricePerKg != null && (
                        <span className={`ml-1 text-xs ${m.pricePerKg >= m.previousPricePerKg ? 'text-green-600' : 'text-red-600'}`}>
                          {m.pricePerKg >= m.previousPricePerKg ? '▲' : '▼'}
                          {Math.abs(m.pricePerKg - m.previousPricePerKg).toFixed(1)}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <DemandBadge level={m.demandLevel} />
                    </td>
                    <td className="px-5 py-3">
                      <TrendCell trend={m.priceTrend} label={m.trendLabel} />
                    </td>
                    {locationLabel && (
                      <td className="px-5 py-3 text-right text-sm">
                        {m.distanceKm != null ? (
                          <span className="text-primary font-medium">{m.distanceKm} km</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    )}
                    <td className="px-5 py-3 text-muted-foreground text-xs">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 shrink-0" />
                        {m.lastUpdated}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Location Tip for users without GPS ── */}
      {!data?.userLocation && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <MapPin className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">Enable location for personalised sorting</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Allow location access when prompted at login so markets near you appear at the top of the list.
            </p>
          </div>
        </div>
      )}

    </div>
  )
}
