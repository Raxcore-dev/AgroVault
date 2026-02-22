'use client'

import { useEffect, useState } from 'react'
import { TemperatureChart } from '@/components/temperature-chart'
import { storages } from '@/lib/mock-data'
import type { SensorData } from '@/lib/mock-data'

export default function TemperaturePage() {
  const [sensorData, setSensorData] = useState<SensorData[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const res = await fetch('/api/sensors')
      if (res.ok) {
        setSensorData(await res.json())
      }
    } catch (error) {
      console.error('[v0] Error fetching sensor data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Temperature Monitoring</h1>
        <p className="mt-2 text-muted-foreground">
          Real-time temperature tracking across all storage facilities
        </p>
      </div>

      {/* Temperature Trend Chart */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
        <h2 className="mb-6 text-xl font-semibold text-foreground">24-Hour Trend</h2>
        <TemperatureChart sensorData={sensorData} />
      </div>

      {/* Individual Storage Temperatures */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-foreground">Storage Facility Details</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {storages.map((storage) => {
            const sensor = sensorData.find((s) => s.storageId === storage.id)
            const tempStatus =
              !sensor ? 'N/A' : sensor.temperature < 15 ? '❄️ Cold' : sensor.temperature > 25 ? '🔥 Hot' : '✅ Optimal'

            return (
              <div key={storage.id} className="rounded-lg border border-border bg-card p-6">
                <h3 className="font-semibold text-foreground">{storage.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{storage.location}</p>
                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Temperature</p>
                    <p className="text-2xl font-bold text-primary">
                      {sensor ? sensor.temperature.toFixed(1) : 'N/A'}°C
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Humidity</p>
                    <p className="text-2xl font-bold text-accent">
                      {sensor ? sensor.humidity.toFixed(1) : 'N/A'}%
                    </p>
                  </div>
                  <div className="pt-2">
                    <p className="text-sm font-medium">{tempStatus}</p>
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
