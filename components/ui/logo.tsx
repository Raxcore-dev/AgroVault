'use client'

import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ className, showText = true, size = 'md' }: LogoProps) {
  const sizes = {
    sm: { box: 'h-8 w-8', img: 24, text: 'text-lg' },
    md: { box: 'h-10 w-10', img: 32, text: 'text-xl' },
    lg: { box: 'h-14 w-14', img: 48, text: 'text-3xl' },
  }

  const currentSize = sizes[size]

  return (
    <div className={cn('flex items-center gap-3 group', className)}>
      <div 
        className={cn(
          'relative flex items-center justify-center rounded-lg bg-primary/10 overflow-hidden ring-1 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300',
          currentSize.box
        )}
      >
        <Image
          src="/logo.png"
          alt="AgroVault Logo"
          width={currentSize.img}
          height={currentSize.img}
          className="object-contain"
        />
      </div>
      {showText && (
        <span className={cn('font-bold tracking-tight text-foreground transition-colors group-hover:text-primary', currentSize.text)}>
          AgroVault
        </span>
      )}
    </div>
  )
}
