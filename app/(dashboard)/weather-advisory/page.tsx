'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Loader2, ArrowLeft } from 'lucide-react'
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
        const response = await fetch('/api/storage-units')
        if (!response.ok) throw new Error('Failed to fetch storage units')
        const data = await response.json()
        setStorageUnits(data)

        // Auto-select first unit
        if (data.length > 0) {
          setSelectedUnit(data[0].id)
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            🌦️ Weather-Based Crop Advisory
          </h1>
          <p className="mt-2 text-gray-600">
            AI-powered weather impact analysis and recommendations for your stored commodities
          </p>
        </div>

        {/* Storage Unit Selector */}
        {storageUnits.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Select Storage Unit
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {storageUnits.map((unit) => (
                <button
                  key={unit.id}
                  onClick={() => setSelectedUnit(unit.id)}
                  className={`p-4 rounded-lg border-2 transition ${
                    selectedUnit === unit.id
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 bg-white hover:border-purple-300'
                  }`}
                >
                  <p className="font-semibold text-gray-900 text-left">
                    {unit.name}
                  </p>
                  <p className="text-sm text-gray-600 text-left">
                    {unit.location}
                  </p>
                  {unit._count && (
                    <p className="text-sm text-gray-500 text-left mt-1">
                      {unit._count.commodities} commodit{unit._count.commodities === 1 ? 'y' : 'ies'}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Advisory Display */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
            <p className="text-gray-600 mt-4">Loading weather analysis...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 rounded-lg shadow p-6 border border-red-200">
            <p className="text-red-900 font-semibold">Error</p>
            <p className="text-red-700 mt-2">{error}</p>
          </div>
        ) : selectedUnit ? (
          <WeatherCropAdvisoryCard
            storageUnitId={selectedUnit}
            storageUnitName={
              storageUnits.find((u) => u.id === selectedUnit)?.name
            }
          />
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600">No storage units available</p>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 rounded-lg shadow p-6 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3">
            💡 How This Works
          </h3>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li>
              ✓ Real-time weather forecasts are analyzed for your location
            </li>
            <li>
              ✓ AI predicts how weather changes will impact each stored commodity
            </li>
            <li>
              ✓ Specific recommendations are generated based on spoilage risk
            </li>
            <li>
              ✓ Market opportunities are linked when urgent sales are advised
            </li>
            <li>
              ✓ Advisories refresh every 30 minutes automatically
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
