'use client'

import { useState } from 'react'
import { Loader2, Sparkles, Cpu } from 'lucide-react'
import type { MarketData } from '@/lib/data/kenya-market-data'

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
      console.error('[AgroVault] Error generating analysis:', error)
      setAnalysis('Unable to generate analysis at this time. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border bg-muted/10 flex flex-col items-center text-center">
        <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-4 shadow-sm relative">
          <Cpu className="h-6 w-6 relative z-10" />
          <div className="absolute inset-0 bg-accent rounded-full opacity-10 blur-sm" />
        </div>
        <h2 className="text-xl font-bold text-foreground">AI Agronomic Insights</h2>
        <p className="mt-2 text-sm text-muted-foreground px-4">
          Powered by DeepSeek AI - {county === 'all' ? 'National Overview' : `${county} Region`}
        </p>
      </div>

      <div className="flex-1 p-6 flex flex-col relative overflow-hidden">
        <div>
          {!analysis && !loading ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center py-8 animate-in fade-in duration-500">
              <p className="text-muted-foreground text-sm mb-6 max-w-xs">
                Generate a comprehensive analysis of the current market conditions and strategic advice for farmers.
              </p>
              <button
                onClick={generateAnalysis}
                className="group relative inline-flex items-center gap-2 rounded-full bg-accent/10 hover:bg-accent/20 border border-accent/20 px-6 py-3 text-sm font-semibold text-accent transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <Sparkles className="h-4 w-4" />
                Generate Deep Analysis
                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-full border border-accent opacity-0 group-hover:opacity-100 scale-105 group-hover:scale-110 transition-all duration-300" />
              </button>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center flex-1 py-12 animate-in fade-in duration-300">
              <div className="relative">
                <Loader2 className="h-10 w-10 text-accent animate-spin" />
                <div className="absolute inset-0 border-t-2 border-accent rounded-full animate-ping opacity-50" />
              </div>
              <p className="mt-4 text-sm font-medium text-accent animate-pulse">Analyzing market patterns...</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed">
                {analysis.split('\n').map((paragraph, index) => {
                  if (!paragraph.trim()) return <br key={index} />
                  // Basic formatting for markdown-like bold text **text**
                  const formattedText = paragraph.split(/(\*\*.*?\*\*)/g).map((part, i) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return <strong key={i} className="text-secondary font-bold">{part.slice(2, -2)}</strong>
                    }
                    return part
                  })

                  return (
                    <p key={index} className="mb-3 last:mb-0">
                      {formattedText}
                    </p>
                  )
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-border flex justify-end">
                <button
                  onClick={generateAnalysis}
                  className="text-xs flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Sparkles className="h-3 w-3" />
                  Regenerate
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
