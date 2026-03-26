/**
 * Job Applicants – Farmer View
 *
 * Farmers can review, accept, or reject applications for a specific job.
 */

'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Users, CheckCircle, XCircle, Clock,
  User, Phone, Mail, MapPin, MessageCircle, Loader2,
  Briefcase,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { ChatWidget } from '@/components/marketplace/chat-widget'

interface Application {
  id: string
  message: string
  status: string
  createdAt: string
  worker: {
    id: string
    name: string
    email: string
    phone: string | null
    location: string | null
  }
}

interface JobInfo {
  id: string
  title: string
  workersNeeded: number
}

interface Stats {
  total: number
  pending: number
  accepted: number
  rejected: number
}

export default function ApplicantsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user, token } = useAuth()
  const router = useRouter()
  const [job, setJob] = useState<JobInfo | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [chatWorker, setChatWorker] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    if (!token) return
    fetch(`/api/jobs/${id}/applicants`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error('Fetch failed')
        return r.json()
      })
      .then((data) => {
        setJob(data.job)
        setApplications(data.applications)
        setStats(data.stats)
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [token, id])

  const updateStatus = async (applicationId: string, status: 'accepted' | 'rejected') => {
    if (!token) return
    setUpdatingId(applicationId)
    try {
      const res = await fetch(`/api/jobs/${id}/applicants`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ applicationId, status }),
      })
      if (res.ok) {
        setApplications((prev) =>
          prev.map((a) => (a.id === applicationId ? { ...a, status } : a))
        )
        setStats((prev) => {
          if (!prev) return prev
          const oldApp = applications.find((a) => a.id === applicationId)
          const oldStatus = oldApp?.status || 'pending'
          return {
            ...prev,
            [oldStatus]: prev[oldStatus as keyof Stats] as number - 1,
            [status]: (prev[status as keyof Stats] as number) + 1,
          }
        })
      }
    } catch (err) {
      console.error('Failed to update:', err)
    } finally {
      setUpdatingId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      default: return 'bg-amber-100 text-amber-700'
    }
  }

  if (isLoading) {
    return (
      <div className="px-6 py-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-6" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-elevated rounded-xl p-5">
              <div className="h-5 bg-muted rounded w-1/3 mb-2" />
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
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Applicants
          </h1>
          {job && (
            <p className="text-sm text-muted-foreground mt-1">
              For: <Link href={`/jobs/${job.id}`} className="text-primary hover:underline">{job.title}</Link>
              {' · '}{job.workersNeeded} workers needed
            </p>
          )}
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="card-elevated rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="card-elevated rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-amber-600">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
            <div className="card-elevated rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-green-600">{stats.accepted}</p>
              <p className="text-xs text-muted-foreground">Accepted</p>
            </div>
            <div className="card-elevated rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-red-600">{stats.rejected}</p>
              <p className="text-xs text-muted-foreground">Rejected</p>
            </div>
          </div>
        )}

        {/* Applications list */}
        {applications.length === 0 ? (
          <div className="card-elevated rounded-xl p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">No applicants yet</h2>
            <p className="text-sm text-muted-foreground">Share the job listing to attract workers.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="card-elevated rounded-xl p-5">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Worker info */}
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <p className="text-sm font-semibold text-foreground">{app.worker.name}</p>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${getStatusColor(app.status)}`}>
                        {app.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                        {app.status === 'accepted' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {app.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                        {app.status}
                      </span>
                    </div>

                    {/* Contact info */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-2">
                      {app.worker.location && (
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{app.worker.location}</span>
                      )}
                      {app.worker.phone && (
                        <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{app.worker.phone}</span>
                      )}
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{app.worker.email}</span>
                    </div>

                    {/* Message */}
                    <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3 italic">
                      &ldquo;{app.message}&rdquo;
                    </p>

                    <p className="text-xs text-muted-foreground mt-2">
                      Applied {new Date(app.createdAt).toLocaleDateString('en-KE', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                  {app.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateStatus(app.id, 'accepted')}
                        disabled={updatingId === app.id}
                        className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {updatingId === app.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                        Accept
                      </button>
                      <button
                        onClick={() => updateStatus(app.id, 'rejected')}
                        disabled={updatingId === app.id}
                        className="flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setChatWorker({ id: app.worker.id, name: app.worker.name })}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ml-auto"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Widget */}
      {chatWorker && job && (
        <ChatWidget
          jobId={job.id}
          otherUserId={chatWorker.id}
          otherUserName={chatWorker.name}
          onClose={() => setChatWorker(null)}
        />
      )}
    </div>
  )
}
