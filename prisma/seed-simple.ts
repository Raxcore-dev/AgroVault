/**
 * Seed Database with Commodity Prices - Simple Version
 * 
 * Run with: npx tsx prisma/seed-simple.ts
 */

import { prisma } from '@/lib/prisma'

// Sample data for key counties and commodities
const SAMPLE_PRICES = [
  // Major maize growing areas
  { county: 'Trans Nzoia', commodity: 'maize', pricePerKg: 35, pricePerBag: 3150, demandLevel: 'high', priceTrend: 'stable' },
  { county: 'Uasin Gishu', commodity: 'maize', pricePerKg: 36, pricePerBag: 3240, demandLevel: 'high', priceTrend: 'stable' },
  { county: 'Nakuru', commodity: 'maize', pricePerKg: 39, pricePerBag: 3510, demandLevel: 'high', priceTrend: 'stable' },
  { county: 'Narok', commodity: 'maize', pricePerKg: 38, pricePerBag: 3420, demandLevel: 'high', priceTrend: 'stable' },
  { county: 'Kisumu', commodity: 'maize', pricePerKg: 44, pricePerBag: 3960, demandLevel: 'high', priceTrend: 'stable' },
  { county: 'Mombasa', commodity: 'maize', pricePerKg: 52, pricePerBag: 4680, demandLevel: 'high', priceTrend: 'increasing' },
  { county: 'Nairobi', commodity: 'maize', pricePerKg: 48, pricePerBag: 4320, demandLevel: 'high', priceTrend: 'stable' },
  
  // Beans prices
  { county: 'Trans Nzoia', commodity: 'beans', pricePerKg: 70, pricePerBag: 6300, demandLevel: 'high', priceTrend: 'stable' },
  { county: 'Uasin Gishu', commodity: 'beans', pricePerKg: 72, pricePerBag: 6480, demandLevel: 'high', priceTrend: 'stable' },
  { county: 'Nakuru', commodity: 'beans', pricePerKg: 80, pricePerBag: 7200, demandLevel: 'high', priceTrend: 'stable' },
  { county: 'Kisumu', commodity: 'beans', pricePerKg: 90, pricePerBag: 8100, demandLevel: 'high', priceTrend: 'stable' },
  { county: 'Mombasa', commodity: 'beans', pricePerKg: 115, pricePerBag: 10350, demandLevel: 'high', priceTrend: 'stable' },
  { county: 'Nairobi', commodity: 'beans', pricePerKg: 95, pricePerBag: 8550, demandLevel: 'high', priceTrend: 'stable' },
  
  // Wheat prices
  { county: 'Trans Nzoia', commodity: 'wheat', pricePerKg: 55, pricePerBag: 4950, demandLevel: 'high', priceTrend: 'stable' },
  { county: 'Uasin Gishu', commodity: 'wheat', pricePerKg: 56, pricePerBag: 5040, demandLevel: 'high', priceTrend: 'stable' },
  { county: 'Nakuru', commodity: 'wheat', pricePerKg: 57, pricePerBag: 5130, demandLevel: 'high', priceTrend: 'stable' },
  { county: 'Narok', commodity: 'wheat', pricePerKg: 56, pricePerBag: 5040, demandLevel: 'high', priceTrend: 'stable' },
  { county: 'Nairobi', commodity: 'wheat', pricePerKg: 62, pricePerBag: 5580, demandLevel: 'high', priceTrend: 'stable' },
  
  // Rice prices
  { county: 'Kisumu', commodity: 'rice', pricePerKg: 135, pricePerBag: 12150, demandLevel: 'high', priceTrend: 'stable' },
  { county: 'Mombasa', commodity: 'rice', pricePerKg: 145, pricePerBag: 13050, demandLevel: 'high', priceTrend: 'stable' },
  { county: 'Nairobi', commodity: 'rice', pricePerKg: 150, pricePerBag: 13500, demandLevel: 'high', priceTrend: 'stable' },
  
  // Tea and Coffee
  { county: 'Nyeri', commodity: 'coffee', pricePerKg: 360, pricePerBag: 32400, demandLevel: 'high', priceTrend: 'increasing' },
  { county: 'Kiambu', commodity: 'coffee', pricePerKg: 345, pricePerBag: 31050, demandLevel: 'medium', priceTrend: 'stable' },
  { county: 'Kericho', commodity: 'tea', pricePerKg: 115, pricePerBag: 10350, demandLevel: 'high', priceTrend: 'stable' },
  { county: 'Nandi', commodity: 'tea', pricePerKg: 110, pricePerBag: 9900, demandLevel: 'high', priceTrend: 'stable' },
  
  // Vegetables
  { county: 'Nakuru', commodity: 'tomatoes', pricePerKg: 70, pricePerBag: 6300, demandLevel: 'high', priceTrend: 'decreasing' },
  { county: 'Nakuru', commodity: 'onions', pricePerKg: 85, pricePerBag: 7650, demandLevel: 'high', priceTrend: 'stable' },
  { county: 'Nairobi', commodity: 'tomatoes', pricePerKg: 90, pricePerBag: 8100, demandLevel: 'high', priceTrend: 'fluctuating' },
  { county: 'Nairobi', commodity: 'onions', pricePerKg: 100, pricePerBag: 9000, demandLevel: 'high', priceTrend: 'stable' },
  { county: 'Nairobi', commodity: 'cabbages', pricePerKg: 55, pricePerBag: 4950, demandLevel: 'high', priceTrend: 'stable' },
  
  // Fish
  { county: 'Kisumu', commodity: 'fish', pricePerKg: 300, pricePerBag: 27000, demandLevel: 'high', priceTrend: 'increasing' },
  { county: 'Siaya', commodity: 'fish', pricePerKg: 280, pricePerBag: 25200, demandLevel: 'high', priceTrend: 'increasing' },
  { county: 'Homa Bay', commodity: 'fish', pricePerKg: 270, pricePerBag: 24300, demandLevel: 'high', priceTrend: 'stable' },
]

