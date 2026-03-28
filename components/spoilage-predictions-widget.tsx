/**
 * Spoilage Predictions Widget
 * 
 * Compact widget for the main dashboard showing high-risk spoilage predictions.
 * Links to the full spoilage predictions page.
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, TrendingDown, ArrowRight, RefreshCw } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { formatKES } from '@/lib/services/spoilage-prediction'

interface HighRiskPrediction {
  storageUnitName: string
  commodityName: string
  estimatedSpoilagePercentage: number
  estimatedEconomicLoss?: number
  riskLevel: {
    level: string
    label: string
  }
}

export function SpoilagePredictionsWidget() {
  const { token } = useAuth()
  const [predictions, setPredictions] = useState<HighRiskPrediction[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHighRiskPredictions = async () => {
      if (!token) return

      try {
        const res = await fetch('/api/spoilage-predictions?highRiskOnly=true', {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (res.ok) {
          const data = await res.json()
          setPredictions(data.predictions.slice(0, 3)) // Show top 3
          setSummary(data.summary)
        }
      } catch (error) {
        console.error('Error fetching predictions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHighRiskPredictions()
  }, [token])

  if (loading) {
    return (
      <div className="card-elevated rounded-lg p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (predictions.length === 0) {
    return (
      <div className="card-elevated rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Spoilage Predictions</h3>
          </div>
        </div>
        <div className="text-center py-6">
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
            <TrendingDown className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">All Clear!</p>
          <p className="text-xs text-muted-foreground">No high-risk spoilage detected</p>
        </div>
        <Link
          href="/dashboard/spoilage-predictions"
          className="flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 font-medium mt-4"
        >
          View All Predictions
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    )
  }

  return (
      <div className="card-elevated rounded-lg overflow-hidden border border-danger/20">
      {/* Header */}
      <div className="p-5 bg-danger/5 border-b border-danger/20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-danger" />
            <h3 className="font-semibold text-danger">High Spoilage Risk</h3>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-danger/10 text-danger text-xs font-semibold">
            {summary?.highRiskCount || 0} Alert{summary?.highRiskCount !== 1 ? 's' : ''}
          </span>
        </div>
        {summary?.totalEstimatedLoss > 0 && (
          <p className="text-sm text-danger">
            Potential loss: <span className="font-semibold">{formatKES(summary.totalEstimatedLoss)}</span>
          </p>
        )}
      </div>

      {/* Predictions List */}
      <div className="p-5 bg-white">
        <div className="space-y-3">
          {predictions.map((prediction, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-danger/5 border border-danger/10"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {prediction.commodityName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {prediction.storageUnitName}
                </p>
              </div>
              <div className="text-right ml-3">
                <p className="text-lg font-bold text-danger">
                  {prediction.estimatedSpoilagePercentage}%
                </p>
                {prediction.estimatedEconomicLoss && (
                  <p className="text-xs text-muted-foreground">
                    {formatKES(prediction.estimatedEconomicLoss)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <Link
          href="/dashboard/spoilage-predictions"
          className="flex items-center justify-center gap-2 text-sm text-danger hover:text-danger/80 font-medium mt-4 py-2 rounded-lg hover:bg-danger/5 transition-colors"
        >
          View All Predictions & Actions
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
