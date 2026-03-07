'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import {
  CloudRain, RefreshCw, Brain, Sparkles, ShieldAlert,
  MapPin, CloudSun, Droplets,
} from 'lucide-react'
import {
  CurrentWeatherCard,
  ForecastCard,
  WeatherAlertCard,
  HarvestRecommendationCard,
  WeatherSkeleton,
  ForecastSkeleton,
} from '@/components/weather-widgets'

// ─── Types ───

interface WeatherCurrent {
  temperature: number
  humidity: number
  wind_speed: number
  description: string
  icon: string
  feels_like: number
  pressure: number
}

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

interface WeatherData {
  location: string
  latitude: number
  longitude: number
  current: WeatherCurrent
  forecast: ForecastDay[]
  fetched_at: string
}

interface WeatherAlertData {
  risk_type: string
  risk_level: 'low' | 'medium' | 'high'
  title: string
  message: string
  affected_days: string[]
  start_date: string
  severity_score: number
}

interface AlertsResponse {
  location: string
  overall_risk: 'low' | 'medium' | 'high'
  alerts: WeatherAlertData[]
  safe_harvest_window: string | null
  rain_forecast_next_3_days: number
  rain_forecast_next_7_days: number
}

interface HarvestRec {
  action: string
  recommendation: string
  message: string
  urgency: 'low' | 'medium' | 'high'
  best_harvest_window: string | null
}

interface RecResponse {
  location: string
  weather_risk: string
  safe_harvest_window: string | null
  recommendations: Array<{
    crop: string
    recommendation: HarvestRec
    weather_risk: string
    generated_at: string
  }>
}

