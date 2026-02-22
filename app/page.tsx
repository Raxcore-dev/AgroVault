'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { CountyFilter } from '@/components/county-filter'
import { StorageCard } from '@/components/storage-card'
import { MarketTable } from '@/components/market-table'
import { MarketChart } from '@/components/market-chart'
import { Alerts } from '@/components/alerts'
import { StatsOverview } from '@/components/stats-overview'
import { TemperatureChart } from '@/components/temperature-chart'
import { Footer } from '@/components/footer'
import { useAgrovaultData } from '@/hooks/use-agrovault-data'
import { storages } from '@/lib/mock-data'

export default function Dashboard() {
  const [selectedCounty, setSelectedCounty] = useState('all')
  const { sensorData, marketData, riskData, loading, lastUpdated } = useAgrovaultData(selectedCounty)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Geographic Intelligence Filter */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <CountyFilter selectedCounty={selectedCounty} onCountyChange={setSelectedCounty} />
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${loading ? 'bg-yellow-500' : 'bg-green-500'}`} />
            <span className="text-xs text-muted-foreground sm:text-sm">
              {loading ? 'Updating...' : `Last update: ${lastUpdated?.toLocaleTimeString() || 'Just now'}`}
            </span>
          </div>
        </div>

        {/* Key Statistics */}
        <section className="mb-8">
          <StatsOverview sensorData={sensorData} riskData={riskData} />
        </section>

        {/* Storage Environment Monitoring Section */}
        <section className="mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground">Storage Environment Monitoring</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Real-time temperature and humidity tracking across all facilities
            </p>
          </div>

          {/* Temperature Trend Chart */}
          <div className="mb-6 rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">24-Hour Temperature Trend</h3>
            <TemperatureChart sensorData={sensorData} />
          </div>

          {/* Individual Storage Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {storages.map((storage) => {
              const sensor = sensorData.find((s) => s.storageId === storage.id)
              const risk = riskData.find((r) => r.storageId === storage.id)
              return <StorageCard key={storage.id} storageId={storage.id} sensorData={sensor} riskData={risk} />
            })}
          </div>
        </section>

        {/* Market Intelligence Section */}
        <section className="mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground">Market Intelligence</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Real-time price trends and recommendations for optimal selling decisions
            </p>
          </div>

          {/* Price Comparison Chart */}
          <div className="mb-6 rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Crop Prices Comparison</h3>
            <MarketChart data={marketData} />
          </div>

          {/* Market Table */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Detailed Market Analysis</h3>
            <MarketTable data={marketData} />
          </div>
        </section>

        {/* Risk Scoring & Alerts Section */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground">Risk Assessment & Alerts</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Spoilage risk monitoring and actionable recommendations
            </p>
          </div>
          <Alerts riskData={riskData} />
        </section>
      </main>
      <Footer />
    </div>
  )
}
