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
  const [error, setError] = useState<string>('')

  const generateAnalysis = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/market-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          county: county === 'all' ? 'National' : county,
          marketData,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      const data = await response.json()
      setAnalysis(data.analysis)
    } catch (err) {
      console.error('[AgroVault] Error generating analysis:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border flex flex-col items-center text-center">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
          <Cpu className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">AI Agronomic Insights</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Powered by DeepSeek AI — {county === 'all' ? 'National Overview' : `${county} Region`}
        </p>
      </div>

      <div className="flex-1 p-6 flex flex-col overflow-hidden">
        <div>
          {!analysis && !loading ? (
            <div className="flex flex-col items-center justify-center text-center py-8">
              {error && (
                <div className="mb-4 p-3 bg-danger/5 border border-danger/20 rounded-lg text-danger text-sm">
                  {error}
                </div>
              )}
              <p className="text-muted-foreground text-sm mb-6 max-w-xs">
                Generate a comprehensive analysis of the current market conditions and strategic advice for farmers.
              </p>
              <button
                onClick={generateAnalysis}
                className="btn-cta inline-flex items-center gap-2 text-sm"
              >
                <Sparkles className="h-4 w-4" />
                Generate Deep Analysis
              </button>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-secondary animate-spin" />
              <p className="mt-4 text-sm font-medium text-muted-foreground">Analyzing market patterns...</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-2">
              <div className="prose prose-sm max-w-none text-foreground leading-relaxed">
                {analysis.split('\n').map((paragraph, index) => {
                  if (!paragraph.trim()) return <br key={index} />
                  const formattedText = paragraph.split(/(\*\*.*?\*\*)/g).map((part, i) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return <strong key={i} className="text-primary font-bold">{part.slice(2, -2)}</strong>
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
                  className="text-xs flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
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
