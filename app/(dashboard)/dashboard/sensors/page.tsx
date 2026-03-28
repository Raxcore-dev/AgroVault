'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Wifi, Plus, CheckCircle, AlertCircle, Copy, ExternalLink } from 'lucide-react'

interface StorageUnit {
  id: string
  name: string
  location: string
}

interface Sensor {
  id: string
  deviceId: string
  name: string
  deviceType: string
  status: string
  StorageUnit: StorageUnit
  StorageReading?: {
    temperature: number
    humidity: number
    status: string
    recordedAt: string
  } | null
}

export default function SensorsPage() {
  const { token } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [storageUnits, setStorageUnits] = useState<StorageUnit[]>([])
  const [sensors, setSensors] = useState<Sensor[]>([])
  const [loading, setLoading] = useState(true)
  const [showRegisterForm, setShowRegisterForm] = useState(false)
  const [formData, setFormData] = useState({
    storageUnitId: '',
    deviceName: '',
    deviceId: '',
    deviceType: 'ESP32-DHT22',
  })
  const [registering, setRegistering] = useState(false)
  const [registrationResult, setRegistrationResult] = useState<any>(null)
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date())

  // Pre-select storage unit from query parameter
  useEffect(() => {
    const preselectedUnitId = searchParams.get('storageUnitId')
    if (preselectedUnitId) {
      setFormData((prev) => ({ ...prev, storageUnitId: preselectedUnitId }))
      setShowRegisterForm(true)
    }
  }, [searchParams])

  const fetchStorageUnits = async () => {
    if (!token) return
    try {
      const res = await fetch('/api/storage-units', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setStorageUnits(data.storageUnits || [])
      }
    } catch (err) {
      console.error('Failed to fetch storage units:', err)
    }
  }

  const fetchSensors = async () => {
    if (!token) return
    try {
      const res = await fetch(`/api/sensors/register?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
      if (res.ok) {
        const data = await res.json()
        setSensors(data.sensors || [])
        setLastRefreshed(new Date())
      }
    } catch (err) {
      console.error('Failed to fetch sensors:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    Promise.all([fetchStorageUnits(), fetchSensors()])
    // Auto-refresh sensor readings every 10 seconds
    const interval = setInterval(fetchSensors, 10000)
    return () => clearInterval(interval)
  }, [token])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegistering(true)
    setRegistrationResult(null)

    try {
      const res = await fetch('/api/sensors/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        setRegistrationResult({ success: true, data })
        setFormData({
          storageUnitId: '',
          deviceName: '',
          deviceId: '',
          deviceType: 'ESP32-DHT22',
        })
        fetchSensors()
      } else {
        setRegistrationResult({ success: false, error: data.error })
      }
    } catch (err) {
      setRegistrationResult({ success: false, error: 'Failed to register sensor' })
    } finally {
      setRegistering(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const simulateReading = async (sensor: Sensor) => {
    if (!token) return
    
    try {
      // Generate realistic test data with more variation
      const testTemperature = 22 + Math.random() * 15 // 22-37°C
      const testHumidity = 45 + Math.random() * 40 // 45-85%
      
      console.log('[Test Reading] Sending:', { 
        deviceId: sensor.deviceId, 
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
          deviceId: sensor.deviceId,
          temperature: testTemperature,
          humidity: testHumidity,
        }),
      })

      if (res.ok) {
        console.log('[Test Reading] Success!')
        // Immediately refresh to show new data
        await fetchSensors()
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading sensors...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">IoT Sensors</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage your ESP32 sensors and monitor storage conditions
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {lastRefreshed.toLocaleTimeString()} • Auto-refreshes every 10s
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchSensors}
              className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              title="Refresh now"
            >
              🔄 Refresh
            </button>
            <button
              onClick={() => setShowRegisterForm(!showRegisterForm)}
              className="btn-primary inline-flex items-center gap-2 text-sm"
            >
              <Plus className="h-4 w-4" />
              Register Sensor
            </button>
          </div>
        </div>

        {/* Registration Form */}
        {showRegisterForm && (
          <div className="card-elevated rounded-lg p-6 mb-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Register New Sensor</h2>
              <button
                onClick={() => setShowRegisterForm(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Storage Unit *
                  </label>
                  <select
                    value={formData.storageUnitId}
                    onChange={(e) => setFormData({ ...formData, storageUnitId: e.target.value })}
                    required
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                  >
                    <option value="">Select a storage unit</option>
                    {storageUnits.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name} ({unit.location})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Device Name
                  </label>
                  <input
                    type="text"
                    value={formData.deviceName}
                    onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })}
                    placeholder="e.g., Silo A Sensor"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Device ID (ESP32 MAC or Custom) *
                  </label>
                  <input
                    type="text"
                    value={formData.deviceId}
                    onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                    placeholder="e.g., esp32_silo_01 or 24:62:AB:CD:EF:12"
                    required
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Unique identifier for this sensor device
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Device Type
                  </label>
                  <select
                    value={formData.deviceType}
                    onChange={(e) => setFormData({ ...formData, deviceType: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                  >
                    <option value="ESP32-DHT22">ESP32 + DHT22</option>
                    <option value="ESP32-DHT11">ESP32 + DHT11</option>
                    <option value="ESP32-BME280">ESP32 + BME280</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={registering}
                  className="btn-primary text-sm disabled:opacity-50"
                >
                  {registering ? 'Registering...' : 'Register Sensor'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowRegisterForm(false)}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>

            {/* Registration Result */}
            {registrationResult && (
              <div
                className={`mt-4 rounded-lg p-4 ${
                  registrationResult.success
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                {registrationResult.success ? (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <p className="font-semibold text-green-900">
                        {registrationResult.data.message}
                      </p>
                    </div>
                    {registrationResult.data.instructions?.esp32_code && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-green-900 mb-2">
                          ESP32 Configuration:
                        </p>
                        <div className="relative">
                          <pre className="bg-green-100 rounded p-3 text-xs text-green-800 overflow-x-auto">
                            {registrationResult.data.instructions.esp32_code}
                          </pre>
                          <button
                            onClick={() =>
                              copyToClipboard(registrationResult.data.instructions.esp32_code)
                            }
                            className="absolute top-2 right-2 p-1.5 rounded bg-white hover:bg-green-50"
                            title="Copy code"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <p className="font-semibold text-red-900">{registrationResult.error}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Sensors List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Registered Sensors ({sensors.length})
          </h2>

          {sensors.length === 0 ? (
            <div className="card-elevated rounded-lg p-8 text-center">
              <Wifi className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <h3 className="font-semibold text-foreground">No sensors registered</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Register your first ESP32 sensor to start monitoring storage conditions
              </p>
              <button
                onClick={() => setShowRegisterForm(true)}
                className="btn-primary inline-flex items-center gap-2 text-sm"
              >
                <Plus className="h-4 w-4" />
                Register Sensor
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {sensors.map((sensor) => (
                <div
                  key={sensor.id}
                  className="card-elevated rounded-lg p-5 border border-border"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        className={`rounded-lg p-2.5 ${
                          sensor.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        <Wifi className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{sensor.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Device ID: <code className="bg-muted px-1.5 py-0.5 rounded">{sensor.deviceId}</code>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Type: {sensor.deviceType} • Status:{' '}
                          <span
                            className={`font-medium ${
                              sensor.status === 'active' ? 'text-green-600' : 'text-gray-600'
                            }`}
                          >
                            {sensor.status}
                          </span>
                        </p>
                        <Link
                          href={`/dashboard/storage-units/${sensor.StorageUnit.id}`}
                          className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-1"
                        >
                          Linked to: {sensor.StorageUnit.name}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                        <button
                          onClick={() => simulateReading(sensor)}
                          className="mt-2 text-xs text-primary hover:underline inline-flex items-center gap-1"
                          title="Generate a test reading for this sensor"
                        >
                          🧪 Send Test Reading
                        </button>
                      </div>
                    </div>

                    {/* Latest Reading */}
                    {sensor.StorageReading && sensor.StorageReading.temperature !== undefined && (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-2">Latest Reading</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-lg bg-primary/5 px-3 py-2">
                            <p className="text-xs text-muted-foreground">Temperature</p>
                            <p className="text-lg font-bold text-primary">
                              {sensor.StorageReading.temperature.toFixed(1)}°C
                            </p>
                          </div>
                          <div className="rounded-lg bg-accent/5 px-3 py-2">
                            <p className="text-xs text-muted-foreground">Humidity</p>
                            <p className="text-lg font-bold text-accent">
                              {sensor.StorageReading.humidity.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(sensor.StorageReading.recordedAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
