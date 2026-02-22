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
        return 'bg-green-50 text-green-900 dark:bg-green-900 dark:text-green-50'
      case 'medium':
        return 'bg-yellow-50 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-50'
      case 'high':
        return 'bg-red-50 text-red-900 dark:bg-red-900 dark:text-red-50'
      default:
        return ''
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="text-lg font-semibold text-foreground">{storage.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{storage.location}</p>

      {sensorData && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="rounded-md bg-blue-50 p-3 dark:bg-blue-950">
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Temperature</p>
            <p className="mt-1 text-2xl font-bold text-blue-900 dark:text-blue-100">
              {sensorData.temperature.toFixed(1)}°C
            </p>
          </div>
          <div className="rounded-md bg-cyan-50 p-3 dark:bg-cyan-950">
            <p className="text-xs font-medium text-cyan-600 dark:text-cyan-400">Humidity</p>
            <p className="mt-1 text-2xl font-bold text-cyan-900 dark:text-cyan-100">
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
            <div className="mt-1 h-2 w-full rounded-full bg-border">
              <div
                className={`h-full rounded-full transition-all ${
                  riskData.riskLevel === 'low'
                    ? 'bg-green-500'
                    : riskData.riskLevel === 'medium'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
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
