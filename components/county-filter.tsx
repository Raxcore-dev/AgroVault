'use client'

import { counties } from '@/lib/mock-data'

interface CountyFilterProps {
  selectedCounty: string
  onCountyChange: (county: string) => void
}

export function CountyFilter({ selectedCounty, onCountyChange }: CountyFilterProps) {
  return (
    <div className="flex items-center gap-4">
      <label htmlFor="county" className="text-sm font-medium text-foreground">
        Geographic Intelligence
      </label>
      <select
        id="county"
        value={selectedCounty}
        onChange={(e) => onCountyChange(e.target.value)}
        className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
      >
        {counties.map((county) => (
          <option key={county.id} value={county.id}>
            {county.name}
          </option>
        ))}
      </select>
    </div>
  )
}
