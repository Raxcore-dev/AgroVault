/**
 * Database Seed Script
 * 
 * Populates the database with demo data for testing:
 *   - 2 farmers and 2 buyers
 *   - 10 sample products across Kenyan counties
 *   - A few sample chat messages
 * 
 * Run with: npm run db:seed (or npx tsx prisma/seed.ts)
 */

import 'dotenv/config'
import { PrismaClient } from '../lib/generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import bcrypt from 'bcryptjs'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data (order matters for foreign keys)
  await prisma.jobApplication.deleteMany()
  await prisma.job.deleteMany()
  await prisma.alert.deleteMany()
  await prisma.storageReading.deleteMany()
  await prisma.commodity.deleteMany()
  await prisma.storageUnit.deleteMany()
  await prisma.message.deleteMany()
  await prisma.product.deleteMany()
  await prisma.market.deleteMany()
  await prisma.commodityThreshold.deleteMany()
  await prisma.user.deleteMany()

  const passwordHash = await bcrypt.hash('password123', 10)

  // ─── Create Users ───
  const farmer1 = await prisma.user.create({
    data: {
      name: 'John Kamau',
      email: 'john@farmer.com',
      password: passwordHash,
      role: 'farmer',
      phone: '+254 712 345 678',
      location: 'Nakuru',
    },
  })

  const farmer2 = await prisma.user.create({
    data: {
      name: 'Wanjiku Mwangi',
      email: 'wanjiku@farmer.com',
      password: passwordHash,
      role: 'farmer',
      phone: '+254 723 456 789',
      location: 'Nyeri',
    },
  })

  const buyer1 = await prisma.user.create({
    data: {
      name: 'Peter Ochieng',
      email: 'peter@buyer.com',
      password: passwordHash,
      role: 'buyer',
      phone: '+254 734 567 890',
      location: 'Nairobi',
    },
  })

  const buyer2 = await prisma.user.create({
    data: {
      name: 'Amina Hassan',
      email: 'amina@buyer.com',
      password: passwordHash,
      role: 'buyer',
      phone: '+254 745 678 901',
      location: 'Mombasa',
    },
  })

  console.log('✅ Created users:', farmer1.name, farmer2.name, buyer1.name, buyer2.name)

  // ─── Create Worker Users ───
  const worker1 = await prisma.user.create({
    data: {
      name: 'David Otieno',
      email: 'david@worker.com',
      password: passwordHash,
      role: 'buyer', // workers use the buyer role (non-farmer)
      phone: '+254 756 789 012',
      location: 'Kisumu',
    },
  })

  const worker2 = await prisma.user.create({
    data: {
      name: 'Grace Wambui',
      email: 'grace@worker.com',
      password: passwordHash,
      role: 'buyer',
      phone: '+254 767 890 123',
      location: 'Nakuru',
    },
  })

  console.log('✅ Created workers:', worker1.name, worker2.name)

  // ─── Create Farm Jobs ───
  const job1 = await prisma.job.create({
    data: {
      title: 'Maize Harvest Workers Needed',
      cropType: 'maize',
      description: 'We need reliable workers to help harvest 20 acres of maize in Kisumu. Experience with maize harvesting preferred. We provide lunch and transport from Kisumu town. Work runs from 7 AM to 4 PM daily.',
      workersNeeded: 10,
      payPerDay: 700,
      location: 'Kisumu',
      latitude: -0.0917,
      longitude: 34.7680,
      startDate: new Date('2026-03-15'),
      farmerId: farmer1.id,
    },
  })

  const job2 = await prisma.job.create({
    data: {
      title: 'Tea Picking Assistants – Nyeri Highlands',
      cropType: 'tea',
      description: 'Seasonal tea picking on our Nyeri estate. Light work suitable for all. Training provided for first-timers. Morning shift 6 AM – 12 PM, afternoon shift 1 PM – 5 PM.',
      workersNeeded: 15,
      payPerDay: 600,
      location: 'Nyeri',
      latitude: -0.4169,
      longitude: 36.9458,
      startDate: new Date('2026-03-20'),
      farmerId: farmer2.id,
    },
  })

  const job3 = await prisma.job.create({
    data: {
      title: 'Wheat Harvesting Crew – Naivasha',
      cropType: 'wheat',
      description: 'Looking for 8 workers to help with wheat harvesting on our 15-acre farm near Lake Naivasha. Must be physically fit. Pay includes breakfast and lunch. We supply gloves and tools.',
      workersNeeded: 8,
      payPerDay: 800,
      location: 'Naivasha',
      latitude: -0.7172,
      longitude: 36.4310,
      startDate: new Date('2026-03-18'),
      farmerId: farmer1.id,
    },
  })

  const job4 = await prisma.job.create({
    data: {
      title: 'Tomato Picking & Sorting – Meru',
      cropType: 'tomatoes',
      description: 'Urgent: Need workers for tomato picking and grading at our greenhouse farm in Meru. Careful handling required. We provide training for sorting grades. Job may extend for 2 weeks.',
      workersNeeded: 6,
      payPerDay: 650,
      location: 'Meru',
      latitude: 0.0480,
      longitude: 37.6559,
      startDate: new Date('2026-03-12'),
      farmerId: farmer2.id,
    },
  })

  const job5 = await prisma.job.create({
    data: {
      title: 'Bean Harvest Helpers – Machakos',
      cropType: 'beans',
      description: 'Small-scale bean harvest on 5 acres in Machakos. Simple work – plucking and bagging. Great for students looking for short-term work. 3-day job.',
      workersNeeded: 4,
      payPerDay: 500,
      location: 'Machakos',
      latitude: -1.5177,
      longitude: 37.2634,
      startDate: new Date('2026-03-25'),
      farmerId: farmer1.id,
    },
  })

  // ─── Create Sample Job Applications ───
  await prisma.jobApplication.create({
    data: {
      jobId: job1.id,
      workerId: worker1.id,
      message: 'I have 3 years of experience harvesting maize in Kisumu. Available from the start date. I can also bring 2 friends who are experienced.',
      status: 'accepted',
    },
  })

  await prisma.jobApplication.create({
    data: {
      jobId: job1.id,
      workerId: worker2.id,
      message: 'I am interested in this position. I am hardworking and reliable. I can start immediately.',
      status: 'pending',
    },
  })

  await prisma.jobApplication.create({
    data: {
      jobId: job2.id,
      workerId: worker1.id,
      message: 'I would love to help with tea picking. I am based in Nyeri and can walk to the estate.',
      status: 'pending',
    },
  })

  await prisma.jobApplication.create({
    data: {
      jobId: job4.id,
      workerId: buyer1.id,
      message: 'I am interested in the tomato sorting job. I have experience working at Marikiti Market sorting produce.',
      status: 'pending',
    },
  })

  console.log('✅ Created farm jobs and applications')

  // ─── Create Products ───
  const products = await Promise.all([
    prisma.product.create({
      data: {
        productName: 'Fresh White Maize',
        description: 'Grade 1 white maize, freshly harvested from our Nakuru farm. Low moisture content, ideal for milling. Organically grown with no pesticides.',
        price: 3500,
        quantity: 500,
        unit: 'bag',
        productImage: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600',
        locationName: 'Nakuru',
        latitude: -0.3031,
        longitude: 36.0800,
        category: 'cereals',
        farmerId: farmer1.id,
      },
    }),
    prisma.product.create({
      data: {
        productName: 'Organic Red Beans',
        description: 'Premium red kidney beans from the highlands of Nyeri. Rich in protein and fiber. Sorted and cleaned, ready for market.',
        price: 120,
        quantity: 200,
        unit: 'kg',
        productImage: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=600',
        locationName: 'Nyeri',
        latitude: -0.4169,
        longitude: 36.9458,
        category: 'legumes',
        farmerId: farmer2.id,
      },
    }),
    prisma.product.create({
      data: {
        productName: 'Fresh Tomatoes',
        description: 'Vine-ripened tomatoes from our greenhouse in Naivasha. Firm and juicy, perfect for cooking or salads. Available in bulk.',
        price: 80,
        quantity: 1000,
        unit: 'kg',
        productImage: 'https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=600',
        locationName: 'Naivasha',
        latitude: -0.7172,
        longitude: 36.4310,
        category: 'vegetables',
        farmerId: farmer1.id,
      },
    }),
    prisma.product.create({
      data: {
        productName: 'Hass Avocados',
        description: 'Export-quality Hass avocados from Murang\'a. Medium-large size, creamy texture. Available for local and export buyers.',
        price: 250,
        quantity: 5000,
        unit: 'piece',
        productImage: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600',
        locationName: 'Thika',
        latitude: -1.0396,
        longitude: 37.0900,
        category: 'fruits',
        farmerId: farmer2.id,
      },
    }),
    prisma.product.create({
      data: {
        productName: 'Wheat Grain',
        description: 'High-quality wheat grain from the Rift Valley. Suitable for bread flour production. Tested and certified.',
        price: 4200,
        quantity: 300,
        unit: 'bag',
        productImage: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600',
        locationName: 'Eldoret',
        latitude: 0.5143,
        longitude: 35.2698,
        category: 'cereals',
        farmerId: farmer1.id,
      },
    }),
    prisma.product.create({
      data: {
        productName: 'Green Grams (Ndengu)',
        description: 'Cleaned and sorted green grams from Machakos. High nutritional value, popular in Kenyan cuisine.',
        price: 150,
        quantity: 100,
        unit: 'kg',
        productImage: 'https://images.unsplash.com/photo-1585996839654-c27e5a78a89c?w=600',
        locationName: 'Machakos',
        latitude: -1.5177,
        longitude: 37.2634,
        category: 'legumes',
        farmerId: farmer2.id,
      },
    }),
    prisma.product.create({
      data: {
        productName: 'Fresh Milk',
        description: 'Farm-fresh cow milk from our dairy farm in Kiambu. Pasteurized and packaged daily. Available for bulk orders.',
        price: 60,
        quantity: 500,
        unit: 'litre',
        productImage: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600',
        locationName: 'Kiambu',
        latitude: -1.1714,
        longitude: 36.8355,
        category: 'dairy',
        farmerId: farmer1.id,
      },
    }),
    prisma.product.create({
      data: {
        productName: 'Sweet Potatoes',
        description: 'Orange-fleshed sweet potatoes from Meru. Rich in Vitamin A, perfect for healthy meals. Freshly harvested.',
        price: 50,
        quantity: 2000,
        unit: 'kg',
        productImage: 'https://images.unsplash.com/photo-1596097635121-14b63a7e1e17?w=600',
        locationName: 'Meru',
        latitude: 0.0480,
        longitude: 37.6559,
        category: 'tubers',
        farmerId: farmer2.id,
      },
    }),
    prisma.product.create({
      data: {
        productName: 'Tea Leaves',
        description: 'Premium Kericho green tea leaves. Hand-picked from high-altitude tea gardens. Aromatic and full-bodied flavor.',
        price: 300,
        quantity: 100,
        unit: 'kg',
        productImage: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=600',
        locationName: 'Kericho',
        latitude: -0.3692,
        longitude: 35.2863,
        category: 'herbs',
        farmerId: farmer1.id,
      },
    }),
    prisma.product.create({
      data: {
        productName: 'Mangoes (Apple)',
        description: 'Juicy apple mangoes from the coast. Sweet and fiber-free. Perfect for juice, eating fresh, or export.',
        price: 40,
        quantity: 3000,
        unit: 'piece',
        productImage: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600',
        locationName: 'Mombasa',
        latitude: -4.0435,
        longitude: 39.6682,
        category: 'fruits',
        farmerId: farmer2.id,
      },
    }),
  ])

  console.log(`✅ Created ${products.length} products`)

  // ─── Create Sample Chat Messages ───
  const product1 = products[0]

  await prisma.message.createMany({
    data: [
      {
        senderId: buyer1.id,
        receiverId: farmer1.id,
        productId: product1.id,
        message: 'Hello! Is the maize still available? I need about 50 bags.',
        timestamp: new Date('2026-03-01T10:00:00'),
      },
      {
        senderId: farmer1.id,
        receiverId: buyer1.id,
        productId: product1.id,
        message: 'Yes, it is! I have 500 bags ready. Where are you located?',
        timestamp: new Date('2026-03-01T10:05:00'),
      },
      {
        senderId: buyer1.id,
        receiverId: farmer1.id,
        productId: product1.id,
        message: 'I\'m in Nairobi. Can you arrange delivery or should I collect?',
        timestamp: new Date('2026-03-01T10:10:00'),
      },
      {
        senderId: farmer1.id,
        receiverId: buyer1.id,
        productId: product1.id,
        message: 'I can arrange transport to Nairobi for a small fee. Let me get a quote for 50 bags.',
        timestamp: new Date('2026-03-01T10:15:00'),
      },
    ],
  })

  console.log('✅ Created sample chat messages')

  // ─── Create Storage Units ───
  const unit1 = await prisma.storageUnit.create({
    data: {
      name: 'Nakuru Warehouse A',
      location: 'Nakuru',
      capacity: 500,
      latitude: -0.3031,
      longitude: 36.0800,
      farmerId: farmer1.id,
    },
  })

  const unit2 = await prisma.storageUnit.create({
    data: {
      name: 'Nakuru Cold Room',
      location: 'Nakuru Town',
      capacity: 200,
      latitude: -0.3031,
      longitude: 36.0800,
      farmerId: farmer1.id,
    },
  })

  const unit3 = await prisma.storageUnit.create({
    data: {
      name: 'Nyeri Storage Facility',
      location: 'Nyeri',
      capacity: 350,
      latitude: -0.4169,
      longitude: 36.9458,
      farmerId: farmer2.id,
    },
  })

  // High-risk demo unit for Kisumu
  const unit4 = await prisma.storageUnit.create({
    data: {
      name: 'Kisumu Maize Silo',
      location: 'Kisumu',
      capacity: 400,
      latitude: -0.0917,
      longitude: 34.7680,
      farmerId: farmer1.id,
    },
  })

  console.log('✅ Created storage units')

  // ─── Create Commodities ───
  await prisma.commodity.createMany({
    data: [
      { commodityName: 'White Maize', quantity: 200, storageUnitId: unit1.id, expectedStorageDuration: 120 },
      { commodityName: 'Wheat Grain', quantity: 150, storageUnitId: unit1.id, expectedStorageDuration: 90 },
      { commodityName: 'Fresh Tomatoes', quantity: 30, storageUnitId: unit2.id, expectedStorageDuration: 14 },
      { commodityName: 'Hass Avocados', quantity: 20, storageUnitId: unit2.id, expectedStorageDuration: 10 },
      { commodityName: 'Red Beans', quantity: 100, storageUnitId: unit3.id, expectedStorageDuration: 180 },
      { commodityName: 'Green Grams', quantity: 80, storageUnitId: unit3.id, expectedStorageDuration: 150 },
      // High-risk scenario: maize stored too long in bad conditions
      { commodityName: 'White Maize', quantity: 300, storageUnitId: unit4.id, expectedStorageDuration: 120,
        dateStored: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000) }, // stored 100 days ago
    ],
  })

  console.log('✅ Created commodities')

  // ─── Create Storage Readings ───
  const now = new Date()
  const readingData: Array<{ storageUnitId: string; temperature: number; humidity: number; recordedAt: Date }> = []

  // Generate 24 hours of readings for each unit (every 2 hours)
  for (let h = 0; h < 24; h += 2) {
    const time = new Date(now.getTime() - h * 60 * 60 * 1000)

    readingData.push(
      { storageUnitId: unit1.id, temperature: 22 + Math.random() * 3, humidity: 55 + Math.random() * 10, recordedAt: time },
      { storageUnitId: unit2.id, temperature: 8 + Math.random() * 4, humidity: 80 + Math.random() * 10, recordedAt: time },
      { storageUnitId: unit3.id, temperature: 23 + Math.random() * 5, humidity: 50 + Math.random() * 15, recordedAt: time },
      // High-risk readings for Kisumu Maize Silo: temp > 32°C, humidity > 75%
      { storageUnitId: unit4.id, temperature: 33 + Math.random() * 3, humidity: 78 + Math.random() * 8, recordedAt: time },
    )
  }

  await prisma.storageReading.createMany({ data: readingData })

  console.log(`✅ Created ${readingData.length} storage readings`)

  // ─── Create Sample Alerts ───
  await prisma.alert.createMany({
    data: [
      {
        storageUnitId: unit2.id,
        alertType: 'HIGH_HUMIDITY',
        severity: 'warning',
        message: 'Humidity at 87% in Nakuru Cold Room — above safe threshold of 75%',
        isRead: false,
      },
      {
        storageUnitId: unit3.id,
        alertType: 'HIGH_TEMPERATURE',
        severity: 'warning',
        message: 'Temperature at 26.5°C in Nyeri Storage Facility — above normal range',
        isRead: false,
      },
      {
        storageUnitId: unit1.id,
        alertType: 'CRITICAL_TEMPERATURE',
        severity: 'danger',
        message: 'Temperature spike to 29°C in Nakuru Warehouse A — immediate attention needed',
        isRead: true,
      },
    ],
  })

  console.log('✅ Created sample alerts')

  // ─── Create Commodity Thresholds ───
  await prisma.commodityThreshold.createMany({
    data: [
      { commodityName: 'maize', minTemp: 10, maxTemp: 30, minHumidity: 50, maxHumidity: 70, maxStorageDays: 120 },
      { commodityName: 'wheat', minTemp: 10, maxTemp: 28, minHumidity: 50, maxHumidity: 65, maxStorageDays: 180 },
      { commodityName: 'beans', minTemp: 10, maxTemp: 28, minHumidity: 40, maxHumidity: 65, maxStorageDays: 180 },
      { commodityName: 'rice', minTemp: 10, maxTemp: 30, minHumidity: 55, maxHumidity: 70, maxStorageDays: 150 },
      { commodityName: 'tomatoes', minTemp: 2, maxTemp: 12, minHumidity: 85, maxHumidity: 95, maxStorageDays: 14 },
      { commodityName: 'avocados', minTemp: 5, maxTemp: 13, minHumidity: 85, maxHumidity: 95, maxStorageDays: 21 },
      { commodityName: 'grams', minTemp: 10, maxTemp: 28, minHumidity: 40, maxHumidity: 65, maxStorageDays: 150 },
    ],
  })

  console.log('✅ Created commodity thresholds')

  // ─── Create Markets ───
  await prisma.market.createMany({
    data: [
      // Maize markets
      { marketName: 'Kibuye Market',           location: 'Kisumu',   commodity: 'maize', pricePerKg: 80, demandLevel: 'high',   priceTrend: 'increasing', latitude: -0.0917, longitude: 34.7680 },
      { marketName: 'Kakamega Market',         location: 'Kakamega', commodity: 'maize', pricePerKg: 72, demandLevel: 'medium', priceTrend: 'stable',     latitude:  0.2827, longitude: 34.7519 },
      { marketName: 'Eldoret Town Market',     location: 'Eldoret',  commodity: 'maize', pricePerKg: 75, demandLevel: 'high',   priceTrend: 'increasing', latitude:  0.5143, longitude: 35.2698 },
      { marketName: 'Wakulima Market',         location: 'Nairobi',  commodity: 'maize', pricePerKg: 85, demandLevel: 'high',   priceTrend: 'increasing', latitude: -1.2833, longitude: 36.8269 },
      { marketName: 'Nakuru Municipal Market', location: 'Nakuru',   commodity: 'maize', pricePerKg: 78, demandLevel: 'medium', priceTrend: 'stable',     latitude: -0.3031, longitude: 36.0800 },
      // Wheat markets
      { marketName: 'Eldoret Grain Hub',       location: 'Eldoret',  commodity: 'wheat', pricePerKg: 65, demandLevel: 'medium', priceTrend: 'stable',     latitude:  0.5143, longitude: 35.2698 },
      { marketName: 'Nairobi Cereal Market',   location: 'Nairobi',  commodity: 'wheat', pricePerKg: 70, demandLevel: 'high',   priceTrend: 'increasing', latitude: -1.2921, longitude: 36.8219 },
      { marketName: 'Nakuru Grain Market',     location: 'Nakuru',   commodity: 'wheat', pricePerKg: 62, demandLevel: 'low',    priceTrend: 'decreasing', latitude: -0.3031, longitude: 36.0800 },
      // Beans markets
      { marketName: 'Nyeri Town Market',       location: 'Nyeri',    commodity: 'beans', pricePerKg: 120, demandLevel: 'high',   priceTrend: 'increasing', latitude: -0.4169, longitude: 36.9458 },
      { marketName: 'Gikomba Market',          location: 'Nairobi',  commodity: 'beans', pricePerKg: 130, demandLevel: 'high',   priceTrend: 'increasing', latitude: -1.2853, longitude: 36.8424 },
      { marketName: 'Embu Market',             location: 'Embu',     commodity: 'beans', pricePerKg: 115, demandLevel: 'medium', priceTrend: 'stable',     latitude: -0.5389, longitude: 37.4596 },
      // Tomatoes markets
      { marketName: 'Marikiti Market',         location: 'Nairobi',  commodity: 'tomatoes', pricePerKg: 90, demandLevel: 'high',   priceTrend: 'increasing', latitude: -1.2840, longitude: 36.8270 },
      { marketName: 'Naivasha Market',         location: 'Naivasha', commodity: 'tomatoes', pricePerKg: 70, demandLevel: 'medium', priceTrend: 'decreasing', latitude: -0.7172, longitude: 36.4310 },
      // Avocado markets
      { marketName: 'Thika Market',            location: 'Thika',    commodity: 'avocados', pricePerKg: 150, demandLevel: 'medium', priceTrend: 'stable',     latitude: -1.0396, longitude: 37.0900 },
      { marketName: 'Mombasa Export Hub',      location: 'Mombasa',  commodity: 'avocados', pricePerKg: 200, demandLevel: 'high',   priceTrend: 'increasing', latitude: -4.0435, longitude: 39.6682 },
      // Green grams markets
      { marketName: 'Machakos Open Market',    location: 'Machakos', commodity: 'grams', pricePerKg: 140, demandLevel: 'medium', priceTrend: 'stable',     latitude: -1.5177, longitude: 37.2634 },
      { marketName: 'Kitui Market',            location: 'Kitui',    commodity: 'grams', pricePerKg: 135, demandLevel: 'low',    priceTrend: 'decreasing', latitude: -1.3667, longitude: 38.0106 },
    ],
  })

  console.log('✅ Created markets')

  console.log('\n🎉 Seeding complete! Demo accounts:')
  console.log('  Farmer: john@farmer.com / password123')
  console.log('  Farmer: wanjiku@farmer.com / password123')
  console.log('  Buyer:  peter@buyer.com / password123')
  console.log('  Buyer:  amina@buyer.com / password123')
  console.log('  Worker: david@worker.com / password123')
  console.log('  Worker: grace@worker.com / password123')

  await prisma.$disconnect()
}

main()
  .catch(console.error)
