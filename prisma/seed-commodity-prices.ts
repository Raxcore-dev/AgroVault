/**
 * Seed Database with Commodity Prices
 * 
 * Populates the CommodityPrice table with initial data for all 47 Kenyan counties.
 * This data serves as the baseline that admins can update through the admin panel.
 * 
 * Run with: npm run db:seed
 */

import { prisma } from '@/lib/prisma'

// Commodity price data for all 47 Kenyan counties
// Prices are in KES per kg (and per 90kg bag where applicable)
// Data based on typical Kenyan agricultural market prices
const COMMODITY_PRICES = [
  // Coast Region
  { county: 'Mombasa', prices: [
    { commodity: 'maize', pricePerKg: 52, pricePerBag: 4680, demandLevel: 'high', priceTrend: 'increasing' },
    { commodity: 'beans', pricePerKg: 115, pricePerBag: 10350, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'rice', pricePerKg: 145, pricePerBag: 13050, demandLevel: 'medium', priceTrend: 'stable' },
    { commodity: 'wheat', pricePerKg: 65, pricePerBag: 5850, demandLevel: 'medium', priceTrend: 'stable' },
    { commodity: 'millet', pricePerKg: 85, pricePerBag: 7650, demandLevel: 'low', priceTrend: 'stable' },
    { commodity: 'sorghum', pricePerKg: 75, pricePerBag: 6750, demandLevel: 'low', priceTrend: 'stable' },
  ]},
  { county: 'Kwale', prices: [
    { commodity: 'maize', pricePerKg: 48, pricePerBag: 4320, demandLevel: 'medium', priceTrend: 'stable' },
    { commodity: 'beans', pricePerKg: 105, pricePerBag: 9450, demandLevel: 'medium', priceTrend: 'increasing' },
    { commodity: 'cassava', pricePerKg: 35, pricePerBag: 3150, demandLevel: 'low', priceTrend: 'stable' },
    { commodity: 'mangoes', pricePerKg: 65, pricePerBag: 5850, demandLevel: 'high', priceTrend: 'increasing' },
  ]},
  { county: 'Kilifi', prices: [
    { commodity: 'maize', pricePerKg: 50, pricePerBag: 4500, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'beans', pricePerKg: 110, pricePerBag: 9900, demandLevel: 'medium', priceTrend: 'increasing' },
    { commodity: 'cashews', pricePerKg: 180, pricePerBag: 16200, demandLevel: 'high', priceTrend: 'increasing' },
    { commodity: 'coconuts', pricePerKg: 55, pricePerBag: 4950, demandLevel: 'medium', priceTrend: 'stable' },
  ]},
  { county: 'Tana River', prices: [
    { commodity: 'maize', pricePerKg: 55, pricePerBag: 4950, demandLevel: 'high', priceTrend: 'increasing' },
    { commodity: 'beans', pricePerKg: 120, pricePerBag: 10800, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'millet', pricePerKg: 90, pricePerBag: 8100, demandLevel: 'medium', priceTrend: 'stable' },
  ]},
  { county: 'Lamu', prices: [
    { commodity: 'maize', pricePerKg: 58, pricePerBag: 5220, demandLevel: 'medium', priceTrend: 'stable' },
    { commodity: 'beans', pricePerKg: 125, pricePerBag: 11250, demandLevel: 'medium', priceTrend: 'stable' },
    { commodity: 'fish', pricePerKg: 250, pricePerBag: 22500, demandLevel: 'high', priceTrend: 'increasing' },
  ]},
  { county: 'Taita Taveta', prices: [
    { commodity: 'maize', pricePerKg: 46, pricePerBag: 4140, demandLevel: 'medium', priceTrend: 'stable' },
    { commodity: 'beans', pricePerKg: 100, pricePerBag: 9000, demandLevel: 'medium', priceTrend: 'stable' },
    { commodity: 'tomatoes', pricePerKg: 80, pricePerBag: 7200, demandLevel: 'high', priceTrend: 'decreasing' },
    { commodity: 'onions', pricePerKg: 95, pricePerBag: 8550, demandLevel: 'high', priceTrend: 'stable' },
  ]},

  // North Eastern Region
  { county: 'Garissa', prices: [
    { commodity: 'maize', pricePerKg: 60, pricePerBag: 5400, demandLevel: 'high', priceTrend: 'increasing' },
    { commodity: 'beans', pricePerKg: 130, pricePerBag: 11700, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'millet', pricePerKg: 95, pricePerBag: 8550, demandLevel: 'medium', priceTrend: 'stable' },
  ]},
  { county: 'Wajir', prices: [
    { commodity: 'maize', pricePerKg: 62, pricePerBag: 5580, demandLevel: 'high', priceTrend: 'increasing' },
    { commodity: 'beans', pricePerKg: 135, pricePerBag: 12150, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'sorghum', pricePerKg: 85, pricePerBag: 7650, demandLevel: 'medium', priceTrend: 'stable' },
  ]},
  { county: 'Mandera', prices: [
    { commodity: 'maize', pricePerKg: 65, pricePerBag: 5850, demandLevel: 'high', priceTrend: 'increasing' },
    { commodity: 'beans', pricePerKg: 140, pricePerBag: 12600, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'millet', pricePerKg: 100, pricePerBag: 9000, demandLevel: 'medium', priceTrend: 'stable' },
  ]},

  // Eastern Region
  { county: 'Machakos', prices: [
    { commodity: 'maize', pricePerKg: 45, pricePerBag: 4050, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'beans', pricePerKg: 95, pricePerBag: 8550, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'millet', pricePerKg: 80, pricePerBag: 7200, demandLevel: 'medium', priceTrend: 'stable' },
    { commodity: 'sorghum', pricePerKg: 70, pricePerBag: 6300, demandLevel: 'medium', priceTrend: 'stable' },
    { commodity: 'green grams', pricePerKg: 150, pricePerBag: 13500, demandLevel: 'high', priceTrend: 'increasing' },
  ]},
  { county: 'Makueni', prices: [
    { commodity: 'maize', pricePerKg: 44, pricePerBag: 3960, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'beans', pricePerKg: 90, pricePerBag: 8100, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'millet', pricePerKg: 75, pricePerBag: 6750, demandLevel: 'medium', priceTrend: 'stable' },
    { commodity: 'mangoes', pricePerKg: 50, pricePerBag: 4500, demandLevel: 'high', priceTrend: 'seasonal' },
  ]},
  { county: 'Kitui', prices: [
    { commodity: 'maize', pricePerKg: 48, pricePerBag: 4320, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'beans', pricePerKg: 100, pricePerBag: 9000, demandLevel: 'high', priceTrend: 'increasing' },
    { commodity: 'millet', pricePerKg: 85, pricePerBag: 7650, demandLevel: 'medium', priceTrend: 'stable' },
    { commodity: 'sorghum', pricePerKg: 75, pricePerBag: 6750, demandLevel: 'medium', priceTrend: 'stable' },
  ]},
  { county: 'Embu', prices: [
    { commodity: 'maize', pricePerKg: 42, pricePerBag: 3780, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'beans', pricePerKg: 85, pricePerBag: 7650, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'coffee', pricePerKg: 350, pricePerBag: 31500, demandLevel: 'high', priceTrend: 'increasing' },
    { commodity: 'tea', pricePerKg: 120, pricePerBag: 10800, demandLevel: 'medium', priceTrend: 'stable' },
    { commodity: 'miraa', pricePerKg: 800, pricePerBag: 72000, demandLevel: 'high', priceTrend: 'stable' },
  ]},
  { county: 'Meru', prices: [
    { commodity: 'maize', pricePerKg: 40, pricePerBag: 3600, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'beans', pricePerKg: 80, pricePerBag: 7200, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'coffee', pricePerKg: 340, pricePerBag: 30600, demandLevel: 'high', priceTrend: 'increasing' },
    { commodity: 'tea', pricePerKg: 115, pricePerBag: 10350, demandLevel: 'medium', priceTrend: 'stable' },
    { commodity: 'bananas', pricePerKg: 60, pricePerBag: 5400, demandLevel: 'high', priceTrend: 'stable' },
  ]},
  { county: 'Tharaka Nithi', prices: [
    { commodity: 'maize', pricePerKg: 43, pricePerBag: 3870, demandLevel: 'medium', priceTrend: 'stable' },
    { commodity: 'beans', pricePerKg: 88, pricePerBag: 7920, demandLevel: 'medium', priceTrend: 'stable' },
    { commodity: 'millet', pricePerKg: 78, pricePerBag: 7020, demandLevel: 'low', priceTrend: 'stable' },
  ]},

  // Central Region
  { county: 'Nyeri', prices: [
    { commodity: 'maize', pricePerKg: 41, pricePerBag: 3690, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'beans', pricePerKg: 82, pricePerBag: 7380, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'coffee', pricePerKg: 360, pricePerBag: 32400, demandLevel: 'high', priceTrend: 'increasing' },
    { commodity: 'tea', pricePerKg: 125, pricePerBag: 11250, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'potatoes', pricePerKg: 45, pricePerBag: 4050, demandLevel: 'high', priceTrend: 'stable' },
  ]},
  { county: 'Kirinyaga', prices: [
    { commodity: 'maize', pricePerKg: 42, pricePerBag: 3780, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'beans', pricePerKg: 85, pricePerBag: 7650, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'rice', pricePerKg: 130, pricePerBag: 11700, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'coffee', pricePerKg: 355, pricePerBag: 31950, demandLevel: 'high', priceTrend: 'increasing' },
  ]},
  { county: 'Murang\'a', prices: [
    { commodity: 'maize', pricePerKg: 43, pricePerBag: 3870, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'beans', pricePerKg: 87, pricePerBag: 7830, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'coffee', pricePerKg: 350, pricePerBag: 31500, demandLevel: 'high', priceTrend: 'increasing' },
    { commodity: 'tea', pricePerKg: 118, pricePerBag: 10620, demandLevel: 'medium', priceTrend: 'stable' },
  ]},
  { county: 'Kiambu', prices: [
    { commodity: 'maize', pricePerKg: 45, pricePerBag: 4050, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'beans', pricePerKg: 90, pricePerBag: 8100, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'coffee', pricePerKg: 345, pricePerBag: 31050, demandLevel: 'medium', priceTrend: 'stable' },
    { commodity: 'tea', pricePerKg: 115, pricePerBag: 10350, demandLevel: 'medium', priceTrend: 'stable' },
    { commodity: 'vegetables', pricePerKg: 80, pricePerBag: 7200, demandLevel: 'high', priceTrend: 'stable' },
  ]},
  { county: 'Nyandarua', prices: [
    { commodity: 'maize', pricePerKg: 38, pricePerBag: 3420, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'beans', pricePerKg: 75, pricePerBag: 6750, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'potatoes', pricePerKg: 40, pricePerBag: 3600, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'wheat', pricePerKg: 60, pricePerBag: 5400, demandLevel: 'medium', priceTrend: 'stable' },
    { commodity: 'barley', pricePerKg: 55, pricePerBag: 4950, demandLevel: 'medium', priceTrend: 'stable' },
  ]},

  // Rift Valley Region
  { county: 'Turkana', prices: [
    { commodity: 'maize', pricePerKg: 68, pricePerBag: 6120, demandLevel: 'high', priceTrend: 'increasing' },
    { commodity: 'beans', pricePerKg: 145, pricePerBag: 13050, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'sorghum', pricePerKg: 90, pricePerBag: 8100, demandLevel: 'medium', priceTrend: 'stable' },
    { commodity: 'millet', pricePerKg: 95, pricePerBag: 8550, demandLevel: 'medium', priceTrend: 'stable' },
  ]},
  { county: 'West Pokot', prices: [
    { commodity: 'maize', pricePerKg: 50, pricePerBag: 4500, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'beans', pricePerKg: 105, pricePerBag: 9450, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'millet', pricePerKg: 85, pricePerBag: 7650, demandLevel: 'medium', priceTrend: 'stable' },
    { commodity: 'sorghum', pricePerKg: 78, pricePerBag: 7020, demandLevel: 'medium', priceTrend: 'stable' },
  ]},
  { county: 'Samburu', prices: [
    { commodity: 'maize', pricePerKg: 65, pricePerBag: 5850, demandLevel: 'high', priceTrend: 'increasing' },
    { commodity: 'beans', pricePerKg: 140, pricePerBag: 12600, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'millet', pricePerKg: 92, pricePerBag: 8280, demandLevel: 'medium', priceTrend: 'stable' },
  ]},
  { county: 'Trans Nzoia', prices: [
    { commodity: 'maize', pricePerKg: 35, pricePerBag: 3150, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'beans', pricePerKg: 70, pricePerBag: 6300, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'wheat', pricePerKg: 55, pricePerBag: 4950, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'sunflower', pricePerKg: 65, pricePerBag: 5850, demandLevel: 'medium', priceTrend: 'increasing' },
  ]},
  { county: 'Uasin Gishu', prices: [
    { commodity: 'maize', pricePerKg: 36, pricePerBag: 3240, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'beans', pricePerKg: 72, pricePerBag: 6480, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'wheat', pricePerKg: 56, pricePerBag: 5040, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'barley', pricePerKg: 52, pricePerBag: 4680, demandLevel: 'medium', priceTrend: 'stable' },
  ]},
  { county: 'Elgeyo Marakwet', prices: [
    { commodity: 'maize', pricePerKg: 38, pricePerBag: 3420, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'beans', pricePerKg: 78, pricePerBag: 7020, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'potatoes', pricePerKg: 42, pricePerBag: 3780, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'wheat', pricePerKg: 58, pricePerBag: 5220, demandLevel: 'medium', priceTrend: 'stable' },
  ]},
  { county: 'Nandi', prices: [
    { commodity: 'maize', pricePerKg: 37, pricePerBag: 3330, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'beans', pricePerKg: 75, pricePerBag: 6750, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'tea', pricePerKg: 110, pricePerBag: 9900, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'coffee', pricePerKg: 330, pricePerBag: 29700, demandLevel: 'medium', priceTrend: 'stable' },
  ]},
  { county: 'Baringo', prices: [
    { commodity: 'maize', pricePerKg: 48, pricePerBag: 4320, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'beans', pricePerKg: 98, pricePerBag: 8820, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'millet', pricePerKg: 82, pricePerBag: 7380, demandLevel: 'medium', priceTrend: 'stable' },
    { commodity: 'sorghum', pricePerKg: 75, pricePerBag: 6750, demandLevel: 'medium', priceTrend: 'stable' },
  ]},
  { county: 'Laikipia', prices: [
    { commodity: 'maize', pricePerKg: 40, pricePerBag: 3600, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'beans', pricePerKg: 82, pricePerBag: 7380, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'wheat', pricePerKg: 58, pricePerBag: 5220, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'barley', pricePerKg: 54, pricePerBag: 4860, demandLevel: 'medium', priceTrend: 'stable' },
    { commodity: 'peas', pricePerKg: 90, pricePerBag: 8100, demandLevel: 'medium', priceTrend: 'stable' },
  ]},
  { county: 'Nakuru', prices: [
    { commodity: 'maize', pricePerKg: 39, pricePerBag: 3510, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'beans', pricePerKg: 80, pricePerBag: 7200, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'wheat', pricePerKg: 57, pricePerBag: 5130, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'potatoes', pricePerKg: 43, pricePerBag: 3870, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'tomatoes', pricePerKg: 70, pricePerBag: 6300, demandLevel: 'high', priceTrend: 'decreasing' },
    { commodity: 'onions', pricePerKg: 85, pricePerBag: 7650, demandLevel: 'high', priceTrend: 'stable' },
  ]},
  { county: 'Narok', prices: [
    { commodity: 'maize', pricePerKg: 38, pricePerBag: 3420, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'beans', pricePerKg: 78, pricePerBag: 7020, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'wheat', pricePerKg: 56, pricePerBag: 5040, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'barley', pricePerKg: 53, pricePerBag: 4770, demandLevel: 'medium', priceTrend: 'stable' },
  ]},
  { county: 'Kajiado', prices: [
    { commodity: 'maize', pricePerKg: 44, pricePerBag: 3960, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'beans', pricePerKg: 90, pricePerBag: 8100, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'millet', pricePerKg: 80, pricePerBag: 7200, demandLevel: 'medium', priceTrend: 'stable' },
    { commodity: 'sorghum', pricePerKg: 72, pricePerBag: 6480, demandLevel: 'medium', priceTrend: 'stable' },
  ]},
  { county: 'Kericho', prices: [
    { commodity: 'maize', pricePerKg: 37, pricePerBag: 3330, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'beans', pricePerKg: 76, pricePerBag: 6840, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'tea', pricePerKg: 115, pricePerBag: 10350, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'coffee', pricePerKg: 335, pricePerBag: 30150, demandLevel: 'medium', priceTrend: 'stable' },
    { commodity: 'pyrethrum', pricePerKg: 180, pricePerBag: 16200, demandLevel: 'medium', priceTrend: 'stable' },
  ]},
  { county: 'Bomet', prices: [
    { commodity: 'maize', pricePerKg: 36, pricePerBag: 3240, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'beans', pricePerKg: 74, pricePerBag: 6660, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'tea', pricePerKg: 112, pricePerBag: 10080, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'millet', pricePerKg: 78, pricePerBag: 7020, demandLevel: 'low', priceTrend: 'stable' },
  ]},

  // Western Region
  { county: 'Kakamega', prices: [
    { commodity: 'maize', pricePerKg: 40, pricePerBag: 3600, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'beans', pricePerKg: 82, pricePerBag: 7380, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'sorghum', pricePerKg: 70, pricePerBag: 6300, demandLevel: 'medium', priceTrend: 'stable' },
    { commodity: 'millet', pricePerKg: 75, pricePerBag: 6750, demandLevel: 'low', priceTrend: 'stable' },
    { commodity: 'cassava', pricePerKg: 38, pricePerBag: 3420, demandLevel: 'low', priceTrend: 'stable' },
  ]},
  { county: 'Vihiga', prices: [
    { commodity: 'maize', pricePerKg: 42, pricePerBag: 3780, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'beans', pricePerKg: 85, pricePerBag: 7650, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'sorghum', pricePerKg: 72, pricePerBag: 6480, demandLevel: 'medium', priceTrend: 'stable' },
    { commodity: 'vegetables', pricePerKg: 60, pricePerBag: 5400, demandLevel: 'high', priceTrend: 'stable' },
  ]},
  { county: 'Busia', prices: [
    { commodity: 'maize', pricePerKg: 41, pricePerBag: 3690, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'beans', pricePerKg: 83, pricePerBag: 7470, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'cassava', pricePerKg: 40, pricePerBag: 3600, demandLevel: 'medium', priceTrend: 'stable' },
    { commodity: 'sweet potatoes', pricePerKg: 45, pricePerBag: 4050, demandLevel: 'medium', priceTrend: 'stable' },
  ]},
  { county: 'Bungoma', prices: [
    { commodity: 'maize', pricePerKg: 39, pricePerBag: 3510, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'beans', pricePerKg: 80, pricePerBag: 7200, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'wheat', pricePerKg: 55, pricePerBag: 4950, demandLevel: 'medium', priceTrend: 'stable' },
    { commodity: 'sorghum', pricePerKg: 68, pricePerBag: 6120, demandLevel: 'low', priceTrend: 'stable' },
    { commodity: 'sugar cane', pricePerKg: 12, pricePerBag: 1080, demandLevel: 'high', priceTrend: 'stable' },
  ]},

  // Eastern Region (New)
  { county: 'Siaya', prices: [
    { commodity: 'maize', pricePerKg: 43, pricePerBag: 3870, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'beans', pricePerKg: 88, pricePerBag: 7920, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'sorghum', pricePerKg: 73, pricePerBag: 6570, demandLevel: 'medium', priceTrend: 'stable' },
    { commodity: 'millet', pricePerKg: 78, pricePerBag: 7020, demandLevel: 'low', priceTrend: 'stable' },
    { commodity: 'fish', pricePerKg: 280, pricePerBag: 25200, demandLevel: 'high', priceTrend: 'increasing' },
  ]},
  { county: 'Kisumu', prices: [
    { commodity: 'maize', pricePerKg: 44, pricePerBag: 3960, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'beans', pricePerKg: 90, pricePerBag: 8100, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'rice', pricePerKg: 135, pricePerBag: 12150, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'fish', pricePerKg: 300, pricePerBag: 27000, demandLevel: 'high', priceTrend: 'increasing' },
    { commodity: 'sorghum', pricePerKg: 75, pricePerBag: 6750, demandLevel: 'medium', priceTrend: 'stable' },
  ]},
  { county: 'Homa Bay', prices: [
    { commodity: 'maize', pricePerKg: 42, pricePerBag: 3780, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'beans', pricePerKg: 86, pricePerBag: 7740, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'millet', pricePerKg: 76, pricePerBag: 6840, demandLevel: 'medium', priceTrend: 'stable' },
    { commodity: 'sorghum', pricePerKg: 72, pricePerBag: 6480, demandLevel: 'medium', priceTrend: 'stable' },
    { commodity: 'fish', pricePerKg: 270, pricePerBag: 24300, demandLevel: 'high', priceTrend: 'stable' },
  ]},
  { county: 'Migori', prices: [
    { commodity: 'maize', pricePerKg: 41, pricePerBag: 3690, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'beans', pricePerKg: 84, pricePerBag: 7560, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'sorghum', pricePerKg: 71, pricePerBag: 6390, demandLevel: 'medium', priceTrend: 'stable' },
    { commodity: 'millet', pricePerKg: 77, pricePerBag: 6930, demandLevel: 'low', priceTrend: 'stable' },
  ]},
  { county: 'Kisii', prices: [
    { commodity: 'maize', pricePerKg: 43, pricePerBag: 3870, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'beans', pricePerKg: 88, pricePerBag: 7920, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'bananas', pricePerKg: 55, pricePerBag: 4950, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'avocados', pricePerKg: 80, pricePerBag: 7200, demandLevel: 'high', priceTrend: 'increasing' },
    { commodity: 'tea', pricePerKg: 108, pricePerBag: 9720, demandLevel: 'medium', priceTrend: 'stable' },
  ]},
  { county: 'Nyamira', prices: [
    { commodity: 'maize', pricePerKg: 42, pricePerBag: 3780, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'beans', pricePerKg: 86, pricePerBag: 7740, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'bananas', pricePerKg: 52, pricePerBag: 4680, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'tea', pricePerKg: 105, pricePerBag: 9450, demandLevel: 'medium', priceTrend: 'stable' },
  ]},

  // Nairobi Region
  { county: 'Nairobi', prices: [
    { commodity: 'maize', pricePerKg: 48, pricePerBag: 4320, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'beans', pricePerKg: 95, pricePerBag: 8550, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'rice', pricePerKg: 150, pricePerBag: 13500, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'wheat', pricePerKg: 62, pricePerBag: 5580, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'potatoes', pricePerKg: 50, pricePerBag: 4500, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'tomatoes', pricePerKg: 90, pricePerBag: 8100, demandLevel: 'high', priceTrend: 'fluctuating' },
    { commodity: 'onions', pricePerKg: 100, pricePerBag: 9000, demandLevel: 'high', priceTrend: 'stable' },
    { commodity: 'cabbages', pricePerKg: 55, pricePerBag: 4950, demandLevel: 'high', priceTrend: 'stable' },
  ]},
]

