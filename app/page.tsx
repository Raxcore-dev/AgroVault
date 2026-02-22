'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Thermometer, Droplets, AlertTriangle, TrendingUp, Activity, ArrowRight } from 'lucide-react'
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
        console.error('[v0] Error fetching data:', error)
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
    ? marketData.reduce((max, crop) =>
        crop.price > (max.price || 0) ? crop : max,
        {} as MarketData
      )
    : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground">Welcome to AgroVault</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Agricultural storage and market intelligence platform
          </p>
          {lastUpdated && (
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="h-4 w-4 text-success" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Quick Stats Grid */}
        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Temperature */}
          <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 p-6 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Temperature</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{avgTemp}°C</p>
                <p className="mt-1 text-xs text-muted-foreground">Across all storage</p>
              </div>
              <Thermometer className="h-8 w-8 text-primary" />
            </div>
          </div>

          {/* Humidity */}
          <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 p-6 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Humidity</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{avgHumidity}%</p>
                <p className="mt-1 text-xs text-muted-foreground">Across all storage</p>
              </div>
              <Droplets className="h-8 w-8 text-primary" />
            </div>
          </div>

          {/* Risk Alert */}
          <div className="rounded-xl border border-danger/20 bg-gradient-to-br from-danger/10 to-danger/5 p-6 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Risk Storage</p>
                <p className="mt-2 text-3xl font-bold text-danger">{highRiskCount}</p>
                <p className="mt-1 text-xs text-muted-foreground">Needs attention</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-danger" />
            </div>
          </div>

          {/* Top Crop */}
          <div className="rounded-xl border border-accent/20 bg-gradient-to-br from-accent/10 to-accent/5 p-6 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Highest Price Crop</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{topCrop?.crop || 'N/A'}</p>
                <p className="mt-1 text-xs text-muted-foreground">KES {topCrop?.price || '0'}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-accent" />
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Temperature Card */}
          <Link href="/temperature">
            <div className="group cursor-pointer rounded-xl border border-border bg-card p-8 shadow-md transition-all hover:shadow-xl hover:border-primary/50">
              <div className="flex items-center justify-between">
                <div>
                  <Thermometer className="h-10 w-10 text-primary" />
                  <h3 className="mt-4 text-lg font-semibold text-foreground">Temperature</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Monitor 24-hour temperature trends
                  </p>
                </div>
              </div>
              <ArrowRight className="mt-4 h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Humidity Card */}
          <Link href="/humidity">
            <div className="group cursor-pointer rounded-xl border border-border bg-card p-8 shadow-md transition-all hover:shadow-xl hover:border-primary/50">
              <div className="flex items-center justify-between">
                <div>
                  <Droplets className="h-10 w-10 text-primary" />
                  <h3 className="mt-4 text-lg font-semibold text-foreground">Humidity</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Track humidity levels in storage</p>
                </div>
              </div>
              <ArrowRight className="mt-4 h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Market Intelligence Card */}
          <Link href="/market">
            <div className="group cursor-pointer rounded-xl border border-border bg-card p-8 shadow-md transition-all hover:shadow-xl hover:border-primary/50">
              <div className="flex items-center justify-between">
                <div>
                  <TrendingUp className="h-10 w-10 text-primary" />
                  <h3 className="mt-4 text-lg font-semibold text-foreground">Market Analysis</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    AI-powered market insights by county
                  </p>
                </div>
              </div>
              <ArrowRight className="mt-4 h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Risk Assessment Card */}
          <Link href="/risk">
            <div className="group cursor-pointer rounded-xl border border-border bg-card p-8 shadow-md transition-all hover:shadow-xl hover:border-primary/50">
              <div className="flex items-center justify-between">
                <div>
                  <AlertTriangle className="h-10 w-10 text-primary" />
                  <h3 className="mt-4 text-lg font-semibold text-foreground">Risk Assessment</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Spoilage risk analysis</p>
                </div>
              </div>
              <ArrowRight className="mt-4 h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>

        {/* Storage Facilities Overview */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-foreground">Storage Facilities Overview</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {storages.map((storage, idx) => {
              const sensor = sensorData[idx]
              const risk = riskData[idx]
              return (
                <div
                  key={storage.id}
                  className="rounded-lg border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-foreground">{storage.name}</h3>
                  {sensor && (
                    <>
                      <div className="mt-3 flex justify-between text-sm">
                        <span className="text-muted-foreground">Temp:</span>
                        <span className="font-medium text-foreground">{sensor.temperature.toFixed(1)}°C</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Humidity:</span>
                        <span className="font-medium text-foreground">{sensor.humidity.toFixed(1)}%</span>
                      </div>
                    </>
                  )}
                  {risk && (
                    <div className="mt-3">
                      <p
                        className={`text-xs font-semibold uppercase ${
                          risk.riskLevel === 'high'
                            ? 'text-danger'
                            : risk.riskLevel === 'medium'
                              ? 'text-warning'
                              : 'text-success'
                        }`}
                      >
                        {risk.riskLevel} Risk
                      </p>
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
