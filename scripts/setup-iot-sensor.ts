/**
 * IoT Sensor Data Pipeline Setup Script
 * 
 * This script:
 * 1. Creates a test farmer user (if not exists)
 * 2. Creates a test storage unit for IoT sensors
 * 3. Outputs the storageUnitId for ESP32 configuration
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
    console.log('=== IoT Sensor Pipeline Setup ===\n')

    // Step 1: Find or create a test farmer
    console.log('📝 Step 1: Checking for farmer user...')
    let farmer = await prisma.user.findFirst({
      where: { role: 'farmer' },
    })

    if (!farmer) {
      console.log('  Creating test farmer user...')
      farmer = await prisma.user.create({
        data: {
          name: 'IoT Test Farmer',
          email: 'iot-test@agrovault.local',
          password: '$2b$10$testhashplaceholder', // Not used for testing
          role: 'farmer',
          phone: '+254700000000',
          location: 'Nakuru',
        },
      })
      console.log(`  ✓ Created farmer: ${farmer.id}`)
    } else {
      console.log(`  ✓ Found farmer: ${farmer.id}`)
    }

    // Step 2: Find or create a storage unit
    console.log('\n📦 Step 2: Checking for storage unit...')
    let storageUnit = await prisma.storageUnit.findFirst({
      where: { farmerId: farmer.id },
    })

    if (!storageUnit) {
      console.log('  Creating test storage unit...')
      storageUnit = await prisma.storageUnit.create({
        data: {
          name: 'Grain Silo A - IoT Enabled',
          location: 'Nakuru',
          capacity: 1000,
          latitude: -0.3031,
          longitude: 36.0800,
          farmerId: farmer.id,
        },
      })
      console.log(`  ✓ Created storage unit: ${storageUnit.id}`)
    } else {
      console.log(`  ✓ Found storage unit: ${storageUnit.id}`)
    }

    // Step 3: Find or create a sensor device
    console.log('\n📡 Step 3: Checking for sensor device...')
    let sensor = await prisma.sensor.findFirst({
      where: { storageUnitId: storageUnit.id },
    })

    if (!sensor) {
      console.log('  Creating ESP32 sensor device...')
      sensor = await prisma.sensor.create({
        data: {
          name: 'ESP32 Sensor #1',
          deviceType: 'combined',
          deviceId: 'ESP32-IOT-001',
          status: 'active',
          location: 'Zone A',
          storageUnitId: storageUnit.id,
        },
      })
      console.log(`  ✓ Created sensor: ${sensor.id}`)
    } else {
      console.log(`  ✓ Found sensor: ${sensor.id}`)
    }

    // Step 4: Output configuration
    console.log('\n=== ESP32 CONFIGURATION ===')
    console.log(`\nUpdate your ESP32 code (src/main.cpp) with:\n`)
    console.log(`  const char* storageUnitId = "${storageUnit.id}";`)
    console.log(`\nOptional - Sensor ID for future use:`)
    console.log(`  const char* sensorId = "${sensor.id}";`)
    console.log(`\nBackend URL (already configured):`)
    console.log(`  http://192.168.100.227:3000/api/sensors/save`)
    console.log('\n=== SETUP COMPLETE ===\n')

    return { storageUnitId: storageUnit.id, sensorId: sensor.id }
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    console.error(error)
    return null
  } finally {
    await prisma.$disconnect()
  }
}

main().then((result) => {
  if (!result) {
    process.exit(1)
  }
  process.exit(0)
})