async function main() {
  console.log('🌱 Starting commodity price seed (simple version)...')
  
  let created = 0
  let updated = 0

  try {
    for (const data of SAMPLE_PRICES) {
      try {
        // First, try to find existing record by compound key
        const existing = await prisma.commodityPrice.findUnique({
          where: {
            county_commodity: {
              county: data.county,
              commodity: data.commodity,
            },
          },
        })

        let result
        if (existing) {
          result = await prisma.commodityPrice.update({
            where: {
              county_commodity: {
                county: data.county,
                commodity: data.commodity,
              },
            },
            data: {
              pricePerKg: data.pricePerKg,
              pricePerBag: data.pricePerBag,
              priceTrend: data.priceTrend,
              demandLevel: data.demandLevel,
              lastUpdated: new Date(),
            },
          })
        } else {
          result = await prisma.commodityPrice.create({
            data: {
              county: data.county,
              commodity: data.commodity,
              pricePerKg: data.pricePerKg,
              pricePerBag: data.pricePerBag,
              priceTrend: data.priceTrend,
              demandLevel: data.demandLevel,
              unit: 'kg',
              isActive: true,
              source: 'seed',
            },
          })
        }
        
        if (result) {
          console.log(`  ✅ ${data.commodity} in ${data.county}: KES ${data.pricePerKg}/kg`)
          created++
        }
      } catch (error: any) {
        console.error(`  ❌ Error with ${data.commodity} in ${data.county}:`, error.message)
      }
    }

    console.log('\n✅ Seed completed!')
    console.log(`📊 Total records: ${created + updated}`)
    
    // Verify data
    const count = await prisma.commodityPrice.count()
    console.log(`📊 Total CommodityPrice records in DB: ${count}`)
    
  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  }
}

main()
