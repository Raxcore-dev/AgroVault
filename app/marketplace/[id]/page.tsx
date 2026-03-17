'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Package, Phone, Mail, Calendar, AlertCircle, Thermometer, Droplets, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
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
  createdAt: string
  harvestDate: string | null
  storageUnit: {
    id: string
    name: string
    location: string
  } | null
  farmer: {
    id: string
    name: string
    email: string
    phone: string
    location: string
  }
}

export default function ProductDetailsPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [storageCondition, setStorageCondition] = useState<{
    hasStorage: boolean
    storageUnit?: { id: string; name: string; location: string }
    latestReading?: { temperature: number; humidity: number; status: string; recordedAt: string }
    condition: 'safe' | 'warning' | 'danger'
    message: string
  } | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string)
      fetchStorageCondition(params.id as string)
    }
  }, [params.id])

  const fetchStorageCondition = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}/storage-condition`)
      if (res.ok) {
        const data = await res.json()
        setStorageCondition(data)
      }
    } catch (error) {
      console.error('Error fetching storage condition:', error)
    }
  }

  const fetchProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`)
      if (res.ok) {
        const data = await res.json()
        setProduct(data.product)
      } else {
        router.push('/marketplace')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleContact = () => {
    if (product?.farmer.phone) {
      window.location.href = `tel:${product.farmer.phone}`
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <AlertCircle className="mx-auto h-16 w-16 text-muted-foreground" />
          <h2 className="mt-4 text-2xl font-bold text-foreground">Product not found</h2>
          <Link href="/marketplace">
            <button className="btn-primary mt-6">Back to Marketplace</button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/marketplace" className="inline-flex items-center gap-2 text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Back to Marketplace
        </Link>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Product Image */}
          <div className="glass-card overflow-hidden rounded-lg">
            {product.productImage ? (
              <img
                src={product.productImage}
                alt={product.productName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-96 items-center justify-center bg-muted">
                <Package className="h-32 w-32 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                  {product.category}
                </span>
              </div>
              <h1 className="mt-4 text-4xl font-bold text-foreground">{product.productName}</h1>
              <p className="mt-4 text-3xl font-bold text-primary">
                KES {product.price.toLocaleString()}
                <span className="text-lg font-normal text-muted-foreground"> / {product.unit}</span>
              </p>
            </div>

            <div className="glass-card rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground">Product Information</h3>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Available Quantity</p>
                    <p className="font-semibold text-foreground">{product.quantity} {product.unit}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-semibold text-foreground">{product.locationName}</p>
                  </div>
                </div>
                {product.harvestDate && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Harvest Date</p>
                      <p className="font-semibold text-foreground">
                        {new Date(product.harvestDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Listed Date</p>
                    <p className="font-semibold text-foreground">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground">Description</h3>
              <p className="mt-4 text-muted-foreground">{product.description}</p>
            </div>

            {/* Storage Condition Card - Only show if product is linked to a storage unit */}
            {storageCondition?.hasStorage && (
              <div className={`glass-card rounded-lg p-6 border-2 ${
                storageCondition.condition === 'safe' ? 'border-green-500/30' :
                storageCondition.condition === 'warning' ? 'border-yellow-500/30' :
                'border-red-500/30'
              }`}>
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Thermometer className="h-5 w-5" />
                  Storage Condition
                </h3>
                
                {/* Status indicator */}
                <div className="mt-4 flex items-center gap-3">
                  {storageCondition.condition === 'safe' ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : storageCondition.condition === 'warning' ? (
                    <AlertTriangle className="h-6 w-6 text-yellow-500" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-500" />
                  )}
                  <span className={`font-semibold ${
                    storageCondition.condition === 'safe' ? 'text-green-600' :
                    storageCondition.condition === 'warning' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {storageCondition.condition === 'safe' ? '✅ Safe Storage Temperature' :
                     storageCondition.condition === 'warning' ? '⚠️ Storage Warning' :
                     '⚠️ Storage Alert'}
                  </span>
                </div>

                <p className="mt-2 text-sm text-muted-foreground">
                  {storageCondition.message}
                </p>

                {/* Storage unit info */}
                {storageCondition.storageUnit && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Stored in: <span className="font-medium text-foreground">{storageCondition.storageUnit.name}</span>
                      {' • '}{storageCondition.storageUnit.location}
                    </p>
                  </div>
                )}

                {/* Latest readings */}
                {storageCondition.latestReading && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Thermometer className="h-4 w-4" />
                        <span className="text-xs">Temperature</span>
                      </div>
                      <p className="mt-1 text-lg font-semibold text-foreground">
                        {storageCondition.latestReading.temperature}°C
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Droplets className="h-4 w-4" />
                        <span className="text-xs">Humidity</span>
                      </div>
                      <p className="mt-1 text-lg font-semibold text-foreground">
                        {storageCondition.latestReading.humidity}%
                      </p>
                    </div>
                  </div>
                )}

                <p className="mt-3 text-xs text-muted-foreground">
                  Last updated: {storageCondition.latestReading 
                    ? new Date(storageCondition.latestReading.recordedAt).toLocaleString()
                    : 'No readings available'}
                </p>
              </div>
            )}

            <div className="glass-card rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground">Seller Information</h3>
              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Farmer Name</p>
                  <p className="font-semibold text-foreground">{product.farmer.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-semibold text-foreground">{product.farmer.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-semibold text-foreground">{product.farmer.email}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={handleContact} className="btn-primary flex-1">
                Contact Farmer
              </button>
              <button className="btn-secondary flex-1">
                Request Purchase
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
