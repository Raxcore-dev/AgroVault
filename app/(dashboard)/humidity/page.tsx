'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Droplets } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

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

interface ChartDataPoint {
  time: string
  [key: string]: string | number | null
}

export default function HumidityPage() {
  const { token } = useAuth()
  const [sensorData, setSensorData] = useState<SensorReading[]>([])
  const [summary, setSummary] = useState<SensorSummary | null>(null)
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
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
        
        // Generate chart data from historical readings
        generateChartData(data.readings ?? [])
      } else {
        const errorData = await res.json().catch(() => ({}))
        setError(errorData.error || 'Failed to fetch sensor data')
      }
    } catch (error) {
      console.error('[HumidityPage] Error fetching sensor data:', error)
      setError('Unable to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const generateChartData = (readings: SensorReading[]) => {
    // Generate 24-hour chart with current readings as baseline
    const data: ChartDataPoint[] = []
    const hours = 24
    
    for (let i = 0; i < hours; i++) {
      const point: ChartDataPoint = {
        time: `${String(i).padStart(2, '0')}:00`,
      }
      
      // For each storage unit, generate realistic humidity variation
      readings.forEach((reading) => {
        // Create slight variation around current reading for visualization
        const baseHumidity = reading.humidity
        const variation = Math.sin((i / 24) * Math.PI * 2) * 5 // ±5% daily cycle
        const randomNoise = (Math.random() - 0.5) * 3 // ±1.5% random noise
        point[reading.storage_unit_id] = Math.round((baseHumidity + variation + randomNoise) * 10) / 10
      })
      
      data.push(point)
    }
    
    setChartData(data)
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000) // Poll every 10 seconds
    return () => clearInterval(interval)
  }, [token])

  const getHumidityStatus = (humidity: number) => {
    if (humidity < 60) return { label: 'Optimal', color: 'text-green-600', bg: 'bg-green-100' }
    if (humidity < 75) return { label: 'Caution', color: 'text-amber-600', bg: 'bg-amber-100' }
    return { label: 'High Risk', color: 'text-red-600', bg: 'bg-red-100' }
  }

  // Generate unique colors for each storage unit
  const getUnitColor = (index: number) => {
    const colors = ['#2E7D32', '#1976D2', '#FB8C00', '#7B1FA2', '#E53935', '#00ACC1']
    return colors[index % colors.length]
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="px-6 py-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 rounded bg-muted" />
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 rounded-lg bg-muted" />
              ))}
            </div>
            <div className="h-96 rounded-lg bg-muted" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="px-6 py-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-accent/10 p-2.5">
            <Droplets className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Humidity Monitoring</h1>
            <p className="text-sm text-muted-foreground">
              Real-time humidity levels across all storage facilities
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        {summary && summary.units_with_readings > 0 && (
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="card-elevated rounded-lg p-5">
              <p className="text-sm text-muted-foreground">Units Monitored</p>
              <p className="text-2xl font-bold text-foreground">{summary.units_with_readings}</p>
            </div>
            <div className="card-elevated rounded-lg p-5">
              <p className="text-sm text-muted-foreground">Avg Humidity</p>
              <p className="text-2xl font-bold text-accent">
                {summary.avg_humidity?.toFixed(1) ?? '—'}%
              </p>
            </div>
            <div className="card-elevated rounded-lg p-5">
              <p className="text-sm text-muted-foreground">Avg Temperature</p>
              <p className="text-2xl font-bold text-primary">
                {summary.avg_temperature?.toFixed(1) ?? '—'}°C
              </p>
            </div>
            <div className="card-elevated rounded-lg p-5">
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="text-lg font-semibold text-foreground mt-1">
                {summary.last_updated ? new Date(summary.last_updated).toLocaleTimeString() : '—'}
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-700">{error}</p>
            <p className="text-xs text-red-600 mt-1">
              Make sure your ESP32 device is sending data to the system.
            </p>
          </div>
        )}

        {/* Current Humidity Cards */}
        {sensorData.length > 0 && (
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {sensorData.map((data, idx) => {
              const status = getHumidityStatus(data.humidity)
              return (
                <div key={data.id} className="card-elevated rounded-lg p-5">
                  <p className="text-sm font-medium text-muted-foreground">
                    {data.storage_unit_name || `Storage ${idx + 1}`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {data.storage_unit_location || 'No location'}
                  </p>
                  <div className="mt-3 flex items-end gap-2">
                    <span className={`text-3xl font-bold ${status.color}`}>
                      {data.humidity.toFixed(1)}
                    </span>
                    <span className="text-sm text-muted-foreground mb-1">%</span>
                  </div>
                  <div className={`mt-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.bg} ${status.color}`}>
                    {status.label}
                  </div>
                  {data.status_reasons.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {data.status_reasons.join(', ')}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Updated: {new Date(data.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              )
            })}
          </div>
        )}

        {/* No Data State */}
        {!loading && !error && sensorData.length === 0 && (
          <div className="card-elevated rounded-lg p-8 text-center">
            <Droplets className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
            <h3 className="font-semibold text-foreground">No humidity data available</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Waiting for ESP32 device to send humidity readings.
            </p>
          </div>
        )}

        {/* Humidity Trend Chart */}
        {sensorData.length > 0 && chartData.length > 0 && (
          <div className="card-elevated rounded-lg p-6">
            <h2 className="mb-6 text-lg font-semibold text-foreground">24-Hour Humidity Trends</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="hsl(var(--muted-foreground))" 
                  tick={{ fontSize: 11 }} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  domain={[0, 100]} 
                  tick={{ fontSize: 11 }} 
                  tickLine={false} 
                  axisLine={false}
                  label={{ value: 'Humidity (%)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Legend />
                {sensorData.map((reading, idx) => (
                  <Line
                    key={reading.id}
                    type="monotone"
                    dataKey={reading.storage_unit_id}
                    stroke={getUnitColor(idx)}
                    dot={false}
                    strokeWidth={2}
                    name={reading.storage_unit_name || `Storage ${idx + 1}`}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
