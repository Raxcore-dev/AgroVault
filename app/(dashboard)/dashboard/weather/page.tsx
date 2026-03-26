'use client'

import { useRoleGuard } from '@/hooks/use-role-guard'
import { WeatherDashboard } from '@/components/weather-dashboard'

export default function WeatherInsightsPage() {
  const { allowed, isLoading: roleLoading } = useRoleGuard('farmer')

  if (roleLoading || !allowed) return null

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-6 lg:px-8">
        <WeatherDashboard />
      </div>
    </div>
  )
}
