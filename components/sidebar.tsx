'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Home, Thermometer, TrendingUp, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    href: '/',
    icon: Home,
    label: 'Dashboard',
  },
  {
    href: '/temperature',
    icon: Thermometer,
    label: 'Temperature',
  },
  {
    href: '/market-analysis',
    icon: TrendingUp,
    label: 'Market Analysis',
  },
  {
    href: '/risk-assessment',
    icon: AlertTriangle,
    label: 'Risk Assessment',
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="sticky top-0 hidden h-screen w-64 border-r border-border bg-card p-6 md:flex md:flex-col">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
          <BarChart3 className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-bold text-foreground">AgroVault</h1>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'text-foreground hover:bg-muted'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">
          Real-time agricultural monitoring system
        </p>
      </div>
    </aside>
  )
}
