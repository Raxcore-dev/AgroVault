'use client'

import { useState } from 'react'
import { MarketChart } from '@/components/market-chart'
import { MarketTable } from '@/components/market-table'
import { AIMarketAnalysis } from '@/components/ai-market-analysis'
import { generateMarketData } from '@/lib/mock-data'
import { Leaf } from 'lucide-react'

const COUNTIES = [
  'all',
  'Nairobi',
  'Kiambu',
  'Kajiado',
  'Nakuru',
  'Nyeri',
  'Murang\'a',
  'Kericho',
  'Bomet',
  'Kisii',
  'Nyamira',
]

export default function MarketPage() {
  const [selectedCounty, setSelectedCounty] = useState('all')
  const marketData = generateMarketData(selectedCounty)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <Leaf className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Market Intelligence</h1>
          </div>
          <p className="mt-2 text-muted-foreground">
            Real-time crop prices, trends, and AI-powered recommendations
          </p>
        </div>

        {/* County Selection */}
        <div className="mb-8 rounded-xl border border-primary/20 bg-card/50 p-6 backdrop-blur">
          <label className="block text-sm font-semibold text-foreground mb-3">
            Select County for Analysis
          </label>
          <select
            value={selectedCounty}
            onChange={(e) => setSelectedCounty(e.target.value)}
            className="w-full max-w-xs rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none"
          >
            {COUNTIES.map((county) => (
              <option key={county} value={county}>
                {county === 'all' ? 'National Average' : county}
              </option>
            ))}
          </select>
        </div>

        {/* Market Chart */}
        <div className="mb-8 rounded-xl border border-border bg-card p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Price Comparison</h2>
          <MarketChart data={marketData} />
        </div>

        {/* AI Analysis Section */}
        <div className="mb-8">
          <AIMarketAnalysis county={selectedCounty} marketData={marketData} />
        </div>

        {/* Market Table */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Detailed Market Data</h2>
          <MarketTable data={marketData} />
        </div>
      </div>
    </div>
  )
}
