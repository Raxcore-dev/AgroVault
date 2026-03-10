'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

/** Notifications page redirects based on user role */
export default function NotificationsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return
    if (user?.role === 'farmer') {
      router.replace('/dashboard/alerts')
    } else {
      router.replace('/marketplace')
    }
  }, [router, user, isLoading])

  return null
}
