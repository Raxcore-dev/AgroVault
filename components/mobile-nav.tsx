'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Thermometer, TrendingUp, AlertTriangle, Droplets } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    href: '/',
    icon: Home,
    label: 'Home',
  },
  {
    href: '/temperature',
    icon: Thermometer,
    label: 'Temp',
  },
  {
    href: '/humidity',
    icon: Droplets,
    label: 'Humidity',
  },
  {
    href: '/market',
    icon: TrendingUp,
    label: 'Market',
  },
  {
    href: '/risk',
    icon: AlertTriangle,
    label: 'Risk',
  },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex border-t border-border bg-card md:hidden">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 py-3 transition-all duration-200',
              isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
