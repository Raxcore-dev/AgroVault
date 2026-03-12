'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useAuth } from '@/lib/auth-context'
import {
  Thermometer, Droplets, RefreshCw, Wifi, WifiOff,
  AlertTriangle, CheckCircle, Activity, Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types (mirror SensorReading from the service) ───────────────────────────

type SensorStatus = 'normal' | 'warning' | 'danger'

interface SensorReading {
  id: string
  storage_unit_id: string
  storage_unit_name: string | null
  storage_unit_location: string | null
  temperature: number
  humidity: number
  timestamp: string
  status: SensorStatus
  status_reasons: string[]
}

interface SensorSummary {
  total_units: number
  units_with_readings: number
  danger_count: number
  warning_count: number
  normal_count: number
  avg_temperature: number | null
  avg_humidity: number | null
  last_updated: string | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const REFRESH_INTERVAL_MS = 30_000  // 30 seconds

// ─── Status helpers ───────────────────────────────────────────────────────────

function statusColor(status: SensorStatus) {
  return {
    danger:  'text-red-600 dark:text-red-400',
    warning: 'text-amber-600 dark:text-amber-400',
    normal:  'text-emerald-600 dark:text-emerald-400',
  }[status]
}

function statusBg(status: SensorStatus) {
  return {
    danger:  'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20',
    warning: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20',
    normal:  'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20',
  }[status]
}

function statusLabel(status: SensorStatus) {
  return { danger: 'High Risk', warning: 'Warning', normal: 'Normal' }[status]
}

function statusIcon(status: SensorStatus) {
  if (status === 'danger')  return <AlertTriangle className="h-3.5 w-3.5" />
  if (status === 'warning') return <AlertTriangle className="h-3.5 w-3.5" />
  return <CheckCircle className="h-3.5 w-3.5" />
}

function relativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return new Date(iso).toLocaleDateString()
}

// ─── Single Reading Card ──────────────────────────────────────────────────────

function SensorCard({ reading }: { reading: SensorReading }) {
  return (
    <div className={cn(
      'rounded-xl border p-4 space-y-3 transition-colors',
      statusBg(reading.status),
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {reading.storage_unit_name ?? reading.storage_unit_id}
          </p>
          {reading.storage_unit_location && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {reading.storage_unit_location}
            </p>
          )}
        </div>
        <span className={cn(
          'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0',
          reading.status === 'danger'  && 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
          reading.status === 'warning' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
          reading.status === 'normal'  && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
        )}>
          {statusIcon(reading.status)}
          {statusLabel(reading.status)}
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-background/60 p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
            <Thermometer className="h-3.5 w-3.5" />
            Temperature
          </div>
          <p className={cn('text-xl font-bold', reading.temperature > 28 ? 'text-red-600' : reading.temperature > 24 ? 'text-amber-600' : 'text-emerald-600')}>
            {reading.temperature.toFixed(1)}°C
          </p>
        </div>
        <div className="rounded-lg bg-background/60 p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
            <Droplets className="h-3.5 w-3.5" />
            Humidity
          </div>
          <p className={cn('text-xl font-bold', reading.humidity > 75 || reading.humidity < 40 ? 'text-red-600' : reading.humidity > 70 ? 'text-amber-600' : 'text-emerald-600')}>
            {reading.humidity.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Status reasons */}
      {reading.status_reasons.length > 0 && (
        <div className="space-y-1">
          {reading.status_reasons.map((reason, i) => (
            <p key={i} className={cn('text-xs', statusColor(reading.status))}>
              ⚠ {reason}
            </p>
          ))}
        </div>
      )}

      {reading.status === 'normal' && (
        <p className="text-xs text-emerald-600 dark:text-emerald-400">
          ✓ Storage conditions are within safe parameters.
        </p>
      )}

      {/* Timestamp */}
      <p className="text-right text-xs text-muted-foreground flex items-center justify-end gap-1">
        <Clock className="h-3 w-3" />
        {relativeTime(reading.timestamp)}
      </p>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SensorCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3 animate-pulse">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1.5">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="h-3 w-20 rounded bg-muted" />
        </div>
        <div className="h-5 w-16 rounded-full bg-muted" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="h-16 rounded-lg bg-muted" />
        <div className="h-16 rounded-lg bg-muted" />
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface SensorReadingsPanelProps {
  className?: string
}

export function SensorReadingsPanel({ className }: SensorReadingsPanelProps) {
  const { token } = useAuth()
  const [readings, setReadings]   = useState<SensorReading[]>([])
  const [summary, setSummary]     = useState<SensorSummary | null>(null)
  const [loading, setLoading]     = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [lastFetched, setLastFetched] = useState<Date | null>(null)
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL_MS / 1000)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchReadings = useCallback(async (isManual = false) => {
    if (!token) return
    if (isManual) setRefreshing(true)

    try {
      const res = await fetch('/api/sensors/latest', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error ?? 'Unable to fetch sensor data.')
        return
      }

      const data = await res.json()
      setReadings(data.readings ?? [])
      setSummary(data.summary ?? null)
      setError(null)
      setLastFetched(new Date())
      setCountdown(REFRESH_INTERVAL_MS / 1000)
    } catch {
      setError('Unable to fetch sensor data.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [token])

  // Initial fetch
  useEffect(() => {
    fetchReadings()
  }, [fetchReadings])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!token) return
    intervalRef.current = setInterval(() => fetchReadings(), REFRESH_INTERVAL_MS)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [fetchReadings, token])

  // Countdown timer
  useEffect(() => {
    const tick = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : REFRESH_INTERVAL_MS / 1000))
    }, 1000)
    return () => clearInterval(tick)
  }, [])

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Live Sensor Readings</h2>
          {!loading && (
            <span className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
              error ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700',
            )}>
              {error ? <WifiOff className="h-3 w-3" /> : <Wifi className="h-3 w-3" />}
              {error ? 'Offline' : 'Supabase Live'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {lastFetched && !loading && (
            <span className="text-xs text-muted-foreground hidden sm:block">
              Refreshes in {countdown}s
            </span>
          )}
          <button
            onClick={() => fetchReadings(true)}
            disabled={loading || refreshing}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Summary bar */}
      {summary && summary.units_with_readings > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-border bg-muted/20 p-3 text-center">
            <p className="text-xs text-muted-foreground">Units Monitored</p>
            <p className="text-lg font-bold text-foreground mt-0.5">{summary.units_with_readings}</p>
          </div>
          <div className={cn(
            'rounded-lg border p-3 text-center',
            summary.danger_count > 0 ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20' : 'border-border bg-muted/20',
          )}>
            <p className="text-xs text-muted-foreground">High Risk</p>
            <p className={cn('text-lg font-bold mt-0.5', summary.danger_count > 0 ? 'text-red-600' : 'text-foreground')}>
              {summary.danger_count}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 p-3 text-center">
            <p className="text-xs text-muted-foreground">Avg Temp</p>
            <p className="text-lg font-bold text-foreground mt-0.5">
              {summary.avg_temperature != null ? `${summary.avg_temperature}°C` : '—'}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 p-3 text-center">
            <p className="text-xs text-muted-foreground">Avg Humidity</p>
            <p className="text-lg font-bold text-foreground mt-0.5">
              {summary.avg_humidity != null ? `${summary.avg_humidity}%` : '—'}
            </p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <SensorCardSkeleton key={i} />)}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20 p-4">
          <WifiOff className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-700 dark:text-red-300">{error}</p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
              Check your Supabase connection and ensure SUPABASE_URL and SUPABASE_ANON_KEY are set.
            </p>
          </div>
        </div>
      )}

      {/* No readings */}
      {!loading && !error && readings.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-muted/10 p-8 text-center">
          <Activity className="mx-auto h-8 w-8 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-foreground">No sensor readings available yet.</p>
          <p className="text-xs text-muted-foreground mt-1">
            IoT sensors will appear here once they start sending readings to Supabase.
          </p>
        </div>
      )}

      {/* Sensor cards grid */}
      {!loading && readings.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {readings.map((reading) => (
            <SensorCard key={reading.id} reading={reading} />
          ))}
        </div>
      )}

      {lastFetched && !loading && (
        <p className="text-right text-xs text-muted-foreground">
          Last updated: {lastFetched.toLocaleTimeString()} · Auto-refreshes every 30 s
        </p>
      )}
    </div>
  )
}
