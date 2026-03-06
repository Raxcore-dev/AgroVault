/**
 * Product Details Page
 * 
 * Displays full information about a single product:
 *   - Product image, name, price, quantity, description
 *   - Farmer information (name, phone, location)
 *   - Interactive map showing the farmer's location (OpenStreetMap/Leaflet)
 *   - Chat widget so the buyer can message the farmer
 * 
 * Dynamic route: /marketplace/[id]
 */

'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, MapPin, Package, Phone, Mail, User,
  MessageCircle, Calendar, Tag, Scale
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { FarmerMap } from '@/components/marketplace/farmer-map'
import { ChatWidget } from '@/components/marketplace/chat-widget'

interface Product {
  id: string
  productName: string
  description: string
  price: number
  quantity: number
  unit: string
  productImage: string | null
  locationName: string
  latitude: number
  longitude: number
  category: string
  isAvailable: boolean
  createdAt: string
  farmer: {
    id: string
    name: string
    email: string
    phone: string | null
    location: string | null
  }
}

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showChat, setShowChat] = useState(false)
  const [error, setError] = useState('')

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`)
        if (res.ok) {
          const data = await res.json()
          setProduct(data.product)
        } else {
          setError('Product not found.')
        }
      } catch {
        setError('Failed to load product.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background px-6 py-6 lg:px-8">
        <div className="max-w-5xl mx-auto animate-pulse">
          <div className="h-8 bg-muted rounded w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-[400px] bg-muted rounded-xl" />
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-6 bg-muted rounded w-1/4" />
              <div className="h-20 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background px-6 py-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center py-20">
          <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">{error || 'Product not found'}</h2>
          <Link href="/marketplace" className="text-sm text-primary hover:underline">
            Back to Marketplace
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Marketplace
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* ─── Left Column: Image + Map ─── */}
            <div className="space-y-6">
              {/* Product Image */}
              <div className="card-elevated rounded-xl overflow-hidden">
                {product.productImage ? (
                  <img
                    src={product.productImage}
                    alt={product.productName}
                    className="w-full h-[350px] object-cover"
                  />
                ) : (
                  <div className="w-full h-[350px] bg-primary/5 flex items-center justify-center">
                    <Package className="h-20 w-20 text-primary/20" />
                  </div>
                )}
              </div>

              {/* Farmer Location Map */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Farm Location
                </h3>
                <FarmerMap
                  latitude={product.latitude}
                  longitude={product.longitude}
                  farmerName={product.farmer.name}
                  locationName={product.locationName}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  📍 {product.locationName} ({product.latitude.toFixed(4)}, {product.longitude.toFixed(4)})
                </p>
              </div>
            </div>

            {/* ─── Right Column: Product Info + Chat ─── */}
            <div className="space-y-6">
              {/* Product Details Card */}
              <div className="card-elevated rounded-xl p-6">
                {/* Category & Availability */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold capitalize">
                    {product.category}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    product.isAvailable ? 'bg-primary/10 text-primary' : 'bg-danger/10 text-danger'
                  }`}>
                    {product.isAvailable ? 'Available' : 'Sold Out'}
                  </span>
                </div>

                {/* Product Name */}
                <h1 className="text-2xl font-bold text-foreground mb-2">{product.productName}</h1>

                {/* Price */}
                <p className="text-3xl font-bold text-primary mb-4">
                  KES {product.price.toLocaleString()}
                  <span className="text-base font-normal text-muted-foreground ml-2">per {product.unit}</span>
                </p>

                {/* Quick Info */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Scale className="h-3.5 w-3.5" />
                      <span className="text-xs">Quantity</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{product.quantity} {product.unit}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="text-xs">Location</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{product.locationName}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Tag className="h-3.5 w-3.5" />
                      <span className="text-xs">Category</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground capitalize">{product.category}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="text-xs">Listed</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-foreground mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
                </div>

                {/* Farmer Info */}
                <div className="border-t border-border pt-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Farmer Information</h3>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{product.farmer.name}</p>
                        <p className="text-xs text-muted-foreground">{product.farmer.location || product.locationName}</p>
                      </div>
                    </div>
                    {product.farmer.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{product.farmer.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      <span>{product.farmer.email}</span>
                    </div>
                  </div>
                </div>

                {/* Chat Button */}
                {user && user.id !== product.farmer.id && (
                  <button
                    onClick={() => setShowChat(!showChat)}
                    className="btn-cta w-full mt-6 flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {showChat ? 'Close Chat' : `Message ${product.farmer.name}`}
                  </button>
                )}

                {!user && (
                  <Link
                    href="/login"
                    className="btn-primary w-full mt-6 flex items-center justify-center gap-2 text-sm"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Sign in to message farmer
                  </Link>
                )}
              </div>

              {/* Chat Widget */}
              {showChat && user && product && (
                <ChatWidget
                  productId={product.id}
                  otherUserId={product.farmer.id}
                  otherUserName={product.farmer.name}
                  onClose={() => setShowChat(false)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
