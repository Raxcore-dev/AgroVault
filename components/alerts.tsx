import type { RiskData } from '@/lib/mock-data'
import { storages } from '@/lib/mock-data'

interface AlertsProps {
  riskData: RiskData[]
}

export function Alerts({ riskData }: AlertsProps) {
  const highRiskItems = riskData.filter((item) => item.riskLevel === 'high')
  const mediumRiskItems = riskData.filter((item) => item.riskLevel === 'medium')

  if (highRiskItems.length === 0 && mediumRiskItems.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground">Alert System</h3>
        <div className="mt-4 rounded-md bg-green-50 p-4 dark:bg-green-950">
          <p className="text-sm text-green-800 dark:text-green-100">All storage units are operating within normal parameters. No alerts at this time.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="text-lg font-semibold text-foreground">Alert System</h3>

      {highRiskItems.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-red-900 dark:text-red-100">High Priority Alerts</h4>
          <div className="mt-2 space-y-2">
            {highRiskItems.map((item) => {
              const storage = storages.find((s) => s.id === item.storageId)
              return (
                <div key={item.storageId} className="rounded-md bg-red-50 p-3 dark:bg-red-950">
                  <p className="text-sm font-semibold text-red-900 dark:text-red-100">{storage?.name}</p>
                  <p className="mt-1 text-xs text-red-800 dark:text-red-200">{item.recommendation}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {mediumRiskItems.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">Medium Priority Alerts</h4>
          <div className="mt-2 space-y-2">
            {mediumRiskItems.map((item) => {
              const storage = storages.find((s) => s.id === item.storageId)
              return (
                <div key={item.storageId} className="rounded-md bg-yellow-50 p-3 dark:bg-yellow-950">
                  <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">{storage?.name}</p>
                  <p className="mt-1 text-xs text-yellow-800 dark:text-yellow-200">{item.recommendation}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
