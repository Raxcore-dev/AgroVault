/**
 * County Search Component
 * 
 * Clean discovery-based search interface for county selection.
 * Features:
 * - Search and select from all 47 Kenyan counties
 * - Discovery prompt for AI-powered exploration
 * - Streamlined, minimal design
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  MapPin, 
  ChevronDown, 
  X, 
  Sparkles,
} from 'lucide-react'
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

interface CountySearchProps {
  onCountySelect: (county: string | null) => void
  selectedCounty: string | null
}

export function CountySearch({ onCountySelect, selectedCounty }: CountySearchProps) {
  const [counties, setCounties] = useState<County[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [discoveryQuery, setDiscoveryQuery] = useState('')
  const [aiInsights, setAiInsights] = useState<string>('')
  const [highlightedIndex, setHighlightedIndex] = useState(0)

  // Fetch counties
  useEffect(() => {
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
        setIsLoading(false)
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
    onCountySelect(countyName)
    setSearchQuery('')
    setIsOpen(false)
  }

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return

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
        setIsOpen(false)
        break
    }
  }, [isOpen, filteredCounties, highlightedIndex])

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* County Selector - Clean & Simple */}
      <div className="relative">
        <div className={cn(
          "relative flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-card transition-all duration-300",
          isOpen 
            ? "border-primary" 
            : selectedCounty
            ? "border-primary/30 bg-card"
            : "border-border hover:border-primary/20"
        )}>
          <MapPin className={cn(
            "h-5 w-5 shrink-0",
            selectedCounty ? "text-primary" : "text-muted-foreground"
          )} />
          
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setIsOpen(true)
              setHighlightedIndex(0)
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={selectedCounty || "Select a county..."}
            className="flex-1 bg-transparent border-none outline-none text-sm font-medium placeholder:text-muted-foreground text-foreground"
          />

          <ChevronDown className={cn(
            "h-5 w-5 text-muted-foreground transition-transform shrink-0",
            isOpen && "rotate-180"
          )} />
        </div>

        {/* Dropdown List */}
        {isOpen && (
          <Card className="absolute top-full left-0 right-0 mt-2 p-0 border border-border bg-card z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
            <ScrollArea className="max-h-[320px]">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : filteredCounties.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                  <MapPin className="h-8 w-8 text-muted mb-2" />
                  <p className="text-sm font-medium text-muted-foreground">No counties found</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredCounties.map((county, idx) => (
                    <button
                      key={county.name}
                      onClick={() => handleSelectCounty(county.name)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 transition-colors duration-150",
                        highlightedIndex === idx
                          ? "bg-primary/5"
                          : "hover:bg-muted/40"
                      )}
                    >
                      <div className="shrink-0 h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-medium text-sm text-foreground">{county.name}</p>
                        <p className="text-xs text-muted-foreground">{county.headquarters}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </Card>
        )}
      </div>

      {/* Discovery Section - Only show when county is selected */}
      {selectedCounty && (
        <div className="space-y-3 pt-2">
          {/* Discovery Prompt */}
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">or start our discovery for insights</p>
          </div>

          {/* Discovery Input */}
          <div className="relative">
            <input
              type="text"
              value={discoveryQuery}
              onChange={(e) => setDiscoveryQuery(e.target.value)}
              placeholder="e.g., 'best markets for maize', 'storage facilities nearby'"
              className="w-full px-4 py-3 border border-border rounded-lg bg-card placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
            />
            {discoveryQuery && (
              <button
                onClick={() => {
                  setDiscoveryQuery('')
                  setAiInsights('')
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* AI Insights Display */}
          {aiInsights && (
            <div className="p-4 rounded-lg bg-accent/5 border border-accent/20 space-y-2 animate-in fade-in duration-300">
              <div className="flex items-start gap-2">
                <div className="h-6 w-6 rounded-full bg-accent text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-semibold text-accent uppercase tracking-wide">AI DISCOVERY</h4>
                  <p className="text-sm text-foreground mt-1 leading-relaxed">{aiInsights}</p>
                </div>
              </div>
            </div>
          )}

          {/* Clear Button */}
          {selectedCounty && (
            <button
              onClick={() => {
                onCountySelect(null)
                setSearchQuery('')
                setDiscoveryQuery('')
                setAiInsights('')
              }}
              className="w-full py-3 text-center text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg hover:border-primary/30 hover:bg-muted/30 transition-all duration-200"
            >
              CLEAR SEARCH
            </button>
          )}
        </div>
      )}
    </div>
  )
}
