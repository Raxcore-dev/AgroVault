'use client'

import { useState } from 'react'
import { MarketTable } from '@/components/market-table'
import { AIMarketAnalysis } from '@/components/ai-market-analysis'
import { generateKenyaMarketData, KENYA_COUNTIES } from '@/lib/data/kenya-market-data'
import { MapPin, TrendingUp, TrendingDown, Minus, BarChart2 } from 'lucide-react'

const SORTED_COUNTIES = [...KENYA_COUNTIES].sort()

export default function MarketPage() {
  const [selectedCounty, setSelectedCounty] = useState('all')
  const marketData = generateKenyaMarketData(selectedCounty)

  const risingCount  = marketData.filter((d) => d.trend === 'up').length
  const fallingCount = marketData.filter((d) => d.trend === 'down').length
  const stableCount  = marketData.filter((d) => d.trend === 'stable').length

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="px-6 py-6 lg:px-8">
        {/* ── Header ── */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-xs mb-3">
              <BarChart2 className="h-3.5 w-3.5" />
              Live Market Data
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              Market Trends
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl">
              Current wholesale commodity prices and regional trends across all 47 Kenyan counties.
            </p>
          </div>

          {/* County selector */}
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

        {/* ── Price Movement Summary ── */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card-elevated rounded-xl p-4 flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2.5">
              <TrendingUp className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{risingCount}</p>
              <p className="text-xs text-muted-foreground">Rising</p>
            </div>
          </div>
          <div className="card-elevated rounded-xl p-4 flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2.5">
              <Minus className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stableCount}</p>
              <p className="text-xs text-muted-foreground">Stable</p>
            </div>
          </div>
          <div className="card-elevated rounded-xl p-4 flex items-center gap-3">
            <div className="rounded-lg bg-red-100 p-2.5">
              <TrendingDown className="h-5 w-5 text-red-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{fallingCount}</p>
              <p className="text-xs text-muted-foreground">Falling</p>
            </div>
          </div>
        </div>

        {/* ── AI Market Analysis ── */}
        <div className="mb-6 card-elevated rounded-xl overflow-hidden">
          <AIMarketAnalysis county={selectedCounty} marketData={marketData} />
        </div>

        {/* ── Detailed Price Table ── */}
        <div className="card-elevated rounded-xl overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Commodity Price Breakdown</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Wholesale prices per standard unit
              {selectedCounty !== 'all' ? ` — ${selectedCounty} County` : ' — National Average'}.
            </p>
          </div>
          <MarketTable data={marketData} />
        </div>
      </div>
    </div>
  )
}

