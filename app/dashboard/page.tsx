'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import {
  Package, Wheat, AlertTriangle, Thermometer, Droplets,
  ArrowRight, Plus, TrendingUp, Activity, ShieldAlert,
} from 'lucide-react'

interface DashboardStats {
  totalStorageUnits: number
  totalCommodities: number
  unreadAlerts: number
  avgTemperature: number | null
  avgHumidity: number | null
  recentReadings: Array<{
    id: string
    temperature: number
    humidity: number
    recordedAt: string
    storageUnit: { name: string }
  }>
}

interface StorageUnit {
  id: string
  name: string
  location: string
  capacity: number
  createdAt: string
  _count: { commodities: number; readings: number }
}

interface SpoilageAssessment {
  storageUnitId: string
  storageUnitName: string
  commodityId: string
  commodityName: string
  riskLevel: 'low' | 'medium' | 'high'
  temperature: number
  humidity: number
  daysStored: number
  maxStorageDays: number
  reasons: string[]
  recommendation?: {
    marketId: string
    marketName: string
    location: string
    pricePerKg: number
    distanceKm: number
  } | null
}

interface SpoilageSummary {
  total: number
  high: number
  medium: number
  low: number
}

export default function FarmerDashboard() {
  const { user, token } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [units, setUnits] = useState<StorageUnit[]>([])
  const [spoilageAssessments, setSpoilageAssessments] = useState<SpoilageAssessment[]>([])
  const [spoilageSummary, setSpoilageSummary] = useState<SpoilageSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return

    const headers = { Authorization: `Bearer ${token}` }

    Promise.all([
      fetch('/api/dashboard/farmer', { headers }).then((r) => r.ok ? r.json() : null),
      fetch('/api/storage-units', { headers }).then((r) => r.ok ? r.json() : null),
      fetch('/api/storage/alerts', { headers }).then((r) => r.ok ? r.json() : null),
    ])
      .then(([statsData, unitsData, spoilageData]) => {
        if (statsData) setStats(statsData)
        if (unitsData) setUnits(unitsData.storageUnits ?? unitsData)
        if (spoilageData) {
          setSpoilageAssessments(spoilageData.assessments ?? [])
          setSpoilageSummary(spoilageData.summary ?? null)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [token])

  if (loading) {
    return (
      <div className="px-6 py-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 rounded-xl bg-muted" />
            ))}
          </div>
          <div className="h-64 rounded-xl bg-muted" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Welcome back, {user?.name?.split(' ')[0] || 'Farmer'}.
            </p>
          </div>
          <Link
            href="/dashboard/storage-units?action=add"
            className="btn-primary inline-flex items-center gap-2 text-sm"
          >
            <Plus className="h-4 w-4" />
            Add Storage Unit
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="card-elevated rounded-xl p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Storage Units</p>
              <div className="rounded-lg bg-primary/10 p-2">
                <Package className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">{stats?.totalStorageUnits ?? 0}</p>
            <p className="mt-1 text-xs text-muted-foreground">Active facilities</p>
          </div>

          <div className="card-elevated rounded-xl p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Commodities</p>
              <div className="rounded-lg bg-accent/10 p-2">
                <Wheat className="h-4 w-4 text-accent" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">{stats?.totalCommodities ?? 0}</p>
            <p className="mt-1 text-xs text-muted-foreground">Items stored</p>
          </div>

          <div className="card-elevated rounded-xl p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Avg Temperature</p>
              <div className="rounded-lg bg-secondary/10 p-2">
                <Thermometer className="h-4 w-4 text-secondary" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">
              {stats?.avgTemperature != null ? `${stats.avgTemperature.toFixed(1)}°C` : '—'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Across all units</p>
          </div>

          <div className="card-elevated rounded-xl p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Unread Alerts</p>
              <div className={`rounded-lg p-2 ${(stats?.unreadAlerts ?? 0) > 0 ? 'bg-danger/10' : 'bg-primary/10'}`}>
                <AlertTriangle className={`h-4 w-4 ${(stats?.unreadAlerts ?? 0) > 0 ? 'text-danger' : 'text-primary'}`} />
              </div>
            </div>
            <p className={`mt-3 text-2xl font-bold ${(stats?.unreadAlerts ?? 0) > 0 ? 'text-danger' : 'text-foreground'}`}>
              {stats?.unreadAlerts ?? 0}
            </p>
            <Link href="/dashboard/alerts" className="mt-1 text-xs text-primary hover:underline flex items-center gap-1">
              View alerts <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Storage Units Grid */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Your Storage Units</h2>
            <Link href="/dashboard/storage-units" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {units.length === 0 ? (
            <div className="card-elevated rounded-xl p-8 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <h3 className="font-semibold text-foreground">No storage units yet</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Add your first storage facility to start monitoring.
              </p>
              <Link
                href="/dashboard/storage-units?action=add"
                className="btn-primary inline-flex items-center gap-2 text-sm"
              >
                <Plus className="h-4 w-4" />
                Add Storage Unit
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {units.slice(0, 6).map((unit) => (
                <Link
                  key={unit.id}
                  href={`/dashboard/storage-units/${unit.id}`}
                  className="card-elevated rounded-xl p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{unit.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{unit.location}</p>
                    </div>
                    <div className="rounded-lg bg-primary/10 p-1.5">
                      <Package className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-muted/50 p-2.5">
                      <p className="text-[11px] text-muted-foreground">Capacity</p>
                      <p className="text-sm font-bold text-foreground">{unit.capacity} tons</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-2.5">
                      <p className="text-[11px] text-muted-foreground">Items</p>
                      <p className="text-sm font-bold text-foreground">{unit._count?.commodities ?? 0}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Spoilage Risk & Market Recommendations */}
        {spoilageAssessments.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Spoilage Risk & Recommendations</h2>
              </div>
              <Link
                href="/dashboard/market-analysis"
                className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
              >
                View full analysis <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Quick Risk Summary */}
            {spoilageSummary && (spoilageSummary.high > 0 || spoilageSummary.medium > 0) && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-3 text-center">
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{spoilageSummary.high}</p>
                  <p className="text-xs text-red-700 dark:text-red-300 font-medium">High Risk</p>
                </div>
                <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-3 text-center">
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{spoilageSummary.medium}</p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">Medium Risk</p>
                </div>
                <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 p-3 text-center">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{spoilageSummary.low}</p>
                  <p className="text-xs text-green-700 dark:text-green-300 font-medium">Low Risk</p>
                </div>
              </div>
            )}

            {/* High Risk Alerts with Recommendations */}
            <div className="space-y-3">
              {spoilageAssessments
                .filter((a) => a.riskLevel === 'high')
                .slice(0, 3)
                .map((assessment) => (
                  <div
                    key={`${assessment.storageUnitId}-${assessment.commodityId}`}
                    className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <div>
                          <h4 className="font-semibold text-foreground text-sm">{assessment.storageUnitName}</h4>
                          <p className="text-xs text-muted-foreground">{assessment.commodityName}</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/50 px-2.5 py-0.5 text-xs font-semibold text-red-800 dark:text-red-300">
                        HIGH RISK
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <Thermometer className="h-3.5 w-3.5" />
                        {assessment.temperature.toFixed(1)}°C
                      </span>
                      <span className="flex items-center gap-1">
                        <Droplets className="h-3.5 w-3.5" />
                        {assessment.humidity.toFixed(1)}%
                      </span>
                      <span>{assessment.daysStored} days stored</span>
                    </div>

                    {assessment.reasons.length > 0 && (
                      <p className="text-xs text-red-700 dark:text-red-300 mb-2">
                        {assessment.reasons[0]}
                      </p>
                    )}

                    {assessment.recommendation && (
                      <div className="rounded-lg bg-white/60 dark:bg-white/5 border border-primary/20 p-3 mt-2">
                        <div className="flex items-center gap-1.5 mb-1">
                          <TrendingUp className="h-3.5 w-3.5 text-primary" />
                          <p className="text-xs font-semibold text-primary">Recommendation</p>
                        </div>
                        <p className="text-sm text-foreground">
                          Sell immediately at <span className="font-bold">{assessment.recommendation.marketName}</span>
                          {' '}({assessment.recommendation.location}) — KES {assessment.recommendation.pricePerKg}/kg
                        </p>
                      </div>
                    )}
                  </div>
                ))}

              {spoilageAssessments.filter((a) => a.riskLevel === 'high').length === 0 &&
               spoilageAssessments.filter((a) => a.riskLevel === 'medium').length > 0 && (
                <div className="card-elevated rounded-xl p-4 border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-4 w-4" />
                    <p className="text-sm font-medium">
                      {spoilageAssessments.filter((a) => a.riskLevel === 'medium').length} commodities at medium risk.
                      <Link href="/dashboard/market-analysis" className="ml-1 text-primary hover:underline">
                        View details
                      </Link>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Readings */}
        {stats?.recentReadings && stats.recentReadings.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Recent Sensor Readings</h2>
            <div className="card-elevated rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Unit</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Temperature</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Humidity</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentReadings.map((reading) => (
                    <tr key={reading.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium text-foreground">{reading.storageUnit.name}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 ${reading.temperature > 28 ? 'text-danger' : reading.temperature > 24 ? 'text-warning' : 'text-primary'}`}>
                          <Thermometer className="h-3.5 w-3.5" />
                          {reading.temperature.toFixed(1)}°C
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 ${reading.humidity > 75 || reading.humidity < 40 ? 'text-danger' : 'text-accent'}`}>
                          <Droplets className="h-3.5 w-3.5" />
                          {reading.humidity.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(reading.recordedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
