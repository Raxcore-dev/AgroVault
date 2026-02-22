import { useEffect, useState, useCallback } from 'react'
import type { SensorData, MarketData, RiskData } from '@/lib/mock-data'

interface UseAgrovaultDataResult {
  sensorData: SensorData[]
  marketData: MarketData[]
  riskData: RiskData[]
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

export function useAgrovaultData(county: string): UseAgrovaultDataResult {
  const [sensorData, setSensorData] = useState<SensorData[]>([])
  const [marketData, setMarketData] = useState<MarketData[]>([])
  const [riskData, setRiskData] = useState<RiskData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      const [sensorsRes, marketRes, riskRes] = await Promise.all([
        fetch('/api/sensors'),
        fetch(`/api/market?county=${county}`),
        fetch('/api/risk'),
      ])

      if (!sensorsRes.ok || !marketRes.ok || !riskRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const [sensors, market, risks] = await Promise.all([
        sensorsRes.json(),
        marketRes.json(),
        riskRes.json(),
      ])

      setSensorData(sensors)
      setMarketData(market)
      setRiskData(risks)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('[v0] Error fetching data:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [county])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [county, fetchData])

  return {
    sensorData,
    marketData,
    riskData,
    loading,
    error,
    lastUpdated,
  }
}
