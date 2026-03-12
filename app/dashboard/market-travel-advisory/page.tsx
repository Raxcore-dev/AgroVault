'use client'

import { Navigation, MapPin } from 'lucide-react'
import { useRoleGuard } from '@/hooks/use-role-guard'
import { MarketTravelAdvisoryWidget } from '@/components/market-travel-advisory'
import { CountyTransportAdvisory } from '@/components/county-transport-advisory'

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

        {/* ── County Advisory (all 47 Kenya counties) ────────────────────── */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">All-County Weather Advisory</h2>
            <span className="rounded-full bg-primary/10 text-primary text-xs font-medium px-2 py-0.5">
              47 counties
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Select any of Kenya&apos;s 47 counties from the dropdown to instantly view its current
            weather conditions and transport risk level. The advisory updates automatically when you
            switch counties.
          </p>
          <CountyTransportAdvisory />
        </section>

        {/* Divider */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-3 text-xs text-muted-foreground">
              Market-specific search
            </span>
          </div>
        </div>

        {/* How it works */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
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

        {/* Market search widget */}
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
