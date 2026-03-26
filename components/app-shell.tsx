'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { getRestrictedRedirect, type UserRole } from '@/lib/role-routes'
import { Header } from './header'
import { Sidebar } from './sidebar'
import { MobileNav } from './mobile-nav'
import { Sprout } from 'lucide-react'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [isLoading, user, router])

  // Role-based route protection: redirect if accessing a restricted route
  useEffect(() => {
    if (isLoading || !user) return

    const redirect = getRestrictedRedirect(pathname, user.role as UserRole)
    if (redirect) {
      router.replace(redirect)
    }
  }, [isLoading, user, pathname, router])

  // Show branded loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary animate-pulse">
          <Sprout className="h-8 w-8 text-white" />
        </div>
        <p className="text-sm text-muted-foreground">Loading AgroVault...</p>
      </div>
    )
  }

  // Not authenticated — will redirect via useEffect
  if (!user) {
    return null
  }

  // Authenticated — render full app shell with sidebar
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto pb-20 md:pb-0">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
