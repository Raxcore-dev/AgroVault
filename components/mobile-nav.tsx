'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, TrendingUp, Store, Package, AlertTriangle, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'

interface NavItem {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
}

const farmerMobileNav: NavItem[] = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/dashboard/storage-units', icon: Package, label: 'Storage' },
  { href: '/marketplace', icon: Store, label: 'Market' },
  { href: '/dashboard/alerts', icon: AlertTriangle, label: 'Alerts' },
  { href: '/market', icon: TrendingUp, label: 'Trends' },
]

const buyerMobileNav: NavItem[] = [
  { href: '/marketplace', icon: Store, label: 'Market' },
  { href: '/market', icon: TrendingUp, label: 'Trends' },
  { href: '/risk', icon: BarChart3, label: 'Analytics' },
]

export function MobileNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  const navItems = user?.role === 'farmer' ? farmerMobileNav : buyerMobileNav

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex border-t border-border bg-white md:hidden z-50">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 py-3 transition-colors',
              isActive
                ? 'text-primary'
                : 'text-muted-foreground'
            )}
          >
            {isActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-primary" />
            )}
            <Icon className="h-5 w-5" />
            <span className="text-[11px] font-medium">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
