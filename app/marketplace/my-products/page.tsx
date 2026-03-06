/**
 * My Products Page (Farmer Dashboard)
 * 
 * Displays all products listed by the currently logged-in farmer.
 * Farmers can view, edit availability, and delete their products from here.
 * Requires authentication with the "farmer" role.
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Plus, Package, Trash2, Eye, EyeOff,
  MapPin, ExternalLink
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

interface Product {
  id: string
  productName: string
  description: string
  price: number
  quantity: number
  unit: string
  productImage: string | null
  locationName: string
  category: string
  isAvailable: boolean
  createdAt: string
}

export default function MyProductsPage() {
  const { user, token } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch farmer's own products
  const fetchMyProducts = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    try {
      // Get all products then filter by farmer ID on client side
      // (alternatively, add a farmerId query param to the API)
      const res = await fetch('/api/products?limit=100', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        // Filter to only this farmer's products
        setProducts(
          data.products.filter((p: Product & { farmerId?: string; farmer?: { id: string } }) =>
            p.farmer?.id === user?.id || p.farmerId === user?.id
          )
        )
      }
    } catch (err) {
      console.error('Failed to fetch products:', err)
    } finally {
      setIsLoading(false)
    }
  }, [token, user?.id])

  useEffect(() => {
    fetchMyProducts()
  }, [fetchMyProducts])

  // Toggle product availability
  const toggleAvailability = async (productId: string, currentStatus: boolean) => {
    if (!token) return
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isAvailable: !currentStatus }),
      })
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId ? { ...p, isAvailable: !currentStatus } : p
          )
        )
      }
    } catch (err) {
      console.error('Failed to update product:', err)
    }
  }

  // Delete a product
  const deleteProduct = async (productId: string) => {
    if (!token || !confirm('Are you sure you want to delete this product?')) return
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== productId))
      }
    } catch (err) {
      console.error('Failed to delete product:', err)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background px-6 py-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center py-20">
          <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">Sign In Required</h2>
          <Link href="/login" className="text-primary font-semibold hover:underline">Sign In →</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <Link
            href="/marketplace"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Marketplace
          </Link>

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Product Listings</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Manage your products on the marketplace
              </p>
            </div>
            <Link
              href="/marketplace/add-product"
              className="btn-cta inline-flex items-center gap-2 text-sm"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </Link>
          </div>

          {/* Product List */}
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card-elevated rounded-xl p-5 animate-pulse">
                  <div className="flex gap-4">
                    <div className="h-20 w-20 bg-muted rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/3" />
                      <div className="h-3 bg-muted rounded w-2/3" />
                      <div className="h-4 bg-muted rounded w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="card-elevated rounded-xl p-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-1">No products listed yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start selling by adding your first product.
              </p>
              <Link
                href="/marketplace/add-product"
                className="btn-cta inline-flex items-center gap-2 text-sm"
              >
                <Plus className="h-4 w-4" />
                Add Product
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="card-elevated rounded-xl p-5">
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                      {product.productImage ? (
                        <img
                          src={product.productImage}
                          alt={product.productName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-primary/5">
                          <Package className="h-8 w-8 text-primary/20" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground text-sm">{product.productName}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-muted-foreground capitalize">{product.category}</span>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {product.locationName}
                            </span>
                          </div>
                        </div>
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          product.isAvailable ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                        }`}>
                          {product.isAvailable ? 'Active' : 'Hidden'}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 mt-3">
                        <p className="text-sm font-bold text-primary">
                          KES {product.price.toLocaleString()}/{product.unit}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {product.quantity} {product.unit} available
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
                    <Link
                      href={`/marketplace/${product.id}`}
                      className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View
                    </Link>
                    <button
                      onClick={() => toggleAvailability(product.id, product.isAvailable)}
                      className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      {product.isAvailable ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      {product.isAvailable ? 'Hide' : 'Show'}
                    </button>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="flex items-center gap-1.5 rounded-lg border border-danger/20 px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/5 transition-colors ml-auto"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
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
