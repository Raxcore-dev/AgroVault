'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import {
  Package, Wheat, AlertTriangle, Thermometer, Droplets,
  ArrowRight, Plus, TrendingUp, Activity, ShieldAlert,
  Brain, Sparkles, Loader2, CloudSun, CloudRain, Briefcase, Navigation,
} from 'lucide-react'
import { AIInsightCard, AIInsightSkeleton, type AIAnalysis } from '@/components/ai-insight-card'
import { SpoilagePredictionsWidget } from '@/components/spoilage-predictions-widget'
import {
  CurrentWeatherCard,
  ForecastCard,
  WeatherAlertCard,
  HarvestRecommendationCard,
  WeatherSkeleton,
  ForecastSkeleton,
} from '@/components/weather-widgets'
import { MarketTravelAdvisoryWidget } from '@/components/market-travel-advisory'
import { SensorReadingsPanel } from '@/components/sensor-readings-panel'

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
  commodityCount: number
  alertCount: number
  StorageReading: {
    id: string
    temperature: number
    humidity: number
    recordedAt: string
  }[]
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

export default function DashboardPage() {
  const { user, token, isLoading } = useAuth()

  // Wait for auth to resolve before committing to a dashboard
  if (isLoading || !user) return null

  // Job applicants see their own dashboard
  if (user.role === 'job_applicant') {
    return <JobApplicantDashboard />
  }

  // Default: farmer dashboard
  return <FarmerDashboard />
}

// ─── Job Applicant Dashboard ───

interface RecentJob {
  id: string
  title: string
  location: string
  payPerDay: number
  cropType: string
  createdAt: string
  farmer: { name: string; phone: string | null }
}

interface RecentApplication {
  id: string
  status: string
  createdAt: string
  job: { id: string; title: string; location: string }
}

