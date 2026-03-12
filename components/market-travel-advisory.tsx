'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import {
  MapPin, CloudRain, Thermometer, Wind, Droplets,
  RefreshCw, AlertTriangle, CheckCircle, Shield, TrendingUp,
  Navigation, Info, ChevronDown, ChevronUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────────

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

interface CombinedInsight {
  commodity: string
  price_per_kg: number
  price_trend: string
  demand_level: string
  market_name: string
  weather_summary: string
  final_recommendation: string
}

interface MarketTravelAdvisory {
  market_location: string
  farmer_location: string
  weather: TravelForecastSummary
  recommendation: TravelRecommendation
  combined_insight: CombinedInsight | null
  fetched_at: string
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RiskBadge({ level }: { level: 'safe' | 'moderate' | 'high' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold',
        level === 'safe' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        level === 'moderate' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        level === 'high' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      )}
    >
      {level === 'safe' && <CheckCircle className="h-3 w-3" />}
      {level === 'moderate' && <AlertTriangle className="h-3 w-3" />}
      {level === 'high' && <Shield className="h-3 w-3" />}
      {level === 'safe' ? 'Safe' : level === 'moderate' ? 'Moderate Risk' : 'High Risk'}
    </span>
  )
}

function WeatherStatGrid({ weather }: { weather: TravelForecastSummary }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className="rounded-xl border border-border bg-muted/30 p-3 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CloudRain className="h-3.5 w-3.5" />
          Rain (24h)
        </div>
        <p className="text-lg font-bold text-foreground">{weather.rain_probability_24h}%</p>
        <p className="text-xs text-muted-foreground">{weather.rainfall_mm_24h.toFixed(1)} mm</p>
      </div>
      <div className="rounded-xl border border-border bg-muted/30 p-3 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Thermometer className="h-3.5 w-3.5" />
          Temperature
        </div>
        <p className="text-lg font-bold text-foreground">{weather.temperature}°C</p>
        <p className="text-xs text-muted-foreground capitalize">{weather.description}</p>
      </div>
      <div className="rounded-xl border border-border bg-muted/30 p-3 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Droplets className="h-3.5 w-3.5" />
          Humidity
        </div>
        <p className="text-lg font-bold text-foreground">{weather.humidity}%</p>
        <p className="text-xs text-muted-foreground">Relative humidity</p>
      </div>
      <div className="rounded-xl border border-border bg-muted/30 p-3 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Wind className="h-3.5 w-3.5" />
          Wind Speed
        </div>
        <p className="text-lg font-bold text-foreground">{weather.wind_speed} m/s</p>
        <p className="text-xs text-muted-foreground">
          {weather.wind_speed >= 15 ? 'Strong winds' : weather.wind_speed >= 8 ? 'Moderate' : 'Calm'}
        </p>
      </div>
    </div>
  )
}

