/**
 * Seed Commodity Prices - Browser Console Script
 * 
 * Run this in your browser console while logged in as admin:
 * 1. Go to http://localhost:3000
 * 2. Log in as admin
 * 3. Open browser console (F12)
 * 4. Paste this script and press Enter
 */

(async function seedCommodityPrices() {
  console.log('🌱 Starting commodity price seed...')
  
  const SAMPLE_PRICES = [
    { county: 'Trans Nzoia', commodity: 'maize', pricePerKg: 35, pricePerBag: 3150, demandLevel: 'high', priceTrend: 'stable' },
    { county: 'Uasin Gishu', commodity: 'maize', pricePerKg: 36, pricePerBag: 3240, demandLevel: 'high', priceTrend: 'stable' },
    { county: 'Nakuru', commodity: 'maize', pricePerKg: 39, pricePerBag: 3510, demandLevel: 'high', priceTrend: 'stable' },
    { county: 'Narok', commodity: 'maize', pricePerKg: 38, pricePerBag: 3420, demandLevel: 'high', priceTrend: 'stable' },
    { county: 'Kisumu', commodity: 'maize', pricePerKg: 44, pricePerBag: 3960, demandLevel: 'high', priceTrend: 'stable' },
    { county: 'Mombasa', commodity: 'maize', pricePerKg: 52, pricePerBag: 4680, demandLevel: 'high', priceTrend: 'increasing' },
    { county: 'Nairobi', commodity: 'maize', pricePerKg: 48, pricePerBag: 4320, demandLevel: 'high', priceTrend: 'stable' },
    { county: 'Trans Nzoia', commodity: 'beans', pricePerKg: 70, pricePerBag: 6300, demandLevel: 'high', priceTrend: 'stable' },
    { county: 'Uasin Gishu', commodity: 'beans', pricePerKg: 72, pricePerBag: 6480, demandLevel: 'high', priceTrend: 'stable' },
    { county: 'Nakuru', commodity: 'beans', pricePerKg: 80, pricePerBag: 7200, demandLevel: 'high', priceTrend: 'stable' },
    { county: 'Kisumu', commodity: 'beans', pricePerKg: 90, pricePerBag: 8100, demandLevel: 'high', priceTrend: 'stable' },
    { county: 'Mombasa', commodity: 'beans', pricePerKg: 115, pricePerBag: 10350, demandLevel: 'high', priceTrend: 'stable' },
    { county: 'Nairobi', commodity: 'beans', pricePerKg: 95, pricePerBag: 8550, demandLevel: 'high', priceTrend: 'stable' },
    { county: 'Trans Nzoia', commodity: 'wheat', pricePerKg: 55, pricePerBag: 4950, demandLevel: 'high', priceTrend: 'stable' },
    { county: 'Uasin Gishu', commodity: 'wheat', pricePerKg: 56, pricePerBag: 5040, demandLevel: 'high', priceTrend: 'stable' },
    { county: 'Nakuru', commodity: 'wheat', pricePerKg: 57, pricePerBag: 5130, demandLevel: 'high', priceTrend: 'stable' },
    { county: 'Narok', commodity: 'wheat', pricePerKg: 56, pricePerBag: 5040, demandLevel: 'high', priceTrend: 'stable' },
    { county: 'Nairobi', commodity: 'wheat', pricePerKg: 62, pricePerBag: 5580, demandLevel: 'high', priceTrend: 'stable' },
    { county: 'Kisumu', commodity: 'rice', pricePerKg: 135, pricePerBag: 12150, demandLevel: 'high', priceTrend: 'stable' },
    { county: 'Mombasa', commodity: 'rice', pricePerKg: 145, pricePerBag: 13050, demandLevel: 'high', priceTrend: 'stable' },
    { county: 'Nairobi', commodity: 'rice', pricePerKg: 150, pricePerBag: 13500, demandLevel: 'high', priceTrend: 'stable' },
    { county: 'Nyeri', commodity: 'coffee', pricePerKg: 360, pricePerBag: 32400, demandLevel: 'high', priceTrend: 'increasing' },
    { county: 'Kiambu', commodity: 'coffee', pricePerKg: 345, pricePerBag: 31050, demandLevel: 'medium', priceTrend: 'stable' },
    { county: 'Kericho', commodity: 'tea', pricePerKg: 115, pricePerBag: 10350, demandLevel: 'high', priceTrend: 'stable' },
    { county: 'Nandi', commodity: 'tea', pricePerKg: 110, pricePerBag: 9900, demandLevel: 'high', priceTrend: 'stable' },
    { county: 'Nakuru', commodity: 'tomatoes', pricePerKg: 70, pricePerBag: 6300, demandLevel: 'high', priceTrend: 'decreasing' },
    { county: 'Nakuru', commodity: 'onions', pricePerKg: 85, pricePerBag: 7650, demandLevel: 'high', priceTrend: 'stable' },
    { county: 'Nairobi', commodity: 'tomatoes', pricePerKg: 90, pricePerBag: 8100, demandLevel: 'high', priceTrend: 'fluctuating' },
    { county: 'Nairobi', commodity: 'onions', pricePerKg: 100, pricePerBag: 9000, demandLevel: 'high', priceTrend: 'stable' },
    { county: 'Nairobi', commodity: 'cabbages', pricePerKg: 55, pricePerBag: 4950, demandLevel: 'high', priceTrend: 'stable' },
    { county: 'Kisumu', commodity: 'fish', pricePerKg: 300, pricePerBag: 27000, demandLevel: 'high', priceTrend: 'increasing' },
    { county: 'Siaya', commodity: 'fish', pricePerKg: 280, pricePerBag: 25200, demandLevel: 'high', priceTrend: 'increasing' },
    { county: 'Homa Bay', commodity: 'fish', pricePerKg: 270, pricePerBag: 24300, demandLevel: 'high', priceTrend: 'stable' },
  ]

  let success = 0
  let failed = 0

  for (const data of SAMPLE_PRICES) {
    try {
      const response = await fetch('/api/admin/commodity-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        console.log(`✅ ${data.commodity} in ${data.county}: KES ${data.pricePerKg}/kg`)
        success++
      } else {
        console.error(`❌ Failed: ${data.commodity} in ${data.county}`)
        failed++
      }
    } catch (error) {
      console.error(`❌ Error: ${data.commodity} in ${data.county}`, error)
      failed++
    }
  }

  console.log('\n✅ Seed completed!')
  console.log(`📊 Success: ${success}`)
  console.log(`📊 Failed: ${failed}`)
  console.log(`📊 Total: ${success + failed}`)
  
  // Verify
  const checkResponse = await fetch('/api/commodity-prices')
  const data = await checkResponse.json()
  console.log(`\n📊 Total records in database: ${data.total}`)
})()
