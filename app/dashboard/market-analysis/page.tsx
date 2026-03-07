'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import {
  AlertTriangle, TrendingUp, BarChart3, RefreshCw,
  ShieldAlert, Store, ArrowRight,
} from 'lucide-react'
import {
  SpoilageAlertCard,
  SpoilageAlertSkeleton,
  type SpoilageAssessment,
} from '@/components/spoilage-alert-card'
import Link from 'next/link'

interface MarketData {
  id: string
  marketName: string
  location: string
  commodity: string
  pricePerKg: number
  latitude: number
  longitude: number
  lastUpdated: string
}

interface SpoilageSummary {
  total: number
  high: number
  medium: number
  low: number
}

export default function MarketAnalysisPage() {
  const { token } = useAuth()
  const [assessments, setAssessments] = useState<SpoilageAssessment[]>([])
  const [summary, setSummary] = useState<SpoilageSummary | null>(null)
  const [markets, setMarkets] = useState<MarketData[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'high' | 'medium' | 'low'>('all')

  const fetchData = useCallback(async () => {
    if (!token) return

    const headers = { Authorization: `Bearer ${token}` }

    try {
      const [alertsRes, marketsRes] = await Promise.all([
        fetch('/api/storage/alerts', { headers }),
        fetch('/api/markets'),
      ])

      if (alertsRes.ok) {
        const data = await alertsRes.json()
        setAssessments(data.assessments ?? [])
        setSummary(data.summary ?? null)
      }

      if (marketsRes.ok) {
        const data = await marketsRes.json()
        setMarkets(data.markets ?? [])
      }
    } catch (err) {
      console.error('Failed to fetch market analysis data:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [token])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchData()
  }

  const filteredAssessments =
    activeTab === 'all'
      ? assessments
      : assessments.filter((a) => a.riskLevel === activeTab)

  if (loading) {
    return (
      <div className="px-6 py-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 rounded bg-muted" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-muted" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SpoilageAlertSkeleton />
            <SpoilageAlertSkeleton />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Market Analysis & Recommendations
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Spoilage risk detection and smart market recommendations for your stored commodities.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-primary inline-flex items-center gap-2 text-sm disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Analysis'}
          </button>
        </div>

        {/* Summary Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="card-elevated rounded-xl p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Total Assessments</p>
              <div className="rounded-lg bg-primary/10 p-2">
                <BarChart3 className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">{summary?.total ?? 0}</p>
            <p className="mt-1 text-xs text-muted-foreground">Commodities monitored</p>
          </div>

          <div className="card-elevated rounded-xl p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">High Risk</p>
              <div className="rounded-lg bg-red-100 dark:bg-red-900/30 p-2">
                <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-red-600 dark:text-red-400">
              {summary?.high ?? 0}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Immediate action needed</p>
          </div>

          <div className="card-elevated rounded-xl p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Medium Risk</p>
              <div className="rounded-lg bg-amber-100 dark:bg-amber-900/30 p-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-amber-600 dark:text-amber-400">
              {summary?.medium ?? 0}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Monitor closely</p>
          </div>

          <div className="card-elevated rounded-xl p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Markets Available</p>
              <div className="rounded-lg bg-primary/10 p-2">
                <Store className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">{markets.length}</p>
            <p className="mt-1 text-xs text-muted-foreground">Nearby markets tracked</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex items-center gap-1 rounded-lg bg-muted/50 p-1 w-fit">
          {(['all', 'high', 'medium', 'low'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-white dark:bg-zinc-800 text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab !== 'all' && summary && (
                <span className="ml-1.5 text-xs opacity-70">
                  ({summary[tab]})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Spoilage Alerts Grid */}
        {filteredAssessments.length === 0 ? (
          <div className="card-elevated rounded-xl p-12 text-center">
            <ShieldAlert className="h-12 w-12 mx-auto text-green-500/50 mb-3" />
            <h3 className="font-semibold text-foreground">All Clear!</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {activeTab === 'all'
                ? 'No spoilage risks detected across your storage units.'
                : `No ${activeTab} risk items found.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-8">
            {filteredAssessments.map((assessment) => (
              <SpoilageAlertCard key={`${assessment.storageUnitId}-${assessment.commodityId}`} assessment={assessment} />
            ))}
          </div>
        )}

        {/* Market Prices Section */}
        {markets.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Current Market Prices</h2>
            </div>
            <div className="card-elevated rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Market</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Location</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Commodity</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Price (KES/kg)</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {markets.map((market) => (
                    <tr key={market.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <Store className="h-4 w-4 text-muted-foreground" />
                          {market.marketName}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{market.location}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary capitalize">
                          {market.commodity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1 font-semibold text-green-700 dark:text-green-400">
                          <TrendingUp className="h-3.5 w-3.5" />
                          {market.pricePerKg}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(market.lastUpdated).toLocaleDateString()}
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
