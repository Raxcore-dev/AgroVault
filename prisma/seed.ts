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

  // Clear existing data
  await prisma.message.deleteMany()
  await prisma.product.deleteMany()
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

  console.log('\n🎉 Seeding complete! Demo accounts:')
  console.log('  Farmer: john@farmer.com / password123')
  console.log('  Farmer: wanjiku@farmer.com / password123')
  console.log('  Buyer:  peter@buyer.com / password123')
  console.log('  Buyer:  amina@buyer.com / password123')

  await prisma.$disconnect()
}

main()
  .catch(console.error)
