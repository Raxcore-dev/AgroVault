'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import {
  Package, Wheat, Thermometer, Droplets, ArrowLeft, Plus, X, Trash2,
} from 'lucide-react'

interface Commodity {
  id: string
  commodityName: string
  quantity: number
  dateStored: string
  expectedStorageDuration: number | null
}

interface StorageReading {
  id: string
  temperature: number
  humidity: number
  recordedAt: string
  status?: 'normal' | 'warning' | 'danger'
  status_reasons?: string[]
}

interface StorageUnit {
  id: string
  name: string
  location: string
  capacity: number
  latitude?: number | null
  longitude?: number | null
  createdAt: string
  commodities: Commodity[]
  readings: StorageReading[]
}

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

const SENSOR_REFRESH_MS = 10_000

export default function StorageUnitDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { token } = useAuth()
  const router = useRouter()
  const [unit, setUnit] = useState<StorageUnit | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddCommodity, setShowAddCommodity] = useState(false)
  const [commodityForm, setCommodityForm] = useState({
    commodityName: '',
    quantity: '',
    expectedStorageDuration: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [sensorReading, setSensorReading] = useState<SensorReading | null>(null)
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date())
  const [sensorDeviceId, setSensorDeviceId] = useState<string | null>(null)
  const [isEditingLocation, setIsEditingLocation] = useState(false)
  const [locationForm, setLocationForm] = useState({
    latitude: '',
    longitude: '',
  })

  const fetchUnit = async () => {
    if (!token || !id) return
    try {
      const res = await fetch(`/api/storage-units/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        const unitData = data.storageUnit ?? data
        setUnit(unitData)
        setLocationForm({
          latitude: unitData.latitude ? String(unitData.latitude) : '',
          longitude: unitData.longitude ? String(unitData.longitude) : '',
        })
      } else if (res.status === 404) router.push('/dashboard/storage-units')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUnit() }, [token, id])

  const fetchSensorReading = async () => {
    if (!token || !id) return

    try {
      const res = await fetch(`/api/sensors/latest?storageUnitId=${id}&t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })

      if (!res.ok) {
        setSensorReading(null)
        return
      }

      const data = await res.json()
      setSensorReading(data.reading ?? null)
      setLastRefreshed(new Date())
    } catch (err) {
      console.error('Failed to fetch sensor reading:', err)
    }
  }

  useEffect(() => {
    fetchSensorReading()
    const interval = setInterval(fetchSensorReading, SENSOR_REFRESH_MS)
    return () => clearInterval(interval)
  }, [token, id])

  // Fetch sensor device ID for this storage unit
  useEffect(() => {
    const fetchSensorDevice = async () => {
      if (!token || !id) return
      try {
        const res = await fetch(`/api/sensors/register?t=${Date.now()}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        })
        if (res.ok) {
          const data = await res.json()
          const sensor = data.sensors?.find((s: any) => s.StorageUnit?.id === id)
          if (sensor) {
            setSensorDeviceId(sensor.deviceId)
          }
        }
      } catch (err) {
        console.error('Failed to fetch sensor device:', err)
      }
    }
    fetchSensorDevice()
  }, [token, id])

  const simulateReading = async () => {
    if (!token || !sensorDeviceId) return
    
    try {
      // Generate realistic test data with more variation
      const testTemperature = 22 + Math.random() * 15 // 22-37°C
      const testHumidity = 45 + Math.random() * 40 // 45-85%
      
      console.log('[Test Reading] Sending:', { 
        deviceId: sensorDeviceId, 
        temperature: testTemperature, 
        humidity: testHumidity 
      })
      
      const res = await fetch('/api/sensors/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          deviceId: sensorDeviceId,
          temperature: testTemperature,
          humidity: testHumidity,
        }),
      })

      if (res.ok) {
        console.log('[Test Reading] Success!')
        // Immediately refresh to show new data
        await fetchSensorReading()
        alert(`✅ Test reading sent!\nTemperature: ${testTemperature.toFixed(1)}°C\nHumidity: ${testHumidity.toFixed(1)}%`)
      } else {
        const data = await res.json()
        alert(`❌ Failed: ${data.error}`)
      }
    } catch (err) {
      console.error('[Test Reading] Error:', err)
      alert('❌ Failed to send test reading')
    }
  }

  const handleAddCommodity = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch(`/api/storage-units/${id}/commodities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          commodityName: commodityForm.commodityName,
          quantity: Number(commodityForm.quantity),
          expectedStorageDuration: Number(commodityForm.expectedStorageDuration),
        }),
      })
      if (res.ok) {
        setCommodityForm({ commodityName: '', quantity: '', expectedStorageDuration: '' })
        setShowAddCommodity(false)
        await fetchUnit()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateLocation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!locationForm.latitude || !locationForm.longitude) {
      alert('Please enter both latitude and longitude')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/storage-units/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          latitude: Number(locationForm.latitude),
          longitude: Number(locationForm.longitude),
        }),
      })
      if (res.ok) {
        setIsEditingLocation(false)
        await fetchUnit()
        alert('✅ Coordinates updated successfully!')
      } else {
        const data = await res.json()
        alert(`❌ Error: ${data.error}`)
      }
    } catch (err) {
      console.error(err)
      alert('❌ Failed to update coordinates')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="px-6 py-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 rounded bg-muted" />
          <div className="h-8 w-64 rounded bg-muted" />
          <div className="h-48 rounded-lg bg-muted" />
        </div>
      </div>
    )
  }

  if (!unit) {
    return (
      <div className="px-6 py-6 lg:px-8 text-center">
        <p className="text-muted-foreground">Storage unit not found.</p>
        <Link href="/dashboard/storage-units" className="text-primary hover:underline text-sm mt-2 inline-block">
          ← Back to units
        </Link>
      </div>
    )
  }

  const latestReading = unit.readings?.[0]
  const displayedReading = sensorReading ?? latestReading
  const displayedReadingTimestamp = displayedReading
    ? ('timestamp' in displayedReading ? displayedReading.timestamp : displayedReading.recordedAt)
    : null
  const totalStored = unit.commodities.reduce((sum, c) => sum + c.quantity, 0)
  const capacityPercent = unit.capacity > 0 ? Math.min(100, (totalStored / unit.capacity) * 100) : 0

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/dashboard/storage-units"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to units
        </Link>

        {/* Unit Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{unit.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{unit.location}</p>
            {unit.latitude && unit.longitude ? (
              <p className="text-xs text-muted-foreground mt-1">
                📍 {unit.latitude.toFixed(4)}, {unit.longitude.toFixed(4)}
              </p>
            ) : (
              <p className="text-xs text-warning font-medium mt-1">
                ⚠️ Coordinates not set - weather advisory unavailable
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Sensor data updated: {lastRefreshed.toLocaleTimeString()} • Auto-refreshes every 10s
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchSensorReading}
              className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              title="Refresh now"
            >
              🔄 Refresh
            </button>
            <Link
              href={`/dashboard/sensors?storageUnitId=${unit.id}`}
              className="btn-primary inline-flex items-center gap-2 text-sm"
            >
              <Plus className="h-4 w-4" />
              Add Sensor
            </Link>
          </div>
        </div>

        {/* Location Coordinates Section */}
        <div className="mb-6 card-elevated rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Storage Location</h3>
            {!isEditingLocation && (
              <button
                onClick={() => setIsEditingLocation(true)}
                className="text-xs text-primary hover:underline"
              >
                Edit Coordinates
              </button>
            )}
          </div>
          {isEditingLocation ? (
            <form onSubmit={handleUpdateLocation} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={locationForm.latitude}
                    onChange={(e) => setLocationForm((p) => ({ ...p, latitude: e.target.value }))}
                    placeholder="e.g. -1.2921"
                    required
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Example: -1.2921 (South), 0.1234 (North)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={locationForm.longitude}
                    onChange={(e) => setLocationForm((p) => ({ ...p, longitude: e.target.value }))}
                    placeholder="e.g. 36.6892"
                    required
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Example: 36.6892 (East), 20.1234 (West)</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={submitting} className="btn-primary text-sm disabled:opacity-50">
                  {submitting ? 'Saving...' : 'Save Coordinates'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingLocation(false)}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="text-sm text-foreground">
              {unit.latitude && unit.longitude ? (
                <>
                  <p>Latitude: <strong>{unit.latitude.toFixed(6)}</strong></p>
                  <p>Longitude: <strong>{unit.longitude.toFixed(6)}</strong></p>
                </>
              ) : (
                <p className="text-warning">No coordinates set. Click "Edit Coordinates" to add them.</p>
              )}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="card-elevated rounded-lg p-5">
            <p className="text-sm font-medium text-muted-foreground">Capacity</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{unit.capacity} tons</p>
            <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${capacityPercent > 90 ? 'bg-danger' : capacityPercent > 70 ? 'bg-warning' : 'bg-primary'}`}
                style={{ width: `${capacityPercent}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{capacityPercent.toFixed(0)}% used ({totalStored} tons)</p>
          </div>

          <div className="card-elevated rounded-lg p-5">
            <p className="text-sm font-medium text-muted-foreground">Temperature</p>
            <p className={`mt-2 text-2xl font-bold ${displayedReading && displayedReading.temperature > 35 ? 'text-danger' : displayedReading && displayedReading.temperature > 30 ? 'text-warning' : 'text-primary'}`}>
              {displayedReading ? `${displayedReading.temperature.toFixed(1)}°C` : '—'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {displayedReading ? 'Live from ESP32 sensor' : 'No sensor data'}
            </p>
          </div>

          <div className="card-elevated rounded-lg p-5">
            <p className="text-sm font-medium text-muted-foreground">Humidity</p>
            <p className={`mt-2 text-2xl font-bold ${displayedReading && displayedReading.humidity > 75 ? 'text-danger' : 'text-accent'}`}>
              {displayedReading ? `${displayedReading.humidity.toFixed(1)}%` : '—'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {displayedReading ? 'Live from ESP32 sensor' : 'No sensor data'}
            </p>
          </div>

          <div className="card-elevated rounded-lg p-5">
            <p className="text-sm font-medium text-muted-foreground">Commodities</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{unit.commodities.length}</p>
            <p className="mt-1 text-xs text-muted-foreground">Items stored</p>
          </div>
        </div>

        {/* Live Storage Monitoring Status */}
        <div className="mb-6 card-elevated rounded-lg p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold text-foreground">Storage Monitoring Status</h2>
            {sensorDeviceId && (
              <button
                onClick={simulateReading}
                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                title="Generate a test reading for this storage unit"
              >
                🧪 Send Test Reading
              </button>
            )}
          </div>
          {!displayedReading && (
            <p className="text-sm text-muted-foreground mt-2">
              No sensor readings available yet for this unit. {sensorDeviceId ? 'Click "Send Test Reading" to simulate data.' : 'Check that the ESP32 device is connected and sending data.'}
            </p>
          )}
          {displayedReading && (
            <div className="mt-3 space-y-2">
              {(displayedReading.status_reasons || []).map((reason, i) => (
                <p
                  key={i}
                  className={`text-sm font-medium ${
                    displayedReading.status === 'danger'
                      ? 'text-danger'
                      : displayedReading.status === 'warning'
                      ? 'text-warning'
                      : 'text-primary'
                  }`}
                >
                  ⚠ {reason}
                </p>
              ))}
              {displayedReading.status === 'normal' && (
                <p className="text-sm font-medium text-primary">✅ Storage Conditions Normal</p>
              )}
              {displayedReadingTimestamp && (
                <p className="text-xs text-muted-foreground">
                  Updated at {new Date(displayedReadingTimestamp).toLocaleTimeString()}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Commodities Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Commodities</h2>
            <button
              onClick={() => setShowAddCommodity(true)}
              className="btn-primary inline-flex items-center gap-2 text-sm"
            >
              <Plus className="h-4 w-4" />
              Add Commodity
            </button>
          </div>

          {showAddCommodity && (
            <div className="card-elevated rounded-lg p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Add Commodity</h3>
                <button onClick={() => setShowAddCommodity(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleAddCommodity} className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Commodity Name</label>
                  <input
                    type="text"
                    value={commodityForm.commodityName}
                    onChange={(e) => setCommodityForm((p) => ({ ...p, commodityName: e.target.value }))}
                    placeholder="e.g. Maize"
                    required
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Quantity (tons)</label>
                  <input
                    type="number"
                    value={commodityForm.quantity}
                    onChange={(e) => setCommodityForm((p) => ({ ...p, quantity: e.target.value }))}
                    placeholder="e.g. 50"
                    required
                    min={0.1}
                    step={0.1}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Storage Duration (days)
                  </label>
                  <input
                    type="number"
                    value={commodityForm.expectedStorageDuration}
                    onChange={(e) => setCommodityForm((p) => ({ ...p, expectedStorageDuration: e.target.value }))}
                    placeholder="e.g. 90"
                    required
                    min={1}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                  />
                </div>
                <div className="md:col-span-3 flex gap-3">
                  <button type="submit" disabled={submitting} className="btn-primary text-sm disabled:opacity-50">
                    {submitting ? 'Adding...' : 'Add Commodity'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddCommodity(false)}
                    className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {unit.commodities.length === 0 ? (
            <div className="card-elevated rounded-lg p-6 text-center">
              <Wheat className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No commodities stored yet.</p>
            </div>
          ) : (
            <div className="card-elevated rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Commodity</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Quantity</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date Stored</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {unit.commodities.map((c) => (
                    <tr key={c.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium text-foreground">{c.commodityName}</td>
                      <td className="px-4 py-3 text-foreground">{c.quantity} tons</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(c.dateStored).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {c.expectedStorageDuration ? `${c.expectedStorageDuration} days` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Readings */}
        {unit.readings && unit.readings.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Recent Readings</h2>
            <div className="card-elevated rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Temperature</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Humidity</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Recorded</th>
                  </tr>
                </thead>
                <tbody>
                  {unit.readings.slice(0, 10).map((r) => (
                    <tr key={r.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 font-medium ${r.temperature > 28 ? 'text-danger' : r.temperature > 24 ? 'text-warning' : 'text-primary'}`}>
                          <Thermometer className="h-3.5 w-3.5" />
                          {r.temperature.toFixed(1)}°C
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 font-medium ${r.humidity > 75 || r.humidity < 40 ? 'text-danger' : 'text-accent'}`}>
                          <Droplets className="h-3.5 w-3.5" />
                          {r.humidity.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(r.recordedAt).toLocaleString()}
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
