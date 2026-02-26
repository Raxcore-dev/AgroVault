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
    { label: 'Avg Temperature', value: `${avgTemp}°C`, color: 'bg-primary/5 border-primary/10', textColor: 'text-primary' },
    { label: 'Avg Humidity', value: `${avgHumidity}%`, color: 'bg-accent/5 border-accent/10', textColor: 'text-accent' },
    { label: 'High Risk Units', value: highRiskCount, color: highRiskCount > 0 ? 'bg-danger/5 border-danger/10' : 'bg-primary/5 border-primary/10', textColor: highRiskCount > 0 ? 'text-danger' : 'text-primary' },
    { label: 'Active Storage Units', value: totalStorages, color: 'bg-secondary/5 border-secondary/10', textColor: 'text-secondary' },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className={`rounded-xl border ${stat.color} p-4 transition-all hover:shadow-sm`}>
          <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
          <p className={`mt-2 text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  )
}