function ForecastStrip({ days }: { days: ForecastDay[] }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="space-y-2">
      <button
        onClick={() => setExpanded((p) => !p)}
        className="flex w-full items-center justify-between text-sm font-medium text-foreground hover:text-primary transition-colors"
      >
        <span>3-Day Forecast</span>
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {expanded && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {days.map((d) => (
            <div
              key={d.date}
              className="rounded-xl border border-border bg-muted/20 p-3 space-y-1"
            >
              <p className="text-xs font-semibold text-foreground">{d.day}</p>
              <p className="text-xs text-muted-foreground capitalize">{d.description}</p>
              <div className="flex items-center justify-between mt-2 text-xs">
                <span className="text-foreground font-medium">{d.temperature_max}°C</span>
                <span className="text-muted-foreground">{d.temperature_min}°C</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                <CloudRain className="h-3 w-3" />
                {d.rain_probability}%
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CombinedInsightPanel({ insight }: { insight: CombinedInsight }) {
  const trendColor =
    insight.price_trend === 'increasing'
      ? 'text-emerald-600'
      : insight.price_trend === 'decreasing'
      ? 'text-red-600'
      : 'text-muted-foreground'

  return (
    <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Market + Weather Combined Insight</h3>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
        <div>
          <p className="text-muted-foreground">Commodity</p>
          <p className="font-semibold text-foreground capitalize">{insight.commodity}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Price</p>
          <p className="font-semibold text-foreground">KES {insight.price_per_kg.toFixed(0)}/kg</p>
        </div>
        <div>
          <p className="text-muted-foreground">Price Trend</p>
          <p className={cn('font-semibold capitalize', trendColor)}>{insight.price_trend}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Demand</p>
          <p className="font-semibold text-foreground capitalize">{insight.demand_level}</p>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Weather at {insight.market_name}</p>
        <p className="text-xs text-foreground">{insight.weather_summary}</p>
      </div>

      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
        <p className="text-xs font-medium text-primary mb-1">Final Recommendation</p>
        <p className="text-sm text-foreground">{insight.final_recommendation}</p>
      </div>
    </div>
  )
}

// ─── Location Input ───────────────────────────────────────────────────────────

interface LocationInputProps {
  value: string
  suggestions: string[]
  onChange: (v: string) => void
  onSelect: (v: string) => void
  placeholder?: string
  label: string
}

function LocationInput({
  value, suggestions, onChange, onSelect, placeholder, label,
}: LocationInputProps) {
  const [open, setOpen] = useState(false)

  const filtered = suggestions.filter(
    (s) => s.toLowerCase().includes(value.toLowerCase()) && s !== value,
  ).slice(0, 8)

  return (
    <div className="relative flex-1">
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => { onChange(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
      {open && filtered.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg max-h-48 overflow-y-auto">
          {filtered.map((s) => (
            <li key={s}>
              <button
                type="button"
                onMouseDown={() => { onSelect(s); setOpen(false) }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface MarketTravelAdvisoryWidgetProps {
  /** Pre-fill the destination market location */
  defaultMarket?: string
  /** Show as compact card (no heading, no farmer location input) */
  compact?: boolean
  className?: string
}

export function MarketTravelAdvisoryWidget({
  defaultMarket = '',
  compact = false,
  className,
}: MarketTravelAdvisoryWidgetProps) {
  const { token, user } = useAuth()
  const [market, setMarket] = useState(defaultMarket)
  const [farmerLoc, setFarmerLoc] = useState(user?.location ?? '')
  const [advisory, setAdvisory] = useState<MarketTravelAdvisory | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [locations, setLocations] = useState<string[]>([])

  // Fetch location suggestions once
  useEffect(() => {
    fetch('/api/travel-advisory/locations')
      .then((r) => r.json())
      .then((d) => setLocations(d.locations ?? []))
      .catch(() => {})
  }, [])

  // Auto-fetch if defaultMarket is provided
  useEffect(() => {
    if (defaultMarket && token) fetchAdvisory(defaultMarket)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultMarket, token])

  const fetchAdvisory = useCallback(
    async (destination: string = market) => {
      if (!destination.trim()) {
        setError('Please enter a destination market or location.')
        return
      }
      if (!token) return

      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({ market: destination })
        if (farmerLoc) params.set('farmerLocation', farmerLoc)

        const res = await fetch(`/api/travel-advisory?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          setError(body.error ?? 'Failed to fetch advisory.')
          return
        }

        setAdvisory(await res.json())
      } catch {
        setError('Network error. Please try again.')
      } finally {
        setLoading(false)
      }
    },
    [token, market, farmerLoc],
  )

  const risk = advisory?.recommendation.risk_level

  const bannerClasses = cn(
    'rounded-xl border p-4 space-y-2',
    risk === 'safe' && 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20',
    risk === 'moderate' && 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20',
    risk === 'high' && 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20',
    (!risk) && 'border-border bg-muted/20',
  )

  return (
    <div className={cn('space-y-5', className)}>
      {/* Header */}
      {!compact && (
        <div className="flex items-center gap-2">
          <Navigation className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-base font-semibold text-foreground">Market Travel Advisory</h2>
            <p className="text-xs text-muted-foreground">
              Check weather conditions before transporting your produce to a market.
            </p>
          </div>
        </div>
      )}

      {/* Location inputs + search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <LocationInput
          label="Destination Market / Location"
          value={market}
          suggestions={locations}
          onChange={setMarket}
          onSelect={(v) => { setMarket(v); fetchAdvisory(v) }}
          placeholder="e.g. Kibuye Market, Kisumu"
        />

        {!compact && (
          <LocationInput
            label="Your Location (optional)"
            value={farmerLoc}
            suggestions={locations}
            onChange={setFarmerLoc}
            onSelect={setFarmerLoc}
            placeholder="e.g. Nakuru"
          />
        )}

        <button
          onClick={() => fetchAdvisory()}
          disabled={loading || !market.trim()}
          className="inline-flex h-[38px] items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
          {loading ? 'Checking...' : 'Check Weather'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400">
          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Advisory result */}
      {advisory && (
        <div className="space-y-4">
          {/* Route summary */}
          {!compact && (
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {advisory.farmer_location && advisory.farmer_location !== 'Kenya' && (
                <>
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">{advisory.farmer_location}</span>
                  <span>→</span>
                </>
              )}
              <MapPin className="h-4 w-4 text-amber-500" />
              <span className="font-medium text-foreground">{advisory.market_location}</span>
              <RiskBadge level={advisory.recommendation.risk_level} />
            </div>
          )}

          {/* Recommendation banner */}
          <div className={bannerClasses}>
            <div className="flex items-start gap-3">
              <span className="text-2xl leading-none">{advisory.recommendation.icon}</span>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className={cn(
                    'text-sm font-semibold',
                    risk === 'safe' && 'text-emerald-700 dark:text-emerald-400',
                    risk === 'moderate' && 'text-amber-700 dark:text-amber-400',
                    risk === 'high' && 'text-red-700 dark:text-red-400',
                  )}>
                    {advisory.recommendation.title}
                  </h3>
                  {compact && <RiskBadge level={advisory.recommendation.risk_level} />}
                </div>
                <p className="text-sm text-foreground">{advisory.recommendation.message}</p>
              </div>
            </div>

            <div className={cn(
              'flex items-start gap-2 rounded-lg border p-3',
              risk === 'safe' && 'border-emerald-200 bg-emerald-100/50 dark:border-emerald-700 dark:bg-emerald-900/20',
              risk === 'moderate' && 'border-amber-200 bg-amber-100/50 dark:border-amber-700 dark:bg-amber-900/20',
              risk === 'high' && 'border-red-200 bg-red-100/50 dark:border-red-700 dark:bg-red-900/20',
            )}>
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-inherit opacity-70" />
              <p className="text-sm font-medium">{advisory.recommendation.action}</p>
            </div>
          </div>

          {/* Weather stats */}
          <WeatherStatGrid weather={advisory.weather} />

          {/* 3-day forecast */}
          {advisory.weather.forecast_days.length > 0 && (
            <ForecastStrip days={advisory.weather.forecast_days} />
          )}

          {/* Combined price + weather insight */}
          {advisory.combined_insight && (
            <CombinedInsightPanel insight={advisory.combined_insight} />
          )}

          <p className="text-right text-xs text-muted-foreground">
            Last updated: {new Date(advisory.fetched_at).toLocaleTimeString()}
          </p>
        </div>
      )}

      {/* Empty state */}
      {!advisory && !loading && !error && (
        <div className="rounded-xl border border-dashed border-border bg-muted/10 p-8 text-center">
          <Navigation className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">
            Enter a destination market and click <strong>Check Weather</strong> to get your travel advisory.
          </p>
        </div>
      )}
    </div>
  )
}
