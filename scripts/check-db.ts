/**
 * Database Check Script
 * Verifies storage units and existing sensor readings
 */

import { PrismaClient } from '@/lib/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

async function main() {
  const connectionString = process.env.DATABASE_URL!

  const pool = new pg.Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    statement_timeout: 10000,
  })

  const adapter = new PrismaPg(pool, {
    maxRequests: 10,
    timeout: 10000,
  })

  const prisma = new PrismaClient({
    adapter,
  })

  try {
    console.log('=== DATABASE CHECK ===\n')

    // Check StorageUnits
    console.log('📦 Storage Units:')
    const units = await prisma.storageUnit.findMany({ take: 10 })
    if (units.length === 0) {
      console.log('  ⚠️  No storage units found!')
    } else {
      units.forEach((u) => {
        console.log(`  ✓ ${u.id} - ${u.name} (${u.location})`)
      })
    }

    // Check StorageReadings
    console.log('\n📊 Recent Sensor Readings:')
    const readings = await prisma.storageReading.findMany({
      take: 10,
      orderBy: { recordedAt: 'desc' },
    })
    if (readings.length === 0) {
      console.log('  ⚠️  No sensor readings found!')
    } else {
      readings.forEach((r) => {
        console.log(`  ✓ ${r.id} - Temp: ${r.temperature}°C, Humidity: ${r.humidity}% (${r.status})`)
      })
    }

    // Check Sensors
    console.log('\n📡 Sensors:')
    const sensors = await prisma.sensor.findMany({ take: 10 })
    if (sensors.length === 0) {
      console.log('  ⚠️  No sensors registered!')
    } else {
      sensors.forEach((s) => {
        console.log(`  ✓ ${s.id} - ${s.name} (${s.deviceType}) - ${s.status}`)
      })
    }

    return units.length > 0 ? units[0].id : null
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    return null
  } finally {
    await prisma.$disconnect()
  }
}

main().then((storageUnitId) => {
  console.log('\n=== ESP32 CONFIGURATION ===')
  if (storageUnitId) {
    console.log(`Update ESP32 code with storageUnitId: "${storageUnitId}"`)
  } else {
    console.log('⚠️  No storage unit found. Create one first!')
  }
  process.exit(0)
})
