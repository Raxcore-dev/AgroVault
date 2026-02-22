'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { storages } from '@/lib/mock-data'
import { Droplets } from 'lucide-react'
import type { SensorData } from '@/lib/mock-data'

interface HumidityReading {
  time: string
  [key: string]: string | number
}

export default function HumidityPage() {
  const [sensorData, setSensorData] = useState<SensorData[]>([])
  const [chartData, setChartData] = useState<HumidityReading[]>([])

  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const response = await fetch('/api/sensors')
        if (response.ok) {
          setSensorData(await response.json())
        }
      } catch (error) {
        console.error('[v0] Error fetching sensor data:', error)
      }
    }

    const generateChartData = () => {
      const data: HumidityReading[] = []
      for (let i = 0; i < 24; i++) {
        const reading: HumidityReading = {
          time: `${String(i).padStart(2, '0')}:00`,
        }
        storages.forEach((storage) => {
          reading[storage.id] = 55 + Math.random() * 20 - 10
        })
        data.push(reading)
      }
      setChartData(data)
    }

    fetchSensorData()
    generateChartData()
    const interval = setInterval(fetchSensorData, 5000)
    return () => clearInterval(interval)
  }, [])

  const colors = ['#a855f7', '#ec4899', '#06b6d4', '#f59e0b']

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <Droplets className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Humidity Monitoring</h1>
          </div>
          <p className="mt-2 text-muted-foreground">
            24-hour humidity levels across all storage facilities
          </p>
        </div>

        {/* Current Humidity Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {sensorData.map((data, idx) => (
            <div
              key={data.storageId}
              className="rounded-lg border border-border bg-card p-6 shadow-md hover:shadow-lg transition-shadow"
            >
              <p className="text-sm font-medium text-muted-foreground">
                {storages[idx]?.name || `Storage ${idx + 1}`}
              </p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-3xl font-bold text-primary">
                  {Math.round(data.humidity)}
                </span>
                <span className="text-sm text-muted-foreground">%</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {data.humidity < 60 ? '✓ Optimal' : data.humidity < 75 ? '⚠ Caution' : '✕ High Risk'}
              </p>
            </div>
          ))}
        </div>

        {/* Humidity Trend Chart */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-lg">
          <h2 className="mb-6 text-xl font-semibold text-foreground">24-Hour Humidity Trends</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend />
              {storages.map((storage, idx) => (
                <Line
                  key={storage.id}
                  type="monotone"
                  dataKey={storage.id}
                  stroke={colors[idx % colors.length]}
                  dot={false}
                  strokeWidth={2}
                  name={storage.name}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
