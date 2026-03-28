/**
 * Product Filters Component
 * 
 * Provides search bar and filter controls for the marketplace.
 * Filters include: keyword search, location, price range, and sorting.
 * Emits filter changes to the parent via an onChange callback.
 */

'use client'

import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'

export interface FilterValues {
  search: string
  location: string
  minPrice: string
  maxPrice: string
  sort: string
  category: string
  minQuantity: string
}

interface ProductFiltersProps {
  filters: FilterValues
  onChange: (filters: FilterValues) => void
}

// Common Kenya locations for the filter dropdown
const LOCATIONS = [
  '', 'Nairobi', 'Nakuru', 'Mombasa', 'Kisumu', 'Eldoret',
  'Thika', 'Nanyuki', 'Nyeri', 'Machakos', 'Kiambu',
  'Meru', 'Embu', 'Kericho', 'Naivasha', 'Kitale',
]

const CATEGORIES = [
  '', 'maize', 'beans', 'tomatoes', 'potatoes', 'rice', 'wheat',
  'vegetables', 'fruits', 'dairy', 'poultry', 'livestock', 'tubers', 'herbs',
]

export function ProductFilters({ filters, onChange }: ProductFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)

  const updateFilter = (key: keyof FilterValues, value: string) => {
    onChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onChange({
      search: '',
      location: '',
      minPrice: '',
      maxPrice: '',
      sort: 'newest',
      category: '',
      minQuantity: '',
    })
  }

  const hasActiveFilters =
    filters.location || filters.minPrice || filters.maxPrice || filters.category || filters.minQuantity

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Search products... (e.g. maize, beans, tomatoes)"
            className="w-full rounded-lg border border-border bg-white py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
            showFilters || hasActiveFilters
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 h-5 w-5 rounded-full bg-primary text-white text-[11px] flex items-center justify-center">
              {[filters.location, filters.minPrice, filters.maxPrice].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="card-elevated rounded-lg p-5 animate-fade-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Filter Products</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-danger hover:underline"
              >
                <X className="h-3 w-3" />
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Location filter */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Location</label>
              <select
                value={filters.location}
                onChange={(e) => updateFilter('location', e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
              >
                <option value="">All locations</option>
                {LOCATIONS.filter(Boolean).map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Category</label>
              <select
                value={filters.category}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 capitalize"
              >
                <option value="">All categories</option>
                {CATEGORIES.filter(Boolean).map((cat) => (
                  <option key={cat} value={cat} className="capitalize">{cat}</option>
                ))}
              </select>
            </div>

            {/* Min Price */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Min Price (KES)</label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => updateFilter('minPrice', e.target.value)}
                placeholder="0"
                min="0"
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>

            {/* Max Price */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Max Price (KES)</label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
                placeholder="Any"
                min="0"
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>

            {/* Minimum Quantity */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Min Quantity</label>
              <input
                type="number"
                value={filters.minQuantity}
                onChange={(e) => updateFilter('minQuantity', e.target.value)}
                placeholder="Any"
                min="0"
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>

            {/* Sort */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Sort by</label>
              <select
                value={filters.sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
