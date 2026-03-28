'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, TrendingDown } from 'lucide-react'
import { storages } from '@/lib/mock-data'
import type { RiskData } from '@/lib/mock-data'

export default function RiskPage() {
  const [riskData, setRiskData] = useState<RiskData[]>([])

  useEffect(() => {
    const fetchRiskData = async () => {
      try {
        const response = await fetch('/api/risk')
        if (response.ok) {
          setRiskData(await response.json())
        }
      } catch (error) {
        console.error('[AgroVault] Error fetching risk data:', error)
      }
    }

    fetchRiskData()
    const interval = setInterval(fetchRiskData, 5000)
    return () => clearInterval(interval)
  }, [])

  const getRiskIcon = (level: string) => {
    if (level === 'high') return '🔴'
    if (level === 'medium') return '🟡'
    return '🟢'
  }

  return (
    <div className="min-h-screen">
      <div className="px-6 py-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-danger/10 p-2.5">
            <AlertTriangle className="h-6 w-6 text-danger" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Risk Assessment</h1>
            <p className="text-sm text-muted-foreground">
              Real-time spoilage risk analysis and mitigation strategies
            </p>
          </div>
        </div>

        {/* Risk Summary Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="card-elevated rounded-lg p-5">
            <p className="text-sm font-medium text-primary">Low Risk</p>
            <p className="mt-2 text-3xl font-bold text-primary">
              {riskData.filter((r) => r.riskLevel === 'low').length}
            </p>
          </div>
          <div className="card-elevated rounded-lg p-5">
            <p className="text-sm font-medium text-warning">Medium Risk</p>
            <p className="mt-2 text-3xl font-bold text-warning">
              {riskData.filter((r) => r.riskLevel === 'medium').length}
            </p>
          </div>
          <div className="card-elevated rounded-lg p-5">
            <p className="text-sm font-medium text-danger">High Risk</p>
            <p className="mt-2 text-3xl font-bold text-danger">
              {riskData.filter((r) => r.riskLevel === 'high').length}
            </p>
          </div>
        </div>

        {/* Risk Details */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Storage Facility Analysis</h2>
          {riskData.map((risk, idx) => {
            const storage = storages[idx]
            return (
              <div
                key={risk.storageId}
                className="card-elevated rounded-lg p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="text-3xl">{getRiskIcon(risk.riskLevel)}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{storage?.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Risk Level: <span className={`font-semibold ${
                          risk.riskLevel === 'high' ? 'text-danger' : risk.riskLevel === 'medium' ? 'text-warning' : 'text-primary'
                        }`}>{risk.riskLevel}</span>
                      </p>
                      <div className="mt-3">
                        <div className="flex items-center gap-2">
                          <TrendingDown className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground">Spoilage Risk: {risk.spoilageRisk}%</span>
                        </div>
                        {/* Progress bar */}
                        <div className="mt-2 h-2 w-full rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full transition-all ${
                              risk.riskLevel === 'low'
                                ? 'bg-primary'
                                : risk.riskLevel === 'medium'
                                  ? 'bg-warning'
                                  : 'bg-danger'
                            }`}
                            style={{ width: `${risk.spoilageRisk}%` }}
                          />
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground">{risk.recommendation}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk Mitigation Strategies */}
                <div className="mt-4 rounded-lg bg-muted/50 border border-border p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    Recommended Actions
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-foreground">
                    {risk.riskLevel === 'high' && (
                      <>
                        <li>• Increase ventilation immediately</li>
                        <li>• Monitor temperature every 2 hours</li>
                        <li>• Consider partial harvest to reduce load</li>
                      </>
                    )}
                    {risk.riskLevel === 'medium' && (
                      <>
                        <li>• Check ventilation systems</li>
                        <li>• Monitor conditions closely</li>
                        <li>• Plan for market timing</li>
                      </>
                    )}
                    {risk.riskLevel === 'low' && (
                      <>
                        <li>• Maintain current storage conditions</li>
                        <li>• Regular monitoring schedule</li>
                        <li>• Optimize market timing</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
