/**
 * Weather Dashboard Component
 * 
 * Displays accurate weather data combining Open-Meteo API and IoT sensor data.
 * Features auto-refresh, comparison warnings, and hybrid data visualization.
 */

'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/lib/auth-context'
import { 
  CloudSun, Thermometer, Droplets, Wind, AlertTriangle, 
  RefreshCw, MapPin, Calendar, TrendingUp, TrendingDown,
  Cloud, CloudRain, CloudSnow, Sun, CloudDrizzle, Zap
} from 'lucide-react'

interface WeatherData {
  location: {
    latitude: number
    longitude: number
    name: string
  }
  external: {
    temperature: number
    humidity: number
    windSpeed: number
    weatherCode: number
    description: string
    timestamp: string
  }
  storage: {
    hasData: boolean
    averageTemperature: number | null
    averageHumidity: number | null
    units: Array<{
      id: string
      name: string
      temperature: number
      humidity: number
      status: string
      recordedAt: string
    }>
  }
  comparison: {
    temperatureDiff: number | null
    humidityDiff: number | null
    hasSignificantDifference: boolean
    warning: string | null
  }
  forecast: Array<{
    date: string
    temperatureMax: number
    temperatureMin: number
    humidity: number
    precipitation: number
    weatherCode: number
  }>
}

