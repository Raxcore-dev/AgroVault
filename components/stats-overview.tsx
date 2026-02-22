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
    { label: 'Avg Temperature', value: `${avgTemp}°C`, color: 'bg-blue-50 dark:bg-blue-950' }
,    { label: 'Avg Humidity', value: `${avgHumidity}%`, color: 'bg-cyan-50 dark:bg-cyan-950' },
    { label: 'High Risk Units', value: highRiskCount, color: highRiskCount > 0 ? 'bg-red-50 dark:bg-red-950' : 'bg-green-50 dark:bg-green-950' },
    { label: 'Active Storage Units', value: totalStorages, color: 'bg-purple-50 dark:bg-purple-950' },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className={`rounded-lg ${stat.color} p-4`}>
          <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{stat.value}</p>
        </div>
      ))}
    </div>
  )
}
