'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { HumidityAlertCard } from '@/components/humidity-alert-card'
import { RefreshCw, Droplets, AlertTriangle, CheckCircle, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HumidityAnalysis {
  status: 'safe' | 'moderate' | 'high'
  risk_level: string
  recommendations: string[]
  immediate_actions: string[]
  preventive_measures: string[]
  ai_insight: string
}

interface EnrichedReading {
  id: string
  storage_unit_id: string
  storage_unit_name: string | null
  storage_unit_location: string | null
  temperature: number
  humidity: number
  timestamp: string
  status: string
  status_reasons: string[]
  humidity_analysis: HumidityAnalysis
  risk_score: number
  alert_priority: string
  crop_type?: string
  storage_duration?: number
}

interface HumidityAlert {
  storage_unit_id: string
  storage_unit_name: string | null
  humidity: number
  status: string
  priority: string
  message: string
  recommendations: string[]
}

type FilterType = 'all' | 'high' | 'moderate' | 'safe'

const REFRESH_INTERVAL_MS = 10_000

export default function HumidityAlertsPage() {
  const { token } = useAuth()
  const [readings, setReadings] = useState<EnrichedReading[]>([])
  const [alerts, setAlerts] = useState<HumidityAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL_MS / 1000)

  const fetchData = useCallback(
    async (isManual = false) => {
      if (!token) return
      if (isManual) setRefreshing(true)

      try {
        const res = await fetch('/api/sensors/humidity-analysis', {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        })

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          setError(body.error ?? 'Unable to fetch humidity analysis.')
          return
        }

        const data = await res.json()
        setReadings(data.readings ?? [])
        setAlerts(data.alerts ?? [])
        setError(null)
        setCountdown(REFRESH_INTERVAL_MS / 1000)
      } catch {
        setError('Unable to fetch humidity analysis.')
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [token],
  )

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (!token) return
    const interval = setInterval(() => fetchData(), REFRESH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [fetchData, token])

  useEffect(() => {
    const tick = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : REFRESH_INTERVAL_MS / 1000))
    }, 1000)
    return () => clearInterval(tick)
  }, [])

  const filteredReadings = readings.filter((r) => {
    if (filter === 'all') return true
    return r.humidity_analysis.status === filter
  })

  const highRiskCount = readings.filter((r) => r.humidity_analysis.status === 'high').length
  const moderateCount = readings.filter((r) => r.humidity_analysis.status === 'moderate').length
  const safeCount = readings.filter((r) => r.humidity_analysis.status === 'safe').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Droplets className="h-6 w-6 text-primary" />
            Humidity Alerts & Recommendations
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI-powered humidity monitoring and actionable recommendations
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!loading && (
            <span className="text-xs text-muted-foreground hidden sm:block">
              Refreshes in {countdown}s
            </span>
          )}
          <button
            onClick={() => fetchData(true)}
            disabled={loading || refreshing}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Urgent Alerts Banner */}
      {alerts.length > 0 && (
        <div className="rounded-xl border-2 border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-red-700 dark:text-red-300">
                {alerts.length} Urgent {alerts.length === 1 ? 'Alert' : 'Alerts'} Requiring Immediate Action
              </h2>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                High humidity levels detected in storage units. Review recommendations below and take action immediately.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">High Risk</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">{highRiskCount}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400 opacity-50" />
          </div>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Moderate Risk</p>
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">{moderateCount}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400 opacity-50" />
          </div>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Safe</p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{safeCount}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400 opacity-50" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <button
          onClick={() => setFilter('all')}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            filter === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted',
          )}
        >
          All ({readings.length})
        </button>
        <button
          onClick={() => setFilter('high')}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            filter === 'high'
              ? 'bg-red-600 text-white'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted',
          )}
        >
          High Risk ({highRiskCount})
        </button>
        <button
          onClick={() => setFilter('moderate')}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            filter === 'moderate'
              ? 'bg-amber-600 text-white'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted',
          )}
        >
          Moderate ({moderateCount})
        </button>
        <button
          onClick={() => setFilter('safe')}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            filter === 'safe'
              ? 'bg-emerald-600 text-white'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted',
          )}
        >
          Safe ({safeCount})
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20 p-6 text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-3" />
          <p className="text-sm font-semibold text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* No Data */}
      {!loading && !error && readings.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-muted/10 p-12 text-center">
          <Droplets className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-sm font-medium text-foreground">No sensor readings available yet.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Add storage units with IoT sensors to start monitoring humidity levels.
          </p>
        </div>
      )}

      {/* Alerts Grid */}
      {!loading && filteredReadings.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredReadings.map((reading) => (
            <HumidityAlertCard
              key={reading.id}
              storageUnitName={reading.storage_unit_name}
              storageUnitLocation={reading.storage_unit_location}
              humidity={reading.humidity}
              temperature={reading.temperature}
              timestamp={reading.timestamp}
              analysis={reading.humidity_analysis}
              riskScore={reading.risk_score}
              alertPriority={reading.alert_priority}
              cropType={reading.crop_type}
              storageDuration={reading.storage_duration}
            />
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && !error && readings.length > 0 && filteredReadings.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-muted/10 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No storage units match the selected filter.
          </p>
        </div>
      )}

      {/* Footer */}
      {!loading && readings.length > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          Auto-refreshes every 10 seconds · Last updated: {new Date().toLocaleTimeString()}
        </p>
      )}
    </div>
  )
}
