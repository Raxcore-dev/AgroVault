'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { AlertTriangle, TrendingDown, Thermometer, Droplets } from 'lucide-react'

interface SensorReading {
  id: string
  storage_unit_id: string
  storage_unit_name: string | null
  storage_unit_location: string | null
  temperature: number
  humidity: number
  timestamp: string
  status: 'normal' | 'warning' | 'danger'
  status_reasons: string[]
}

interface RiskAssessment {
  storageUnitId: string
  storageUnitName: string
  riskLevel: 'low' | 'medium' | 'high'
  temperature: number
  humidity: number
  spoilageRisk: number
  recommendation: string
  status_reasons: string[]
  timestamp: string
}

export default function RiskPage() {
  const { token } = useAuth()
  const [riskData, setRiskData] = useState<RiskAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const calculateRisk = (reading: SensorReading): RiskAssessment => {
    // Calculate spoilage risk based on temperature and humidity
    let spoilageRisk = 0
    
    // Temperature risk (optimal: 15-25°C)
    const temp = reading.temperature
    if (temp < 10) spoilageRisk += 20 // Too cold
    else if (temp < 15) spoilageRisk += 10 // Slightly cold
    else if (temp > 35) spoilageRisk += 40 // Too hot
    else if (temp > 30) spoilageRisk += 25 // Hot
    else if (temp > 25) spoilageRisk += 10 // Slightly hot
    
    // Humidity risk (optimal: 55-70%)
    const humidity = reading.humidity
    if (humidity > 85) spoilageRisk += 40 // Very high
    else if (humidity > 75) spoilageRisk += 30 // High
    else if (humidity > 70) spoilageRisk += 15 // Slightly high
    else if (humidity < 50) spoilageRisk += 20 // Too dry
    else if (humidity < 55) spoilageRisk += 10 // Slightly dry
    
    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high'
    if (spoilageRisk >= 50) riskLevel = 'high'
    else if (spoilageRisk >= 25) riskLevel = 'medium'
    else riskLevel = 'low'
    
    // Generate recommendation
    let recommendation = ''
    if (riskLevel === 'high') {
      recommendation = 'Immediate action required. Increase ventilation and monitor conditions every 2 hours.'
    } else if (riskLevel === 'medium') {
      recommendation = 'Check ventilation systems and consider reducing storage density.'
    } else {
      recommendation = 'Storage conditions are optimal. Continue regular monitoring.'
    }
    
    return {
      storageUnitId: reading.storage_unit_id,
      storageUnitName: reading.storage_unit_name || 'Unknown Unit',
      riskLevel,
      temperature: reading.temperature,
      humidity: reading.humidity,
      spoilageRisk: Math.min(100, spoilageRisk),
      recommendation,
      status_reasons: reading.status_reasons,
      timestamp: reading.timestamp,
    }
  }

  const fetchData = async () => {
    if (!token) return
    
    try {
      const res = await fetch('/api/sensors/latest', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
      
      if (res.ok) {
        const data = await res.json()
        const readings = data.readings ?? []
        
        // Convert sensor readings to risk assessments
        const risks = readings.map((reading: SensorReading) => calculateRisk(reading))
        setRiskData(risks)
        setError(null)
      } else {
        const errorData = await res.json().catch(() => ({}))
        setError(errorData.error || 'Failed to fetch risk data')
      }
    } catch (error) {
      console.error('[RiskPage] Error fetching risk data:', error)
      setError('Unable to connect to server')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000) // Poll every 10 seconds
    return () => clearInterval(interval)
  }, [token])

  const getRiskIcon = (level: string) => {
    if (level === 'high') return '🔴'
    if (level === 'medium') return '🟡'
    return '🟢'
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="px-6 py-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 rounded bg-muted" />
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-lg bg-muted" />
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 rounded-lg bg-muted" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="px-6 py-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-danger/10 p-2.5">
            <AlertTriangle className="h-6 w-6 text-danger" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Risk Assessment</h1>
            <p className="text-sm text-muted-foreground">
              Real-time spoilage risk analysis based on live sensor data
            </p>
          </div>
        </div>

        {/* Error State */}
        {error && !loading && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-700">{error}</p>
            <p className="text-xs text-red-600 mt-1">
              Make sure your ESP32 device is sending data to the system.
            </p>
          </div>
        )}

        {/* Risk Summary Cards */}
        {riskData.length > 0 && (
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="card-elevated rounded-lg p-5">
              <p className="text-sm font-medium text-muted-foreground">Low Risk</p>
              <p className="mt-2 text-3xl font-bold text-primary">
                {riskData.filter((r) => r.riskLevel === 'low').length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Storage units in optimal condition
              </p>
            </div>
            <div className="card-elevated rounded-lg p-5">
              <p className="text-sm font-medium text-muted-foreground">Medium Risk</p>
              <p className="mt-2 text-3xl font-bold text-warning">
                {riskData.filter((r) => r.riskLevel === 'medium').length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Requires monitoring
              </p>
            </div>
            <div className="card-elevated rounded-lg p-5">
              <p className="text-sm font-medium text-muted-foreground">High Risk</p>
              <p className="mt-2 text-3xl font-bold text-danger">
                {riskData.filter((r) => r.riskLevel === 'high').length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Immediate action needed
              </p>
            </div>
          </div>
        )}

        {/* No Data State */}
        {!loading && !error && riskData.length === 0 && (
          <div className="card-elevated rounded-lg p-8 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
            <h3 className="font-semibold text-foreground">No risk data available</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Waiting for ESP32 device to send sensor readings.
            </p>
          </div>
        )}

        {/* Risk Details */}
        {riskData.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Storage Facility Analysis</h2>
            {riskData.map((risk) => (
              <div
                key={risk.storageUnitId}
                className="card-elevated rounded-lg p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="text-3xl">{getRiskIcon(risk.riskLevel)}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">{risk.storageUnitName}</h3>
                      <p className="text-sm text-muted-foreground">
                        Risk Level:{' '}
                        <span
                          className={`font-semibold ${
                            risk.riskLevel === 'high'
                              ? 'text-danger'
                              : risk.riskLevel === 'medium'
                              ? 'text-warning'
                              : 'text-primary'
                          }`}
                        >
                          {risk.riskLevel.toUpperCase()}
                        </span>
                      </p>
                      <div className="mt-3 grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Thermometer className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground">
                            {risk.temperature.toFixed(1)}°C
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Droplets className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground">
                            {risk.humidity.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center gap-2">
                          <TrendingDown className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground">
                            Spoilage Risk: {risk.spoilageRisk}%
                          </span>
                        </div>
                        {/* Progress bar */}
                        <div className="mt-2 h-2 w-full rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full transition-all ${
                              risk.riskLevel === 'low'
                                ? 'bg-primary'
                                : risk.riskLevel === 'medium'
                                ? 'bg-warning'
                                : 'bg-danger'
                            }`}
                            style={{ width: `${risk.spoilageRisk}%` }}
                          />
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground">{risk.recommendation}</p>
                        {risk.status_reasons.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {risk.status_reasons.map((reason, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium"
                              >
                                ⚠ {reason}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Updated: {new Date(risk.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk Mitigation Strategies */}
                <div className="mt-4 rounded-lg bg-muted/50 border border-border p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    Recommended Actions
                  </p>
                  <ul className="mt-2 space-y-1.5 text-sm text-foreground">
                    {risk.riskLevel === 'high' && (
                      <>
                        <li className="flex items-start gap-2">
                          <span className="text-danger font-bold">•</span>
                          <span>Increase ventilation immediately</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-danger font-bold">•</span>
                          <span>Monitor temperature and humidity every 2 hours</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-danger font-bold">•</span>
                          <span>Consider partial harvest to reduce load</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-danger font-bold">•</span>
                          <span>Check for signs of mold or pest infestation</span>
                        </li>
                      </>
                    )}
                    {risk.riskLevel === 'medium' && (
                      <>
                        <li className="flex items-start gap-2">
                          <span className="text-warning font-bold">•</span>
                          <span>Check ventilation systems for proper operation</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-warning font-bold">•</span>
                          <span>Monitor conditions closely (every 4-6 hours)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-warning font-bold">•</span>
                          <span>Plan for market timing if conditions worsen</span>
                        </li>
                      </>
                    )}
                    {risk.riskLevel === 'low' && (
                      <>
                        <li className="flex items-start gap-2">
                          <span className="text-primary font-bold">•</span>
                          <span>Maintain current storage conditions</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary font-bold">•</span>
                          <span>Continue regular monitoring schedule</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary font-bold">•</span>
                          <span>Optimize market timing for best prices</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
