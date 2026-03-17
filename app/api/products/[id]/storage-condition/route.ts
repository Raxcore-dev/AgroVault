/**
 * GET /api/products/[id]/storage-condition
 * 
 * Returns the current storage condition status for a product if it's
 * linked to a monitored storage unit. This helps buyers trust product quality.
 * 
 * Response includes:
 * - storageUnit: name, location
 * - latestReading: temperature, humidity, status, recordedAt
 * - condition: "safe" | "warning" | "danger"
 * - message: human-readable status message
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get the product with its storage unit
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        storageUnit: {
          include: {
            readings: {
              orderBy: { recordedAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 })
    }

    // If no storage unit linked, return null
    if (!product.storageUnit) {
      return NextResponse.json({ 
        hasStorage: false,
        message: 'This product is not linked to a monitored storage unit.'
      })
    }

    const storageUnit = product.storageUnit
    const latestReading = storageUnit.readings[0] || null

    // Determine condition status based on readings
    let condition: 'safe' | 'warning' | 'danger' = 'safe'
    let message = 'Storage conditions are optimal.'

    if (latestReading) {
      if (latestReading.status === 'danger') {
        condition = 'danger'
        message = '⚠ High risk detected! Storage conditions require immediate attention.'
      } else if (latestReading.status === 'warning') {
        condition = 'warning'
        message = '⚠ Storage conditions are slightly outside optimal range.'
      } else if (latestReading.humidity > 70) {
        condition = 'warning'
        message = '⚠ High humidity detected. Monitor storage conditions closely.'
      } else if (latestReading.temperature > 30) {
        condition = 'warning'
        message = '⚠ Temperature is higher than recommended. Consider ventilation.'
      }
    }

    return NextResponse.json({
      hasStorage: true,
      storageUnit: {
        id: storageUnit.id,
        name: storageUnit.name,
        location: storageUnit.location,
      },
      latestReading: latestReading ? {
        temperature: latestReading.temperature,
        humidity: latestReading.humidity,
        status: latestReading.status,
        recordedAt: latestReading.recordedAt,
      } : null,
      condition,
      message,
    })
  } catch (error) {
    console.error('[Storage Condition GET] Error:', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
