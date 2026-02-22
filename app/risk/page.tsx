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
        console.error('[v0] Error fetching risk data:', error)
      }
    }

    fetchRiskData()
    const interval = setInterval(fetchRiskData, 5000)
    return () => clearInterval(interval)
  }, [])

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-success/10 border-success/30 text-success'
      case 'medium':
        return 'bg-warning/10 border-warning/30 text-warning'
      case 'high':
        return 'bg-danger/10 border-danger/30 text-danger'
      default:
        return 'bg-muted/10'
    }
  }

  const getRiskIcon = (level: string) => {
    if (level === 'high') return '🔴'
    if (level === 'medium') return '🟡'
    return '🟢'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-danger" />
            <h1 className="text-3xl font-bold text-foreground">Risk Assessment</h1>
          </div>
          <p className="mt-2 text-muted-foreground">
            Real-time spoilage risk analysis and mitigation strategies
          </p>
        </div>

        {/* Risk Summary Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-success/30 bg-success/10 p-6">
            <p className="text-sm font-medium text-success">Low Risk</p>
            <p className="mt-2 text-2xl font-bold text-success">
              {riskData.filter((r) => r.riskLevel === 'low').length}
            </p>
          </div>
          <div className="rounded-lg border border-warning/30 bg-warning/10 p-6">
            <p className="text-sm font-medium text-warning">Medium Risk</p>
            <p className="mt-2 text-2xl font-bold text-warning">
              {riskData.filter((r) => r.riskLevel === 'medium').length}
            </p>
          </div>
          <div className="rounded-lg border border-danger/30 bg-danger/10 p-6">
            <p className="text-sm font-medium text-danger">High Risk</p>
            <p className="mt-2 text-2xl font-bold text-danger">
              {riskData.filter((r) => r.riskLevel === 'high').length}
            </p>
          </div>
        </div>

        {/* Risk Details */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Storage Facility Analysis</h2>
          {riskData.map((risk, idx) => {
            const storage = storages[idx]
            return (
              <div
                key={risk.storageId}
                className={`rounded-lg border p-6 transition-all hover:shadow-lg ${getRiskColor(risk.riskLevel)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="text-3xl">{getRiskIcon(risk.riskLevel)}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{storage?.name}</h3>
                      <p className="text-sm capitalize text-muted-foreground">
                        Risk Level: <span className="font-semibold">{risk.riskLevel}</span>
                      </p>
                      <div className="mt-3">
                        <div className="flex items-center gap-2">
                          <TrendingDown className="h-4 w-4" />
                          <span className="text-sm font-medium">Spoilage Risk: {risk.spoilageRisk}%</span>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed">{risk.recommendation}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk Mitigation Strategies */}
                <div className="mt-4 rounded-lg bg-black/5 p-4 dark:bg-white/5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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
