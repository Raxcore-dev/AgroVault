/**
 * Storage Recommendations API
 *
 * GET /api/storage/recommendations – Returns market recommendations
 *     for commodities at HIGH spoilage risk.
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

    // Only return high-risk assessments that have recommendations
    const recommendations = assessments
      .filter((a) => a.riskLevel === 'high' && a.recommendation)
      .map((a) => ({
        storageUnitId: a.storageUnitId,
        storageUnitName: a.storageUnitName,
        commodityId: a.commodityId,
        commodityName: a.commodityName,
        riskLevel: a.riskLevel,
        temperature: a.temperature,
        humidity: a.humidity,
        daysStored: a.daysStored,
        reasons: a.reasons,
        recommendation: a.recommendation,
      }))

    return NextResponse.json({ recommendations })
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch market recommendations.' },
      { status: 500 }
    )
  }
}
