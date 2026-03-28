import { useEffect, useState, useCallback } from 'react'

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

interface MarketData {
  id: string
  marketName: string
  location: string
  commodity: string
  pricePerKg: number
  demandLevel: string
  priceTrend: string
  lastUpdated: string
}

interface RiskAssessment {
  storageUnitId: string
  storageUnitName: string
  riskLevel: 'low' | 'medium' | 'high'
  spoilageRisk: number
  recommendation: string
}

interface UseAgrovaultDataResult {
  sensorData: SensorReading[]
  sensorSummary: SensorSummary | null
  marketData: MarketData[]
  riskData: RiskAssessment[]
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

export function useAgrovaultData(county: string): UseAgrovaultDataResult {
  const [sensorData, setSensorData] = useState<SensorReading[]>([])
  const [sensorSummary, setSensorSummary] = useState<SensorSummary | null>(null)
  const [marketData, setMarketData] = useState<MarketData[]>([])
  const [riskData, setRiskData] = useState<RiskAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      
      // Fetch sensor data from real API
      const sensorsRes = await fetch('/api/sensors/latest', {
        cache: 'no-store',
      })
      
      // Fetch market data
      const marketRes = await fetch(`/api/market?county=${encodeURIComponent(county)}`)
      
      // Fetch risk data from real API
      const riskRes = await fetch('/api/risk')

      if (!marketRes.ok || !riskRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const market = await marketRes.json()
      const risks = await riskRes.json()

      if (sensorsRes.ok) {
        const sensorData = await sensorsRes.json()
        setSensorData(sensorData.readings ?? [])
        setSensorSummary(sensorData.summary ?? null)
      }

      setMarketData(market)
      setRiskData(risks)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('[useAgrovaultData] Error fetching data:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [county])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000) // Poll every 10 seconds
    return () => clearInterval(interval)
  }, [county, fetchData])

  return {
    sensorData,
    sensorSummary,
    marketData,
    riskData,
    loading,
    error,
    lastUpdated,
  }
}
