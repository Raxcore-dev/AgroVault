/**
 * Post a Job – Farmer Page
 *
 * Lets farmers create farm labor job postings.
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Briefcase, Loader2,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

const CROP_TYPES = [
  'maize', 'wheat', 'beans', 'tea', 'coffee',
  'tomatoes', 'avocados', 'rice', 'sugarcane', 'other',
]

const LOCATION_COORDS: Record<string, { lat: number; lon: number }> = {
  Kisumu: { lat: -0.0917, lon: 34.7680 },
  Nairobi: { lat: -1.2921, lon: 36.8219 },
  Mombasa: { lat: -4.0435, lon: 39.6682 },
  Nakuru: { lat: -0.3031, lon: 36.0800 },
  Eldoret: { lat: 0.5143, lon: 35.2698 },
  Nyeri: { lat: -0.4169, lon: 36.9458 },
  Meru: { lat: 0.0480, lon: 37.6559 },
  Machakos: { lat: -1.5177, lon: 37.2634 },
  Naivasha: { lat: -0.7172, lon: 36.4310 },
  Thika: { lat: -1.0396, lon: 37.0900 },
  Kericho: { lat: -0.3692, lon: 35.2863 },
  Embu: { lat: -0.5389, lon: 37.4596 },
  Nanyuki: { lat: 0.0066, lon: 37.0722 },
  Kiambu: { lat: -1.1714, lon: 36.8356 },
  Kitale: { lat: 1.0157, lon: 35.0020 },
}

const LOCATIONS = Object.keys(LOCATION_COORDS)

export default function PostJobPage() {
  const { user, token } = useAuth()
  const router = useRouter()

  const [form, setForm] = useState({
    title: '',
    cropType: '',
    description: '',
    workersNeeded: '',
    payPerDay: '',
    location: '',
    startDate: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    setIsSubmitting(true)
    setError('')

    const coords = LOCATION_COORDS[form.location] || { lat: 0, lon: 0 }

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: form.title,
          cropType: form.cropType,
          description: form.description,
          workersNeeded: Number(form.workersNeeded),
          payPerDay: Number(form.payPerDay),
          location: form.location,
          latitude: coords.lat,
          longitude: coords.lon,
          startDate: form.startDate,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        router.push(`/jobs/${data.job.id}`)
      } else {
        const errData = await res.json()
        setError(errData.error || 'Failed to create job.')
      }
    } catch {
      setError('Failed to create job. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user || user.role !== 'farmer') {
    return (
      <div className="min-h-screen bg-background px-6 py-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center py-20">
          <Briefcase className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">Farmers Only</h2>
          <p className="text-sm text-muted-foreground mb-4">Only farmers can post jobs.</p>
          <Link href="/jobs" className="text-sm text-primary hover:underline">Browse Jobs</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="card-elevated rounded-lg p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Post a Farm Job</h1>
                <p className="text-sm text-muted-foreground">Find workers for harvesting and other farm work</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Job Title</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Maize Harvest Workers Needed"
                  required
                  className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>

              {/* Crop Type & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Crop Type</label>
                  <select
                    name="cropType"
                    value={form.cropType}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                  >
                    <option value="">Select crop</option>
                    {CROP_TYPES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Location</label>
                  <select
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                  >
                    <option value="">Select location</option>
                    {LOCATIONS.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
                  </select>
                </div>
              </div>

              {/* Workers & Pay */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Workers Needed</label>
                  <input
                    type="number"
                    name="workersNeeded"
                    value={form.workersNeeded}
                    onChange={handleChange}
                    placeholder="e.g. 10"
                    min="1"
                    required
                    className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Pay Per Day (KSh)</label>
                  <input
                    type="number"
                    name="payPerDay"
                    value={form.payPerDay}
                    onChange={handleChange}
                    placeholder="e.g. 700"
                    min="0"
                    required
                    className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the job, requirements, working hours, what you provide (tools, meals, transport), etc."
                  rows={5}
                  required
                  className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 dark:bg-red-950/20 dark:border-red-800">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Briefcase className="h-4 w-4" />
                )}
                {isSubmitting ? 'Posting...' : 'Post Job'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
