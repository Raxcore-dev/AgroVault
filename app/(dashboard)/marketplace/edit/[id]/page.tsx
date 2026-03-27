/**
 * Edit Product Page
 * 
 * Form for farmers to edit an existing product listing.
 * Requires authentication with a "farmer" role and ownership of the product.
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Plus, Package, MapPin, Upload, X, Loader2, Warehouse, Calendar } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

// Common product categories for Kenyan agriculture
const CATEGORIES = [
  'cereals', 'legumes', 'vegetables', 'fruits', 'dairy',
  'poultry', 'livestock', 'tubers', 'herbs', 'general',
]

// Preset Kenya locations with approximate coordinates
const PRESET_LOCATIONS = [
  { name: 'Nairobi', lat: -1.2921, lng: 36.8219 },
  { name: 'Nakuru', lat: -0.3031, lng: 36.0800 },
  { name: 'Mombasa', lat: -4.0435, lng: 39.6682 },
  { name: 'Kisumu', lat: -0.1022, lng: 34.7617 },
  { name: 'Eldoret', lat: 0.5143, lng: 35.2698 },
  { name: 'Thika', lat: -1.0396, lng: 37.0900 },
  { name: 'Nanyuki', lat: 0.0067, lng: 37.0722 },
  { name: 'Nyeri', lat: -0.4169, lng: 36.9458 },
  { name: 'Machakos', lat: -1.5177, lng: 37.2634 },
  { name: 'Kiambu', lat: -1.1714, lng: 36.8355 },
  { name: 'Meru', lat: 0.0480, lng: 37.6559 },
  { name: 'Embu', lat: -0.5388, lng: 37.4596 },
  { name: 'Kericho', lat: -0.3692, lng: 35.2863 },
  { name: 'Naivasha', lat: -0.7172, lng: 36.4310 },
  { name: 'Kitale', lat: 1.0187, lng: 35.0020 },
]

export default function EditProductPage() {
  const params = useParams()
  const { user, token } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageUploading, setImageUploading] = useState(false)
  const [storageUnits, setStorageUnits] = useState<{ id: string; name: string; location: string }[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    price: '',
    quantity: '',
    unit: 'kg',
    productImage: '',
    locationName: '',
    latitude: '',
    longitude: '',
    category: 'general',
    storageUnitId: '',
    harvestDate: '',
    isAvailable: true,
  })

  // Auto-fill coordinates when a preset location is selected
  const handleLocationChange = (locationName: string) => {
    const preset = PRESET_LOCATIONS.find((l) => l.name === locationName)
    setFormData((prev) => ({
      ...prev,
      locationName,
      latitude: preset ? String(preset.lat) : prev.latitude,
      longitude: preset ? String(preset.lng) : prev.longitude,
    }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === 'locationName') {
      handleLocationChange(value)
    } else if (name === 'isAvailable') {
      setFormData((prev) => ({ ...prev, [name]: value === 'true' }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5 MB.')
      return
    }

    setError('')
    setImageFile(file)

    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setFormData((prev) => ({ ...prev, productImage: '' }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile || !token) return null

    setImageUploading(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('image', imageFile)

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formDataUpload,
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Image upload failed')
      }

      return data.url
    } catch (err) {
      throw err
    } finally {
      setImageUploading(false)
    }
  }

  // Fetch product data and storage units
  useEffect(() => {
    if (params.id && token) {
      fetchProduct(params.id as string)
      fetchStorageUnits()
    }
  }, [params.id, token])

  const fetchProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`)
      if (res.ok) {
        const data = await res.json()
        const product = data.product
        
        // Check ownership
        if (user && product.farmerId !== user.id) {
          setError('You can only edit your own products.')
          return
        }

        setFormData({
          productName: product.productName || '',
          description: product.description || '',
          price: String(product.price || ''),
          quantity: String(product.quantity || ''),
          unit: product.unit || 'kg',
          productImage: product.productImage || '',
          locationName: product.locationName || '',
          latitude: String(product.latitude || ''),
          longitude: String(product.longitude || ''),
          category: product.category || 'general',
          storageUnitId: product.storageUnitId || '',
          harvestDate: product.harvestDate ? product.harvestDate.split('T')[0] : '',
          isAvailable: product.isAvailable ?? true,
        })

        if (product.productImage) {
          setImagePreview(product.productImage)
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStorageUnits = async () => {
    try {
      const res = await fetch('/api/storage-units/my-units', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setStorageUnits(data.storageUnits || [])
      }
    } catch (error) {
      console.error('Error fetching storage units:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!token) {
      setError('You must be logged in.')
      return
    }

    setIsSubmitting(true)

    try {
      let imageUrl: string | null = formData.productImage
      if (imageFile) {
        imageUrl = await uploadImage()
      }

      const res = await fetch(`/api/products/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productName: formData.productName,
          description: formData.description,
          price: Number(formData.price),
          quantity: Number(formData.quantity),
          unit: formData.unit,
          productImage: imageUrl,
          locationName: formData.locationName,
          latitude: Number(formData.latitude),
          longitude: Number(formData.longitude),
          category: formData.category,
          storageUnitId: formData.storageUnitId || null,
          harvestDate: formData.harvestDate ? new Date(formData.harvestDate).toISOString() : null,
          isAvailable: formData.isAvailable,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update product')
      }

      router.push('/marketplace/my-listings')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update product.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user || user.role !== 'farmer') {
    return (
      <div className="min-h-screen bg-background px-6 py-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center py-20">
          <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">Farmer Account Required</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Only farmers can edit products.
          </p>
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
        <div className="max-w-2xl mx-auto">
          {/* Back button */}
          <Link
            href="/marketplace/my-listings"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Listings
          </Link>

          <div className="card-elevated rounded-lg p-8">
            <h1 className="text-xl font-bold text-foreground mb-1 flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Edit Product
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              Update your product listing details.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-lg bg-danger/10 border border-danger/20 p-3 text-sm text-danger">
                  {error}
                </div>
              )}

              {/* Product Name */}
              <div>
                <label htmlFor="productName" className="block text-sm font-medium text-foreground mb-1.5">
                  Product Name *
                </label>
                <input
                  id="productName"
                  name="productName"
                  type="text"
                  value={formData.productName}
                  onChange={handleChange}
                  placeholder="e.g. Fresh White Maize"
                  required
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1.5">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your product... quality, harvest date, farming method, etc."
                  required
                  rows={4}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors resize-none"
                />
              </div>

              {/* Price & Quantity Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-foreground mb-1.5">
                    Price (KES) *
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="e.g. 3500"
                    required
                    min="1"
                    step="0.01"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-foreground mb-1.5">
                    Quantity *
                  </label>
                  <input
                    id="quantity"
                    name="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="e.g. 500"
                    required
                    min="0.1"
                    step="0.1"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="unit" className="block text-sm font-medium text-foreground mb-1.5">
                    Unit
                  </label>
                  <select
                    id="unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                  >
                    <option value="kg">Kilogram (kg)</option>
                    <option value="bag">Bag (90kg)</option>
                    <option value="crate">Crate</option>
                    <option value="piece">Piece</option>
                    <option value="litre">Litre</option>
                    <option value="tonne">Tonne</option>
                  </select>
                </div>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-foreground mb-1.5">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors capitalize"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="capitalize">{cat}</option>
                  ))}
                </select>
              </div>

              {/* Product Image Upload */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Product Photo <span className="text-muted-foreground">(optional)</span>
                </label>

                {imagePreview ? (
                  <div className="relative w-full rounded-lg border border-border overflow-hidden">
                    <div className="relative aspect-video w-full bg-muted">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-background">
                      <div className="flex items-center gap-2 min-w-0">
                        <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm text-muted-foreground truncate">
                          {imageFile?.name || 'Current image'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="rounded-md p-1 text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full rounded-lg border-2 border-dashed border-border bg-muted/30 px-4 py-8 text-center hover:border-primary/50 hover:bg-muted/50 transition-colors"
                  >
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm font-medium text-foreground">
                      Click to upload a photo
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPEG, PNG, WebP or GIF — max 5 MB
                    </p>
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>

              {/* Location Section */}
              <div className="border-t border-border pt-5">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Farm Location
                </h3>

                <div className="mb-4">
                  <label htmlFor="locationName" className="block text-sm font-medium text-foreground mb-1.5">
                    County / Town *
                  </label>
                  <select
                    id="locationName"
                    name="locationName"
                    value={formData.locationName}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                  >
                    <option value="">Select a location</option>
                    {PRESET_LOCATIONS.map((loc) => (
                      <option key={loc.name} value={loc.name}>{loc.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="latitude" className="block text-sm font-medium text-foreground mb-1.5">
                      Latitude *
                    </label>
                    <input
                      id="latitude"
                      name="latitude"
                      type="number"
                      value={formData.latitude}
                      onChange={handleChange}
                      placeholder="-1.2921"
                      required
                      step="any"
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="longitude" className="block text-sm font-medium text-foreground mb-1.5">
                      Longitude *
                    </label>
                    <input
                      id="longitude"
                      name="longitude"
                      type="number"
                      value={formData.longitude}
                      onChange={handleChange}
                      placeholder="36.8219"
                      required
                      step="any"
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Storage Unit Section */}
              {storageUnits.length > 0 && (
                <div className="border-t border-border pt-5">
                  <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Warehouse className="h-4 w-4 text-primary" />
                    Storage Information
                    <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                  </h3>

                  <div className="mb-4">
                    <label htmlFor="storageUnitId" className="block text-sm font-medium text-foreground mb-1.5">
                      Monitored Storage Unit
                    </label>
                    <select
                      id="storageUnitId"
                      name="storageUnitId"
                      value={formData.storageUnitId}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                    >
                      <option value="">Not linked to a storage unit</option>
                      {storageUnits.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.name} ({unit.location})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="harvestDate" className="block text-sm font-medium text-foreground mb-1.5">
                      Harvest Date
                    </label>
                    <input
                      id="harvestDate"
                      name="harvestDate"
                      type="date"
                      value={formData.harvestDate}
                      onChange={handleChange}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Availability Toggle */}
              <div className="border-t border-border pt-5">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isAvailable: e.target.checked }))}
                    className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-foreground">
                    Product is available for purchase
                  </span>
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting || imageUploading}
                className="btn-cta w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting || imageUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {imageUploading ? 'Uploading photo...' : isSubmitting ? 'Saving changes...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
