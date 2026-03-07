'use client'

import {
  Cloud, CloudRain, CloudDrizzle, CloudLightning, CloudSnow,
  Sun, CloudSun, Wind, Droplets, Thermometer, Eye,
} from 'lucide-react'

/**
 * Map OpenWeather icon codes to Lucide icons.
 */
export function WeatherIcon({
  icon,
  className = 'h-6 w-6',
}: {
  icon: string
  className?: string
}) {
  switch (icon) {
    case '01d':
    case '01n':
      return <Sun className={`${className} text-amber-500`} />
    case '02d':
    case '02n':
      return <CloudSun className={`${className} text-amber-400`} />
    case '03d':
    case '03n':
    case '04d':
    case '04n':
      return <Cloud className={`${className} text-gray-400`} />
    case '09d':
    case '09n':
      return <CloudDrizzle className={`${className} text-blue-400`} />
    case '10d':
    case '10n':
      return <CloudRain className={`${className} text-blue-500`} />
    case '11d':
    case '11n':
      return <CloudLightning className={`${className} text-purple-500`} />
    case '13d':
    case '13n':
      return <CloudSnow className={`${className} text-sky-300`} />
    default:
      return <Cloud className={`${className} text-gray-400`} />
  }
}

// ─── Current Weather Card ───

interface CurrentWeatherProps {
  location: string
  temperature: number
  humidity: number
  wind_speed: number
  description: string
  icon: string
  feels_like: number
}

export function CurrentWeatherCard({ data }: { data: CurrentWeatherProps }) {
  return (
    <div className="card-elevated rounded-xl p-6 bg-gradient-to-br from-blue-500/5 to-sky-500/5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Current Weather</p>
          <p className="text-lg font-semibold text-foreground">{data.location}</p>
        </div>
        <WeatherIcon icon={data.icon} className="h-12 w-12" />
      </div>

      <div className="flex items-end gap-2 mb-4">
        <p className="text-5xl font-bold text-foreground">{Math.round(data.temperature)}°</p>
        <p className="text-sm text-muted-foreground mb-1.5 capitalize">{data.description}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-white/60 dark:bg-white/5 p-2.5">
          <div className="flex items-center gap-1 mb-1">
            <Thermometer className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground">Feels like</span>
          </div>
          <p className="text-sm font-bold">{Math.round(data.feels_like)}°C</p>
        </div>
        <div className="rounded-lg bg-white/60 dark:bg-white/5 p-2.5">
          <div className="flex items-center gap-1 mb-1">
            <Droplets className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground">Humidity</span>
          </div>
          <p className="text-sm font-bold">{data.humidity}%</p>
        </div>
        <div className="rounded-lg bg-white/60 dark:bg-white/5 p-2.5">
          <div className="flex items-center gap-1 mb-1">
            <Wind className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground">Wind</span>
          </div>
          <p className="text-sm font-bold">{data.wind_speed} m/s</p>
        </div>
      </div>
    </div>
  )
}

// ─── 7-Day Forecast Card ───

