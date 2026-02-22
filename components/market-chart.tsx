'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { MarketData } from '@/lib/mock-data'

interface MarketChartProps {
  data: MarketData[]
}

export function MarketChart({ data }: MarketChartProps) {
  const chartData = data.map((item) => ({
    crop: item.crop,
    price: item.price,
  }))

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="crop" stroke="currentColor" />
          <YAxis stroke="currentColor" />
          <Tooltip />
          <Bar dataKey="price" fill="hsl(var(--primary))" name="Price (KES)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
