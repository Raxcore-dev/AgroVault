/**
 * Marketplace Page
 * 
 * The main marketplace listing where buyers can browse all available products.
 * Features:
 *   - Search products by keywords (e.g. "maize", "beans")
 *   - Filter by location, price range
 *   - Sort by newest, price ascending/descending
 *   - Pagination for large result sets
 *   - Product cards link to detail pages
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { Package, Plus, Store } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { ProductCard } from '@/components/marketplace/product-card'
import { ProductFilters, type FilterValues } from '@/components/marketplace/product-filters'

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
  createdAt: string
  farmer: {
    id: string
    name: string
    location: string | null
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function MarketplacePage() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<FilterValues>({
    search: '',
    location: '',
    minPrice: '',
    maxPrice: '',
    sort: 'newest',
  })

  // Fetch products with current filters
  const fetchProducts = useCallback(async (page = 1) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.search) params.set('search', filters.search)
      if (filters.location) params.set('location', filters.location)
      if (filters.minPrice) params.set('minPrice', filters.minPrice)
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
      if (filters.sort) params.set('sort', filters.sort)
      params.set('page', String(page))
      params.set('limit', '20')

      const res = await fetch(`/api/products?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products)
        setPagination(data.pagination)
      }
    } catch (err) {
      console.error('Failed to fetch products:', err)
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  // Debounced search: refetch when filters change
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchProducts(1)
    }, 300)
    return () => clearTimeout(timeout)
  }, [fetchProducts])

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Store className="h-6 w-6 text-primary" />
              Marketplace
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Browse fresh produce directly from Kenyan farmers
            </p>
          </div>
          <div className="flex gap-3">
            {user?.role === 'farmer' && (
              <Link
                href="/marketplace/add-product"
                className="btn-cta inline-flex items-center gap-2 text-sm"
              >
                <Plus className="h-4 w-4" />
                List Product
              </Link>
            )}
            {user?.role === 'farmer' && (
              <Link
                href="/marketplace/my-products"
                className="btn-primary inline-flex items-center gap-2 text-sm"
              >
                <Package className="h-4 w-4" />
                My Listings
              </Link>
            )}
            {!user && (
              <Link href="/login" className="btn-primary inline-flex items-center gap-2 text-sm">
                Sign in to sell or chat
              </Link>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <ProductFilters filters={filters} onChange={setFilters} />
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card-elevated rounded-xl overflow-hidden animate-pulse">
                <div className="h-48 bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-5 bg-muted rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="card-elevated rounded-xl p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No products found</h3>
            <p className="text-sm text-muted-foreground">
              {filters.search
                ? `No results for "${filters.search}". Try a different search term.`
                : 'No products available yet. Check back soon!'}
            </p>
          </div>
        ) : (
          <>
            {/* Results count */}
            <p className="text-sm text-muted-foreground mb-4">
              Showing {products.length} of {pagination.total} product{pagination.total !== 1 ? 's' : ''}
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => fetchProducts(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-muted-foreground px-4">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => fetchProducts(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
