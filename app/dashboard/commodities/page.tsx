'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRoleGuard } from '@/hooks/use-role-guard'
import { Wheat, Package } from 'lucide-react'
import Link from 'next/link'

interface CommodityWithUnit {
  id: string
  commodityName: string
  quantity: number
  dateStored: string
  expectedStorageDuration: number | null
  storageUnit: {
    id: string
    name: string
    location: string
  }
}

interface StorageUnit {
  id: string
  name: string
  location: string
  commodities: Array<{
    id: string
    commodityName: string
    quantity: number
    dateStored: string
    expectedStorageDuration: number | null
  }>
}

export default function CommoditiesPage() {
  const { allowed, isLoading: roleLoading } = useRoleGuard('farmer')
  const { token } = useAuth()
  const [units, setUnits] = useState<StorageUnit[]>([])
  const [loading, setLoading] = useState(true)

  if (roleLoading || !allowed) return null

  useEffect(() => {
    if (!token) return

    // Fetch all storage units (which include their commodities)
    fetch('/api/storage-units', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.ok) {
          const raw = await res.json()
          const list = raw.storageUnits ?? raw
          // For each unit, fetch its details to get commodities
          const detailed = await Promise.all(
            list.map(async (u: { id: string }) => {
              const detailRes = await fetch(`/api/storage-units/${u.id}`, {
                headers: { Authorization: `Bearer ${token}` },
              })
              if (!detailRes.ok) return null
              const d = await detailRes.json()
              return d.storageUnit ?? d
            })
          )
          setUnits(detailed.filter(Boolean))
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [token])

  const allCommodities = units.flatMap((u) =>
    u.commodities.map((c) => ({
      ...c,
      unitName: u.name,
      unitLocation: u.location,
      unitId: u.id,
    }))
  )

  if (loading) {
    return (
      <div className="px-6 py-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="h-64 rounded-xl bg-muted" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Commodities</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            All commodities across your storage facilities
          </p>
        </div>

        {allCommodities.length === 0 ? (
          <div className="card-elevated rounded-xl p-8 text-center">
            <Wheat className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <h3 className="font-semibold text-foreground">No commodities stored</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Add commodities to your storage units to see them here.
            </p>
            <Link
              href="/dashboard/storage-units"
              className="btn-primary inline-flex items-center gap-2 text-sm"
            >
              <Package className="h-4 w-4" />
              Go to Storage Units
            </Link>
          </div>
        ) : (
          <div className="card-elevated rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Commodity</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Quantity</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Storage Unit</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date Stored</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Duration</th>
                </tr>
              </thead>
              <tbody>
                {allCommodities.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">{c.commodityName}</td>
                    <td className="px-4 py-3 text-foreground">{c.quantity} tons</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/storage-units/${c.unitId}`}
                        className="text-primary hover:underline"
                      >
                        {c.unitName}
                      </Link>
                      <p className="text-xs text-muted-foreground">{c.unitLocation}</p>
                    </td>
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
    </div>
  )
}
