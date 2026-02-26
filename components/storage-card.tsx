import { storages } from '@/lib/mock-data'
import type { SensorData, RiskData } from '@/lib/mock-data'

interface StorageCardProps {
  storageId: string
  sensorData?: SensorData
  riskData?: RiskData
}

export function StorageCard({ storageId, sensorData, riskData }: StorageCardProps) {
  const storage = storages.find((s) => s.id === storageId)

  if (!storage) return null

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-success/10 text-success border border-success/20'
      case 'medium':
        return 'bg-warning/10 text-warning border border-warning/20'
      case 'high':
        return 'bg-danger/10 text-danger border border-danger/20'
      default:
        return ''
    }
  }

  return (
    <div className="card-elevated rounded-xl p-6 transition-all hover:shadow-md">
      <h3 className="text-lg font-semibold text-foreground">{storage.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{storage.location}</p>

      {sensorData && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-accent/5 border border-accent/10 p-3">
            <p className="text-xs font-medium text-accent">Temperature</p>
            <p className="mt-1 text-2xl font-bold text-accent">
              {sensorData.temperature.toFixed(1)}°C
            </p>
          </div>
          <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
            <p className="text-xs font-medium text-primary">Humidity</p>
            <p className="mt-1 text-2xl font-bold text-primary">
              {sensorData.humidity.toFixed(1)}%
            </p>
          </div>
        </div>
      )}

      {riskData && (
        <div className="mt-4">
          <div className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getRiskColor(riskData.riskLevel)}`}>
            Risk: {riskData.riskLevel.charAt(0).toUpperCase() + riskData.riskLevel.slice(1)}
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Spoilage Risk</span>
              <span className="text-sm font-bold text-foreground">{riskData.spoilageRisk.toFixed(0)}%</span>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all ${
                  riskData.riskLevel === 'low'
                    ? 'bg-success'
                    : riskData.riskLevel === 'medium'
                      ? 'bg-warning'
                      : 'bg-danger'
                }`}
                style={{ width: `${riskData.spoilageRisk}%` }}
              />
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{riskData.recommendation}</p>
        </div>
      )}
    </div>
  )
}
