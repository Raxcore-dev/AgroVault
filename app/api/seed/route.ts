/**
 * Database Seed API Route
 *
 * POST /api/seed
 *
 * Populates the database with demo data for testing:
 *   - 2 farmers and 2 buyers
 *   - 10 sample products across Kenyan counties
 *   - Sample chat messages
 *   - Market data for all Kenyan counties
 *
 * Usage: curl -X POST http://localhost:3000/api/seed
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { KENYA_COUNTIES_MARKETS } from '@/lib/data/kenya-counties-markets'

export async function POST() {
  try {
    // Clear existing data (order matters for foreign key constraints)
    await prisma.message.deleteMany()
    await prisma.product.deleteMany()
    await prisma.user.deleteMany()

    const passwordHash = await hashPassword('password123')

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

    // ─── Seed Market Data ───
    console.log('🌱 Seeding market data...')
    await prisma.market.deleteMany()
    
    const marketsToCreate = []
    for (const countyData of KENYA_COUNTIES_MARKETS) {
      for (const market of countyData.markets) {
        for (const commodity of countyData.commodities) {
          marketsToCreate.push({
            marketName: market.name,
            location: countyData.county,
            commodity: commodity.commodity.toLowerCase(),
            pricePerKg: commodity.pricePerKg,
            previousPricePerKg: commodity.pricePerKg * 0.95,
            demandLevel: commodity.demandLevel,
            priceTrend: commodity.priceTrend === 'increasing' ? 'increasing' : commodity.priceTrend === 'decreasing' ? 'decreasing' : 'stable',
            latitude: market.latitude,
            longitude: market.longitude,
            lastUpdated: new Date(),
          })
        }
      }
    }

    // Create markets in batches
    const batchSize = 100
    for (let i = 0; i < marketsToCreate.length; i += batchSize) {
      const batch = marketsToCreate.slice(i, batchSize)
      await prisma.market.createMany({ data: batch })
    }
    console.log(`✅ Seeded ${marketsToCreate.length} markets`)

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      data: {
        users: 4,
        products: products.length,
        messages: 4,
        markets: marketsToCreate.length,
      },
      accounts: [
        { email: 'john@farmer.com', password: 'password123', role: 'farmer' },
        { email: 'wanjiku@farmer.com', password: 'password123', role: 'farmer' },
        { email: 'peter@buyer.com', password: 'password123', role: 'buyer' },
        { email: 'amina@buyer.com', password: 'password123', role: 'buyer' },
      ],
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
