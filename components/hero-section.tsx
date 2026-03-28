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
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-black">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <NextImage
          src="/hero-bg.png"
          alt="Modern African Agricultural Landscape"
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
      </div>

      {/* Hero Content */}
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Heading Showcase */}
          <div className="relative inline-block mb-10 group">
             <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-amber-500/50 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
             <div className="relative px-8 py-10 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl space-y-8 animate-in zoom-in-95 duration-700">
                <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter text-white leading-[0.9]">
                  <span className="block">PROTECTING</span>
                  <span className="block bg-gradient-to-r from-primary to-amber-400 bg-clip-text text-transparent">YOUR HARVEST</span>
                </h1>

                <p className="text-xl sm:text-2xl text-white/80 font-medium max-w-2xl mx-auto leading-tight italic">
                  Africa's premier platform empowering both smallholder and commercial farmers with intelligent drying, monitoring, storage, and market access tools.
                </p>

                {/* Integrated Search Section */}
                <div className="max-w-xl mx-auto flex flex-col gap-6">
                  <CountySearch
                    selectedCounty={selectedCounty}
                    onCountySelect={setSelectedCounty}
                  />

                  {/* AI Interaction */}
                  <div className="flex items-center justify-center gap-6">
                    <button 
                      onClick={() => setShowChat(true)}
                      className="group/btn flex items-center gap-3 text-sm font-bold text-white transition-all hover:text-primary"
                    >
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover/btn:bg-primary/20 transition-colors">
                        <Brain className="h-5 w-5 text-primary" />
                      </div>
                      Ask Rax AI for advice
                    </button>
                    
                    <div className="h-1 w-1 rounded-full bg-white/20" />

                    <div className="flex items-center gap-2">
                       <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                       <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Live in 47 Counties</span>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce hidden sm:block">
        <div className="h-10 w-6 rounded-full border-2 border-white/20 flex justify-center p-1">
          <div className="h-2 w-1 bg-white/50 rounded-full" />
        </div>
      </div>

      {/* AI Chat Widget */}
      {showChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => setShowChat(false)} />
          <div className="relative animate-in zoom-in-95 duration-300 shadow-2xl">
            <RaxChatWidget
              county={selectedCounty || undefined}
              onClose={() => setShowChat(false)}
            />
          </div>
        </div>
      )}
    </section>
  )
}

