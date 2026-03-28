/**
 * Minimalist Hero Section
 * Clean, professional design focused on clarity and user action
 */

'use client'

import { useState } from 'react'
import { Sprout } from 'lucide-react'
import Image from 'next/image'
import { CountySearch } from '@/components/county-search'
import { RaxChatWidget } from '@/components/rax-chat-widget'

interface HeroSectionProps {
  initialCounty?: string
}

export function HeroSection({ initialCounty }: HeroSectionProps) {
  const [selectedCounty, setSelectedCounty] = useState<string | null>(initialCounty || null)
  const [showChat, setShowChat] = useState(false)

  return (
    <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24 bg-background">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-1/2 h-full bg-primary/5 rounded-full blur-3xl -z-10" />
      
      {/* Content Container */}
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="flex-1 max-w-2xl text-left">
            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 animate-in slide-in-from-left-4 duration-700">
              <span className="text-foreground">Tech-Powered </span>
              <span className="text-primary leading-tight">Post-Harvest Solutions </span>
              <span className="text-foreground">for Every African Farmer</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-muted-foreground mb-10 leading-relaxed max-w-xl animate-in fade-in duration-1000">
              Kenya's premier platform empowering both smallholder and commercial farmers with intelligent drying, monitoring, storage, and market access tools.
            </p>

            {/* Search Section */}
            <div className="mb-8 animate-in slide-in-from-bottom-4 duration-700">
              <CountySearch
                selectedCounty={selectedCounty}
                onCountySelect={setSelectedCounty}
              />
            </div>

            {/* AI Call to Action */}
            <button 
              onClick={() => setShowChat(true)}
              className="text-sm font-semibold text-primary/80 hover:text-primary transition-colors flex items-center gap-2 mb-12"
            >
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Ask Rax AI for market advice
            </button>
          </div>

          {/* New Hero Image */}
          <div className="flex-1 relative w-full aspect-square max-w-[500px] lg:max-w-none animate-in zoom-in-95 duration-1000">
            <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-2xl -z-10 translate-x-4 translate-y-4" />
            <div className="relative h-full w-full rounded-lg overflow-hidden border border-border">
              <Image
                src="/hero.png"
                alt="AgroVault: Empowering African Farmers"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                <p className="text-white font-medium text-sm">
                  Empowering smallholder and commercial farmers across Africa.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Chat Widget */}
        {showChat && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={() => setShowChat(false)} />
            <div className="relative animate-in zoom-in-95 duration-200">
              <RaxChatWidget
                county={selectedCounty || undefined}
                onClose={() => setShowChat(false)}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