export default function WeatherInsightsPage() {
  const { token } = useAuth()
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [alertsData, setAlertsData] = useState<AlertsResponse | null>(null)
  const [recs, setRecs] = useState<RecResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [recsLoading, setRecsLoading] = useState(false)

  const fetchData = useCallback(async () => {
    if (!token) return
    const headers = { Authorization: `Bearer ${token}` }

    try {
      const [forecastRes, alertsRes] = await Promise.all([
        fetch('/api/weather/forecast', { headers }),
        fetch('/api/weather/alerts', { headers }),
      ])

      if (forecastRes.ok) {
        setWeather(await forecastRes.json())
      }
      if (alertsRes.ok) {
        setAlertsData(await alertsRes.json())
      }
    } catch (err) {
      console.error('Weather fetch failed:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }

    // Fetch recommendations separately (may call AI)
    setRecsLoading(true)
    try {
      const recsRes = await fetch('/api/weather/recommendations', { headers })
      if (recsRes.ok) {
        setRecs(await recsRes.json())
      }
    } catch (err) {
      console.error('Recommendations fetch failed:', err)
    } finally {
      setRecsLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchData()
  }

  if (loading) {
    return (
      <div className="px-6 py-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-56 rounded bg-muted" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <WeatherSkeleton />
            <ForecastSkeleton />
          </div>
          <div className="space-y-3">
            <div className="h-24 rounded-xl bg-muted" />
            <div className="h-24 rounded-xl bg-muted" />
          </div>
        </div>
      </div>
    )
  }

  const overallRisk = alertsData?.overall_risk ?? 'low'

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <CloudSun className="h-6 w-6 text-primary" />
              Weather Insights
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Weather intelligence and AI-powered harvest recommendations for your location.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {weather && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {weather.location}
              </div>
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-primary inline-flex items-center gap-2 text-sm disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Risk Banner */}
        {overallRisk !== 'low' && (
          <div
            className={`mb-6 rounded-xl border p-4 flex items-center gap-3 ${
              overallRisk === 'high'
                ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30'
                : 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30'
            }`}
          >
            <ShieldAlert
              className={`h-5 w-5 shrink-0 ${
                overallRisk === 'high'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            />
            <div>
              <p className="text-sm font-semibold text-foreground">
                {overallRisk === 'high' ? 'Severe Weather Alert' : 'Weather Advisory'}
              </p>
              <p className="text-xs text-muted-foreground">
                {alertsData?.alerts[0]?.message?.slice(0, 120)}
                {alertsData?.safe_harvest_window &&
                  ` Safe window: ${alertsData.safe_harvest_window}.`}
              </p>
            </div>
          </div>
        )}

        {/* Overview Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="card-elevated rounded-xl p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Risk Level</p>
              <div
                className={`rounded-lg p-2 ${
                  overallRisk === 'high'
                    ? 'bg-red-100 dark:bg-red-900/30'
                    : overallRisk === 'medium'
                      ? 'bg-amber-100 dark:bg-amber-900/30'
                      : 'bg-green-100 dark:bg-green-900/30'
                }`}
              >
                <ShieldAlert
                  className={`h-4 w-4 ${
                    overallRisk === 'high'
                      ? 'text-red-600'
                      : overallRisk === 'medium'
                        ? 'text-amber-600'
                        : 'text-green-600'
                  }`}
                />
              </div>
            </div>
            <p
              className={`mt-3 text-2xl font-bold capitalize ${
                overallRisk === 'high'
                  ? 'text-red-600'
                  : overallRisk === 'medium'
                    ? 'text-amber-600'
                    : 'text-green-600'
              }`}
            >
              {overallRisk}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Overall weather risk</p>
          </div>

          <div className="card-elevated rounded-xl p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Rain (3-Day)</p>
              <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2">
                <Droplets className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">
              {alertsData?.rain_forecast_next_3_days ?? 0}%
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Max probability</p>
          </div>

          <div className="card-elevated rounded-xl p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Rain (7-Day)</p>
              <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2">
                <CloudRain className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">
              {alertsData?.rain_forecast_next_7_days ?? 0}%
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Max probability</p>
          </div>

          <div className="card-elevated rounded-xl p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
              <div className="rounded-lg bg-primary/10 p-2">
                <CloudRain className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">
              {alertsData?.alerts.length ?? 0}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Weather alerts</p>
          </div>
        </div>

        {/* Current Weather + Forecast */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
          {weather && (
            <CurrentWeatherCard
              data={{
                location: weather.location,
                temperature: weather.current.temperature,
                humidity: weather.current.humidity,
                wind_speed: weather.current.wind_speed,
                description: weather.current.description,
                icon: weather.current.icon,
                feels_like: weather.current.feels_like,
              }}
            />
          )}
          {weather && <ForecastCard forecast={weather.forecast} />}
        </div>

        {/* Weather Alerts */}
        {alertsData && alertsData.alerts.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary" />
              Weather Risk Alerts
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {alertsData.alerts.map((alert, i) => (
                <WeatherAlertCard key={i} alert={alert} />
              ))}
            </div>

            {alertsData.safe_harvest_window && (
              <div className="mt-4 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 p-4 flex items-center gap-3">
                <CloudSun className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Safe Harvest Window</p>
                  <p className="text-xs text-muted-foreground">
                    Best time to harvest: <span className="font-semibold text-green-700 dark:text-green-300">{alertsData.safe_harvest_window}</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI Harvest Recommendations */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative">
              <Brain className="h-5 w-5 text-primary" />
              <Sparkles className="h-2.5 w-2.5 text-primary absolute -top-1 -right-1" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              AI Harvest Recommendations
            </h2>
          </div>

          {recsLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="card-elevated rounded-xl p-5 animate-pulse">
                  <div className="h-3 w-16 rounded bg-muted mb-2" />
                  <div className="h-4 w-48 rounded bg-muted mb-3" />
                  <div className="space-y-2">
                    <div className="h-3 w-full rounded bg-muted" />
                    <div className="h-3 w-4/5 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : recs && recs.recommendations.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {recs.recommendations.map((r, i) => (
                <HarvestRecommendationCard
                  key={i}
                  rec={{
                    crop: r.crop,
                    action: r.recommendation.action,
                    recommendation: r.recommendation.recommendation,
                    message: r.recommendation.message,
                    urgency: r.recommendation.urgency,
                    best_harvest_window: r.recommendation.best_harvest_window,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="card-elevated rounded-xl p-8 text-center">
              <Brain className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">
                No harvest recommendations available. Add commodities to your storage units to receive AI-powered advice.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
