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
      <div className="card-elevated rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground">Alert System</h3>
        <div className="mt-4 rounded-lg bg-success/5 border border-success/15 p-4">
          <p className="text-sm text-success">All storage units are operating within normal parameters. No alerts at this time.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card-elevated rounded-xl p-6">
      <h3 className="text-lg font-semibold text-foreground">Alert System</h3>

      {highRiskItems.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-danger">High Priority Alerts</h4>
          <div className="mt-2 space-y-2">
            {highRiskItems.map((item) => {
              const storage = storages.find((s) => s.id === item.storageId)
              return (
                <div key={item.storageId} className="rounded-lg bg-danger/5 border border-danger/15 p-3">
                  <p className="text-sm font-semibold text-danger">{storage?.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.recommendation}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {mediumRiskItems.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-warning">Medium Priority Alerts</h4>
          <div className="mt-2 space-y-2">
            {mediumRiskItems.map((item) => {
              const storage = storages.find((s) => s.id === item.storageId)
              return (
                <div key={item.storageId} className="rounded-lg bg-warning/5 border border-warning/15 p-3">
                  <p className="text-sm font-semibold text-warning">{storage?.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.recommendation}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
