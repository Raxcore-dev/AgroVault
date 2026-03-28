'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Loader2 } from 'lucide-react'
import { WeatherCropAdvisoryCard } from '@/components/weather-crop-advisory-card'

interface StorageUnit {
  id: string
  name: string
  location: string
  latitude?: number
  longitude?: number
  _count?: { commodities: number }
}

export default function WeatherCropAdvisoryPage() {
  const { user, token, isLoading } = useAuth()
  const [storageUnits, setStorageUnits] = useState<StorageUnit[]>([])
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isLoading || !user) return

    const fetchStorageUnits = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/storage-units', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to fetch storage units')
        }
        const data = await response.json()
        const units = data.storageUnits || data || []
        setStorageUnits(units)

        // Auto-select first unit
        if (units.length > 0) {
          setSelectedUnit(units[0].id)
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load storage units'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchStorageUnits()
  }, [user, isLoading, token])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            🌦️ Weather-Based Crop Advisory
          </h1>
          <p className="mt-2 text-muted-foreground">
            AI-powered weather impact analysis and recommendations for your stored commodities
          </p>
        </div>

        {/* Storage Unit Selector */}
        {storageUnits.length > 0 && (
          <div className="card-elevated rounded-lg border p-6 mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Select Storage Unit
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {storageUnits.map((unit) => (
                <button
                  key={unit.id}
                  onClick={() => setSelectedUnit(unit.id)}
                  className={`p-4 rounded-lg border-2 transition ${
                    selectedUnit === unit.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                >
                  <p className="font-semibold text-foreground text-left">
                    {unit.name}
                  </p>
                  <p className="text-sm text-muted-foreground text-left">
                    {unit.location}
                  </p>
                  {unit._count && (
                    <p className="text-sm text-muted-foreground text-left mt-1">
                      {unit._count.Commodity} commodit{unit._count.Commodity === 1 ? 'y' : 'ies'}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Advisory Display */}
        {loading ? (
          <div className="card-elevated rounded-lg border p-12 text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
            <p className="text-muted-foreground mt-4">Loading weather analysis...</p>
          </div>
        ) : error ? (
          <div className="bg-destructive/10 rounded-lg border border-destructive/30 p-6">
            <p className="font-semibold text-destructive">Error</p>
            <p className="text-destructive/80 mt-2">{error}</p>
          </div>
        ) : selectedUnit ? (
          <WeatherCropAdvisoryCard
            storageUnitId={selectedUnit}
            storageUnitName={
              storageUnits.find((u) => u.id === selectedUnit)?.name
            }
          />
        ) : (
          <div className="card-elevated rounded-lg border p-12 text-center">
            <p className="text-muted-foreground">No storage units available</p>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 rounded-lg border border-primary/20 bg-primary/5 p-6">
          <h3 className="font-semibold text-foreground mb-3">
            💡 How This Works
          </h3>
          <ul className="space-y-2 text-muted-foreground text-sm">
            <li>✓ Real-time weather forecasts are analyzed for your location</li>
            <li>✓ AI predicts how weather changes will impact each stored commodity</li>
            <li>✓ Specific recommendations are generated based on spoilage risk</li>
            <li>✓ Market opportunities are linked when urgent sales are advised</li>
            <li>✓ Advisories refresh every 30 minutes automatically</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