interface ForecastDay {
  day: string
  date: string
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

export function ForecastCard({ forecast }: { forecast: ForecastDay[] }) {
  return (
    <div className="card-elevated rounded-xl p-6">
      <h3 className="text-sm font-semibold text-foreground mb-4">7-Day Forecast</h3>
      <div className="space-y-2">
        {forecast.map((day, i) => (
          <div
            key={day.date}
            className={`flex items-center gap-3 rounded-lg p-2.5 transition-colors ${
              i === 0 ? 'bg-primary/5' : 'hover:bg-muted/50'
            }`}
          >
            <div className="w-20 shrink-0">
              <p className="text-sm font-medium text-foreground">
                {i === 0 ? 'Today' : day.day.slice(0, 3)}
              </p>
              <p className="text-[10px] text-muted-foreground">{day.date}</p>
            </div>

            <WeatherIcon icon={day.icon} className="h-5 w-5 shrink-0" />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">
                  {Math.round(day.temperature_max)}°
                </span>
                <span className="text-xs text-muted-foreground">
                  {Math.round(day.temperature_min)}°
                </span>
              </div>
            </div>

            {/* Rain probability bar */}
            <div className="w-24 shrink-0">
              <div className="flex items-center justify-between text-[10px] mb-0.5">
                <span className={day.rain_probability > 60 ? 'text-blue-600 font-semibold' : 'text-muted-foreground'}>
                  <Droplets className="h-3 w-3 inline mr-0.5" />
                  {day.rain_probability}%
                </span>
              </div>
              <div className="h-1 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    day.rain_probability > 70
                      ? 'bg-blue-600'
                      : day.rain_probability > 40
                        ? 'bg-blue-400'
                        : 'bg-blue-200'
                  }`}
                  style={{ width: `${day.rain_probability}%` }}
                />
              </div>
            </div>

            <div className="w-14 text-right shrink-0">
              <span className="text-xs text-muted-foreground">{day.humidity}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Weather Alert Card ───

interface WeatherAlertProps {
  title: string
  message: string
  risk_level: 'low' | 'medium' | 'high'
  affected_days: string[]
  risk_type: string
}

const alertConfig = {
  high: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800',
    badge: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    icon: 'text-red-600 dark:text-red-400',
  },
  medium: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
    icon: 'text-amber-600 dark:text-amber-400',
  },
  low: {
    bg: 'bg-green-50 dark:bg-green-950/30',
    border: 'border-green-200 dark:border-green-800',
    badge: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    icon: 'text-green-600 dark:text-green-400',
  },
}

export function WeatherAlertCard({ alert }: { alert: WeatherAlertProps }) {
  const cfg = alertConfig[alert.risk_level]

  return (
    <div className={`rounded-xl border ${cfg.border} ${cfg.bg} p-4`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <CloudRain className={`h-5 w-5 ${cfg.icon}`} />
          <h4 className="font-semibold text-foreground text-sm">{alert.title}</h4>
        </div>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.badge}`}>
          {alert.risk_level.toUpperCase()}
        </span>
      </div>
      <p className="text-sm text-foreground/80 mb-2">{alert.message}</p>
      {alert.affected_days.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-muted-foreground">Affected:</span>
          {alert.affected_days.map((day) => (
            <span
              key={day}
              className="inline-flex items-center rounded-full bg-white/60 dark:bg-white/10 px-2 py-0.5 text-[10px] font-medium"
            >
              {day}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Harvest Recommendation Card ───

interface HarvestRecProps {
  crop: string
  action: string
  recommendation: string
  message: string
  urgency: 'low' | 'medium' | 'high'
  best_harvest_window: string | null
}

const urgencyConfig = {
  high: {
    bg: 'from-red-500/10 to-orange-500/10',
    border: 'border-red-300 dark:border-red-700',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  },
  medium: {
    bg: 'from-amber-500/10 to-yellow-500/10',
    border: 'border-amber-300 dark:border-amber-700',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  },
  low: {
    bg: 'from-green-500/10 to-emerald-500/10',
    border: 'border-green-300 dark:border-green-700',
    badge: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
  },
}

const actionLabels: Record<string, string> = {
  harvest_early: 'Harvest Early',
  harvest_now: 'Harvest Now',
  delay_harvest: 'Delay Harvest',
  monitor: 'Monitor',
}

export function HarvestRecommendationCard({ rec }: { rec: HarvestRecProps }) {
  const cfg = urgencyConfig[rec.urgency]

  return (
    <div className={`rounded-xl border ${cfg.border} bg-gradient-to-br ${cfg.bg} p-5`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            {rec.crop}
          </p>
          <h4 className="font-semibold text-foreground text-sm mt-0.5">
            {rec.recommendation}
          </h4>
        </div>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${cfg.badge}`}>
          {actionLabels[rec.action] ?? rec.action}
        </span>
      </div>

      <p className="text-sm text-foreground/80 leading-relaxed mb-3">
        {rec.message}
      </p>

      {rec.best_harvest_window && (
        <div className="rounded-lg bg-white/50 dark:bg-white/5 p-2.5 flex items-center gap-2">
          <Eye className="h-4 w-4 text-primary shrink-0" />
          <div>
            <p className="text-[11px] text-muted-foreground">Best Harvest Window</p>
            <p className="text-sm font-semibold text-foreground">{rec.best_harvest_window}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Skeletons ───

export function WeatherSkeleton() {
  return (
    <div className="card-elevated rounded-xl p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="h-4 w-24 rounded bg-muted mb-2" />
          <div className="h-5 w-32 rounded bg-muted" />
        </div>
        <div className="h-12 w-12 rounded-full bg-muted" />
      </div>
      <div className="h-12 w-20 rounded bg-muted mb-4" />
      <div className="grid grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  )
}

export function ForecastSkeleton() {
  return (
    <div className="card-elevated rounded-xl p-6 animate-pulse">
      <div className="h-4 w-28 rounded bg-muted mb-4" />
      <div className="space-y-3">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="h-10 rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  )
}
