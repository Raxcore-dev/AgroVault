'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts'
import { TrendingUp, TrendingDown, ArrowRight, ShoppingCart, BarChart3, Wheat, Activity } from 'lucide-react'
import { storages } from '@/lib/mock-data'
import type { SensorData, MarketData, RiskData } from '@/lib/mock-data'

export default function Dashboard() {
  const [sensorData, setSensorData] = useState<SensorData[]>([])
  const [marketData, setMarketData] = useState<MarketData[]>([])
  const [riskData, setRiskData] = useState<RiskData[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sensorsRes, marketRes, riskRes] = await Promise.all([
          fetch('/api/sensors'),
          fetch('/api/market'),
          fetch('/api/risk'),
        ])
        if (sensorsRes.ok) setSensorData(await sensorsRes.json())
        if (marketRes.ok) setMarketData(await marketRes.json())
        if (riskRes.ok) setRiskData(await riskRes.json())
        setLastUpdated(new Date())
      } catch (error) {
        console.error('[AgroVault] Error fetching data:', error)
      }
    }
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  const avgTemp = sensorData.length
    ? (sensorData.reduce((acc, s) => acc + s.temperature, 0) / sensorData.length).toFixed(1)
    : '0'
  const avgHumidity = sensorData.length
    ? (sensorData.reduce((acc, s) => acc + s.humidity, 0) / sensorData.length).toFixed(1)
    : '0'
  const highRiskCount = riskData.filter((r) => r.riskLevel === 'high').length
  const topCrop = marketData.length
    ? marketData.reduce((max, crop) => (crop.price > (max.price || 0) ? crop : max), {} as MarketData)
    : null

  // Generate sparkline data for market trend cards
  const generateSparkline = (base: number, trend: 'up' | 'down' | 'stable') => {
    return Array.from({ length: 12 }, (_, i) => ({
      v: base + (trend === 'up' ? i * 2 : trend === 'down' ? -i * 1.5 : 0) + (Math.random() - 0.5) * base * 0.08,
    }))
  }

  // Generate price chart data
  const priceChartData = Array.from({ length: 24 }, (_, i) => {
    const hour = String(i).padStart(2, '0') + ':00'
    return {
      time: hour,
      maize: 3200 + Math.sin(i / 3) * 200 + Math.random() * 100,
      wheat: 4500 + Math.cos(i / 4) * 300 + Math.random() * 150,
      rice: 8200 + Math.sin(i / 5) * 400 + Math.random() * 200,
    }
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Welcome back, John.{' '}
              {lastUpdated && (
                <span>Last updated {lastUpdated.toLocaleTimeString()}</span>
              )}
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/market" className="btn-cta inline-flex items-center gap-2 text-sm">
              <ShoppingCart className="h-4 w-4" />
              Start Trading
            </Link>
            <Link href="/risk" className="btn-primary inline-flex items-center gap-2 text-sm">
              <BarChart3 className="h-4 w-4" />
              View Analytics
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="card-elevated rounded-xl p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Avg Temperature</p>
              <div className="rounded-lg bg-primary/10 p-2">
                <Activity className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">{avgTemp}°C</p>
            <p className="mt-1 text-xs text-muted-foreground">Across {sensorData.length} units</p>
          </div>

          <div className="card-elevated rounded-xl p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Avg Humidity</p>
              <div className="rounded-lg bg-accent/10 p-2">
                <Activity className="h-4 w-4 text-accent" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">{avgHumidity}%</p>
            <p className="mt-1 text-xs text-muted-foreground">All storage</p>
          </div>

          <div className="card-elevated rounded-xl p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Risk Alerts</p>
              <div className={`rounded-lg p-2 ${highRiskCount > 0 ? 'bg-danger/10' : 'bg-primary/10'}`}>
                <Activity className={`h-4 w-4 ${highRiskCount > 0 ? 'text-danger' : 'text-primary'}`} />
              </div>
            </div>
            <p className={`mt-3 text-2xl font-bold ${highRiskCount > 0 ? 'text-danger' : 'text-foreground'}`}>{highRiskCount}</p>
            <p className="mt-1 text-xs text-muted-foreground">High risk facilities</p>
          </div>

          <div className="card-elevated rounded-xl p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Top Commodity</p>
              <div className="rounded-lg bg-secondary/10 p-2">
                <Wheat className="h-4 w-4 text-secondary" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">{topCrop?.crop || 'N/A'}</p>
            <p className="mt-1 text-xs text-secondary font-medium">KES {topCrop?.price?.toLocaleString() || '0'}</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Price Chart - takes 2 cols */}
          <div className="lg:col-span-2 card-elevated rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Price Trends</h2>
                <p className="text-sm text-muted-foreground">24-hour commodity price movement</p>
              </div>
              <div className="flex gap-4 text-xs">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" /> Maize</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-accent" /> Wheat</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-secondary" /> Rice</span>
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={priceChartData}>
                  <defs>
                    <linearGradient id="gradPrimary" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradAccent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1976D2" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#1976D2" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '13px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}
                  />
                  <Area type="monotone" dataKey="maize" stroke="#2E7D32" strokeWidth={2} fill="url(#gradPrimary)" dot={false} />
                  <Area type="monotone" dataKey="wheat" stroke="#1976D2" strokeWidth={2} fill="url(#gradAccent)" dot={false} />
                  <Line type="monotone" dataKey="rice" stroke="#FB8C00" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Market Trend Cards - right column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Market Trends</h2>
              <Link href="/market" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {marketData.slice(0, 5).map((item) => {
              const isUp = item.priceChange > 0
              const changePercent = item.price > 0 ? ((item.priceChange / item.price) * 100).toFixed(1) : '0'
              const sparkData = generateSparkline(item.price, item.trend)

              return (
                <div key={item.crop} className="card-elevated rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/8 flex items-center justify-center text-primary font-bold text-sm border border-primary/10">
                        {item.crop.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{item.crop}</p>
                        <p className="text-xs text-muted-foreground">Per {item.unit}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">
                        KES {item.price.toLocaleString()}
                      </p>
                      <div className={`flex items-center gap-1 text-xs font-semibold ${isUp ? 'text-primary' : 'text-danger'}`}>
                        {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {isUp ? '+' : ''}{changePercent}%
                      </div>
                    </div>
                  </div>

                  {/* Mini sparkline */}
                  <div className="mt-3 h-8">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sparkData}>
                        <Line
                          type="monotone"
                          dataKey="v"
                          stroke={isUp ? '#2E7D32' : '#D32F2F'}
                          strokeWidth={1.5}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Storage Facilities Grid */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Storage Facilities</h2>
            <Link href="/temperature" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              View details <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {storages.map((storage, idx) => {
              const sensor = sensorData[idx]
              const risk = riskData[idx]
              return (
                <div key={storage.id} className="card-elevated rounded-xl p-5">
                  <h3 className="font-semibold text-foreground text-sm">{storage.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{storage.location}</p>
                  {sensor && (
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-primary/5 p-2.5">
                        <p className="text-[11px] text-muted-foreground">Temp</p>
                        <p className="text-lg font-bold text-primary">{sensor.temperature.toFixed(1)}°C</p>
                      </div>
                      <div className="rounded-lg bg-accent/5 p-2.5">
                        <p className="text-[11px] text-muted-foreground">Humidity</p>
                        <p className="text-lg font-bold text-accent">{sensor.humidity.toFixed(1)}%</p>
                      </div>
                    </div>
                  )}
                  {risk && (
                    <div className="mt-3">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        risk.riskLevel === 'high'
                          ? 'bg-danger/10 text-danger'
                          : risk.riskLevel === 'medium'
                            ? 'bg-warning/10 text-warning'
                            : 'bg-primary/10 text-primary'
                      }`}>
                        {risk.riskLevel.charAt(0).toUpperCase() + risk.riskLevel.slice(1)} Risk
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
