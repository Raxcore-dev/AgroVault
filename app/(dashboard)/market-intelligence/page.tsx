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
  Filter,
  Star,
  Award,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// ─── Types ───────────────────────────────────────────────────────────────────────

interface MarketData {
  id: string
  marketName: string
  location: string
  county: string
  commodity: string
  pricePerKg: number
  previousPricePerKg: number | null
  demandLevel: 'high' | 'medium' | 'low'
  priceTrend: 'increasing' | 'stable' | 'decreasing'
  latitude: number
  longitude: number
  priceChange?: number
  priceChangePercent?: number
  trendLabel?: string
  recommendation?: string
  distanceKm?: number | null
}

interface MarketSummary {
  totalMarkets: number
  avgPrice: number
  highDemand: number
  increasing: number
  stable: number
  decreasing: number
}

interface ApiResponse {
  markets: MarketData[]
  summary: MarketSummary
  bestMarkets: Record<string, MarketData>
  counties: string[]
  commodities: string[]
}

interface CountyData {
  name: string
  headquarters: string
  latitude: number
  longitude: number
  marketCount: number
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

function TrendCell({ trend, label, change }: { trend: 'increasing' | 'stable' | 'decreasing'; label: string; change?: number }) {
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
  value: string | number
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

// ─── Best Market Card ──────────────────────────────────────────────────────────

function BestMarketCard({
  commodity,
  market,
}: {
  commodity: string
  market: MarketData
}) {
  return (
    <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">
            Best Price for {commodity}
          </p>
          <p className="mt-1 text-lg font-bold text-green-800 dark:text-green-200">
            KES {market.pricePerKg.toFixed(2)}/kg
          </p>
          <p className="mt-1 text-sm text-green-700 dark:text-green-300 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {market.marketName}, {market.location}
          </p>
        </div>
        <Award className="h-8 w-8 text-green-600 dark:text-green-400" />
      </div>
    </div>
  )
}

// ─── County Selector Component ─────────────────────────────────────────────────

function CountySelector({
  selectedCounty,
  onSelectCounty,
  counties,
}: {
  selectedCounty: string
  onSelectCounty: (county: string) => void
  counties: string[]
}) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCounties = useMemo(() => {
    if (!searchQuery) return counties
    return counties.filter(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [counties, searchQuery])

  const selectedCountyData = counties.find(c => c === selectedCounty)

  return (
    <div className="relative">
      <button
        onClick={() => setSearchOpen(!searchOpen)}
        className="w-full flex items-center justify-between rounded-lg border border-input bg-background px-4 py-2.5 text-sm hover:bg-muted transition-colors"
      >
        <span className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          {selectedCountyData || 'Select County'}
        </span>
        {searchOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {searchOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setSearchOpen(false)}
          />
          <div className="absolute z-50 w-full mt-2 rounded-lg border border-border bg-popover shadow-lg max-h-80 overflow-hidden">
            <div className="p-2 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search counties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  autoFocus
                />
              </div>
            </div>
            <div className="overflow-y-auto max-h-60">
              {filteredCounties.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No counties found
                </div>
              ) : (
                filteredCounties.map((county) => (
                  <button
                    key={county}
                    onClick={() => {
                      onSelectCounty(county)
                      setSearchOpen(false)
                      setSearchQuery('')
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors flex items-center justify-between ${
                      selectedCounty === county ? 'bg-muted font-medium' : ''
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-primary/60" />
                      {county}
                    </span>
                    {selectedCounty === county && (
                      <Star className="h-3.5 w-3.5 text-primary fill-primary" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Main Page Component ───────────────────────────────────────────────────────

export default function MarketIntelligencePage() {
  const { token, user } = useAuth()

  const [data, setData]           = useState<ApiResponse | null>(null)
  const [counties, setCounties]   = useState<CountyData[]>([])
  const [loading, setLoading]     = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  
  // Filters
  const [selectedCounty, setSelectedCounty] = useState('')
  const [selectedCommodity, setSelectedCommodity] = useState('')
  const [selectedDemand, setSelectedDemand] = useState('')
  const [selectedTrend, setSelectedTrend] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showBestMarkets, setShowBestMarkets] = useState(true)

  const fetchData = useCallback(async (showRefreshing = false) => {
    if (!token) return
    if (showRefreshing) setRefreshing(true)
    else setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/markets?includeAnalysis=true', {
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

  const fetchCounties = useCallback(async () => {
    try {
      const res = await fetch('/api/counties')
      if (!res.ok) throw new Error('Failed to load counties')
      const json = await res.json()
      setCounties(json.counties)
    } catch (e) {
      console.error('Error fetching counties:', e)
    }
  }, [])

  useEffect(() => { 
    fetchData()
    fetchCounties()
  }, [fetchData, fetchCounties])

  // Auto-refresh every 15 minutes
  useEffect(() => {
    const id = setInterval(() => fetchData(true), 15 * 60 * 1000)
    return () => clearInterval(id)
  }, [fetchData])

  // ── Derived data ─────────────────────────────────────────────────────────────

  const markets = data?.markets ?? []

  const allCounties = useMemo(() => 
    data?.counties?.sort() || Array.from(new Set(markets.map((m) => m.county))).sort(),
    [data?.counties, markets],
  )

  const allCommodities = useMemo(() =>
    data?.commodities?.sort() || Array.from(new Set(markets.map((m) => m.commodity))).sort(),
    [data?.commodities, markets],
  )

  const filtered = useMemo(() => {
    let list = markets
    const q = searchQuery.toLowerCase()
    
    if (q) {
      list = list.filter((m) => 
        m.commodity.toLowerCase().includes(q) || 
        m.marketName.toLowerCase().includes(q) || 
        m.county.toLowerCase().includes(q)
      )
    }
    if (selectedCounty) list = list.filter((m) => m.county === selectedCounty)
    if (selectedCommodity) list = list.filter((m) => m.commodity === selectedCommodity)
    if (selectedDemand) list = list.filter((m) => m.demandLevel === selectedDemand)
    if (selectedTrend) list = list.filter((m) => m.priceTrend === selectedTrend)
    
    return list
  }, [markets, searchQuery, selectedCounty, selectedCommodity, selectedDemand, selectedTrend])

  const summary = data?.summary || {
    totalMarkets: markets.length,
    avgPrice: markets.length ? markets.reduce((s, m) => s + m.pricePerKg, 0) / markets.length : 0,
    highDemand: markets.filter((m) => m.demandLevel === 'high').length,
    increasing: markets.filter((m) => m.priceTrend === 'increasing').length,
    stable: markets.filter((m) => m.priceTrend === 'stable').length,
    decreasing: markets.filter((m) => m.priceTrend === 'decreasing').length,
  }

  const bestMarkets = data?.bestMarkets || {}

  const clearFilters = () => {
    setSelectedCounty('')
    setSelectedCommodity('')
    setSelectedDemand('')
    setSelectedTrend('')
    setSearchQuery('')
  }

  const hasActiveFilters = selectedCounty || selectedCommodity || selectedDemand || selectedTrend || searchQuery

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
            Kenya Market Intelligence
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time prices across all 47 counties
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Button
            variant="outline"
            onClick={() => fetchData(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard 
          label="Total Markets" 
          value={summary.totalMarkets} 
          sub={`${allCounties.length} counties`} 
          icon={Globe} 
          color="bg-primary/10 text-primary" 
        />
        <StatCard 
          label="Avg Price/kg" 
          value={`KES ${summary.avgPrice.toFixed(2)}`} 
          sub="across all commodities" 
          icon={BarChart3} 
          color="bg-blue-50 text-blue-700" 
        />
        <StatCard 
          label="Rising Prices" 
          value={summary.increasing} 
          sub={`${summary.decreasing} falling`} 
          icon={TrendingUp} 
          color="bg-green-50 text-green-700" 
        />
        <StatCard 
          label="High Demand" 
          value={summary.highDemand} 
          sub={`${summary.stable} stable`} 
          icon={Award} 
          color="bg-amber-50 text-amber-700" 
        />
      </div>

      {/* ── Best Markets Section ── */}
      {showBestMarkets && Object.keys(bestMarkets).length > 0 && (
        <div className="card-elevated rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-600" />
              <h2 className="font-semibold text-foreground">Best Markets by Commodity</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBestMarkets(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(bestMarkets).slice(0, 6).map(([commodity, market]) => (
              <BestMarketCard key={commodity} commodity={commodity} market={market} />
            ))}
          </div>
        </div>
      )}

      {/* ── Filters ── */}
      <div className="card-elevated rounded-xl border border-border p-4">
        <div className="flex flex-col gap-3">
          {/* Search and County Selector */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search commodity, market or county…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="sm:w-64">
              <CountySelector
                selectedCounty={selectedCounty}
                onSelectCounty={setSelectedCounty}
                counties={allCounties}
              />
            </div>
          </div>

          {/* Additional Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedCommodity}
              onChange={(e) => setSelectedCommodity(e.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-w-[180px]"
            >
              <option value="">All Commodities</option>
              {allCommodities.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>

            <select
              value={selectedDemand}
              onChange={(e) => setSelectedDemand(e.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-w-[150px]"
            >
              <option value="">All Demand</option>
              <option value="high">🟢 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🔴 Low</option>
            </select>

            <select
              value={selectedTrend}
              onChange={(e) => setSelectedTrend(e.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-w-[150px]"
            >
              <option value="">All Trends</option>
              <option value="increasing">↑ Rising</option>
              <option value="stable">→ Stable</option>
              <option value="decreasing">↓ Falling</option>
            </select>

            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <Filter className="h-3.5 w-3.5 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Market Table ── */}
      <div className="card-elevated rounded-xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/20">
          <h2 className="font-semibold text-foreground">
            Market Price Board
          </h2>
          <span className="text-xs text-muted-foreground">
            {filtered.length} of {markets.length} entries
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
                    </p>
                  </div>
                  <DemandBadge level={m.demandLevel} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-foreground">
                    KES {m.pricePerKg.toFixed(2)}<span className="text-xs font-normal text-muted-foreground">/kg</span>
                  </span>
                  <TrendCell trend={m.priceTrend} label={m.trendLabel || ''} change={m.priceChange} />
                </div>
                {m.recommendation && (
                  <p className="text-xs text-muted-foreground mt-2 p-2 rounded bg-muted/50">
                    {m.recommendation}
                  </p>
                )}
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
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-muted-foreground">
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
                      <TrendCell trend={m.priceTrend} label={m.trendLabel || ''} change={m.priceChange} />
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground max-w-xs truncate" title={m.recommendation}>
                      {m.recommendation || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
