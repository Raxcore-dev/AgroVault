'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Sprout } from 'lucide-react'

/**
 * Root page — redirects authenticated users to their role-appropriate dashboard.
 * Farmers → /dashboard, Buyers → /marketplace.
 * The AppShell handles redirecting unauthenticated users to /login.
 */
export default function RootPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'farmer') {
        router.replace('/dashboard')
      } else {
        router.replace('/marketplace')
      }
    }
  }, [user, isLoading, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary animate-pulse">
        <Sprout className="h-8 w-8 text-white" />
      </div>
      <p className="text-sm text-muted-foreground">Redirecting...</p>
    </div>
  )
}
