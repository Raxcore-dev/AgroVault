/**
 * Create Storage Unit for IoT Testing
 * Run this to create a storage unit that ESP32 can send data to
 */

import { PrismaClient } from '../lib/generated/prisma/client/index.js'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

async function main() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    console.error('❌ DATABASE_URL not found in environment')
    process.exit(1)
  }

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
    console.log('=== Creating IoT Storage Unit ===\n')

    // First, find or create a farmer user
    console.log('📝 Finding or creating farmer user...')
    let farmer = await prisma.user.findFirst({
      where: { role: 'farmer' },
    })

    if (!farmer) {
      console.log('  Creating new farmer user...')
      farmer = await prisma.user.create({
        data: {
          name: 'IoT Test Farmer',
          email: `iot-test-${Date.now()}@agrovault.local`,
          password: 'placeholder_hash_not_used',
          role: 'farmer',
          phone: '+254700000000',
          location: 'Nakuru',
        },
      })
      console.log(`  ✓ Created farmer: ${farmer.id}`)
    } else {
      console.log(`  ✓ Found farmer: ${farmer.id}`)
    }

    // Create storage unit
    console.log('\n📦 Creating storage unit...')
    const storageUnit = await prisma.storageUnit.create({
      data: {
        name: 'ESP32 Test Silo',
        location: 'Nakuru',
        capacity: 1000,
        latitude: -0.3031,
        longitude: 36.0800,
        farmerId: farmer.id,
      },
    })
    console.log(`  ✓ Created storage unit: ${storageUnit.id}`)

    // Create sensor device
    console.log('\n📡 Creating ESP32 sensor device...')
    const sensor = await prisma.sensor.create({
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

    // Output configuration
    console.log('\n=== ESP32 CONFIGURATION ===')
    console.log('\nUpdate your ESP32 code (src/main.cpp) with:\n')
    console.log(`const char* storageUnitId = "${storageUnit.id}";`)
    console.log('\nBackend URL (verify your IP):')
    console.log('http://192.168.100.227:3000/api/sensors/save')
    console.log('\n=== SETUP COMPLETE ===\n')

    return storageUnit.id
  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Database connection refused. Check:')
      console.error('   1. Internet connection')
      console.error('   2. DATABASE_URL in .env file')
      console.error('   3. Neon database is accessible')
    }
    return null
  } finally {
    await prisma.$disconnect()
  }
}

main().then((result) => {
  process.exit(result ? 0 : 1)
})
