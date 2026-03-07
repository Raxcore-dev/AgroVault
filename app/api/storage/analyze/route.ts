/**
 * AI Storage Analysis API
 *
 * POST /api/storage/analyze
 *   Body: { storageUnitId: string, commodityId?: string }
 *
 * Runs the AI analysis pipeline on a storage unit:
 *   1. Evaluates spoilage risk using RaxAI
 *   2. Recommends the best market if risk is high
 *   3. Creates alerts in the DB for high-risk cases
 *
 * Returns: { analyses: AIFullAnalysis[], summary }
 */

import { NextRequest, NextResponse } from 'next/server'
import { authorizeRole } from '@/lib/api-auth'
import {
  analyzeStorageUnit,
  runFullAnalysis,
  analyzeAllForFarmer,
  type AIFullAnalysis,
} from '@/lib/services/aiAnalysisService'

const farmerGuard = authorizeRole('farmer')

export async function POST(request: NextRequest) {
  const user = await farmerGuard(request)
  if (user instanceof NextResponse) return user

  try {
    const body = await request.json()
    const { storageUnitId, commodityId } = body

    let analyses: AIFullAnalysis[] = []

    if (storageUnitId && commodityId) {
      // Analyze a specific commodity in a specific unit
      const result = await runFullAnalysis(storageUnitId, commodityId)
      if (result) analyses = [result]
    } else if (storageUnitId) {
      // Analyze all commodities in a specific unit
      analyses = await analyzeStorageUnit(storageUnitId)
    } else {
      // Analyze all storage units for this farmer
      analyses = await analyzeAllForFarmer(user.userId)
    }

    const summary = {
      total: analyses.length,
      high: analyses.filter((a) => a.spoilage.risk_level === 'high').length,
      medium: analyses.filter((a) => a.spoilage.risk_level === 'medium').length,
      low: analyses.filter((a) => a.spoilage.risk_level === 'low').length,
      withMarketRecommendation: analyses.filter((a) => a.market !== null).length,
    }

    return NextResponse.json({ analyses, summary })
  } catch (error) {
    console.error('[API] AI analysis failed:', error)
    return NextResponse.json(
      { error: 'AI analysis failed. Please try again.' },
      { status: 500 }
    )
  }
}
