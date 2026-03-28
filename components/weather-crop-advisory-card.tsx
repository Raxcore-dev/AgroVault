'use client'

import React, { useState, useEffect } from 'react'
import {
  AlertTriangle,
  Cloud,
  Droplets,
  ThermometerSun,
  TrendingUp,
  Clock,
  Target,
  CheckCircle,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

interface CommodityAdvisory {
  commodityId: string
  commodityName: string
  quantity: number
  unit: string
  currentConditions: {
    temperature: number
    humidity: number
    spoilageRisk: number
    status: string
  }
  forecastedConditions: {
    temperature: number
    humidity: number
    forecastedSpoilageRisk: number
    riskChange: string
    causedBy: string
  }
  timeframe: {
    hoursToCritical: number
    actionDeadline: string
    window: string
  }
  recommendations: {
    primary: string
    secondary: string[]
    urgency: string
  }
  actions: Array<{
    action: string
    reason: string
    details?: string
    timeframe: string
  }>
  marketOpportunity: {
    recommended: boolean
    market?: string
    price?: number
    distance_km?: number
    trend?: string
    reasoning: string
    urgency?: string
  }
  aiAnalysis: string
  confidence_score: number
}

interface WeatherCropAdvisoryProps {
  storageUnitId: string
  storageUnitName?: string
}

export function WeatherCropAdvisoryCard({
  storageUnitId,
  storageUnitName,
}: WeatherCropAdvisoryProps) {
  const { token } = useAuth()
  const [advisory, setAdvisory] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedCommodity, setExpandedCommodity] = useState<string | null>(null)

  useEffect(() => {
    const fetchAdvisory = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `/api/weather/crop-advisory?storageUnitId=${storageUnitId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch crop advisory')
        }

        const data = await response.json()
        setAdvisory(data)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch advisory'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchAdvisory()

    // Refresh every 30 minutes
    const interval = setInterval(fetchAdvisory, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [storageUnitId, token])

  if (loading) {
    return (
      <div className="card-elevated rounded-lg border p-6">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-4 h-4 bg-primary rounded-full animate-pulse"></div>
          <p className="text-muted-foreground">Analyzing weather impact...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-destructive/10 rounded-lg border border-destructive/30 p-6">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-destructive">Error</h3>
            <p className="text-destructive/80 text-sm">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!advisory || advisory.commodityAdvisories.length === 0) {
    return (
      <div className="card-elevated rounded-lg border p-6">
        <p className="text-muted-foreground text-center py-4">
          No commodities in storage to analyze
        </p>
      </div>
    )
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-50 border-red-200'
      case 'HIGH':
        return 'bg-orange-50 border-orange-200'
      case 'WARNING':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-green-50 border-green-200'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
      case 'HIGH':
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      case 'WARNING':
        return <Cloud className="w-5 h-5 text-yellow-600" />
      default:
        return <CheckCircle className="w-5 h-5 text-green-600" />
    }
  }

  const getUrgencyBgColor = (urgency: string) => {
    switch (urgency) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-900'
      case 'HIGH':
        return 'bg-orange-100 text-orange-900'
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-900'
      case 'MONITOR':
        return 'bg-blue-100 text-blue-900'
      default:
        return 'bg-green-100 text-green-900'
    }
  }

  return (
    <div className="space-y-4">
      {/* Header Alert */}
      <div
        className={`rounded-lg shadow p-6 border ${getSeverityColor(
          advisory.severity
        )}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            {getSeverityIcon(advisory.severity)}
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                🌧️ WEATHER ALERT - CROP IMPACT
              </h2>
              <p className="text-gray-700 mt-1">{advisory.weatherSummary}</p>
              <div className="mt-3 space-y-1 text-sm">
                <p className="text-gray-600">
                  <span className="font-semibold">Impact Level:</span>{' '}
                  <span className={`px-2 py-1 rounded font-semibold ${getUrgencyBgColor(advisory.severity)}`}>
                    {advisory.severity}
                  </span>
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Duration:</span> {advisory.weatherImpact.duration}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Expected Changes:</span>{' '}
                  {advisory.weatherImpact.expectedTemperatureChange}, {advisory.weatherImpact.expectedHumidityChange}
                </p>
              </div>
            </div>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>Last updated:</p>
            <p className="font-semibold">
              {new Date(advisory.lastUpdated).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* Overall Strategy */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          📋 OVERALL STRATEGY
        </h3>
        <p className="text-gray-700 leading-relaxed">
          {advisory.overallStrategy}
        </p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-600">Affected Commodities</p>
            <p className="text-2xl font-bold text-gray-900">
              {advisory.alertedCommodities}
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-600">Confidence</p>
            <p className="text-2xl font-bold text-gray-900">
              {Math.round(advisory.confidence * 100)}%
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-600">Recommended Actions</p>
            <p className="text-2xl font-bold text-gray-900">
              {advisory.recommendedActions.length}
            </p>
          </div>
        </div>
      </div>

      {/* Recommended Actions */}
      {advisory.recommendedActions.length > 0 && (
        <div className="bg-blue-50 rounded-lg shadow p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            IMMEDIATE ACTIONS REQUIRED
          </h3>
          <ul className="space-y-2">
            {advisory.recommendedActions.map(
              (action: string, idx: number) => (
                <li key={idx} className="flex items-start space-x-2 text-blue-900">
                  <span className="flex-shrink-0 font-bold">→</span>
                  <span>{action}</span>
                </li>
              )
            )}
          </ul>
        </div>
      )}

      {/* Commodity Advisories */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <ThermometerSun className="w-5 h-5 mr-2" />
          🌾 COMMODITY ADVISORIES
        </h3>

        {advisory.commodityAdvisories.map(
          (commodity: CommodityAdvisory, idx: number) => (
            <div
              key={commodity.commodityId}
              className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden"
            >
              {/* Commodity Header */}
              <button
                onClick={() =>
                  setExpandedCommodity(
                    expandedCommodity === commodity.commodityId
                      ? null
                      : commodity.commodityId
                  )
                }
                className="w-full p-6 hover:bg-gray-50 transition flex items-between justify-between cursor-pointer"
              >
                <div className="flex items-start space-x-4 flex-1 text-left">
                  <div className="text-2xl">🌾</div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {commodity.commodityName}
                    </h4>
                    <p className="text-gray-600">
                      {commodity.quantity} {commodity.unit}
                    </p>
                  </div>
                  <div className="ml-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getUrgencyBgColor(
                        commodity.recommendations.urgency
                      )}`}
                    >
                      {commodity.recommendations.urgency}
                    </span>
                  </div>
                </div>
                <div className="text-gray-400">
                  {expandedCommodity === commodity.commodityId ? '▲' : '▼'}
                </div>
              </button>

              {/* Commodity Details */}
              {expandedCommodity === commodity.commodityId && (
                <div className="px-6 pb-6 border-t border-gray-200 space-y-6">
                  {/* Risk Levels */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600 mb-2">Current Risk</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {Math.round(commodity.currentConditions.spoilageRisk)}%
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {commodity.currentConditions.temperature}°C,{' '}
                        {commodity.currentConditions.humidity}% humidity
                      </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded">
                      <p className="text-sm text-gray-600 mb-2">
                        Forecasted Risk
                      </p>
                      <p className="text-3xl font-bold text-red-600">
                        {Math.round(
                          commodity.forecastedConditions.forecastedSpoilageRisk
                        )}%
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {commodity.forecastedConditions.riskChange} change
                      </p>
                    </div>
                  </div>

                  {/* Weather Impact */}
                  <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                    <p className="font-semibold text-yellow-900 mb-2">
                      🌧️ Weather Impact
                    </p>
                    <p className="text-yellow-900 text-sm">
                      {commodity.forecastedConditions.causedBy}
                    </p>
                  </div>

                  {/* Timeframe */}
                  <div className="bg-blue-50 p-4 rounded border border-blue-200 flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-900">
                        Time to Critical
                      </p>
                      <p className="text-blue-900 text-sm">
                        {commodity.timeframe.hoursToCritical} hours (
                        {commodity.timeframe.actionDeadline})
                      </p>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <p className="font-semibold text-gray-900 mb-3">
                      ⚡ RECOMMENDED ACTIONS
                    </p>
                    <div className="space-y-3">
                      <div className="bg-red-50 p-3 rounded border border-red-200">
                        <p className="font-semibold text-red-900">
                          🎯 Primary: {commodity.recommendations.primary}
                        </p>
                      </div>
                      {commodity.recommendations.secondary.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-700 mb-2">
                            Backup options:
                          </p>
                          <ul className="space-y-1">
                            {commodity.recommendations.secondary.map(
                              (sec, i) => (
                                <li
                                  key={i}
                                  className="text-sm text-gray-700 flex items-start space-x-2"
                                >
                                  <span className="text-gray-400">•</span>
                                  <span>{sec}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Steps */}
                  <div>
                    <p className="font-semibold text-gray-900 mb-3">
                      📋 ACTION STEPS
                    </p>
                    <ol className="space-y-3">
                      {commodity.actions.map((action, i) => (
                        <li key={i} className="flex space-x-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-semibold">
                            {i + 1}
                          </span>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {action.action}
                            </p>
                            <p className="text-sm text-gray-600">{action.reason}</p>
                            {action.details && (
                              <p className="text-xs text-gray-500 mt-1">
                                {action.details}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              ⏱️ {action.timeframe}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Market Opportunity */}
                  {commodity.marketOpportunity.recommended && (
                    <div className="bg-green-50 p-4 rounded border border-green-200">
                      <p className="font-semibold text-green-900 mb-2">
                        💰 MARKET OPPORTUNITY
                      </p>
                      <p className="text-green-900 text-sm">
                        {commodity.marketOpportunity.reasoning}
                      </p>
                      {commodity.marketOpportunity.market && (
                        <p className="text-sm text-green-800 mt-2">
                          Best market: {commodity.marketOpportunity.market} (
                          {commodity.marketOpportunity.distance_km}km away)
                        </p>
                      )}
                    </div>
                  )}

                  {/* AI Analysis */}
                  <div className="bg-purple-50 p-4 rounded border border-purple-200">
                    <p className="font-semibold text-purple-900 mb-2">
                      🤖 AI ANALYSIS (Confidence: {Math.round(commodity.confidence_score * 100)}%)
                    </p>
                    <p className="text-purple-900 text-sm">
                      {commodity.aiAnalysis}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )
        )}
      </div>

      {/* Footer */}
      <div className="text-xs text-gray-500 text-center py-2">
        Last updated: {new Date(advisory.lastUpdated).toLocaleString()}
        <br />
        Next update in: 30 minutes
      </div>
    </div>
  )
}
