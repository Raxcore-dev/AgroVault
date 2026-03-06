/**
 * Product Card Component
 * 
 * Displays a product in the marketplace grid. Shows the product image,
 * name, price, quantity, location, and farmer info. Clickable to navigate
 * to the product details page.
 */

'use client'

import Link from 'next/link'
import { MapPin, Package, User } from 'lucide-react'

interface ProductCardProps {
  product: {
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
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/marketplace/${product.id}`}>
      <div className="card-elevated rounded-xl overflow-hidden group cursor-pointer">
        {/* Product Image */}
        <div className="relative h-48 bg-muted overflow-hidden">
          {product.productImage ? (
            <img
              src={product.productImage}
              alt={product.productName}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-primary/5">
              <Package className="h-12 w-12 text-primary/30" />
            </div>
          )}
          {/* Category badge */}
          <span className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[11px] font-semibold text-foreground capitalize">
            {product.category}
          </span>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-semibold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">
            {product.productName}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {product.description}
          </p>

          {/* Price & Quantity */}
          <div className="mt-3 flex items-center justify-between">
            <p className="text-lg font-bold text-primary">
              KES {product.price.toLocaleString()}
              <span className="text-xs font-normal text-muted-foreground">/{product.unit}</span>
            </p>
            <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
              {product.quantity} {product.unit} avail.
            </span>
          </div>

          {/* Location & Farmer */}
          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>{product.locationName}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              <span>{product.farmer.name}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
