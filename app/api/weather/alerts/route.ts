/**
 * Weather Alerts API
 *
 * GET /api/weather/alerts?location=Kisumu
 *
 * Returns weather risk analysis including rainfall alerts,
 * risk levels, and safe harvest windows.
 *
 * Also creates DB alerts for severe weather when applicable.
 */

import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'
import { getWeatherForecast } from '@/lib/services/weatherService'
import { analyzeWeatherRisks } from '@/lib/services/weatherAnalysisService'

export async function GET(request: NextRequest) {
  const user = await authenticateUser(request)
  if (user instanceof NextResponse) return user

  try {
    const { searchParams } = new URL(request.url)
    let location = searchParams.get('location')

    if (!location) {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.userId },
        select: { location: true },
      })
      location = dbUser?.location ?? 'Kisumu'
    }

    const weather = await getWeatherForecast(location)
    const riskSummary = analyzeWeatherRisks(weather)

    // Create DB alerts for high-risk weather events (avoid duplicates)
    if (riskSummary.overall_risk === 'high' && user.role === 'farmer') {
      const units = await prisma.storageUnit.findMany({
        where: { farmerId: user.userId },
        select: { id: true, name: true },
      })

      for (const alert of riskSummary.alerts.filter((a) => a.risk_level === 'high')) {
        for (const unit of units) {
          // Check for existing recent weather alert
          const existing = await prisma.alert.findFirst({
            where: {
              storageUnitId: unit.id,
              alertType: 'weather_risk',
              isRead: false,
              timestamp: { gte: new Date(Date.now() - 12 * 60 * 60 * 1000) },
            },
          })

          if (!existing) {
            await prisma.alert.create({
              data: {
                storageUnitId: unit.id,
                alertType: 'weather_risk',
                message: `${alert.title} in ${location}: ${alert.message}`,
                severity: 'danger',
                recommendedAction: riskSummary.safe_harvest_window
                  ? `Safe harvest window: ${riskSummary.safe_harvest_window}. Consider harvesting ready crops before the weather event.`
                  : 'Consider harvesting ready crops immediately to prevent post-harvest losses.',
              },
            })
          }
        }
      }
    }

    return NextResponse.json({
      location,
      ...riskSummary,
      current_temperature: weather.current.temperature,
      current_humidity: weather.current.humidity,
    })
  } catch (error) {
    console.error('[API] Weather alerts error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze weather risks.' },
      { status: 500 }
    )
  }
}
