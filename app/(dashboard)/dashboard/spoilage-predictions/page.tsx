/**
 * Spoilage Predictions Dashboard Page - Enhanced with Real-Time Trend Analysis
 *
 * Displays AI-powered spoilage risk predictions with:
 * - Real-time temperature and humidity trends
 * - Time-based risk evaluation
 * - Early warning system
 * - Market-based selling recommendations
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { SpoilagePredictionCardEnhanced } from '@/components/spoilage-prediction-card-enhanced'
import {
  AlertTriangle,
  TrendingDown,
  Package,
  RefreshCw,
  Clock,
  Thermometer,
  Droplets,
  AlertCircle,
  Brain,
  Plus,
} from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface TrendData {
  direction: 'rising' | 'falling' | 'stable'
  ratePerMinute: number
  changePercent: number
}

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
  temperatureTrend: TrendData
  humidityTrend: TrendData
  riskLevel: {
    level: 'safe' | 'moderate' | 'high' | 'critical'
    color: 'green' | 'yellow' | 'orange' | 'red'
    label: string
    score: number
  }
  estimatedSpoilagePercentage: number
  estimatedSpoilageQuantity: number
  timeframeHours: number
  estimatedEconomicLoss?: number
  immediateActions: string[]
  marketRecommendation?: {
    action: 'hold' | 'monitor' | 'sell_soon' | 'sell_immediately'
    message: string
    bestMarket?: {
      name: string
      location: string
      pricePerKg: number
      distance: number
    }
  }
  earlyWarning?: {
    triggered: boolean
    message: string
    urgency: 'low' | 'medium' | 'high'
  }
  lastReadingTime: string
}

interface Summary {
  totalPredictions: number
  criticalRiskCount: number
  highRiskCount: number
  moderateRiskCount: number
  safeCount: number
  totalEstimatedLoss: number
  alertsNeeded: number
  withEarlyWarnings: number
}

interface UnitWithoutReadings {
  storageUnitId: string
  storageUnitName: string
  storageLocation: string
  commodityId: string
  commodityName: string
  quantityStored: number
  unit: string
}

// ─── Helper Functions ──────────────────────────────────────────────────────────

function formatKES(amount: number): string {
  return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function formatTimeframe(hours: number): string {
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''}`
  const days = Math.floor(hours / 24)
  return `${days} day${days !== 1 ? 's' : ''}`
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function SpoilagePredictionsPage() {
  const { token } = useAuth()
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [unitsWithoutReadings, setUnitsWithoutReadings] = useState<UnitWithoutReadings[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'moderate'>('all')
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchPredictions = useCallback(async () => {
    if (!token) return

    try {
      setRefreshing(true)
      const highRiskOnly = filter === 'high' || filter === 'critical' ? `?highRiskOnly=true` : ''
      const res = await fetch(`/api/spoilage-predictions${highRiskOnly}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        const data = await res.json()
        setPredictions(data.predictions || [])
        setSummary(data.summary || null)
        setUnitsWithoutReadings(data.unitsWithoutReadings || [])
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Error fetching predictions:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [token, filter])

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
    if (filter === 'critical') return p.riskLevel.level === 'critical'
    if (filter === 'high') return p.riskLevel.level === 'high'
    if (filter === 'moderate') return p.riskLevel.level === 'moderate'
    return true
  })

  // Count predictions with early warnings
  const earlyWarningCount = predictions.filter(p => p.earlyWarning?.triggered).length

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Analyzing storage conditions with AI...</p>
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
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold text-foreground">Spoilage Risk Predictions</h1>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                  <RefreshCw className="h-3 w-3" />
                  Real-time
                </span>
              </div>
              <p className="text-muted-foreground">
                AI-powered analysis with trend detection and market recommendations
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
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
                Refresh
              </button>
            </div>
          </div>

          {/* Last Updated */}
          {lastUpdated && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-4">
              <Clock className="h-3.5 w-3.5" />
              Last updated: {lastUpdated.toLocaleTimeString('en-KE')}
            </p>
          )}

          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
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
                    <p className="text-xs text-muted-foreground">High</p>
                  </div>
                </div>
              </div>

              <div className="card-elevated rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">{summary.moderateRiskCount}</p>
                    <p className="text-xs text-muted-foreground">Moderate</p>
                  </div>
                </div>
              </div>

              <div className="card-elevated rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{summary.withEarlyWarnings}</p>
                    <p className="text-xs text-muted-foreground">Warnings</p>
                  </div>
                </div>
              </div>

              <div className="card-elevated rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <TrendingDown className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-secondary">{formatKES(summary.totalEstimatedLoss)}</p>
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
              onClick={() => setFilter('high')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                filter === 'high'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              🟠 High ({summary?.highRiskCount || 0})
            </button>
            <button
              onClick={() => setFilter('moderate')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                filter === 'moderate'
                  ? 'border-yellow-600 text-yellow-600'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              🟡 Moderate ({summary?.moderateRiskCount || 0})
            </button>
          </div>
        </div>

        {/* Early Warning Banner */}
        {earlyWarningCount > 0 && (
          <div className="mb-6 rounded-lg bg-amber-50 border-2 border-amber-200 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900">
                  ⚠️ {earlyWarningCount} Early Warning{earlyWarningCount !== 1 ? 's' : ''} Active
                </h3>
                <p className="text-sm text-amber-700 mt-1">
                  Rapid changes detected in storage conditions. Immediate attention recommended.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Predictions Grid */}
        {filteredPredictions.length === 0 && unitsWithoutReadings.length === 0 ? (
          <div className="card-elevated rounded-lg p-12 text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Predictions Available</h3>
            <p className="text-muted-foreground">
              {filter === 'all'
                ? 'Add commodities to your storage units to see spoilage predictions.'
                : `No ${filter} risk commodities found. Great job maintaining optimal conditions!`}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Units Without Sensor Readings */}
            {unitsWithoutReadings.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  Commodities Without Sensor Data ({unitsWithoutReadings.length})
                </h2>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {unitsWithoutReadings.map((item) => (
                    <div
                      key={`${item.storageUnitId}-${item.commodityId}`}
                      className="card-elevated rounded-lg p-6 border-2 border-amber-200 bg-amber-50"
                    >
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                          <Thermometer className="h-6 w-6 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground text-lg">
                            {item.commodityName}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            📍 {item.storageUnitName} • {item.storageLocation}
                          </p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            📦 Quantity: {item.quantityStored} {item.unit}
                          </p>
                          <div className="mt-4 p-3 rounded-lg bg-white border border-amber-200">
                            <p className="text-sm text-amber-800 font-medium">
                              ⚠️ No sensor readings available
                            </p>
                            <p className="text-xs text-amber-700 mt-1">
                              Add an IoT sensor to this storage unit to get AI-powered spoilage predictions
                            </p>
                          </div>
                          <Link
                            href={`/dashboard/sensors?storageUnitId=${item.storageUnitId}`}
                            className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
                          >
                            <Plus className="h-4 w-4" />
                            Add Sensor to {item.storageUnitName}
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Predictions with Sensor Data */}
            {filteredPredictions.length > 0 && (
              <div>
                {unitsWithoutReadings.length > 0 && (
                  <h2 className="text-lg font-semibold text-foreground mb-4 mt-8 flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    AI Spoilage Predictions ({filteredPredictions.length})
                  </h2>
                )}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {filteredPredictions.map((prediction) => (
                    <SpoilagePredictionCardEnhanced
                      key={`${prediction.storageUnitId}-${prediction.commodityId}`}
                      prediction={prediction}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Critical Alert Banner */}
        {summary && summary.criticalRiskCount > 0 && (
          <div className="mt-8 rounded-lg bg-red-50 border-2 border-red-200 p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-red-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-2">
                  🚨 CRITICAL: Immediate Action Required
                </h3>
                <p className="text-sm text-red-700 mb-3">
                  You have {summary.criticalRiskCount} commodit{summary.criticalRiskCount === 1 ? 'y' : 'ies'} at critical risk.
                  Estimated potential losses: {formatKES(summary.totalEstimatedLoss)}.
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setFilter('critical')}
                    className="btn-cta text-sm"
                  >
                    View Critical Items
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
