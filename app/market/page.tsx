'use client'

import { useState } from 'react'
import { MarketChart } from '@/components/market-chart'
import { MarketTable } from '@/components/market-table'
import { AIMarketAnalysis } from '@/components/ai-market-analysis'
import { generateKenyaMarketData, KENYA_COUNTIES } from '@/lib/data/kenya-market-data'
import { LineChart, MapPin, TrendingUp } from 'lucide-react'

const SORTED_COUNTIES = [...KENYA_COUNTIES].sort()

export default function MarketPage() {
  const [selectedCounty, setSelectedCounty] = useState('all')
  const marketData = generateKenyaMarketData(selectedCounty)

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="px-6 py-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-xs mb-3">
              <LineChart className="h-3.5 w-3.5" />
              Live Analytics
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              Market Intelligence
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl">
              Track real-time crop wholesale prices, regional trends, and receive AI-powered agronomic insights across all 47 Kenyan counties.
            </p>
          </div>

          {/* County Selection */}
          <div className="card-elevated rounded-xl p-4 flex-shrink-0 min-w-[260px]">
            <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              Select Region
            </label>
            <select
              value={selectedCounty}
              onChange={(e) => setSelectedCounty(e.target.value)}
              className="w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 pr-8 text-sm text-foreground font-medium focus:border-primary focus:ring-1 focus:ring-primary/30 focus:outline-none transition-colors cursor-pointer"
            >
              <option value="all">National Average</option>
              {SORTED_COUNTIES.map((county) => (
                <option key={county} value={county}>
                  {county} County
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Top Widgets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Price Comparison Chart */}
          <div className="lg:col-span-2 card-elevated rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Regional Price Index</h2>
                  <p className="text-xs text-muted-foreground">Average wholesale prices in KES</p>
                </div>
              </div>
            </div>
            <MarketChart data={marketData} />
          </div>

          {/* AI Analysis Section */}
          <div className="lg:col-span-1 card-elevated rounded-xl overflow-hidden">
            <AIMarketAnalysis county={selectedCounty} marketData={marketData} />
          </div>
        </div>

        {/* Detailed Market Data Table */}
        <div className="card-elevated rounded-xl overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Comprehensive Commodity Pricing</h2>
            <p className="text-sm text-muted-foreground mt-1">Detailed wholesale breakdown per standard unit.</p>
          </div>
          <MarketTable data={marketData} />
        </div>
      </div>
    </div>
  )
}
