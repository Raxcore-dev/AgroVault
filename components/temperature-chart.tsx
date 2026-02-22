'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { SensorData } from '@/lib/mock-data'

interface TemperatureChartProps {
  sensorData: SensorData[]
}

export function TemperatureChart({ sensorData }: TemperatureChartProps) {
  // Generate time series data
  const hours = Array.from({ length: 24 }, (_, i) => {
    const date = new Date()
    date.setHours(date.getHours() - (23 - i))
    return {
      time: date.getHours() + ':00',
      avg: 18 + Math.sin(i / 4) * 4 + Math.random() * 2,
    }
  })

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={hours}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" stroke="currentColor" />
          <YAxis stroke="currentColor" />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="avg"
            stroke="hsl(var(--primary))"
            name="Avg Temperature (°C)"
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