async function main() {
  console.log('🌱 Starting commodity price seed...')

  let totalCreated = 0
  let totalUpdated = 0

  for (const countyData of COMMODITY_PRICES) {
    console.log(`\n📍 Processing ${countyData.county}...`)
    
    for (const priceData of countyData.prices) {
      try {
        // Check if price already exists
        const existing = await prisma.commodityPrice.findUnique({
          where: {
            county_commodity: {
              county: countyData.county,
              commodity: priceData.commodity,
            },
          },
        })

        if (existing) {
          // Update existing price
          await prisma.commodityPrice.update({
            where: {
              county_commodity: {
                county: countyData.county,
                commodity: priceData.commodity,
              },
            },
            data: {
              pricePerKg: priceData.pricePerKg,
              pricePerBag: priceData.pricePerBag,
              previousPrice: existing.pricePerKg,
              priceTrend: priceData.priceTrend,
              demandLevel: priceData.demandLevel,
              lastUpdated: new Date(),
            },
          })
          totalUpdated++
          console.log(`  ✏️  Updated: ${priceData.commodity} - KES ${priceData.pricePerKg}/kg`)
        } else {
          // Create new price
          await prisma.commodityPrice.create({
            data: {
              county: countyData.county,
              commodity: priceData.commodity,
              pricePerKg: priceData.pricePerKg,
              pricePerBag: priceData.pricePerBag,
              priceTrend: priceData.priceTrend,
              demandLevel: priceData.demandLevel,
              unit: 'kg',
              isActive: true,
              source: 'seed',
            },
          })
          totalCreated++
          console.log(`  ✅ Created: ${priceData.commodity} - KES ${priceData.pricePerKg}/kg`)
        }
      } catch (error) {
        console.error(`  ❌ Error processing ${priceData.commodity} in ${countyData.county}:`, error)
      }
    }
  }

  console.log('\n✅ Seed completed!')
  console.log(`📊 Total created: ${totalCreated}`)
  console.log(`📊 Total updated: ${totalUpdated}`)
  console.log(`📊 Total records: ${totalCreated + totalUpdated}`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
