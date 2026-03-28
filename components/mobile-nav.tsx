'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, TrendingUp, Store, Package, AlertTriangle, BarChart3, CloudSun, Briefcase, Globe, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from 'next-themes'

interface NavItem {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
}

const farmerMobileNav: NavItem[] = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/dashboard/storage-units', icon: Package, label: 'Storage' },
  { href: '/jobs', icon: Briefcase, label: 'Jobs' },
  { href: '/market-intelligence', icon: Globe, label: 'Market' },
  { href: '/dashboard/alerts', icon: AlertTriangle, label: 'Alerts' },
]

const jobApplicantMobileNav: NavItem[] = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/jobs', icon: Briefcase, label: 'Jobs' },
  { href: '/dashboard/my-applications', icon: Briefcase, label: 'Applied' },
]

export function MobileNav() {
  const pathname = usePathname()
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()

  const navItems = user?.role === 'farmer' ? farmerMobileNav : jobApplicantMobileNav

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex border-t border-border bg-background md:hidden z-50">
      <div className="flex flex-1">
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
      </div>
      {/* Theme Toggle */}
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="flex flex-col items-center justify-center gap-1 py-3 text-muted-foreground transition-colors"
      >
        {theme === 'dark' ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
        <span className="text-[11px] font-medium">{theme === 'dark' ? 'Light' : 'Dark'}</span>
      </button>
    </nav>
  )
}
