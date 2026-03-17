'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, TrendingUp, Wheat, BarChart3, Settings,
  Thermometer, AlertTriangle, Store, Package, Bell, ShieldAlert, CloudSun, Briefcase,
  Search, MessageCircle, User, List, Plus, TrendingDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'

interface NavItem {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
}

const farmerNav: NavItem[] = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/storage-units', icon: Package, label: 'Storage Units' },
  { href: '/dashboard/commodities', icon: Wheat, label: 'Commodities' },
  { href: '/dashboard/alerts', icon: AlertTriangle, label: 'Storage Alerts' },
  { href: '/dashboard/spoilage-predictions', icon: TrendingDown, label: 'Spoilage Predictions' },
  { href: '/dashboard/market-analysis', icon: ShieldAlert, label: 'Risk & Markets' },
  { href: '/dashboard/weather', icon: CloudSun, label: 'Weather Insights' },
  { href: '/jobs', icon: Briefcase, label: 'Farm Jobs' },
  { href: '/dashboard/jobs', icon: Briefcase, label: 'My Job Posts' },
  { href: '/marketplace', icon: Store, label: 'Marketplace' },
  { href: '/marketplace/add-product', icon: Plus, label: 'Add Product' },
  { href: '/marketplace/my-listings', icon: List, label: 'My Listings' },
  { href: '/dashboard/messages', icon: MessageCircle, label: 'Messages' },
  { href: '/market', icon: TrendingUp, label: 'Market Analysis' },
  { href: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
]

const buyerNav: NavItem[] = [
  { href: '/marketplace', icon: Store, label: 'Marketplace' },
  { href: '/dashboard/messages', icon: MessageCircle, label: 'Messages' },
  { href: '/jobs', icon: Briefcase, label: 'Farm Jobs' },
  { href: '/dashboard/my-applications', icon: Briefcase, label: 'My Applications' },
  { href: '/market', icon: TrendingUp, label: 'Market Trends' },
]

const bottomNav: NavItem[] = [
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  const navItems = user?.role === 'farmer' ? farmerNav : buyerNav

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 border-r border-border bg-white p-4 md:flex md:flex-col">
      {/* Main Navigation */}
      <nav className="flex flex-1 flex-col gap-1">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Menu</p>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
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