function JobApplicantDashboard() {
  const { user, token } = useAuth()
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([])
  const [applications, setApplications] = useState<RecentApplication[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    const headers = { Authorization: `Bearer ${token}` }
    Promise.all([
      fetch('/api/jobs?limit=5&sort=newest', { headers }).then((r) => r.ok ? r.json() : null),
      fetch('/api/jobs/my-applications', { headers }).then((r) => r.ok ? r.json() : null),
    ])
      .then(([jobsData, appsData]) => {
        if (jobsData?.jobs) setRecentJobs(jobsData.jobs)
        if (appsData?.applications) setApplications(appsData.applications)
      })
      .finally(() => setLoading(false))
  }, [token])

  const pending  = applications.filter((a) => a.status === 'pending').length
  const accepted = applications.filter((a) => a.status === 'accepted').length

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-6 lg:px-8 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Welcome back, {user?.name?.split(' ')[0] || 'there'}.
          </p>
        </div>

        {/* Stats overview */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="card-elevated rounded-lg border border-border p-5 flex items-start gap-4">
            <div className="rounded-lg bg-primary/10 p-2.5"><Briefcase className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Total Applied</p>
              <p className="text-2xl font-bold text-foreground">{applications.length}</p>
            </div>
          </div>
          <div className="card-elevated rounded-lg border border-border p-5 flex items-start gap-4">
            <div className="rounded-lg bg-amber-50 p-2.5"><Activity className="h-5 w-5 text-amber-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-foreground">{pending}</p>
            </div>
          </div>
          <div className="card-elevated rounded-lg border border-border p-5 flex items-start gap-4">
            <div className="rounded-lg bg-green-50 p-2.5"><ShieldAlert className="h-5 w-5 text-green-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Accepted</p>
              <p className="text-2xl font-bold text-foreground">{accepted}</p>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link href="/jobs" className="card-elevated rounded-lg p-6 hover:shadow-md transition-shadow group border border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-lg bg-primary/10 p-2.5"><Briefcase className="h-5 w-5 text-primary" /></div>
              <h3 className="font-semibold text-foreground">Available Jobs</h3>
            </div>
            <p className="text-sm text-muted-foreground">Browse and apply for open farm labor positions near you.</p>
            <div className="mt-3 flex items-center text-sm font-medium text-primary">
              Browse Jobs <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          <Link href="/dashboard/my-applications" className="card-elevated rounded-lg p-6 hover:shadow-md transition-shadow group border border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-lg bg-accent/10 p-2.5"><Activity className="h-5 w-5 text-accent" /></div>
              <h3 className="font-semibold text-foreground">My Applications</h3>
            </div>
            <p className="text-sm text-muted-foreground">Track the status of all jobs you have applied for.</p>
            <div className="mt-3 flex items-center text-sm font-medium text-primary">
              View Applications <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Recent Jobs */}
        <div className="card-elevated rounded-lg border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/20">
            <h2 className="font-semibold text-foreground">Recent Job Openings</h2>
            <Link href="/jobs" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {loading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-5 py-4 animate-pulse flex gap-4">
                  <div className="h-10 w-10 bg-muted rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-3 bg-muted rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentJobs.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">No jobs available right now. Check back soon.</p>
          ) : (
            <div className="divide-y divide-border">
              {recentJobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors">
                  <div className="rounded-lg bg-primary/10 p-2.5 shrink-0">
                    <Briefcase className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{job.title}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <span>{job.location}</span>
                      <span className="text-muted-foreground/40">·</span>
                      <span>KES {job.payPerDay.toLocaleString()}/day</span>
                      <span className="text-muted-foreground/40">·</span>
                      <span>{job.farmer.name}</span>
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent applications */}
        {applications.length > 0 && (
          <div className="card-elevated rounded-lg border border-border overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/20">
              <h2 className="font-semibold text-foreground">Recent Applications</h2>
              <Link href="/dashboard/my-applications" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {applications.slice(0, 5).map((app) => {
                const badge =
                  app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                  app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-amber-100 text-amber-700'
                return (
                  <div key={app.id} className="flex items-center justify-between px-5 py-3">
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{app.job.title}</p>
                      <p className="text-xs text-muted-foreground">{app.job.location}</p>
                    </div>
                    <span className={`ml-4 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${badge}`}>
                      {app.status}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

// ─── Farmer Dashboard ───

function FarmerDashboard() {
  const { user, token } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [units, setUnits] = useState<StorageUnit[]>([])
  const [spoilageAssessments, setSpoilageAssessments] = useState<SpoilageAssessment[]>([])
  const [spoilageSummary, setSpoilageSummary] = useState<SpoilageSummary | null>(null)
  const [aiAnalyses, setAiAnalyses] = useState<AIAnalysis[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [reanalyzingId, setReanalyzingId] = useState<string | null>(null)
  const [weatherData, setWeatherData] = useState<any>(null)
  const [weatherAlerts, setWeatherAlerts] = useState<any>(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return

    const headers = { Authorization: `Bearer ${token}` }

    // Load critical data first
    Promise.all([
      fetch('/api/dashboard/farmer', { headers }).then((r) => r.ok ? r.json() : null),
      fetch('/api/storage-units', { headers }).then((r) => r.ok ? r.json() : null),
    ])
      .then(([statsData, unitsData]) => {
        if (statsData) setStats(statsData)
        if (unitsData) setUnits(unitsData.storageUnits ?? unitsData)
        setLoading(false)
      })
      .catch(console.error)

    // Load spoilage alerts in background
    fetch('/api/storage/alerts', { headers })
      .then((r) => r.ok ? r.json() : null)
      .then((spoilageData) => {
        if (spoilageData) {
          setSpoilageAssessments(spoilageData.assessments ?? [])
          setSpoilageSummary(spoilageData.summary ?? null)
        }
      })
      .catch(console.error)

    // Load AI analysis in background (non-blocking)
    setAiLoading(true)
    fetch('/api/storage/analyze', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.analyses) setAiAnalyses(data.analyses)
      })
      .catch((err) => {
        console.error('AI analysis fetch failed:', err)
        setAiError('AI analysis unavailable')
      })
      .finally(() => setAiLoading(false))

    // Load weather data in background
    setWeatherLoading(true)
    Promise.all([
      fetch('/api/weather/forecast', { headers }).then((r) => r.ok ? r.json() : null),
      fetch('/api/weather/alerts', { headers }).then((r) => r.ok ? r.json() : null),
    ])
      .then(([forecastData, alertsData]) => {
        if (forecastData) setWeatherData(forecastData)
        if (alertsData) setWeatherAlerts(alertsData)
      })
      .catch(console.error)
      .finally(() => setWeatherLoading(false))
  }, [token])

  const handleReanalyze = async (storageUnitId: string, commodityId: string) => {
    if (!token) return
    setReanalyzingId(`${storageUnitId}-${commodityId}`)
    try {
      const res = await fetch('/api/storage/analyze', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ storageUnitId, commodityId }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.analyses?.[0]) {
          setAiAnalyses((prev) => {
            const updated = [...prev]
            const idx = updated.findIndex(
              (a) =>
                a.raw_input.commodity === data.analyses[0].raw_input.commodity &&
                a.raw_input.location === data.analyses[0].raw_input.location
            )
            if (idx >= 0) updated[idx] = data.analyses[0]
            else updated.push(data.analyses[0])
            return updated
          })
        }
      }
    } catch (err) {
      console.error('Re-analysis failed:', err)
    } finally {
      setReanalyzingId(null)
    }
  }

  if (loading) {
    return (
      <div className="px-6 py-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 rounded-lg bg-muted" />
            ))}
          </div>
          <div className="h-64 rounded-lg bg-muted" />
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
          <div className="card-elevated rounded-lg p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Storage Units</p>
              <div className="rounded-lg bg-primary/10 p-2">
                <Package className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">{stats?.totalStorageUnits ?? 0}</p>
            <p className="mt-1 text-xs text-muted-foreground">Active facilities</p>
          </div>

          <div className="card-elevated rounded-lg p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Commodities</p>
              <div className="rounded-lg bg-accent/10 p-2">
                <Wheat className="h-4 w-4 text-accent" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">{stats?.totalCommodities ?? 0}</p>
            <p className="mt-1 text-xs text-muted-foreground">Items stored</p>
          </div>

          <div className="card-elevated rounded-lg p-5">
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

          <div className="card-elevated rounded-lg p-5">
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
            <div className="card-elevated rounded-lg p-8 text-center">
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
                  className="card-elevated rounded-lg p-5 hover:shadow-md transition-shadow"
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
                      <p className="text-sm font-bold text-foreground">{unit.commodityCount ?? 0}</p>
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
                    className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4"
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
                <div className="card-elevated rounded-lg p-4 border-amber-200 dark:border-amber-800">
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

        {/* Spoilage Predictions Widget */}
        <div className="mb-6">
          <SpoilagePredictionsWidget />
        </div>

        {/* Recent Readings */}
        {/* AI-Powered Insights */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Brain className="h-5 w-5 text-primary" />
                <Sparkles className="h-2.5 w-2.5 text-primary absolute -top-1 -right-1" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">AI-Powered Insights</h2>
            </div>
            <Link
              href="/dashboard/market-analysis"
              className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
            >
              Full analysis <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {aiLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <AIInsightSkeleton />
              <AIInsightSkeleton />
            </div>
          ) : aiError ? (
            <div className="card-elevated rounded-lg p-6 text-center">
              <Brain className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">{aiError}</p>
            </div>
          ) : aiAnalyses.length === 0 ? (
            <div className="card-elevated rounded-lg p-6 text-center">
              <Brain className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">
                No AI analyses available yet. Add sensor readings to trigger AI analysis.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {aiAnalyses
                .sort((a, b) => {
                  const order = { high: 0, medium: 1, low: 2 }
                  return order[a.spoilage.risk_level] - order[b.spoilage.risk_level]
                })
                .slice(0, 4)
                .map((analysis, idx) => {
                  // Find the matching spoilage assessment to get unit/commodity names
                  const match = spoilageAssessments.find(
                    (s) =>
                      s.storageUnitName
                        .toLowerCase()
                        .includes(analysis.raw_input.location.toLowerCase().split(',')[0]) ||
                      s.commodityName
                        .toLowerCase()
                        .includes(analysis.raw_input.commodity)
                  )
                  return (
                    <AIInsightCard
                      key={idx}
                      analysis={analysis}
                      storageUnitName={match?.storageUnitName ?? analysis.raw_input.location}
                      commodityName={match?.commodityName ?? analysis.raw_input.commodity}
                      storageUnitId={match?.storageUnitId}
                      commodityId={match?.commodityId}
                      onReanalyze={handleReanalyze}
                      isReanalyzing={
                        reanalyzingId === `${match?.storageUnitId}-${match?.commodityId}`
                      }
                    />
                  )
                })}
            </div>
          )}
        </div>

        {/* Weather Intelligence Panel */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CloudSun className="h-5 w-5 text-sky-500" />
              <h2 className="text-lg font-semibold text-foreground">Weather Intelligence</h2>
            </div>
            <Link href="/dashboard/weather">
              <Button variant="ghost" size="sm" className="text-sky-600 hover:text-sky-700">
                Full Forecast <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          {weatherLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <WeatherSkeleton />
              <div className="md:col-span-2">
                <div className="card-elevated p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              </div>
            </div>
          ) : weatherData ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Current Weather */}
              <CurrentWeatherCard data={{
                location: weatherData.location ?? '',
                temperature: Number(weatherData.current?.temperature) || 0,
                humidity: Number(weatherData.current?.humidity) || 0,
                wind_speed: Number(weatherData.current?.wind_speed) || 0,
                description: weatherData.current?.description ?? '',
                icon: weatherData.current?.icon ?? '01d',
                feels_like: Number(weatherData.current?.feels_like) || 0,
              }} />

              {/* Weather Alerts & Rain Outlook */}
              <div className="md:col-span-2 space-y-4">
                {/* Risk Banner */}
                {weatherAlerts && (
                  <div
                    className={`rounded-lg p-3 flex items-center gap-3 ${
                      weatherAlerts.overall_risk === 'high'
                        ? 'bg-red-50 border border-red-200 dark:bg-red-950/30 dark:border-red-800'
                        : weatherAlerts.overall_risk === 'medium'
                        ? 'bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800'
                        : 'bg-green-50 border border-green-200 dark:bg-green-950/30 dark:border-green-800'
                    }`}
                  >
                    {weatherAlerts.overall_risk === 'high' ? (
                      <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
                    ) : weatherAlerts.overall_risk === 'medium' ? (
                      <CloudRain className="h-5 w-5 text-amber-500 shrink-0" />
                    ) : (
                      <CloudSun className="h-5 w-5 text-green-500 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {weatherAlerts.overall_risk === 'high'
                          ? 'High weather risk — check alerts'
                          : weatherAlerts.overall_risk === 'medium'
                          ? 'Moderate weather risk — stay prepared'
                          : 'Low weather risk — good conditions'}
                      </p>
                      {weatherAlerts.safe_harvest_window && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Safe harvest window: <span className="font-medium">{weatherAlerts.safe_harvest_window}</span>
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground">Rain (3d)</p>
                      <p className="text-sm font-semibold">
                        {weatherAlerts.rain_forecast_next_3_days ?? '—'}%
                      </p>
                    </div>
                  </div>
                )}

                {/* 3-Day Quick Forecast */}
                {weatherData.forecast && weatherData.forecast.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {weatherData.forecast.slice(0, 3).map((day: any, i: number) => (
                      <div key={i} className="card-elevated p-3 text-center">
                        <p className="text-xs text-muted-foreground font-medium">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </p>
                        <div className="flex justify-center my-1">
                          <Thermometer className="h-4 w-4 text-orange-400" />
                        </div>
                        <p className="text-sm font-semibold">
                          {Math.round(Number(day.temperature_max) || 0)}° / {Math.round(Number(day.temperature_min) || 0)}°
                        </p>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <Droplets className="h-3 w-3 text-blue-400" />
                          <span className="text-xs text-muted-foreground">{Math.round(day.rain_probability)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card-elevated p-6 text-center text-muted-foreground">
              <CloudSun className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Weather data unavailable</p>
            </div>
          )}
        </div>

        {/* Market Travel Advisory Panel */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Market Travel Advisory</h2>
            </div>
            <Link href="/dashboard/market-travel-advisory">
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                Full Advisory <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="card-elevated rounded-lg p-5">
            <MarketTravelAdvisoryWidget compact />
          </div>
        </div>

        {/* Live Sensor Readings from Supabase */}
        <SensorReadingsPanel />
      </div>
    </div>
  )
}
