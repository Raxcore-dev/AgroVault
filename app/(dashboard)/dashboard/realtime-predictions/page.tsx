/**
 * Real-Time AI Spoilage Predictions Dashboard
 *
 * Features:
 * - Real-time predictions updated every 10 seconds
 * - AI-powered risk analysis with confidence scores
 * - Early warning system
 * - Trend analysis visualization
 * - Market intelligence integration
 * - Filterable by risk level
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { AISpoilagePredictionCard } from '@/components/ai-spoilage-prediction-card'
import {
  AlertTriangle,
  TrendingDown,
  Package,
  RefreshCw,
  Clock,
  Brain,
  Activity,
  Zap,
  Shield,
} from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface TrendAnalysis {
  direction: 'rising' | 'falling' | 'stable'
  ratePerMinute: number
  changePercent: number
  volatility: 'low' | 'moderate' | 'high'
}

interface DurationExposure {
  minutesInHighRisk: number
  consecutiveBadReadings: number
  worstConditionDuration: string
}

interface EarlyWarning {
  triggered: boolean
  message: string
  urgency: 'low' | 'medium' | 'high'
  detectedPattern: string
}

interface MarketSuggestion {
  action: 'hold' | 'monitor_closely' | 'sell_soon' | 'sell_immediately'
  reason: string
  bestMarket?: {
    name: string
    location: string
    pricePerKg: number
    distance: number
  }
}

interface AIPrediction {
  riskLevel: 'safe' | 'warning' | 'high_risk' | 'critical'
  confidence: number
  spoilageProbability: number
  predictedTimeToSpoilage: string
  explanation: string
  primaryRiskFactors: string[]
  recommendations: string[]
  earlyWarning: EarlyWarning
  marketSuggestion?: MarketSuggestion
}

interface Prediction {
  storageUnitId: string
  storageUnitName: string
  location: string
  commodityName: string
  quantityStored: number
  unit: string
  daysInStorage: number
  temperature: number
  humidity: number
  temperatureTrend: TrendAnalysis
  humidityTrend: TrendAnalysis
  durationExposure: DurationExposure
  aiPrediction: AIPrediction
  estimatedLoss?: {
    percentage: number
    quantity: number
    value: number
  }
  readingsAnalyzed: number
  lastUpdated: string
}

interface Summary {
  totalPredictions: number
  criticalRiskCount: number
  highRiskCount: number
  warningCount: number
  safeCount: number
  totalEstimatedLoss: number
  earlyWarningsCount: number
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function RealTimePredictionsPage() {
  const { token } = useAuth()
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'critical' | 'high_risk' | 'warning' | 'safe'>('all')
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error'>('connected')

  const fetchPredictions = useCallback(async () => {
    if (!token) return

    try {
      setRefreshing(true)
      setConnectionStatus('connected')
      
      const res = await fetch('/api/sensors/prediction', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        const data = await res.json()
        setPredictions(data.predictions || [])
        setSummary(data.summary || null)
        setLastUpdated(new Date())
      } else if (res.status === 401) {
        setConnectionStatus('disconnected')
      } else {
        setConnectionStatus('error')
      }
    } catch (error) {
      console.error('Error fetching predictions:', error)
      setConnectionStatus('error')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [token])

  useEffect(() => {
    fetchPredictions()
  }, [fetchPredictions])

  // Auto-refresh every 10 seconds for real-time updates
  useEffect(() => {
    if (!autoRefresh) return

    const intervalId = setInterval(() => {
      fetchPredictions()
    }, 10000) // 10 seconds

    return () => clearInterval(intervalId)
  }, [autoRefresh, fetchPredictions])

  const filteredPredictions = predictions.filter(p => {
    if (filter === 'all') return true
    return p.aiPrediction.riskLevel === filter
  })

  // Count active early warnings
  const activeWarnings = predictions.filter(p => p.aiPrediction.earlyWarning.triggered).length

  // Calculate average confidence
  const avgConfidence = predictions.length > 0
    ? Math.round(predictions.reduce((sum, p) => sum + p.aiPrediction.confidence, 0) / predictions.length)
    : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <Brain className="h-6 w-6 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">AI is analyzing storage conditions...</p>
          <p className="text-xs text-muted-foreground mt-1">Processing sensor data and detecting trends</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-foreground">Real-Time Spoilage Predictions</h1>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    connectionStatus === 'connected'
                      ? 'bg-green-100 text-green-700'
                      : connectionStatus === 'error'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    <Activity className="h-3 w-3" />
                    {connectionStatus === 'connected' ? 'Live' : connectionStatus === 'error' ? 'Error' : 'Disconnected'}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    <Zap className="h-3 w-3" />
                    AI-Powered
                  </span>
                </div>
              </div>
              <p className="text-muted-foreground">
                Predictive analysis using temperature, humidity trends, and duration of exposure
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  autoRefresh
                    ? 'border-green-300 bg-green-50 text-green-700'
                    : 'border-border bg-background text-muted-foreground'
                }`}
              >
                Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={fetchPredictions}
                disabled={refreshing}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh Now
              </button>
            </div>
          </div>

          {/* Last Updated */}
          {lastUpdated && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-4">
              <Clock className="h-3.5 w-3.5" />
              Last updated: {lastUpdated.toLocaleTimeString('en-KE')}
              <span className="text-muted-foreground/60 mx-1">•</span>
              <span>Next update in {autoRefresh ? '10s' : '—'}</span>
            </p>
          )}

          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              <div className="card-elevated rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{summary.totalPredictions}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                </div>
              </div>

              <div className="card-elevated rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">{summary.criticalRiskCount}</p>
                    <p className="text-xs text-muted-foreground">Critical</p>
                  </div>
                </div>
              </div>

              <div className="card-elevated rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">{summary.highRiskCount}</p>
                    <p className="text-xs text-muted-foreground">High Risk</p>
                  </div>
                </div>
              </div>

              <div className="card-elevated rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">{summary.warningCount}</p>
                    <p className="text-xs text-muted-foreground">Warning</p>
                  </div>
                </div>
              </div>

              <div className="card-elevated rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Brain className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{avgConfidence}%</p>
                    <p className="text-xs text-muted-foreground">Avg Confidence</p>
                  </div>
                </div>
              </div>

              <div className="card-elevated rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <TrendingDown className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-secondary">
                      KES {(summary.totalEstimatedLoss / 1000).toFixed(1)}K
                    </p>
                    <p className="text-xs text-muted-foreground">At Risk</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-border">
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
              onClick={() => setFilter('critical')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                filter === 'critical'
                  ? 'border-red-700 text-red-700'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              🔴 Critical ({summary?.criticalRiskCount || 0})
            </button>
            <button
              onClick={() => setFilter('high_risk')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                filter === 'high_risk'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              🟠 High Risk ({summary?.highRiskCount || 0})
            </button>
            <button
              onClick={() => setFilter('warning')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                filter === 'warning'
                  ? 'border-yellow-600 text-yellow-600'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              🟡 Warning ({summary?.warningCount || 0})
            </button>
            <button
              onClick={() => setFilter('safe')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                filter === 'safe'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              ✅ Safe ({summary?.safeCount || 0})
            </button>
          </div>
        </div>

        {/* Early Warning Banner */}
        {activeWarnings > 0 && (
          <div className="mb-6 rounded-lg bg-amber-50 border-2 border-amber-200 p-4">
            <div className="flex items-start gap-3">
              <Activity className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900">
                  ⚠️ {activeWarnings} Early Warning{activeWarnings !== 1 ? 's' : ''} Active
                </h3>
                <p className="text-sm text-amber-700 mt-1">
                  Rapid changes or deteriorating conditions detected. Immediate attention recommended to prevent spoilage.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Critical Alert Banner */}
        {summary && summary.criticalRiskCount > 0 && (
          <div className="mb-6 rounded-lg bg-red-50 border-2 border-red-200 p-5">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-red-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-bold text-red-900 mb-2">
                  🚨 CRITICAL ALERT: Immediate Action Required
                </h3>
                <p className="text-sm text-red-700 mb-3">
                  You have <strong>{summary.criticalRiskCount} commodit{summary.criticalRiskCount === 1 ? 'y' : 'ies'}</strong> at 
                  critical risk of spoilage. Total estimated losses: <strong>KES {summary.totalEstimatedLoss.toLocaleString()}</strong>.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setFilter('critical')}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    View Critical Items
                  </button>
                  <button
                    onClick={() => setFilter('high_risk')}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    View High Risk
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Predictions Grid */}
        {filteredPredictions.length === 0 ? (
          <div className="card-elevated rounded-lg p-12 text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Predictions Available</h3>
            <p className="text-muted-foreground">
              {filter === 'all'
                ? 'Add commodities to your storage units to see AI-powered spoilage predictions.'
                : `No ${filter.replace('_', ' ')} risk commodities found. ${filter === 'safe' ? 'Great job maintaining optimal conditions!' : 'Keep monitoring your storage conditions.'}`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {filteredPredictions.map((prediction) => (
              <AISpoilagePredictionCard
                key={`${prediction.storageUnitId}-${prediction.commodityName}`}
                prediction={prediction}
              />
            ))}
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-8 rounded-lg bg-muted/50 border border-border p-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-2">How AI Spoilage Prediction Works</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our AI analyzes real-time sensor data (temperature and humidity), detects trends over time, 
                calculates duration of exposure to risky conditions, and predicts spoilage risk BEFORE it happens. 
                The system provides actionable recommendations and market suggestions to help you minimize losses 
                and maximize profits. Predictions are updated every 10 seconds for real-time monitoring.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
