'use client'

import { useState } from 'react'
import { Loader } from 'lucide-react'
import type { MarketData } from '@/lib/mock-data'

interface AIMarketAnalysisProps {
  county: string
  marketData: MarketData[]
}

export function AIMarketAnalysis({ county, marketData }: AIMarketAnalysisProps) {
  const [analysis, setAnalysis] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const generateAnalysis = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/market-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          county: county === 'all' ? 'National' : county,
          marketData,
        }),
      })

      if (!response.ok) throw new Error('Failed to generate analysis')

      const data = await response.json()
      setAnalysis(data.analysis)
    } catch (error) {
      console.error('[v0] Error generating analysis:', error)
      setAnalysis('Unable to generate analysis at this time.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-accent/30 bg-gradient-to-r from-accent/5 to-primary/5 p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">AI Market Insights</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Powered by Groq AI - {county === 'all' ? 'National' : county} Analysis
          </p>
        </div>
        <button
          onClick={generateAnalysis}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-secondary px-6 py-2 text-white transition-all hover:shadow-lg disabled:opacity-50"
        >
          {loading && <Loader className="h-4 w-4 animate-spin" />}
          {loading ? 'Analyzing...' : 'Generate Analysis'}
        </button>
      </div>

      {analysis && (
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{analysis}</p>
        </div>
      )}
    </div>
  )
}
