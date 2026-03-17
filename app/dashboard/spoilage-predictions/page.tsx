/**
 * Spoilage Predictions Dashboard Page
 * 
 * Displays all spoilage risk predictions for farmer's storage units.
 * Shows high-risk items first with actionable recommendations.
 */

'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { SpoilagePredictionCard } from '@/components/spoilage-prediction-card'
import { AlertTriangle, TrendingDown, Package, RefreshCw, Filter } from 'lucide-react'
import { formatKES } from '@/lib/services/spoilage-prediction'

interface Prediction {
  storageUnitId: string
  storageUnitName: string
  storageLocation: string
  commodityId: string
  commodityName: string
  quantityStored: number
  unit: string
  currentTemperature: number
  currentHumidity: number
  riskLevel: {
    level: 'safe' | 'moderate' | 'high'
    color: 'green' | 'orange' | 'red'
    label: string
  }
  estimatedSpoilagePercentage: number
  estimatedSpoilageQuantity: number
  timeframeHours: number
  estimatedEconomicLoss?: number
  immediateActions: string[]
  marketRecommendation?: string
  lastReadingTime: string
}

interface Summary {
  totalPredictions: number
  highRiskCount: number
  moderateRiskCount: number
  safeCount: number
  totalEstimatedLoss: number
  alertsNeeded: number
}

export default function SpoilagePredictionsPage() {
  const { token } = useAuth()
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'high' | 'moderate'>('all')
  const [refreshing, setRefreshing] = useState(false)

  const fetchPredictions = async () => {
    if (!token) return

    try {
      setRefreshing(true)
      const highRiskOnly = filter === 'high' ? '?highRiskOnly=true' : ''
      const res = await fetch(`/api/spoilage-predictions${highRiskOnly}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        const data = await res.json()
        setPredictions(data.predictions || [])
        setSummary(data.summary || null)
      }
    } catch (error) {
      console.error('Error fetching predictions:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchPredictions()
  }, [token, filter])

  const filteredPredictions = predictions.filter(p => {
    if (filter === 'all') return true
    if (filter === 'high') return p.riskLevel.level === 'high'
    if (filter === 'moderate') return p.riskLevel.level === 'moderate'
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Analyzing storage conditions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Spoilage Risk Predictions</h1>
              <p className="mt-2 text-muted-foreground">
                AI-powered analysis of your storage conditions and potential crop losses
              </p>
            </div>
            <button
              onClick={fetchPredictions}
              disabled={refreshing}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="card-elevated rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{summary.totalPredictions}</p>
                    <p className="text-xs text-muted-foreground">Total Commodities</p>
                  </div>
                </div>
              </div>

              <div className="card-elevated rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">{summary.highRiskCount}</p>
                    <p className="text-xs text-muted-foreground">High Risk</p>
                  </div>
                </div>
              </div>

              <div className="card-elevated rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">{summary.moderateRiskCount}</p>
                    <p className="text-xs text-muted-foreground">Moderate Risk</p>
                  </div>
                </div>
              </div>

              <div className="card-elevated rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <TrendingDown className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-secondary">{formatKES(summary.totalEstimatedLoss)}</p>
                    <p className="text-xs text-muted-foreground">Potential Loss</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 border-b border-border">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                filter === 'all'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              All ({summary?.totalPredictions || 0})
            </button>
            <button
              onClick={() => setFilter('high')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                filter === 'high'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              High Risk ({summary?.highRiskCount || 0})
            </button>
            <button
              onClick={() => setFilter('moderate')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                filter === 'moderate'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Moderate Risk ({summary?.moderateRiskCount || 0})
            </button>
          </div>
        </div>

        {/* Predictions Grid */}
        {filteredPredictions.length === 0 ? (
          <div className="card-elevated rounded-lg p-12 text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Predictions Available</h3>
            <p className="text-muted-foreground">
              {filter === 'all'
                ? 'Add commodities to your storage units to see spoilage predictions.'
                : `No ${filter} risk commodities found. This is good news!`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPredictions.map((prediction) => (
              <SpoilagePredictionCard
                key={`${prediction.storageUnitId}-${prediction.commodityId}`}
                prediction={prediction}
              />
            ))}
          </div>
        )}

        {/* Alert Banner for High Risk */}
        {summary && summary.highRiskCount > 0 && (
          <div className="mt-8 rounded-lg bg-red-50 border-2 border-red-200 p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-red-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-2">
                  Urgent Action Required
                </h3>
                <p className="text-sm text-red-700 mb-3">
                  You have {summary.highRiskCount} commodit{summary.highRiskCount === 1 ? 'y' : 'ies'} at high risk of spoilage.
                  Immediate action is recommended to prevent losses totaling {formatKES(summary.totalEstimatedLoss)}.
                </p>
                <div className="flex gap-3">
                  <button className="btn-cta text-sm">
                    View Market Prices
                  </button>
                  <button className="text-sm font-medium text-red-700 hover:text-red-900">
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
