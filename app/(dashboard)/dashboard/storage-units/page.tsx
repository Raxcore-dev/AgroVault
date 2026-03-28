'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useRoleGuard } from '@/hooks/use-role-guard'
import { Package, Plus, MapPin, X, Trash2, Pencil } from 'lucide-react'

interface StorageUnit {
  id: string
  name: string
  location: string
  capacity: number
  createdAt: string
  _count: { Commodity: number; Alert: number }
  StorageReading: {
    id: string
    temperature: number
    humidity: number
    recordedAt: string
  }[]
}

export default function StorageUnitsPage() {
  const { allowed, isLoading: roleLoading } = useRoleGuard('farmer')
  const { token } = useAuth()
  const searchParams = useSearchParams()

  // Block access for non-farmer roles
  if (roleLoading || !allowed) return null
  const [units, setUnits] = useState<StorageUnit[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(searchParams.get('action') === 'add')
  const [formData, setFormData] = useState({ name: '', location: '', capacity: '' })
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchUnits = async () => {
    if (!token) return
    try {
      const res = await fetch('/api/storage-units', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setUnits(data.storageUnits ?? data)
      }
    } catch (err) {
      console.error('Failed to fetch units:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUnits()
  }, [token])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/storage-units', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          location: formData.location,
          capacity: Number(formData.capacity),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add')

      setFormData({ name: '', location: '', capacity: '' })
      setShowAddForm(false)
      await fetchUnits()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to add storage unit')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this storage unit and all its data?')) return

    try {
      const res = await fetch(`/api/storage-units/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setUnits((prev) => prev.filter((u) => u.id !== id))
      }
    } catch (err) {
      console.error('Failed to delete:', err)
    }
  }

  if (loading) {
    return (
      <div className="px-6 py-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-40 rounded-lg bg-muted" />)}
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
            <h1 className="text-2xl font-bold text-foreground">Storage Units</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage your agricultural storage facilities
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary inline-flex items-center gap-2 text-sm"
          >
            <Plus className="h-4 w-4" />
            Add Storage Unit
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="card-elevated rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">New Storage Unit</h2>
              <button onClick={() => setShowAddForm(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {formError && (
                <div className="md:col-span-3 rounded-lg bg-danger/10 border border-danger/20 p-3 text-sm text-danger">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Warehouse A"
                  required
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                  placeholder="e.g. Nakuru"
                  required
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Capacity (tons)</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData((p) => ({ ...p, capacity: e.target.value }))}
                  placeholder="e.g. 500"
                  required
                  min={1}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                />
              </div>
              <div className="md:col-span-3 flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary inline-flex items-center gap-2 text-sm disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add Unit'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Units Grid */}
        {units.length === 0 ? (
          <div className="card-elevated rounded-lg p-8 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <h3 className="font-semibold text-foreground">No storage units yet</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Create your first storage facility to begin tracking your produce.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary inline-flex items-center gap-2 text-sm"
            >
              <Plus className="h-4 w-4" />
              Add Your First Unit
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {units.map((unit) => (
              <div key={unit.id} className="card-elevated rounded-lg p-5 group">
                <div className="flex items-start justify-between">
                  <Link href={`/dashboard/storage-units/${unit.id}`} className="flex-1">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {unit.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {unit.location}
                    </p>
                  </Link>
                  <button
                    onClick={() => handleDelete(unit.id)}
                    className="opacity-0 group-hover:opacity-100 rounded-lg p-1.5 text-muted-foreground hover:text-danger hover:bg-danger/10 transition-all"
                    title="Delete unit"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                    <p className="text-[11px] text-muted-foreground">Capacity</p>
                    <p className="text-sm font-bold text-foreground">{unit.capacity}t</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                    <p className="text-[11px] text-muted-foreground">Items</p>
                    <p className="text-sm font-bold text-foreground">{unit._count?.Commodity ?? 0}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                    <p className="text-[11px] text-muted-foreground">Readings</p>
                    <p className="text-sm font-bold text-foreground">{unit.StorageReading?.length ?? 0}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <Link
                    href={`/dashboard/storage-units/${unit.id}`}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    View details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
