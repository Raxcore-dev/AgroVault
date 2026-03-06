'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** Notifications page redirects to the alerts page */
export default function NotificationsPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard/alerts')
  }, [router])

  return null
}
