/**
 * Client-side Providers Wrapper
 * 
 * Wraps the application with all client-side context providers.
 * Used by the root layout (which is a server component) to provide
 * auth context to all client components.
 */

'use client'

import { ReactNode } from 'react'
import { AuthProvider } from '@/lib/auth-context'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}
