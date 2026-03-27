/**
 * Farm Labor Marketplace – Browse Jobs
 *
 * Workers and farmers can browse available farm jobs.
 * Includes search, location filter, crop type filter, and sorting.
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Briefcase, MapPin, Users, Calendar, Search,
  SlidersHorizontal, X, Plus, Wheat, Banknote,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

interface Job {
  id: string
  title: string
  cropType: string
  description: string
  workersNeeded: number
  payPerDay: number
  location: string
  startDate: string
  createdAt: string
  farmer: {
    id: string
    name: string
    phone: string | null
    location: string | null
  }
  _count: { applications: number }
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const LOCATIONS = [
  '', 'Nairobi', 'Nakuru', 'Mombasa', 'Kisumu', 'Eldoret',
  'Thika', 'Nanyuki', 'Nyeri', 'Machakos', 'Kiambu',
  'Meru', 'Embu', 'Kericho', 'Naivasha', 'Kitale',
]

const CROP_TYPES = [
  '', 'maize', 'wheat', 'beans', 'tea', 'coffee',
  'tomatoes', 'avocados', 'rice', 'sugarcane',
]

export default function JobsPage() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [cropType, setCropType] = useState('')
  const [sort, setSort] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)

  const fetchJobs = useCallback(async (page = 1) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (location) params.set('location', location)
      if (cropType) params.set('cropType', cropType)
      if (sort) params.set('sort', sort)
      params.set('page', String(page))
      params.set('limit', '20')

      const res = await fetch(`/api/jobs?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setJobs(data.jobs)
        setPagination(data.pagination)
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err)
    } finally {
      setIsLoading(false)
    }
  }, [search, location, cropType, sort])

  useEffect(() => {
    const timeout = setTimeout(() => fetchJobs(1), 300)
    return () => clearTimeout(timeout)
  }, [fetchJobs])

  const hasActiveFilters = location || cropType
  const clearFilters = () => { setLocation(''); setCropType(''); setSort('newest') }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-primary" />
              Farm Labor Marketplace
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Find farm jobs near you — harvesting, picking, sorting and more
            </p>
          </div>
          {user?.role === 'farmer' && (
            <Link
              href="/jobs/post"
              className="btn-primary inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold"
            >
              <Plus className="h-4 w-4" />
              Post a Job
            </Link>
          )}
        </div>

        {/* Search & Filters */}
        <div className="space-y-4 mb-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search jobs... (e.g. maize harvest, tea picking)"
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
                  {[location, cropType].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="card-elevated rounded-lg p-5 animate-fade-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">Filter Jobs</h3>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-danger hover:underline">
                    <X className="h-3 w-3" /> Clear all
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Location</label>
                  <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30">
                    <option value="">All locations</option>
                    {LOCATIONS.filter(Boolean).map((loc) => <option key={loc} value={loc}>{loc}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Crop Type</label>
                  <select value={cropType} onChange={(e) => setCropType(e.target.value)} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30">
                    <option value="">All crops</option>
                    {CROP_TYPES.filter(Boolean).map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Sort By</label>
                  <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30">
                    <option value="newest">Newest First</option>
                    <option value="pay_desc">Highest Pay</option>
                    <option value="pay_asc">Lowest Pay</option>
                    <option value="start_date">Start Date</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card-elevated rounded-lg p-5 animate-pulse">
                <div className="h-5 bg-muted rounded w-3/4 mb-3" />
                <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                <div className="h-16 bg-muted rounded mb-3" />
                <div className="flex gap-3">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-4 bg-muted rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">No jobs found</h2>
            <p className="text-sm text-muted-foreground">
              {search || hasActiveFilters ? 'Try adjusting your filters.' : 'No jobs have been posted yet.'}
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Showing {jobs.length} of {pagination.total} job{pagination.total !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`}>
                  <div className="card-elevated rounded-lg p-5 group cursor-pointer hover:shadow-md transition-shadow h-full flex flex-col">
                    {/* Crop badge */}
                    <span className="inline-flex items-center self-start rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary capitalize mb-3">
                      <Wheat className="h-3 w-3 mr-1" />
                      {job.cropType}
                    </span>

                    <h3 className="font-semibold text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors mb-2">
                      {job.title}
                    </h3>

                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4 flex-1">
                      {job.description}
                    </p>

                    {/* Pay */}
                    <div className="flex items-center gap-1.5 mb-3">
                      <Banknote className="h-4 w-4 text-green-600" />
                      <span className="text-base font-bold text-green-700">
                        KSh {job.payPerDay.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">/day</span>
                    </div>

                    {/* Meta */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-3 border-t border-border">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        <span>{job.workersNeeded} needed</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(job.startDate).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5" />
                        <span>{job._count.applications} applied</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => fetchJobs(p)}
                    className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${
                      p === pagination.page
                        ? 'bg-primary text-white'
                        : 'bg-white border border-border text-foreground hover:bg-muted'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
