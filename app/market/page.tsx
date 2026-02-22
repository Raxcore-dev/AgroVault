'use client'

import { useState } from 'react'
import { MarketChart } from '@/components/market-chart'
import { MarketTable } from '@/components/market-table'
import { AIMarketAnalysis } from '@/components/ai-market-analysis'
import { generateKenyaMarketData, KENYA_COUNTIES } from '@/lib/data/kenya-market-data'
import { LineChart, MapPin, TrendingUp } from 'lucide-react'

// Sort counties alphabetically for the dropdown
const SORTED_COUNTIES = [...KENYA_COUNTIES].sort()

export default function MarketPage() {
  const [selectedCounty, setSelectedCounty] = useState('all')
  const marketData = generateKenyaMarketData(selectedCounty)

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Very subtle background pattern for deep modern feel */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8 relative z-10">

        {/* Header Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-4">
              <LineChart className="h-4 w-4" />
              Live Analytics
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
              Market Intelligence
            </h1>
            <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
              Track real-time crop wholesale prices, regional trends, and receive AI-powered agronomic insights across all 47 Kenyan counties.
            </p>
          </div>

          {/* County Selection Clean Card */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex-shrink-0 min-w-[280px]">
            <label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
              <MapPin className="h-4 w-4 text-primary" />
              Select Region
            </label>
            <div className="relative">
              <select
                value={selectedCounty}
                onChange={(e) => setSelectedCounty(e.target.value)}
                className="w-full appearance-none rounded-lg border border-border bg-background px-4 py-2.5 pr-10 text-foreground font-medium focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all cursor-pointer hover:bg-muted/30"
              >
                <option value="all">National Average</option>
                {SORTED_COUNTIES.map((county) => (
                  <option key={county} value={county}>
                    {county} County
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                <svg className="h-4 w-4 fill-current opacity-70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Top Widgets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Price Comparison Chart */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm relative group animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-md text-primary">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Regional Price Index</h2>
                  <p className="text-sm text-muted-foreground">Average wholesale prices in KES</p>
                </div>
              </div>
            </div>
            <MarketChart data={marketData} />
          </div>

          {/* AI Analysis Section */}
          <div className="lg:col-span-1 rounded-xl border border-border bg-card shadow-sm overflow-hidden relative animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
            <AIMarketAnalysis county={selectedCounty} marketData={marketData} />
          </div>
        </div>

        {/* Detailed Market Data Table */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-both">
          <div className="p-6 border-b border-border bg-muted/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Comprehensive Commodity Pricing</h2>
              <p className="text-sm text-muted-foreground mt-1">Detailed wholesale breakdown per standard unit.</p>
            </div>
          </div>
          <MarketTable data={marketData} />
        </div>

      </div>
    </div>
  )
}
