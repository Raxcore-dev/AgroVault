/**
 * My Applications – Worker Dashboard
 *
 * Shows all jobs the worker has applied to with application statuses.
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Briefcase, MapPin, Calendar, Banknote, CheckCircle,
  XCircle, Clock, Users, Wheat, MessageCircle,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { ChatWidget } from '@/components/marketplace/chat-widget'

interface Application {
  id: string
  message: string
  status: string
  createdAt: string
  job: {
    id: string
    title: string
    cropType: string
    workersNeeded: number
    payPerDay: number
    location: string
    startDate: string
    isOpen: boolean
    farmer: {
      id: string
      name: string
      phone: string | null
      location: string | null
    }
  }
}

export default function MyApplicationsPage() {
  const { token } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [chatTarget, setChatTarget] = useState<{ jobId: string; farmerId: string; farmerName: string } | null>(null)

  useEffect(() => {
    if (!token) return
    fetch('/api/jobs/my-applications', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.applications) setApplications(data.applications)
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [token])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
            <CheckCircle className="h-3 w-3" /> Accepted
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
            <XCircle className="h-3 w-3" /> Rejected
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
            <Clock className="h-3 w-3" /> Pending
          </span>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="px-6 py-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-4">
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
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            My Applications
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {applications.length} application{applications.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Summary cards */}
        {applications.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="card-elevated rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-amber-600">{applications.filter((a) => a.status === 'pending').length}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
            <div className="card-elevated rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-green-600">{applications.filter((a) => a.status === 'accepted').length}</p>
              <p className="text-xs text-muted-foreground">Accepted</p>
            </div>
            <div className="card-elevated rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-red-600">{applications.filter((a) => a.status === 'rejected').length}</p>
              <p className="text-xs text-muted-foreground">Rejected</p>
            </div>
          </div>
        )}

        {applications.length === 0 ? (
          <div className="card-elevated rounded-xl p-12 text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">No applications yet</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Browse available jobs and apply to get started.
            </p>
            <Link
              href="/jobs"
              className="btn-primary inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold"
            >
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="card-elevated rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Job title & status */}
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      <Link
                        href={`/jobs/${app.job.id}`}
                        className="text-sm font-semibold text-foreground hover:text-primary transition-colors truncate"
                      >
                        {app.job.title}
                      </Link>
                      {getStatusBadge(app.status)}
                      {!app.job.isOpen && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                          Job Closed
                        </span>
                      )}
                    </div>

                    {/* Job meta */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Wheat className="h-3 w-3" /> {app.job.cropType}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {app.job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Banknote className="h-3 w-3" /> KSh {app.job.payPerDay.toLocaleString()}/day
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Starts {new Date(app.job.startDate).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    {/* My message */}
                    <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2.5 italic line-clamp-2">
                      &ldquo;{app.message}&rdquo;
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xs text-muted-foreground">
                        Applied {new Date(app.createdAt).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {' · '}Farmer: <span className="font-medium">{app.job.farmer.name}</span>
                      </p>
                      <button
                        onClick={() => setChatTarget({ jobId: app.job.id, farmerId: app.job.farmer.id, farmerName: app.job.farmer.name })}
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <MessageCircle className="h-3 w-3" /> Chat
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Widget */}
      {chatTarget && (
        <ChatWidget
          jobId={chatTarget.jobId}
          otherUserId={chatTarget.farmerId}
          otherUserName={chatTarget.farmerName}
          onClose={() => setChatTarget(null)}
        />
      )}
    </div>
  )
}
