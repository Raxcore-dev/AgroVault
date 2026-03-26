/**
 * My Jobs – Farmer Dashboard
 *
 * Lists all jobs posted by the farmer with application counts and quick actions.
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Briefcase, Plus, MapPin, Users, Calendar, Eye,
  ToggleLeft, ToggleRight, Loader2, Banknote, Wheat,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useRoleGuard } from '@/hooks/use-role-guard'

interface Job {
  id: string
  title: string
  cropType: string
  description: string
  workersNeeded: number
  payPerDay: number
  location: string
  startDate: string
  isOpen: boolean
  createdAt: string
  _count: { applications: number }
  applications: Array<{
    id: string
    status: string
    createdAt: string
    worker: { id: string; name: string }
  }>
}

export default function MyJobsPage() {
  const { allowed, isLoading: roleLoading } = useRoleGuard('farmer')
  const { token } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  if (roleLoading || !allowed) return null

  useEffect(() => {
    if (!token) return
    fetch('/api/jobs/my-jobs', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.jobs) setJobs(data.jobs)
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [token])

  const toggleJobStatus = async (jobId: string, currentlyOpen: boolean) => {
    if (!token) return
    setTogglingId(jobId)
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isOpen: !currentlyOpen }),
      })
      if (res.ok) {
        setJobs((prev) =>
          prev.map((j) => (j.id === jobId ? { ...j, isOpen: !currentlyOpen } : j))
        )
      }
    } catch (err) {
      console.error('Failed to toggle job:', err)
    } finally {
      setTogglingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="px-6 py-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card-elevated rounded-xl p-5 animate-pulse">
              <div className="h-5 bg-muted rounded w-1/2 mb-3" />
              <div className="h-4 bg-muted rounded w-1/3 mb-2" />
              <div className="h-12 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="px-6 py-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-primary" />
              My Jobs
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {jobs.length} job{jobs.length !== 1 ? 's' : ''} posted
            </p>
          </div>
          <Link
            href="/jobs/post"
            className="btn-primary inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold"
          >
            <Plus className="h-4 w-4" />
            Post Job
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="card-elevated rounded-xl p-12 text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">No jobs posted yet</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Post your first job to find workers for harvesting.
            </p>
            <Link
              href="/jobs/post"
              className="btn-primary inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold"
            >
              <Plus className="h-4 w-4" /> Post a Job
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => {
              const pendingCount = job.applications.filter((a) => a.status === 'pending').length
              return (
                <div key={job.id} className="card-elevated rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Title & badges */}
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                        <Link href={`/jobs/${job.id}`} className="text-base font-semibold text-foreground hover:text-primary transition-colors truncate">
                          {job.title}
                        </Link>
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary capitalize">
                          <Wheat className="h-3 w-3 mr-1" />{job.cropType}
                        </span>
                        {job.isOpen ? (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">Open</span>
                        ) : (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700">Closed</span>
                        )}
                      </div>

                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
                        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{job.workersNeeded} needed</span>
                        <span className="flex items-center gap-1"><Banknote className="h-3.5 w-3.5" />KSh {job.payPerDay.toLocaleString()}/day</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(job.startDate).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      {/* Applicant summary */}
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-foreground">
                          {job._count.applications} applicant{job._count.applications !== 1 ? 's' : ''}
                        </span>
                        {pendingCount > 0 && (
                          <span className="text-xs font-medium text-amber-600 bg-amber-50 rounded-full px-2 py-0.5">
                            {pendingCount} pending
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 shrink-0">
                      <Link
                        href={`/dashboard/jobs/${job.id}/applicants`}
                        className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Applicants
                      </Link>
                      <button
                        onClick={() => toggleJobStatus(job.id, job.isOpen)}
                        disabled={togglingId === job.id}
                        className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                      >
                        {togglingId === job.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : job.isOpen ? (
                          <ToggleRight className="h-3.5 w-3.5" />
                        ) : (
                          <ToggleLeft className="h-3.5 w-3.5" />
                        )}
                        {job.isOpen ? 'Close' : 'Re-open'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
