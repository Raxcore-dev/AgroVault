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
import { ThemeProvider } from '@/components/theme-provider'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  )
}
