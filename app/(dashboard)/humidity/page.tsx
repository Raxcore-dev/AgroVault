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
        console.error('[AgroVault] Error fetching sensor data:', error)
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

  const colors = ['#2E7D32', '#1976D2', '#FB8C00', '#7B1FA2']

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
              24-hour humidity levels across all storage facilities
            </p>
          </div>
        </div>

        {/* Current Humidity Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {sensorData.map((data, idx) => (
            <div key={data.storageId} className="card-elevated rounded-lg p-5">
              <p className="text-sm font-medium text-muted-foreground">
                {storages[idx]?.name || `Storage ${idx + 1}`}
              </p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-3xl font-bold text-foreground">
                  {Math.round(data.humidity)}
                </span>
                <span className="text-sm text-muted-foreground mb-1">%</span>
              </div>
              <p className={`mt-2 text-xs font-semibold ${
                data.humidity < 60 
                  ? 'text-primary' 
                  : data.humidity < 75 
                    ? 'text-warning' 
                    : 'text-danger'
              }`}>
                {data.humidity < 60 ? '✓ Optimal' : data.humidity < 75 ? '⚠ Caution' : '✕ High Risk'}
              </p>
            </div>
          ))}
        </div>

        {/* Humidity Trend Chart */}
        <div className="card-elevated rounded-lg p-6">
          <h2 className="mb-6 text-lg font-semibold text-foreground">24-Hour Humidity Trends</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
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
