import type { SensorData, RiskData } from '@/lib/mock-data'

interface StatsOverviewProps {
  sensorData: SensorData[]
  riskData: RiskData[]
}

export function StatsOverview({ sensorData, riskData }: StatsOverviewProps) {
  const avgTemp = sensorData.length > 0 ? (sensorData.reduce((sum, s) => sum + s.temperature, 0) / sensorData.length).toFixed(1) : '0'
  const avgHumidity = sensorData.length > 0 ? (sensorData.reduce((sum, s) => sum + s.humidity, 0) / sensorData.length).toFixed(1) : '0'
  const highRiskCount = riskData.filter((r) => r.riskLevel === 'high').length
  const totalStorages = sensorData.length

  const stats = [
    { label: 'Avg Temperature', value: `${avgTemp}°C`, icon: '🌡️', color: 'primary' },
    { label: 'Avg Humidity', value: `${avgHumidity}%`, icon: '💧', color: 'secondary' },
    { label: 'High Risk Units', value: highRiskCount, icon: '⚠️', color: highRiskCount > 0 ? 'danger' : 'primary' },
    { label: 'Active Storage Units', value: totalStorages, icon: '📦', color: 'accent' },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-lg border border-border bg-card p-4 transition-all hover:shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
          <p className="mt-3 text-2xl font-bold text-foreground">{stat.value}</p>
        </div>
      ))}
    </div>
  )
}
