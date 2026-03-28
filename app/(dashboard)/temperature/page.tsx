'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Thermometer } from 'lucide-react'
import { TemperatureChart } from '@/components/temperature-chart'

interface SensorReading {
  id: string
  storage_unit_id: string
  storage_unit_name: string | null
  storage_unit_location: string | null
  temperature: number
  humidity: number
  timestamp: string
  status: 'normal' | 'warning' | 'danger'
  status_reasons: string[]
}

interface SensorSummary {
  total_units: number
  units_with_readings: number
  danger_count: number
  warning_count: number
  normal_count: number
  avg_temperature: number | null
  avg_humidity: number | null
  last_updated: string | null
}

export default function TemperaturePage() {
  const { token } = useAuth()
  const [sensorData, setSensorData] = useState<SensorReading[]>([])
  const [summary, setSummary] = useState<SensorSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    if (!token) return
    
    try {
      const res = await fetch('/api/sensors/latest', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
      
      if (res.ok) {
        const data = await res.json()
        setSensorData(data.readings ?? [])
        setSummary(data.summary ?? null)
        setError(null)
      } else {
        const errorData = await res.json().catch(() => ({}))
        setError(errorData.error || 'Failed to fetch sensor data')
      }
    } catch (error) {
      console.error('[TemperaturePage] Error fetching sensor data:', error)
      setError('Unable to connect to server')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000) // Poll every 10 seconds
    return () => clearInterval(interval)
  }, [token])

  const getTempStatus = (temp: number) => {
    if (temp < 15) return { label: 'Cold', icon: '❄️', color: 'text-blue-600' }
    if (temp > 30) return { label: 'Hot', icon: '🔥', color: 'text-red-600' }
    return { label: 'Optimal', icon: '✅', color: 'text-green-600' }
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6 lg:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 rounded bg-muted" />
          <div className="h-64 rounded-lg bg-muted" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2.5">
          <Thermometer className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Temperature Monitoring</h1>
          <p className="text-sm text-muted-foreground">
            Real-time temperature tracking across all storage facilities
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      {summary && summary.units_with_readings > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="card-elevated rounded-lg p-5">
            <p className="text-sm text-muted-foreground">Units Monitored</p>
            <p className="text-2xl font-bold text-foreground">{summary.units_with_readings}</p>
          </div>
          <div className="card-elevated rounded-lg p-5">
            <p className="text-sm text-muted-foreground">Avg Temperature</p>
            <p className="text-2xl font-bold text-primary">
              {summary.avg_temperature?.toFixed(1) ?? '—'}°C
            </p>
          </div>
          <div className="card-elevated rounded-lg p-5">
            <p className="text-sm text-muted-foreground">Warnings</p>
            <p className="text-2xl font-bold text-warning">{summary.warning_count}</p>
          </div>
          <div className="card-elevated rounded-lg p-5">
            <p className="text-sm text-muted-foreground">Critical</p>
            <p className="text-2xl font-bold text-danger">{summary.danger_count}</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-700">{error}</p>
          <p className="text-xs text-red-600 mt-1">
            Make sure your ESP32 device is sending data to the system.
          </p>
        </div>
      )}

      {/* No Data State */}
      {!loading && !error && sensorData.length === 0 && (
        <div className="card-elevated rounded-lg p-8 text-center">
          <Thermometer className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
          <h3 className="font-semibold text-foreground">No sensor data available</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Waiting for ESP32 device to send temperature readings.
          </p>
        </div>
      )}

      {/* Temperature Trend Chart */}
      {sensorData.length > 0 && (
        <div className="card-elevated rounded-lg p-6">
          <h2 className="mb-6 text-lg font-semibold text-foreground">Latest Readings</h2>
          <TemperatureChart sensorData={sensorData} />
        </div>
      )}

      {/* Individual Storage Temperatures */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Storage Facility Details</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {sensorData.map((sensor) => {
            const tempStatus = getTempStatus(sensor.temperature)
            
            return (
              <div key={sensor.id} className="card-elevated rounded-lg p-5 transition-all hover:shadow-md">
                <h3 className="font-semibold text-foreground">{sensor.storage_unit_name || 'Unknown Unit'}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{sensor.storage_unit_location || 'No location'}</p>
                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Temperature</p>
                    <p className={`text-2xl font-bold ${tempStatus.color}`}>
                      {sensor.temperature.toFixed(1)}°C
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Humidity</p>
                    <p className="text-2xl font-bold text-accent">
                      {sensor.humidity.toFixed(1)}%
                    </p>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <p className="text-sm font-medium">
                      {tempStatus.icon} {tempStatus.label}
                    </p>
                    {sensor.status_reasons.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {sensor.status_reasons.join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Updated: {new Date(sensor.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
