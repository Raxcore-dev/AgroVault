'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, TrendingUp, Wheat, ArrowLeftRight, BarChart3, Settings, Thermometer, Droplets, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    href: '/',
    icon: LayoutDashboard,
    label: 'Dashboard',
  },
  {
    href: '/market',
    icon: TrendingUp,
    label: 'Market Trends',
  },
  {
    href: '/temperature',
    icon: Thermometer,
    label: 'My Produce',
  },
  {
    href: '/humidity',
    icon: ArrowLeftRight,
    label: 'Trading Hub',
  },
  {
    href: '/risk',
    icon: BarChart3,
    label: 'Analytics',
  },
]

const bottomNav = [
  {
    href: '#',
    icon: Settings,
    label: 'Settings',
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 border-r border-border bg-white p-4 md:flex md:flex-col">
      {/* Main Navigation */}
      <nav className="flex flex-1 flex-col gap-1">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Menu</p>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className={cn('h-[18px] w-[18px]', isActive && 'text-primary')} />
              <span>{item.label}</span>
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-border pt-3">
        {bottomNav.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Icon className="h-[18px] w-[18px]" />
              <span>{item.label}</span>
            </Link>
          )
        })}
        <div className="mt-3 rounded-lg bg-primary/5 border border-primary/10 p-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <p className="text-xs font-medium text-primary">Live data active</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">All sensors connected</p>
        </div>
      </div>
    </aside>
  )
}