export function WeatherDashboard() {
  const { token } = useAuth()
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchWeather = async (forceRefresh = false) => {
    if (!token) return

    try {
      const url = forceRefresh ? '/api/weather?refresh=true' : '/api/weather'
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        const data = await res.json()
        setWeather(data)
        setLastUpdated(new Date())
        setError(null)
      } else {
        const errorData = await res.json()
        setError(errorData.error || 'Failed to fetch weather data')
      }
    } catch (err) {
      console.error('Error fetching weather:', err)
      setError('Weather data unavailable. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWeather()

    // Auto-refresh every 60 seconds
    intervalRef.current = setInterval(() => {
      fetchWeather()
    }, 60000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [token])

  const getWeatherIcon = (code: number) => {
    if (code === 0 || code === 1) return <Sun className="h-8 w-8 text-yellow-500" />
    if (code === 2 || code === 3) return <Cloud className="h-8 w-8 text-gray-400" />
    if (code >= 51 && code <= 55) return <CloudDrizzle className="h-8 w-8 text-blue-400" />
    if (code >= 61 && code <= 65) return <CloudRain className="h-8 w-8 text-blue-600" />
    if (code >= 71 && code <= 77) return <CloudSnow className="h-8 w-8 text-blue-300" />
    if (code >= 95) return <Zap className="h-8 w-8 text-yellow-600" />
    return <CloudSun className="h-8 w-8 text-gray-500" />
  }

  const getStatusColor = (status: string) => {
    if (status === 'normal') return 'text-green-600 bg-green-50 border-green-200'
    if (status === 'warning') return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  if (loading) {
    return (
      <div className="card-elevated rounded-lg p-8 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading weather data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card-elevated rounded-lg p-8 border border-danger/20">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-2">Weather Data Unavailable</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => fetchWeather(true)}
            className="btn-primary text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!weather) return null

  return (
    <div className="space-y-6">
      {/* Header with Location and Refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-xl font-bold text-foreground">{weather.location.name}</h2>
            <p className="text-xs text-muted-foreground">
              {weather.location.latitude.toFixed(4)}°, {weather.location.longitude.toFixed(4)}°
            </p>
          </div>
        </div>
        <div className="text-right">
          <button
            onClick={() => fetchWeather(true)}
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground mt-1">
              Updated {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {/* Comparison Warning */}
      {weather.comparison.hasSignificantDifference && weather.comparison.warning && (
        <div className="rounded-lg bg-yellow-50 border-2 border-yellow-200 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-semibold text-yellow-900 mb-1">Data Discrepancy Detected</h4>
              <p className="text-sm text-yellow-800">{weather.comparison.warning}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Weather Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* External Weather */}
        <div className="card-elevated rounded-lg p-6 border border-accent/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <CloudSun className="h-5 w-5 text-blue-500" />
              External Weather
            </h3>
            <span className="text-xs text-muted-foreground">Open-Meteo API</span>
          </div>

          <div className="flex items-center gap-4 mb-6">
            {getWeatherIcon(weather.external.weatherCode)}
            <div>
              <p className="text-4xl font-bold text-foreground">
                {weather.external.temperature.toFixed(1)}°C
              </p>
              <p className="text-sm text-muted-foreground">{weather.external.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Droplets className="h-4 w-4" />
                <span className="text-xs">Humidity</span>
              </div>
              <p className="text-xl font-bold text-foreground">{weather.external.humidity}%</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Wind className="h-4 w-4" />
                <span className="text-xs">Wind Speed</span>
              </div>
              <p className="text-xl font-bold text-foreground">{weather.external.windSpeed} km/h</p>
            </div>
          </div>
        </div>

        {/* Storage Conditions */}
        <div className="card-elevated rounded-lg p-6 border border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-green-500" />
              Storage Conditions
            </h3>
            <span className="text-xs text-muted-foreground">IoT Sensors</span>
          </div>

          {weather.storage.hasData ? (
            <>
              <div className="flex items-center gap-4 mb-6">
                <Thermometer className="h-12 w-12 text-green-500" />
                <div>
                  <p className="text-4xl font-bold text-foreground">
                    {weather.storage.averageTemperature?.toFixed(1)}°C
                  </p>
                  <p className="text-sm text-muted-foreground">Average across {weather.storage.units.length} unit{weather.storage.units.length !== 1 ? 's' : ''}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Droplets className="h-4 w-4" />
                    <span className="text-xs">Humidity</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">{weather.storage.averageHumidity?.toFixed(1)}%</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-xs">Difference</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">
                    {weather.comparison.temperatureDiff?.toFixed(1)}°C
                  </p>
                </div>
              </div>

              {/* Individual Storage Units */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Storage Units</p>
                {weather.storage.units.map((unit) => (
                  <div key={unit.id} className={`rounded-lg border p-2 ${getStatusColor(unit.status)}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{unit.name}</span>
                      <div className="flex items-center gap-2 text-xs">
                        <span>{unit.temperature.toFixed(1)}°C</span>
                        <span>•</span>
                        <span>{unit.humidity.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Thermometer className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">No Sensor Data Available</p>
              <p className="text-xs text-muted-foreground">
                Add storage units with sensors to see real-time conditions
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 7-Day Forecast */}
      <div className="card-elevated rounded-lg p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          7-Day Forecast
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {weather.forecast.map((day, index) => {
            const date = new Date(day.date)
            const dayName = index === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' })

            return (
              <div key={day.date} className="bg-muted/30 rounded-lg p-3 text-center">
                <p className="text-xs font-semibold text-muted-foreground mb-2">{dayName}</p>
                <div className="flex justify-center mb-2">
                  {getWeatherIcon(day.weatherCode)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1 text-xs">
                    <TrendingUp className="h-3 w-3 text-red-500" />
                    <span className="font-semibold">{day.temperatureMax.toFixed(0)}°</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 text-xs">
                    <TrendingDown className="h-3 w-3 text-blue-500" />
                    <span className="text-muted-foreground">{day.temperatureMin.toFixed(0)}°</span>
                  </div>
                  {day.precipitation > 0 && (
                    <div className="flex items-center justify-center gap-1 text-xs text-blue-600">
                      <Droplets className="h-3 w-3" />
                      <span>{day.precipitation.toFixed(0)}mm</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Data Source Info */}
      <div className="rounded-lg bg-muted/30 p-4">
        <p className="text-xs text-muted-foreground">
          <strong>Data Sources:</strong> External weather from Open-Meteo API (updated every 60 seconds). 
          Storage conditions from real-time IoT sensors. 
          {weather.storage.hasData && weather.comparison.hasSignificantDifference && (
            <span className="text-yellow-700"> ⚠️ Prioritize sensor data for storage decisions.</span>
          )}
        </p>
      </div>
    </div>
  )
}
