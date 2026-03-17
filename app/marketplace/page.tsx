'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Plus, Package, ShieldCheck } from 'lucide-react'
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
  storageUnit: {
    id: string
    name: string
    location: string
  } | null
  farmer: {
    id: string
    name: string
    phone: string
    location: string
  }
}

const DEFAULT_FILTERS: FilterValues = {
  search: '',
  location: '',
  minPrice: '',
  maxPrice: '',
  sort: 'newest',
  category: '',
  minQuantity: '',
}

export default function MarketplacePage() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS)

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    if (filters.search) params.append('search', filters.search)
    if (filters.location) params.append('location', filters.location)
    if (filters.minPrice) params.append('minPrice', filters.minPrice)
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice)
    if (filters.sort) params.append('sort', filters.sort)
    if (filters.category) params.append('category', filters.category)
    if (filters.minQuantity) params.append('minQuantity', filters.minQuantity)
    return params.toString()
  }, [filters])

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/products?${queryString}`)
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

    fetchProducts()
  }, [queryString])

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Marketplace</h1>
            <p className="mt-2 text-muted-foreground">
              Buy and sell agricultural products directly, reduce spoilage by connecting fast.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-border px-3 py-2 text-xs text-muted-foreground md:flex">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Monitored storage badges build buyer trust.
            </div>

            {user?.role === 'farmer' ? (
              <Link href="/marketplace/add-product" className="btn-primary flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Product
              </Link>
            ) : !user ? (
              <Link href="/login" className="text-sm text-muted-foreground hover:text-primary">
                Sign in to sell
              </Link>
            ) : null}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <ProductFilters filters={filters} onChange={setFilters} />
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : products.length === 0 ? (
          <div className="glass-card rounded-lg p-12 text-center">
            <Package className="mx-auto h-16 w-16 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold text-foreground">No products found</h3>
            <p className="mt-2 text-muted-foreground">
              Adjust filters or list the first product to help others reduce spoilage.
            </p>
            {user?.role === 'farmer' && (
              <Link href="/marketplace/add-product" className="btn-primary mt-4 inline-flex items-center gap-2">
                <Plus className="h-4 w-4" />
                List a product
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
