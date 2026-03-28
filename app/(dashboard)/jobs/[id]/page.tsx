/**
 * Job Details Page
 *
 * Shows full job information, farm location map, and lets workers apply.
 * Features:
 *   - Full job details (pay, location, dates, description)
 *   - Interactive map showing farm location
 *   - Application form for workers
 *   - Chat button to message the farmer
 */

'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, MapPin, Users, Calendar, Briefcase, Phone,
  Mail, User, MessageCircle, Wheat, Banknote, Send,
  CheckCircle, Clock, Loader2,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { FarmerMap } from '@/components/marketplace/farmer-map'
import { ChatWidget } from '@/components/marketplace/chat-widget'

interface Job {
  id: string
  title: string
  cropType: string
  description: string
  workersNeeded: number
  payPerDay: number
  location: string
  latitude: number
  longitude: number
  startDate: string
  isOpen: boolean
  createdAt: string
  farmer: {
    id: string
    name: string
    email: string
    phone: string | null
    location: string | null
  }
  _count: { applications: number }
}

interface Application {
  id: string
  message: string
  status: string
  createdAt: string
}

export default function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user, token } = useAuth()
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showChat, setShowChat] = useState(false)

  // Application state
  const [myApplication, setMyApplication] = useState<Application | null>(null)
  const [applicationMessage, setApplicationMessage] = useState('')
  const [isApplying, setIsApplying] = useState(false)
  const [applicationError, setApplicationError] = useState('')
  const [applicationSuccess, setApplicationSuccess] = useState(false)

  // Fetch job details
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await fetch(`/api/jobs/${id}`)
        if (res.ok) {
          const data = await res.json()
          setJob(data.job)
        } else {
          setError('Job not found.')
        }
      } catch {
        setError('Failed to load job.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchJob()
  }, [id])

  // Check if user already applied
  useEffect(() => {
    if (!token || !job) return
    fetch(`/api/jobs/${id}/applications`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.application) setMyApplication(data.application)
      })
      .catch(console.error)
  }, [token, job, id])

  const handleApply = async () => {
    if (!token || !applicationMessage.trim()) return
    setIsApplying(true)
    setApplicationError('')

    try {
      const res = await fetch(`/api/jobs/${id}/applications`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: applicationMessage.trim() }),
      })

      if (res.ok) {
        const data = await res.json()
        setMyApplication(data.application)
        setApplicationSuccess(true)
        setApplicationMessage('')
      } else {
        const errData = await res.json()
        setApplicationError(errData.error || 'Failed to submit application.')
      }
    } catch {
      setApplicationError('Failed to submit application.')
    } finally {
      setIsApplying(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background px-6 py-6 lg:px-8">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-8 bg-muted rounded w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-4">
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-6 bg-muted rounded w-1/4" />
              <div className="h-32 bg-muted rounded" />
            </div>
            <div className="lg:col-span-2 space-y-4">
              <div className="h-[300px] bg-muted rounded-lg" />
              <div className="h-24 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-background px-6 py-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center py-20">
          <Briefcase className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">{error || 'Job not found'}</h2>
          <Link href="/jobs" className="text-sm text-primary hover:underline">
            Back to Jobs
          </Link>
        </div>
      </div>
    )
  }

  const isOwner = user?.id === job.farmer.id
  const daysUntilStart = Math.ceil((new Date(job.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left: Job Details */}
            <div className="lg:col-span-3 space-y-6">
              {/* Status badges */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary capitalize">
                  <Wheat className="h-3 w-3 mr-1" />
                  {job.cropType}
                </span>
                {job.isOpen ? (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    Open
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                    Closed
                  </span>
                )}
                {daysUntilStart > 0 && daysUntilStart <= 3 && (
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                    Starting soon
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-bold text-foreground">{job.title}</h1>

              {/* Pay highlight */}
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-4 dark:bg-green-950/20 dark:border-green-800">
                <Banknote className="h-6 w-6 text-green-600" />
                <div>
                  <p className="text-xl font-bold text-green-700">KSh {job.payPerDay.toLocaleString()} <span className="text-sm font-normal text-green-600">per day</span></p>
                </div>
              </div>

              {/* Key info grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="card-elevated rounded-lg p-3 flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="text-sm font-medium text-foreground">{job.location}</p>
                  </div>
                </div>
                <div className="card-elevated rounded-lg p-3 flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Workers Needed</p>
                    <p className="text-sm font-medium text-foreground">{job.workersNeeded}</p>
                  </div>
                </div>
                <div className="card-elevated rounded-lg p-3 flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Start Date</p>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(job.startDate).toLocaleDateString('en-KE', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="card-elevated rounded-lg p-3 flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Applications</p>
                    <p className="text-sm font-medium text-foreground">{job._count.applications}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-sm font-semibold text-foreground mb-2">Job Description</h2>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {job.description}
                </p>
              </div>

              {/* Posted date */}
              <p className="text-xs text-muted-foreground">
                Posted {new Date(job.createdAt).toLocaleDateString('en-KE', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            {/* Right: Map, Farmer Info, Apply */}
            <div className="lg:col-span-2 space-y-6">
              {/* Map */}
              {job.latitude !== 0 && job.longitude !== 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Farm Location</h3>
                  <FarmerMap
                    latitude={job.latitude}
                    longitude={job.longitude}
                    farmerName={job.farmer.name}
                    locationName={job.location}
                  />
                </div>
              )}

              {/* Farmer Info */}
              <div className="card-elevated rounded-lg p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3">Posted By</h3>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{job.farmer.name}</p>
                      <p className="text-xs text-muted-foreground">{job.farmer.location || 'Kenya'}</p>
                    </div>
                  </div>
                  {job.farmer.phone && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{job.farmer.phone}</span>
                    </div>
                  )}
                  {job.farmer.email && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      <span>{job.farmer.email}</span>
                    </div>
                  )}
                </div>

                {/* Chat button (non-owner only) */}
                {user && !isOwner && (
                  <button
                    onClick={() => setShowChat(true)}
                    className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg border border-primary bg-primary/5 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Chat with Farmer
                  </button>
                )}
              </div>

              {/* Application Form */}
              {!isOwner && job.isOpen && user && (
                <div className="card-elevated rounded-lg p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Apply for this Job</h3>

                  {myApplication ? (
                    <div className="space-y-3">
                      <div className={`flex items-center gap-2 rounded-lg p-3 ${
                        myApplication.status === 'accepted'
                          ? 'bg-green-50 text-green-700 dark:bg-green-950/20'
                          : myApplication.status === 'rejected'
                          ? 'bg-red-50 text-red-700 dark:bg-red-950/20'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20'
                      }`}>
                        {myApplication.status === 'accepted' ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : myApplication.status === 'rejected' ? (
                          <ArrowLeft className="h-5 w-5" />
                        ) : (
                          <Clock className="h-5 w-5" />
                        )}
                        <div>
                          <p className="text-sm font-medium capitalize">Application {myApplication.status}</p>
                          <p className="text-xs opacity-80">
                            Submitted {new Date(myApplication.createdAt).toLocaleDateString('en-KE')}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground italic">&ldquo;{myApplication.message}&rdquo;</p>
                    </div>
                  ) : applicationSuccess ? (
                    <div className="flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-700 dark:bg-green-950/20">
                      <CheckCircle className="h-5 w-5" />
                      <div>
                        <p className="text-sm font-medium">Application submitted!</p>
                        <p className="text-xs opacity-80">The farmer will review your application.</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <textarea
                        value={applicationMessage}
                        onChange={(e) => setApplicationMessage(e.target.value)}
                        placeholder="Write a short message to the farmer. Tell them about your experience and availability..."
                        rows={4}
                        className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
                      />
                      {applicationError && (
                        <p className="text-xs text-danger mt-1">{applicationError}</p>
                      )}
                      <button
                        onClick={handleApply}
                        disabled={isApplying || !applicationMessage.trim()}
                        className="mt-3 w-full btn-primary flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
                      >
                        {isApplying ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        Submit Application
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Owner actions */}
              {isOwner && (
                <div className="card-elevated rounded-lg p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Manage Job</h3>
                  <Link
                    href={`/dashboard/jobs/${job.id}/applicants`}
                    className="block w-full btn-primary text-center rounded-lg px-4 py-2.5 text-sm font-semibold"
                  >
                    View Applicants ({job._count.applications})
                  </Link>
                  <Link
                    href="/dashboard/jobs"
                    className="block w-full text-center rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    My Jobs
                  </Link>
                </div>
              )}

              {/* Not logged in */}
              {!user && (
                <div className="card-elevated rounded-lg p-5 text-center">
                  <p className="text-sm text-muted-foreground mb-3">Log in to apply for this job</p>
                  <Link
                    href="/login"
                    className="btn-primary inline-block rounded-lg px-6 py-2.5 text-sm font-semibold"
                  >
                    Log In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Widget */}
      {showChat && job && user && (
        <ChatWidget
          jobId={job.id}
          otherUserId={job.farmer.id}
          otherUserName={job.farmer.name}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  )
}
