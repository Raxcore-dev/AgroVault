interface SensorReading {
  id: string
  storage_unit_id: string
  storage_unit_name: string | null
  storage_unit_location: string | null
  temperature: number
  humidity: number
  timestamp: string
  status: 'normal' | 'warning' | 'danger'
  status_reasons: string[]
}

interface RiskAssessment {
  storageUnitId: string
  storageUnitName: string
  riskLevel: 'low' | 'medium' | 'high'
  spoilageRisk: number
  recommendation: string
}

interface StorageCardProps {
  storageUnit: {
    id: string
    name: string
    location: string
    capacity: number
  }
  sensorReading?: SensorReading | null
  riskData?: RiskAssessment | null
}

export function StorageCard({ storageUnit, sensorReading, riskData }: StorageCardProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-300'
      case 'medium':
        return 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300'
      case 'high':
        return 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200'
    }
  }

  const getStatusColor = (temp: number, humidity: number) => {
    if (temp > 35 || humidity > 85) return 'text-red-600'
    if (temp > 30 || humidity > 75) return 'text-amber-600'
    return 'text-green-600'
  }

  return (
    <div className="card-elevated rounded-lg p-6 transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{storageUnit.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{storageUnit.location}</p>
        </div>
        {sensorReading && (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              sensorReading.status === 'danger'
                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                : sensorReading.status === 'warning'
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
            }`}
          >
            {sensorReading.status === 'danger' ? '⚠️' : sensorReading.status === 'warning' ? '⚠️' : '✅'}
            {sensorReading.status === 'danger' ? 'Critical' : sensorReading.status === 'warning' ? 'Warning' : 'Normal'}
          </span>
        )}
      </div>

      {sensorReading ? (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
            <p className="text-xs font-medium text-muted-foreground">Temperature</p>
            <p className={`mt-1 text-2xl font-bold ${getStatusColor(sensorReading.temperature, sensorReading.humidity)}`}>
              {sensorReading.temperature.toFixed(1)}°C
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Updated: {new Date(sensorReading.timestamp).toLocaleTimeString()}
            </p>
          </div>
          <div className="rounded-lg bg-accent/5 border border-accent/10 p-3">
            <p className="text-xs font-medium text-muted-foreground">Humidity</p>
            <p className={`mt-1 text-2xl font-bold ${getStatusColor(sensorReading.temperature, sensorReading.humidity)}`}>
              {sensorReading.humidity.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Updated: {new Date(sensorReading.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-lg bg-muted/30 border border-dashed border-border p-4 text-center">
          <p className="text-sm text-muted-foreground">No sensor data available</p>
          <p className="text-xs text-muted-foreground mt-1">Waiting for ESP32 device</p>
        </div>
      )}

      {sensorReading && sensorReading.status_reasons.length > 0 && (
        <div className="mt-4 space-y-1">
          {sensorReading.status_reasons.map((reason, i) => (
            <p key={i} className="text-xs text-amber-600 dark:text-amber-400">
              ⚠ {reason}
            </p>
          ))}
        </div>
      )}

      {riskData && (
        <div className="mt-4">
          <div
            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getRiskColor(riskData.riskLevel)}`}
          >
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
                    ? 'bg-green-500'
                    : riskData.riskLevel === 'medium'
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${riskData.spoilageRisk}%` }}
              />
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{riskData.recommendation}</p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Capacity</p>
            <p className="text-sm font-semibold text-foreground">{storageUnit.capacity} tons</p>
          </div>
          <a
            href={`/dashboard/storage-units/${storageUnit.id}`}
            className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
          >
            View Details →
          </a>
        </div>
      </div>
    </div>
  )
}
