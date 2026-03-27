'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import {
  MapPin, CloudRain, Thermometer, Wind, Droplets,
  AlertTriangle, CheckCircle, Shield, ChevronDown, ChevronUp, RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { COUNTY_NAMES } from '@/lib/kenya-counties'

// ─── Types (mirrors travelAdvisoryService.ts shapes) ─────────────────────────

interface ForecastDay {
  date: string
  day: string
  temperature: number
  temperature_min: number
  temperature_max: number
  humidity: number
  wind_speed: number
  rain_probability: number
  rainfall_mm: number
  description: string
  icon: string
}

interface TravelForecastSummary {
  rain_probability_24h: number
  rain_probability_48h: number
  rainfall_mm_24h: number
  wind_speed: number
  temperature: number
  humidity: number
  description: string
  forecast_days: ForecastDay[]
}

interface TravelRecommendation {
  risk_level: 'safe' | 'moderate' | 'high'
  title: string
  message: string
  action: string
  icon: string
}

interface MarketTravelAdvisory {
  market_location: string
  farmer_location: string
  weather: TravelForecastSummary
  recommendation: TravelRecommendation
  combined_insight: string | null
  fetched_at: string
}

// ─── Risk helpers ─────────────────────────────────────────────────────────────

const RISK_CONFIG = {
  safe: {
    bg: 'bg-green-50 dark:bg-green-950/30',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-700 dark:text-green-400',
    badge: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    icon: CheckCircle,
  },
  moderate: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-700 dark:text-amber-400',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
    icon: Shield,
  },
  high: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-700 dark:text-red-400',
    badge: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    icon: AlertTriangle,
  },
} as const

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-lg font-bold text-foreground leading-none">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}

function ForecastStrip({ days }: { days: ForecastDay[] }) {
  const [open, setOpen] = useState(false)
  if (!days.length) return null
  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
      >
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        {open ? 'Hide' : 'Show'} 3-day forecast
      </button>
      {open && (
        <div className="grid grid-cols-3 gap-2">
          {days.slice(0, 3).map(d => (
            <div
              key={d.date}
              className="rounded-lg border border-border bg-muted/20 p-2.5 text-center"
            >
              <p className="text-xs font-semibold text-foreground mb-1">{d.day.slice(0, 3)}</p>
              <p className="text-xs text-muted-foreground mb-1">{d.description}</p>
              <p className="text-sm font-bold text-foreground">{Math.round(d.temperature)}°C</p>
              <p className="text-xs text-muted-foreground">
                <span className="text-blue-500">{d.rain_probability}%</span> rain
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface CountyTransportAdvisoryProps {
  className?: string
}

export function CountyTransportAdvisory({ className }: CountyTransportAdvisoryProps) {
  const { token } = useAuth()
  const [selectedCounty, setSelectedCounty] = useState<string>('Nairobi')
  const [advisory, setAdvisory] = useState<MarketTravelAdvisory | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAdvisory = useCallback(async (county: string) => {
    if (!token || !county) return
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ market: county, farmerLocation: county })
      const res = await fetch(`/api/travel-advisory?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: MarketTravelAdvisory = await res.json()
      setAdvisory(data)
    } catch {
      setError('Unable to fetch weather advisory. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [token])

  // Auto-fetch whenever county changes
  useEffect(() => {
    fetchAdvisory(selectedCounty)
  }, [selectedCounty, fetchAdvisory])

  const risk = advisory?.recommendation.risk_level ?? 'safe'
  const cfg = RISK_CONFIG[risk]
  const RiskIcon = cfg.icon

  return (
    <div className={cn('rounded-lg border border-border bg-card', className)}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">County Weather Advisory</h2>
        </div>
        <button
          onClick={() => fetchAdvisory(selectedCounty)}
          disabled={loading}
          title="Refresh"
          className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
        >
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* ── County selector ── */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Select County
          </label>
          <div className="relative">
            <select
              value={selectedCounty}
              onChange={e => setSelectedCounty(e.target.value)}
              className={cn(
                'w-full appearance-none rounded-lg border border-border bg-background',
                'px-3 py-2.5 pr-9 text-sm text-foreground',
                'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                'cursor-pointer',
              )}
            >
              {COUNTY_NAMES.map(name => (
                <option key={name} value={name}>
                  {name} County
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="space-y-3 animate-pulse">
            <div className="h-16 rounded-lg bg-muted/50" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 rounded-lg bg-muted/50" />
              ))}
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {error && !loading && (
          <div className="rounded-lg border border-danger/20 bg-danger/5 p-4 text-sm text-danger flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* ── Advisory result ── */}
        {advisory && !loading && (
          <>
            {/* Risk banner */}
            <div className={cn('rounded-lg border p-4', cfg.bg, cfg.border)}>
              <div className="flex items-start gap-3">
                <RiskIcon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', cfg.text)} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={cn('text-sm font-bold', cfg.text)}>
                      {advisory.recommendation.title}
                    </span>
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold capitalize', cfg.badge)}>
                      {risk} risk
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {advisory.recommendation.message}
                  </p>
                  <p className={cn('text-xs font-medium mt-1.5', cfg.text)}>
                    {advisory.recommendation.action}
                  </p>
                </div>
              </div>
            </div>

            {/* Weather stats */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <StatCard
                icon={CloudRain}
                label="Rain (24h)"
                value={`${advisory.weather.rain_probability_24h}%`}
                sub={`${advisory.weather.rainfall_mm_24h.toFixed(1)} mm`}
              />
              <StatCard
                icon={Thermometer}
                label="Temperature"
                value={`${Math.round(advisory.weather.temperature)}°C`}
                sub={advisory.weather.description}
              />
              <StatCard
                icon={Droplets}
                label="Humidity"
                value={`${advisory.weather.humidity}%`}
              />
              <StatCard
                icon={Wind}
                label="Wind Speed"
                value={`${advisory.weather.wind_speed.toFixed(1)} m/s`}
                sub="at 10 m height"
              />
            </div>

            {/* 48h rain */}
            <div className="rounded-lg bg-muted/30 border border-border px-4 py-2.5 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Rain probability (48 h)</span>
              <span className="font-semibold text-foreground">
                {advisory.weather.rain_probability_48h}%
              </span>
            </div>

            {/* 3-day forecast strip */}
            {advisory.weather.forecast_days?.length > 0 && (
              <ForecastStrip days={advisory.weather.forecast_days} />
            )}

            {/* Combined market insight */}
            {advisory.combined_insight && (
              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <p className="text-xs font-semibold text-foreground mb-1">Market Insight</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {advisory.combined_insight}
                </p>
              </div>
            )}

            <p className="text-xs text-muted-foreground text-right">
              Updated: {new Date(advisory.fetched_at).toLocaleTimeString()}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
