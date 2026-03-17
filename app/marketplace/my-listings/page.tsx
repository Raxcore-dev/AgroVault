'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Package, ShieldCheck, Calendar } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

interface Product {
  id: string
  productName: string
  price: number
  quantity: number
  unit: string
  category: string
  locationName: string
  isAvailable: boolean
  createdAt: string
  harvestDate: string | null
  storageUnit: {
    id: string
    name: string
    location: string
  } | null
}

export default function MyListingsPage() {
  const { user, token } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      fetchMyProducts()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchMyProducts = async () => {
    if (!token) return
    try {
      const res = await fetch('/api/products/my-listings', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!token || !confirm('Are you sure you want to delete this product?')) return

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setProducts(products.filter((p) => p.id !== id))
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const toggleAvailability = async (id: string, isAvailable: boolean) => {
    if (!token) return
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isAvailable: !isAvailable }),
      })
      if (res.ok) {
        setProducts(products.map((p) => (p.id === id ? { ...p, isAvailable: !isAvailable } : p)))
      }
    } catch (error) {
      console.error('Error updating product:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {!user && (
          <div className="glass-card mb-6 rounded-lg p-6 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-3 text-lg font-semibold text-foreground">Sign in required</h3>
            <p className="mt-1 text-sm text-muted-foreground">Log in as a farmer to manage your listings.</p>
            <div className="mt-4 flex justify-center gap-3">
              <Link href="/login" className="btn-primary inline-flex items-center justify-center">Sign in</Link>
              <Link href="/register" className="btn-outline inline-flex items-center justify-center">Create account</Link>
            </div>
          </div>
        )}

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">My Listings</h1>
            <p className="mt-2 text-muted-foreground">Manage your product listings</p>
          </div>
          <Link href="/marketplace/add-product">
            <button className="btn-primary flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Product
            </button>
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : products.length === 0 ? (
          <div className="glass-card rounded-lg p-12 text-center">
            <Package className="mx-auto h-16 w-16 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold text-foreground">No products listed yet</h3>
            <p className="mt-2 text-muted-foreground">Start by adding your first product to the marketplace</p>
            <Link href="/marketplace/add">
              <button className="btn-primary mt-6">Add Your First Product</button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="glass-card rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-foreground">{product.productName}</h3>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        product.isAvailable
                          ? 'bg-primary/10 text-primary'
                          : 'bg-[hsl(var(--danger))/10] text-[hsl(var(--danger))]'
                      }`}>
                        {product.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">
                        {product.category}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Price</p>
                        <p className="mt-1 text-lg font-semibold text-foreground">
                          KES {product.price.toLocaleString()} / {product.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Quantity</p>
                        <p className="mt-1 text-lg font-semibold text-foreground">
                          {product.quantity} {product.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="mt-1 text-lg font-semibold text-foreground">{product.locationName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Listed</p>
                        <p className="mt-1 text-lg font-semibold text-foreground">
                          {new Date(product.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Storage & Harvest Info */}
                    {(product.storageUnit || product.harvestDate) && (
                      <div className="mt-4 pt-4 border-t border-border flex gap-6">
                        {product.storageUnit && (
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <ShieldCheck className="h-4 w-4" />
                            <span>Stored in: {product.storageUnit.name}</span>
                          </div>
                        )}
                        {product.harvestDate && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Harvested: {new Date(product.harvestDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="ml-6 flex gap-2">
                    <button
                      onClick={() => toggleAvailability(product.id, product.isAvailable)}
                      className="rounded-lg border border-border p-2 transition-colors hover:bg-muted"
                      title={product.isAvailable ? 'Mark as unavailable' : 'Mark as available'}
                    >
                      <Package className="h-5 w-5 text-foreground" />
                    </button>
                    <Link href={`/marketplace/edit/${product.id}`}>
                      <button className="rounded-lg border border-border p-2 transition-colors hover:bg-muted">
                        <Edit className="h-5 w-5 text-foreground" />
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="rounded-lg border border-border p-2 transition-colors hover:bg-[hsl(var(--danger))/10]"
                    >
                      <Trash2 className="h-5 w-5 text-[hsl(var(--danger))]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
