/**
 * Storage Alerts API (Spoilage)
 *
 * GET /api/storage/alerts – Returns spoilage risk assessments for all farmer storage units
 *
 * Query params:
 *   ?riskLevel=high  – Filter by risk level (low | medium | high)
 */

import { NextRequest, NextResponse } from 'next/server'
import { authorizeRole } from '@/lib/api-auth'
import { evaluateAllForFarmer } from '@/lib/services/spoilageDetectionService'

const farmerGuard = authorizeRole('farmer')

export async function GET(request: NextRequest) {
  const user = await farmerGuard(request)
  if (user instanceof NextResponse) return user

  try {
    const assessments = await evaluateAllForFarmer(user.userId)

    const { searchParams } = new URL(request.url)
    const riskFilter = searchParams.get('riskLevel')

    const filtered = riskFilter
      ? assessments.filter((a) => a.riskLevel === riskFilter)
      : assessments

    const summary = {
      total: filtered.length,
      high: filtered.filter((a) => a.riskLevel === 'high').length,
      medium: filtered.filter((a) => a.riskLevel === 'medium').length,
      low: filtered.filter((a) => a.riskLevel === 'low').length,
    }

    return NextResponse.json({ assessments: filtered, summary })
  } catch (error) {
    console.error('Error evaluating spoilage:', error)
    return NextResponse.json(
      { error: 'Failed to evaluate spoilage risk.' },
      { status: 500 }
    )
  }
}
