'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { MarketData } from '@/lib/data/kenya-market-data'

interface MarketChartProps {
  data: MarketData[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-md">
        <p className="mb-1 text-sm font-semibold text-foreground">{label}</p>
        <p className="text-sm text-primary font-bold">
          {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(payload[0].value)}
        </p>
        <p className="text-xs text-muted-foreground mt-1 text-right">Per {payload[0].payload.unit}</p>
      </div>
    )
  }
  return null
}

export function MarketChart({ data }: MarketChartProps) {
  // Sort data by price to make the chart look more dynamic/organized
  const chartData = [...data].sort((a, b) => b.price - a.price).map((item) => ({
    crop: item.crop,
    price: item.price,
    unit: item.unit,
  }))

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="colorPriceHover" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={1} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
          <XAxis
            dataKey="crop"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `KES ${value}`}
            dx={-10}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }}
          />
          <Bar
            dataKey="price"
            radius={[6, 6, 0, 0]}
            fill="url(#colorPrice)"
            animationDuration={1500}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} className="hover:fill-[url(#colorPriceHover)] transition-all duration-300 transition-colors" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
