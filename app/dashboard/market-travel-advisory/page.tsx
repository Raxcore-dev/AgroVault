'use client'

import { Navigation } from 'lucide-react'
import { useRoleGuard } from '@/hooks/use-role-guard'
import { MarketTravelAdvisoryWidget } from '@/components/market-travel-advisory'

export default function MarketTravelAdvisoryPage() {
  const { allowed, isLoading } = useRoleGuard('farmer')

  if (isLoading || !allowed) return null

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-6 lg:px-8">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Navigation className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Market Travel Advisory</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Check real-time weather conditions at your destination market before transporting your
            harvested produce. AgroVault combines weather intelligence and market price insights to
            help you make safe and profitable post-harvest decisions.
          </p>
        </div>

        {/* How it works */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              step: '1',
              title: 'Enter Destination',
              desc: 'Type the market or town where you plan to sell your produce.',
            },
            {
              step: '2',
              title: 'Weather Analysis',
              desc: 'AgroVault fetches live weather data and analyses travel risk for the next 24–48 hours.',
            },
            {
              step: '3',
              title: 'Get Recommendation',
              desc: 'Receive a clear Safe / Moderate / High Risk advisory combined with current market prices.',
            },
          ].map(({ step, title, desc }) => (
            <div
              key={step}
              className="flex gap-3 rounded-xl border border-border bg-card p-4"
            >
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {step}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main advisory widget */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <MarketTravelAdvisoryWidget />
        </div>

        {/* Info note */}
        <p className="mt-4 text-xs text-muted-foreground text-center">
          Weather data is sourced from Open-Meteo and refreshed every 30 minutes.
          Market price data is refreshed every 30 minutes from the AgroVault market database.
        </p>
      </div>
    </div>
  )
}
