/**
 * Enhanced Hero Section
 * Clean, professional design with integrated AI search
 */

'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, Search, Sparkles, Loader2, X } from 'lucide-react'
import NextImage from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface County {
  name: string
  headquarters: string
  latitude: number
  longitude: number
  marketCount: number
  commodityCount: number
}

interface HeroSectionProps {
  initialCounty?: string
}

export function HeroSection({ initialCounty }: HeroSectionProps) {
  const [selectedCounty, setSelectedCounty] = useState<string | null>(initialCounty || null)
  const [counties, setCounties] = useState<County[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLoadingCounties, setIsLoadingCounties] = useState(true)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  
  // AI Search State
  const [aiQuery, setAiQuery] = useState('')
  const [aiResponse, setAiResponse] = useState<string | null>(null)
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
    
    // Fetch counties on mount
    const fetchCounties = async () => {
      try {
        const res = await fetch('/api/counties')
        if (res.ok) {
          const data = await res.json()
          setCounties(data.counties)
        }
      } catch (error) {
        console.error('Error fetching counties:', error)
      } finally {
        setIsLoadingCounties(false)
      }
    }
    fetchCounties()
  }, [])

  // Filter counties based on search
  const filteredCounties = counties.filter(county =>
    county.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    county.headquarters.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle county selection
  const handleSelectCounty = (countyName: string) => {
    setSelectedCounty(countyName)
    setSearchQuery('')
    setIsDropdownOpen(false)
    setAiResponse(null)
    setAiQuery('')
  }

  // Handle AI Search
  const handleAiSearch = async () => {
    if (!aiQuery.trim() || !selectedCounty) return
    
    setIsAiLoading(true)
    setAiResponse(null)
    
    try {
      const response = await fetch('/api/ai/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: aiQuery.trim(),
          county: selectedCounty,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      setAiResponse(data.response)
    } catch (error) {
      console.error('Error getting AI response:', error)
      setAiResponse("I'm sorry, I'm having trouble connecting right now. Please try again.")
    } finally {
      setIsAiLoading(false)
    }
  }

  const handleClearSearch = () => {
    setSelectedCounty(null)
    setSearchQuery('')
    setAiQuery('')
    setAiResponse(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev =>
          prev < filteredCounties.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev)
        break
      case 'Enter':
        e.preventDefault()
        if (filteredCounties[highlightedIndex]) {
          handleSelectCounty(filteredCounties[highlightedIndex].name)
        }
        break
      case 'Escape':
        setIsDropdownOpen(false)
        break
    }
  }

  const handleAiKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAiSearch()
    }
  }

  const stats = [
    { value: '47', label: 'Counties Covered' },
    { value: '10K+', label: 'Farmers Empowered' },
    { value: '98%', label: 'Spoilage Reduced' },
    { value: '24/7', label: 'AI Monitoring' },
  ]

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image - Full Coverage */}
      <div className="absolute inset-0 z-0">
        <NextImage
          src="/hero-bg.png"
          alt="Agricultural landscape"
          fill
          className="object-cover"
          priority
          quality={100}
        />
        {/* Subtle dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />
      </div>

      {/* Main Content */}
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto space-y-10">
          {/* Badge */}
          <div 
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium backdrop-blur-sm transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <span>🌾 Africa's Premier AgriTech Platform</span>
          </div>

          {/* Headline */}
          <div 
            className={`space-y-4 transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight text-white leading-[0.9]">
              Protecting Your Harvest
            </h1>
            <p className="text-xl sm:text-2xl text-white/80 max-w-2xl mx-auto leading-relaxed font-light">
              Intelligent post-harvest solutions powered by real-time analytics and AI
            </p>
          </div>

          {/* County Search Bar */}
          <div 
            className={`max-w-2xl mx-auto transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <div className="relative">
              {/* County Search Input */}
              <div className={cn(
                "relative flex items-center gap-3 px-6 py-5 rounded-2xl border transition-all duration-300 bg-white/95 backdrop-blur-sm shadow-2xl",
                isDropdownOpen ? "border-primary ring-2 ring-primary/20" : "border-white/20"
              )}>
                <Search className="h-6 w-6 text-muted-foreground shrink-0" />
                
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setIsDropdownOpen(true)
                    setHighlightedIndex(0)
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  onKeyDown={handleKeyDown}
                  placeholder={selectedCounty ? selectedCounty : "Search county..."}
                  className="flex-1 bg-transparent border-none outline-none text-base font-medium placeholder:text-muted-foreground text-foreground"
                />

                {selectedCounty && (
                  <button
                    onClick={handleClearSearch}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* County Dropdown */}
              {isDropdownOpen && (
                <Card className="absolute top-full left-0 right-0 mt-3 p-0 border border-white/20 bg-white/95 backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden rounded-xl shadow-2xl">
                  <ScrollArea className="max-h-[320px]">
                    {isLoadingCounties ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      </div>
                    ) : filteredCounties.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                        <Search className="h-8 w-8 text-muted mb-2" />
                        <p className="text-sm font-medium text-muted-foreground">No counties found</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-border/50">
                        {filteredCounties.map((county, idx) => (
                          <button
                            key={county.name}
                            onClick={() => handleSelectCounty(county.name)}
                            className={cn(
                              "w-full flex items-center gap-4 px-6 py-4 transition-colors duration-150",
                              highlightedIndex === idx
                                ? "bg-primary/5"
                                : "hover:bg-muted/40"
                            )}
                          >
                            <div className="shrink-0 h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                              <Search className="h-5 w-5" />
                            </div>
                            <div className="text-left flex-1">
                              <p className="font-semibold text-base text-foreground">{county.name}</p>
                              <p className="text-sm text-muted-foreground">{county.headquarters}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </Card>
              )}
            </div>

            {/* Helper Text */}
            {!selectedCounty && (
              <p className="mt-4 text-center text-sm text-white/60 font-medium">
                Select your county to get started
              </p>
            )}
          </div>

          {/* AI Search Card - Appears after county selection */}
          {selectedCounty && (
            <div 
              className={`max-w-2xl mx-auto space-y-4 transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            >
              {/* AI Input Card */}
              <Card className="relative overflow-hidden border border-white/20 bg-white/10 backdrop-blur-md shadow-2xl">
                <div className="p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">AI Assistant</h3>
                      <p className="text-sm text-white/60">Ask anything about {selectedCounty}</p>
                    </div>
                  </div>

                  {/* Input Field */}
                  <div className="relative">
                    <input
                      type="text"
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      onKeyDown={handleAiKeyDown}
                      placeholder="e.g., best markets for maize, storage facilities nearby..."
                      className="w-full px-5 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                      disabled={isAiLoading}
                    />
                    {aiQuery && !isAiLoading && (
                      <button
                        onClick={() => setAiQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  {/* Send Button */}
                  <Button
                    onClick={handleAiSearch}
                    disabled={!aiQuery.trim() || isAiLoading}
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAiLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Get AI Insights
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </Card>

              {/* AI Response Card */}
              {aiResponse && (
                <Card className="overflow-hidden border border-white/20 bg-white/10 backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                          <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">AI Insights</h4>
                          <p className="text-xs text-white/60">Results for {selectedCounty}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setAiResponse(null)
                          setAiQuery('')
                        }}
                        className="text-white/60 hover:text-white h-8"
                      >
                        Clear
                      </Button>
                    </div>

                    {/* Response Content */}
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
                        {aiResponse.split('**').map((part, i) =>
                          i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                        )}
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Stats */}
          <div 
            className={`grid grid-cols-2 sm:grid-cols-4 gap-8 pt-10 border-t border-white/20 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center space-y-2">
                <div className="text-3xl sm:text-4xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/60 font-medium uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
