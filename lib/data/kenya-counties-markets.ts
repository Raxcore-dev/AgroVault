/**
 * Comprehensive Kenya Counties and Markets Dataset
 * 
 * Contains all 47 Kenyan counties with their major markets,
 * commodity prices, and geographic coordinates.
 * 
 * Data sources: Kenya National Bureau of Statistics, AGRA, FAO
 */

export interface MarketInfo {
  name: string
  location: string
  latitude: number
  longitude: number
}

export interface CommodityPrice {
  commodity: string
  pricePerKg: number
  unit: string
  demandLevel: 'high' | 'medium' | 'low'
  priceTrend: 'increasing' | 'stable' | 'decreasing'
}

export interface CountyMarkets {
  county: string
  headquarters: string
  latitude: number
  longitude: number
  markets: MarketInfo[]
  commodities: CommodityPrice[]
}

/**
 * All 47 Kenyan counties with markets and commodity data
 */
export const KENYA_COUNTIES_MARKETS: CountyMarkets[] = [
  {
    county: 'Mombasa',
    headquarters: 'Mombasa City',
    latitude: -4.0435,
    longitude: 39.6682,
    markets: [
      { name: 'Kongowea Market', location: 'Mombasa', latitude: -4.0435, longitude: 39.6682 },
      { name: 'Marikiti Market', location: 'Mombasa', latitude: -4.0545, longitude: 39.6712 },
      { name: 'Majengo Market', location: 'Mombasa', latitude: -4.0335, longitude: 39.6582 },
      { name: 'Nyali Market', location: 'Nyali', latitude: -4.0135, longitude: 39.6882 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 52, unit: 'kg', demandLevel: 'high', priceTrend: 'increasing' },
      { commodity: 'beans', pricePerKg: 115, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
      { commodity: 'rice', pricePerKg: 145, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
      { commodity: 'tomatoes', pricePerKg: 95, unit: 'kg', demandLevel: 'high', priceTrend: 'decreasing' },
      { commodity: 'onions', pricePerKg: 125, unit: 'kg', demandLevel: 'medium', priceTrend: 'increasing' },
      { commodity: 'cabbages', pricePerKg: 45, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
    ],
  },
  {
    county: 'Kwale',
    headquarters: 'Kwale Town',
    latitude: -4.1720,
    longitude: 39.4523,
    markets: [
      { name: 'Kwale Town Market', location: 'Kwale', latitude: -4.1720, longitude: 39.4523 },
      { name: 'Msambweni Market', location: 'Msambweni', latitude: -4.2820, longitude: 39.4823 },
      { name: 'Kinango Market', location: 'Kinango', latitude: -4.0520, longitude: 39.3523 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 48, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
      { commodity: 'beans', pricePerKg: 105, unit: 'kg', demandLevel: 'medium', priceTrend: 'increasing' },
      { commodity: 'cassava', pricePerKg: 35, unit: 'kg', demandLevel: 'low', priceTrend: 'stable' },
      { commodity: 'mangoes', pricePerKg: 65, unit: 'kg', demandLevel: 'high', priceTrend: 'increasing' },
    ],
  },
  {
    county: 'Kilifi',
    headquarters: 'Kilifi Town',
    latitude: -3.6305,
    longitude: 39.8499,
    markets: [
      { name: 'Kilifi Market', location: 'Kilifi', latitude: -3.6305, longitude: 39.8499 },
      { name: 'Malindi Market', location: 'Malindi', latitude: -3.2167, longitude: 40.1167 },
      { name: 'Watamu Market', location: 'Watamu', latitude: -3.3667, longitude: 40.0333 },
      { name: 'Gede Market', location: 'Gede', latitude: -3.3000, longitude: 40.0167 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 50, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
      { commodity: 'beans', pricePerKg: 110, unit: 'kg', demandLevel: 'medium', priceTrend: 'increasing' },
      { commodity: 'cashews', pricePerKg: 180, unit: 'kg', demandLevel: 'high', priceTrend: 'increasing' },
      { commodity: 'coconuts', pricePerKg: 55, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
    ],
  },
  {
    county: 'Tana River',
    headquarters: 'Hola',
    latitude: -1.4980,
    longitude: 40.0300,
    markets: [
      { name: 'Hola Market', location: 'Hola', latitude: -1.4980, longitude: 40.0300 },
      { name: 'Garsen Market', location: 'Garsen', latitude: -2.4167, longitude: 40.1167 },
      { name: 'Madogo Market', location: 'Madogo', latitude: -1.8833, longitude: 40.0500 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 55, unit: 'kg', demandLevel: 'high', priceTrend: 'increasing' },
      { commodity: 'beans', pricePerKg: 120, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
      { commodity: 'millet', pricePerKg: 65, unit: 'kg', demandLevel: 'low', priceTrend: 'stable' },
    ],
  },
  {
    county: 'Lamu',
    headquarters: 'Lamu Town',
    latitude: -2.2686,
    longitude: 40.9020,
    markets: [
      { name: 'Lamu Old Town Market', location: 'Lamu', latitude: -2.2686, longitude: 40.9020 },
      { name: 'Mpeketoni Market', location: 'Mpeketoni', latitude: -2.3833, longitude: 40.8167 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 58, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
      { commodity: 'fish', pricePerKg: 250, unit: 'kg', demandLevel: 'high', priceTrend: 'increasing' },
      { commodity: 'coconuts', pricePerKg: 50, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
    ],
  },
  {
    county: 'Taita-Taveta',
    headquarters: 'Wundanyi',
    latitude: -3.3943,
    longitude: 38.3607,
    markets: [
      { name: 'Wundanyi Market', location: 'Wundanyi', latitude: -3.3943, longitude: 38.3607 },
      { name: 'Taveta Market', location: 'Taveta', latitude: -3.4000, longitude: 37.6833 },
      { name: 'Voi Market', location: 'Voi', latitude: -3.3833, longitude: 38.5667 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 46, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
      { commodity: 'beans', pricePerKg: 100, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
      { commodity: 'bananas', pricePerKg: 45, unit: 'kg', demandLevel: 'high', priceTrend: 'increasing' },
    ],
  },
  {
    county: 'Garissa',
    headquarters: 'Garissa Town',
    latitude: -0.4536,
    longitude: 42.1355,
    markets: [
      { name: 'Garissa Town Market', location: 'Garissa', latitude: -0.4536, longitude: 42.1355 },
      { name: 'Dadaab Market', location: 'Dadaab', latitude: 0.0500, longitude: 42.3167 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 60, unit: 'kg', demandLevel: 'high', priceTrend: 'increasing' },
      { commodity: 'beans', pricePerKg: 125, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
      { commodity: 'sorghum', pricePerKg: 55, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
    ],
  },
  {
    county: 'Wajir',
    headquarters: 'Wajir Town',
    latitude: 1.7471,
    longitude: 40.0573,
    markets: [
      { name: 'Wajir Town Market', location: 'Wajir', latitude: 1.7471, longitude: 40.0573 },
      { name: 'Eldas Market', location: 'Eldas', latitude: 1.4833, longitude: 40.4833 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 62, unit: 'kg', demandLevel: 'high', priceTrend: 'increasing' },
      { commodity: 'beans', pricePerKg: 130, unit: 'kg', demandLevel: 'high', priceTrend: 'increasing' },
      { commodity: 'millet', pricePerKg: 58, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
    ],
  },
  {
    county: 'Mandera',
    headquarters: 'Mandera Town',
    latitude: 3.9373,
    longitude: 41.8569,
    markets: [
      { name: 'Mandera Town Market', location: 'Mandera', latitude: 3.9373, longitude: 41.8569 },
      { name: 'Rhamu Market', location: 'Rhamu', latitude: 3.5667, longitude: 41.9167 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 65, unit: 'kg', demandLevel: 'high', priceTrend: 'increasing' },
      { commodity: 'beans', pricePerKg: 135, unit: 'kg', demandLevel: 'high', priceTrend: 'increasing' },
      { commodity: 'sorghum', pricePerKg: 60, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
    ],
  },
  {
    county: 'Marsabit',
    headquarters: 'Marsabit Town',
    latitude: 2.3284,
    longitude: 37.9947,
    markets: [
      { name: 'Marsabit Town Market', location: 'Marsabit', latitude: 2.3284, longitude: 37.9947 },
      { name: 'Moyale Market', location: 'Moyale', latitude: 3.5167, longitude: 39.0833 },
      { name: 'Chalbi Market', location: 'Chalbi', latitude: 2.6833, longitude: 37.6167 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 68, unit: 'kg', demandLevel: 'high', priceTrend: 'increasing' },
      { commodity: 'beans', pricePerKg: 140, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
      { commodity: 'millet', pricePerKg: 62, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
    ],
  },
  {
    county: 'Isiolo',
    headquarters: 'Isiolo Town',
    latitude: 0.3540,
    longitude: 37.5820,
    markets: [
      { name: 'Isiolo Town Market', location: 'Isiolo', latitude: 0.3540, longitude: 37.5820 },
      { name: 'Merti Market', location: 'Merti', latitude: 0.8833, longitude: 38.2167 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 55, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
      { commodity: 'beans', pricePerKg: 118, unit: 'kg', demandLevel: 'medium', priceTrend: 'increasing' },
      { commodity: 'millet', pricePerKg: 58, unit: 'kg', demandLevel: 'low', priceTrend: 'stable' },
    ],
  },
  {
    county: 'Meru',
    headquarters: 'Meru Town',
    latitude: 0.0515,
    longitude: 37.6559,
    markets: [
      { name: 'Meru Central Market', location: 'Meru', latitude: 0.0515, longitude: 37.6559 },
      { name: 'Maua Market', location: 'Maua', latitude: 0.2167, longitude: 37.9667 },
      { name: 'Mikinduri Market', location: 'Mikinduri', latitude: 0.1000, longitude: 37.7500 },
      { name: 'Kibirichia Market', location: 'Kibirichia', latitude: 0.0833, longitude: 37.6000 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 42, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
      { commodity: 'beans', pricePerKg: 95, unit: 'kg', demandLevel: 'high', priceTrend: 'increasing' },
      { commodity: 'miraa', pricePerKg: 350, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
      { commodity: 'potatoes', pricePerKg: 55, unit: 'kg', demandLevel: 'high', priceTrend: 'increasing' },
      { commodity: 'tea', pricePerKg: 180, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
    ],
  },
  {
    county: 'Tharaka-Nithi',
    headquarters: 'Chuka',
    latitude: -0.3390,
    longitude: 37.6480,
    markets: [
      { name: 'Chuka Market', location: 'Chuka', latitude: -0.3390, longitude: 37.6480 },
      { name: 'Kathwana Market', location: 'Kathwana', latitude: -0.2833, longitude: 37.7167 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 44, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
      { commodity: 'beans', pricePerKg: 98, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
      { commodity: 'millet', pricePerKg: 65, unit: 'kg', demandLevel: 'low', priceTrend: 'stable' },
    ],
  },
  {
    county: 'Embu',
    headquarters: 'Embu Town',
    latitude: -0.5389,
    longitude: 37.4596,
    markets: [
      { name: 'Embu Town Market', location: 'Embu', latitude: -0.5389, longitude: 37.4596 },
      { name: 'Runyenjes Market', location: 'Runyenjes', latitude: -0.4833, longitude: 37.5500 },
      { name: 'Siakago Market', location: 'Siakago', latitude: -0.5167, longitude: 37.7833 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 43, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
      { commodity: 'beans', pricePerKg: 96, unit: 'kg', demandLevel: 'high', priceTrend: 'increasing' },
      { commodity: 'coffee', pricePerKg: 420, unit: 'kg', demandLevel: 'medium', priceTrend: 'increasing' },
      { commodity: 'potatoes', pricePerKg: 52, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
    ],
  },
  {
    county: 'Kitui',
    headquarters: 'Kitui Town',
    latitude: -1.3670,
    longitude: 38.0100,
    markets: [
      { name: 'Kitui Town Market', location: 'Kitui', latitude: -1.3670, longitude: 38.0100 },
      { name: 'Mutito Andei Market', location: 'Mutito', latitude: -2.1167, longitude: 38.1167 },
      { name: 'Mwingi Market', location: 'Mwingi', latitude: -0.9333, longitude: 38.0667 },
      { name: 'Katumani Market', location: 'Katumani', latitude: -1.3500, longitude: 37.9833 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 45, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
      { commodity: 'beans', pricePerKg: 100, unit: 'kg', demandLevel: 'high', priceTrend: 'increasing' },
      { commodity: 'millet', pricePerKg: 55, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
      { commodity: 'sorghum', pricePerKg: 50, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
    ],
  },
  {
    county: 'Machakos',
    headquarters: 'Machakos Town',
    latitude: -1.5177,
    longitude: 37.2634,
    markets: [
      { name: 'Machakos Town Market', location: 'Machakos', latitude: -1.5177, longitude: 37.2634 },
      { name: 'Kangundo Market', location: 'Kangundo', latitude: -1.3000, longitude: 37.1500 },
      { name: 'Kathiani Market', location: 'Kathiani', latitude: -1.5333, longitude: 37.3500 },
      { name: 'Matuu Market', location: 'Matuu', latitude: -1.1167, longitude: 37.4167 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 44, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
      { commodity: 'beans', pricePerKg: 98, unit: 'kg', demandLevel: 'high', priceTrend: 'increasing' },
      { commodity: 'tomatoes', pricePerKg: 75, unit: 'kg', demandLevel: 'high', priceTrend: 'decreasing' },
      { commodity: 'onions', pricePerKg: 95, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
    ],
  },
  {
    county: 'Makueni',
    headquarters: 'Wote',
    latitude: -1.7895,
    longitude: 37.6257,
    markets: [
      { name: 'Wote Market', location: 'Wote', latitude: -1.7895, longitude: 37.6257 },
      { name: 'Kibwezi Market', location: 'Kibwezi', latitude: -2.4833, longitude: 37.8500 },
      { name: 'Mtito Andei Market', location: 'Mtito Andei', latitude: -2.4167, longitude: 38.1167 },
      { name: 'Makindu Market', location: 'Makindu', latitude: -2.2833, longitude: 37.8000 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 43, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
      { commodity: 'beans', pricePerKg: 95, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
      { commodity: 'millet', pricePerKg: 52, unit: 'kg', demandLevel: 'low', priceTrend: 'stable' },
      { commodity: 'bananas', pricePerKg: 42, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
    ],
  },
  {
    county: 'Nyandarua',
    headquarters: 'Ol Kalou',
    latitude: -0.2660,
    longitude: 36.3791,
    markets: [
      { name: 'Ol Kalou Market', location: 'Ol Kalou', latitude: -0.2660, longitude: 36.3791 },
      { name: 'Nyahururu Market', location: 'Nyahururu', latitude: 0.0333, longitude: 36.3667 },
      { name: 'Engineer Market', location: 'Engineer', latitude: -0.3167, longitude: 36.4500 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 40, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
      { commodity: 'potatoes', pricePerKg: 48, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
      { commodity: 'cabbages', pricePerKg: 35, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
      { commodity: 'pyrethrum', pricePerKg: 280, unit: 'kg', demandLevel: 'medium', priceTrend: 'increasing' },
    ],
  },
  {
    county: 'Nyeri',
    headquarters: 'Nyeri Town',
    latitude: -0.4197,
    longitude: 36.9511,
    markets: [
      { name: 'Nyeri Town Market', location: 'Nyeri', latitude: -0.4197, longitude: 36.9511 },
      { name: 'Othaya Market', location: 'Othaya', latitude: -0.4833, longitude: 36.8500 },
      { name: 'Karatina Market', location: 'Karatina', latitude: -0.4167, longitude: 37.1333 },
      { name: 'Murungaru Market', location: 'Murungaru', latitude: -0.3833, longitude: 36.9833 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 41, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
      { commodity: 'beans', pricePerKg: 92, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
      { commodity: 'coffee', pricePerKg: 450, unit: 'kg', demandLevel: 'high', priceTrend: 'increasing' },
      { commodity: 'tea', pricePerKg: 175, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
      { commodity: 'potatoes', pricePerKg: 50, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
    ],
  },
  {
    county: 'Kirinyaga',
    headquarters: 'Kerugoya',
    latitude: -0.4974,
    longitude: 37.2805,
    markets: [
      { name: 'Kerugoya Market', location: 'Kerugoya', latitude: -0.4974, longitude: 37.2805 },
      { name: 'Wanguru Market', location: 'Wanguru', latitude: -0.5167, longitude: 37.3500 },
      { name: 'Sagana Market', location: 'Sagana', latitude: -0.6167, longitude: 37.1833 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 42, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
      { commodity: 'rice', pricePerKg: 110, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
      { commodity: 'coffee', pricePerKg: 440, unit: 'kg', demandLevel: 'high', priceTrend: 'increasing' },
      { commodity: 'tea', pricePerKg: 170, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
    ],
  },
  {
    county: "Murang'a",
    headquarters: "Murang'a Town",
    latitude: -0.7195,
    longitude: 37.1504,
    markets: [
      { name: "Murang'a Town Market", location: "Murang'a", latitude: -0.7195, longitude: 37.1504 },
      { name: 'Kiharu Market', location: 'Kiharu', latitude: -0.7333, longitude: 37.1667 },
      { name: 'Gaturi Market', location: 'Gaturi', latitude: -0.6833, longitude: 37.2000 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 42, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
      { commodity: 'beans', pricePerKg: 94, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
      { commodity: 'coffee', pricePerKg: 435, unit: 'kg', demandLevel: 'high', priceTrend: 'increasing' },
      { commodity: 'bananas', pricePerKg: 48, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
    ],
  },
  {
    county: 'Kiambu',
    headquarters: 'Kiambu Town',
    latitude: -1.1716,
    longitude: 36.8350,
    markets: [
      { name: 'Kiambu Town Market', location: 'Kiambu', latitude: -1.1716, longitude: 36.8350 },
      { name: 'Thika Market', location: 'Thika', latitude: -1.0396, longitude: 37.0900 },
      { name: 'Ruiru Market', location: 'Ruiru', latitude: -1.1500, longitude: 36.9667 },
      { name: 'Limuru Market', location: 'Limuru', latitude: -1.1167, longitude: 36.6500 },
      { name: 'Juja Market', location: 'Juja', latitude: -1.1000, longitude: 37.0167 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 45, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
      { commodity: 'beans', pricePerKg: 100, unit: 'kg', demandLevel: 'high', priceTrend: 'increasing' },
      { commodity: 'tomatoes', pricePerKg: 80, unit: 'kg', demandLevel: 'high', priceTrend: 'decreasing' },
      { commodity: 'onions', pricePerKg: 100, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
      { commodity: 'cabbages', pricePerKg: 38, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
      { commodity: 'tea', pricePerKg: 165, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
    ],
  },
  {
    county: 'Turkana',
    headquarters: 'Lodwar',
    latitude: 3.1193,
    longitude: 35.5966,
    markets: [
      { name: 'Lodwar Market', location: 'Lodwar', latitude: 3.1193, longitude: 35.5966 },
      { name: 'Lokichar Market', location: 'Lokichar', latitude: 2.6500, longitude: 35.3167 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 70, unit: 'kg', demandLevel: 'high', priceTrend: 'increasing' },
      { commodity: 'beans', pricePerKg: 145, unit: 'kg', demandLevel: 'high', priceTrend: 'increasing' },
      { commodity: 'sorghum', pricePerKg: 65, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
      { commodity: 'millet', pricePerKg: 68, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
    ],
  },
  {
    county: 'West Pokot',
    headquarters: 'Kapenguria',
    latitude: 1.2390,
    longitude: 35.1125,
    markets: [
      { name: 'Kapenguria Market', location: 'Kapenguria', latitude: 1.2390, longitude: 35.1125 },
      { name: 'Makutano Market', location: 'Makutano', latitude: 1.1833, longitude: 35.2167 },
      { name: 'Sigor Market', location: 'Sigor', latitude: 1.3167, longitude: 35.1833 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 48, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
      { commodity: 'beans', pricePerKg: 105, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
      { commodity: 'millet', pricePerKg: 60, unit: 'kg', demandLevel: 'low', priceTrend: 'stable' },
      { commodity: 'honey', pricePerKg: 320, unit: 'kg', demandLevel: 'high', priceTrend: 'increasing' },
    ],
  },
  {
    county: 'Samburu',
    headquarters: 'Maralal',
    latitude: 1.0983,
    longitude: 36.6988,
    markets: [
      { name: 'Maralal Market', location: 'Maralal', latitude: 1.0983, longitude: 36.6988 },
      { name: 'Baragoi Market', location: 'Baragoi', latitude: 1.6833, longitude: 36.8167 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 58, unit: 'kg', demandLevel: 'high', priceTrend: 'increasing' },
      { commodity: 'beans', pricePerKg: 125, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
      { commodity: 'millet', pricePerKg: 62, unit: 'kg', demandLevel: 'low', priceTrend: 'stable' },
    ],
  },
  {
    county: 'Trans Nzoia',
    headquarters: 'Kitale',
    latitude: 1.0187,
    longitude: 35.0020,
    markets: [
      { name: 'Kitale Market', location: 'Kitale', latitude: 1.0187, longitude: 35.0020 },
      { name: 'Endebess Market', location: 'Endebess', latitude: 1.1167, longitude: 34.8500 },
      { name: 'Kwanza Market', location: 'Kwanza', latitude: 0.9167, longitude: 34.9500 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 38, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
      { commodity: 'beans', pricePerKg: 88, unit: 'kg', demandLevel: 'high', priceTrend: 'increasing' },
      { commodity: 'wheat', pricePerKg: 52, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
      { commodity: 'potatoes', pricePerKg: 48, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
    ],
  },
  {
    county: 'Uasin Gishu',
    headquarters: 'Eldoret',
    latitude: 0.5143,
    longitude: 35.2698,
    markets: [
      { name: 'Eldoret Market', location: 'Eldoret', latitude: 0.5143, longitude: 35.2698 },
      { name: 'Huruma Market', location: 'Eldoret', latitude: 0.5243, longitude: 35.2798 },
      { name: 'Burnt Forest Market', location: 'Burnt Forest', latitude: 0.4167, longitude: 35.4167 },
      { name: 'Turbo Market', location: 'Turbo', latitude: 0.4833, longitude: 35.4500 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 36, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
      { commodity: 'beans', pricePerKg: 85, unit: 'kg', demandLevel: 'high', priceTrend: 'increasing' },
      { commodity: 'wheat', pricePerKg: 50, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
      { commodity: 'potatoes', pricePerKg: 45, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
      { commodity: 'milk', pricePerKg: 65, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
    ],
  },
  {
    county: 'Elgeyo-Marakwet',
    headquarters: 'Iten',
    latitude: 0.6713,
    longitude: 35.5093,
    markets: [
      { name: 'Iten Market', location: 'Iten', latitude: 0.6713, longitude: 35.5093 },
      { name: 'Kapsowar Market', location: 'Kapsowar', latitude: 0.9167, longitude: 35.5333 },
      { name: 'Tambach Market', location: 'Tambach', latitude: 0.6500, longitude: 35.5500 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 40, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
      { commodity: 'beans', pricePerKg: 90, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
      { commodity: 'potatoes', pricePerKg: 46, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
    ],
  },
  {
    county: 'Nandi',
    headquarters: 'Kapsabet',
    latitude: 0.2049,
    longitude: 35.0994,
    markets: [
      { name: 'Kapsabet Market', location: 'Kapsabet', latitude: 0.2049, longitude: 35.0994 },
      { name: 'Mosoriot Market', location: 'Mosoriot', latitude: 0.1167, longitude: 35.1833 },
      { name: 'Nandi Hills Market', location: 'Nandi Hills', latitude: 0.1333, longitude: 35.0500 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 39, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
      { commodity: 'beans', pricePerKg: 88, unit: 'kg', demandLevel: 'high', priceTrend: 'increasing' },
      { commodity: 'tea', pricePerKg: 160, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
      { commodity: 'milk', pricePerKg: 62, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
    ],
  },
  {
    county: 'Baringo',
    headquarters: 'Kabarnet',
    latitude: 0.4896,
    longitude: 35.7428,
    markets: [
      { name: 'Kabarnet Market', location: 'Kabarnet', latitude: 0.4896, longitude: 35.7428 },
      { name: 'Marigat Market', location: 'Marigat', latitude: 0.8167, longitude: 36.0167 },
      { name: 'Eldama Ravine Market', location: 'Eldama Ravine', latitude: 0.4167, longitude: 35.9167 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 42, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
      { commodity: 'beans', pricePerKg: 92, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
      { commodity: 'millet', pricePerKg: 58, unit: 'kg', demandLevel: 'low', priceTrend: 'stable' },
    ],
  },
  {
    county: 'Laikipia',
    headquarters: 'Nanyuki',
    latitude: 0.0066,
    longitude: 37.0722,
    markets: [
      { name: 'Nanyuki Market', location: 'Nanyuki', latitude: 0.0066, longitude: 37.0722 },
      { name: 'Rumuruti Market', location: 'Rumuruti', latitude: 0.2167, longitude: 36.5667 },
      { name: 'Nyahururu Market', location: 'Nyahururu', latitude: 0.0333, longitude: 36.3667 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 41, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
      { commodity: 'beans', pricePerKg: 90, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
      { commodity: 'potatoes', pricePerKg: 48, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
      { commodity: 'milk', pricePerKg: 60, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
    ],
  },
  {
    county: 'Nakuru',
    headquarters: 'Nakuru Town',
    latitude: -0.3031,
    longitude: 36.0800,
    markets: [
      { name: 'Biashara Market', location: 'Nakuru', latitude: -0.3031, longitude: 36.0800 },
      { name: 'Mwikwande Market', location: 'Nakuru', latitude: -0.3131, longitude: 36.0900 },
      { name: 'Naivasha Market', location: 'Naivasha', latitude: -0.7172, longitude: 36.4310 },
      { name: 'Gilgil Market', location: 'Gilgil', latitude: -0.5000, longitude: 36.3167 },
      { name: 'Molo Market', location: 'Molo', latitude: -0.2833, longitude: 35.7333 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 40, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
      { commodity: 'beans', pricePerKg: 90, unit: 'kg', demandLevel: 'high', priceTrend: 'increasing' },
      { commodity: 'potatoes', pricePerKg: 46, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
      { commodity: 'tomatoes', pricePerKg: 70, unit: 'kg', demandLevel: 'high', priceTrend: 'decreasing' },
      { commodity: 'onions', pricePerKg: 90, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
      { commodity: 'cabbages', pricePerKg: 32, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
      { commodity: 'wheat', pricePerKg: 50, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
    ],
  },
  {
    county: 'Narok',
    headquarters: 'Narok Town',
    latitude: -1.0800,
    longitude: 35.8690,
    markets: [
      { name: 'Narok Town Market', location: 'Narok', latitude: -1.0800, longitude: 35.8690 },
      { name: 'Kilgoris Market', location: 'Kilgoris', latitude: -1.0500, longitude: 35.2167 },
      { name: 'Suswa Market', location: 'Suswa', latitude: -1.1167, longitude: 36.6833 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 42, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
      { commodity: 'beans', pricePerKg: 95, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
      { commodity: 'wheat', pricePerKg: 48, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
      { commodity: 'honey', pricePerKg: 350, unit: 'kg', demandLevel: 'high', priceTrend: 'increasing' },
    ],
  },
  {
    county: 'Kajiado',
    headquarters: 'Kajiado Town',
    latitude: -1.8534,
    longitude: 36.7773,
    markets: [
      { name: 'Kajiado Town Market', location: 'Kajiado', latitude: -1.8534, longitude: 36.7773 },
      { name: 'Ngong Market', location: 'Ngong', latitude: -1.3833, longitude: 36.6667 },
      { name: 'Ongata Rongai Market', location: 'Rongai', latitude: -1.3833, longitude: 36.8333 },
      { name: 'Kitengela Market', location: 'Kitengela', latitude: -1.5000, longitude: 36.9500 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 44, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
      { commodity: 'beans', pricePerKg: 98, unit: 'kg', demandLevel: 'high', priceTrend: 'increasing' },
      { commodity: 'tomatoes', pricePerKg: 72, unit: 'kg', demandLevel: 'high', priceTrend: 'decreasing' },
      { commodity: 'onions', pricePerKg: 92, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
      { commodity: 'milk', pricePerKg: 58, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
    ],
  },
  {
    county: 'Kericho',
    headquarters: 'Kericho Town',
    latitude: -0.3692,
    longitude: 35.2863,
    markets: [
      { name: 'Kericho Town Market', location: 'Kericho', latitude: -0.3692, longitude: 35.2863 },
      { name: 'Litein Market', location: 'Litein', latitude: -0.5167, longitude: 35.2500 },
      { name: 'Londiani Market', location: 'Londiani', latitude: -0.1833, longitude: 35.5167 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 40, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
      { commodity: 'beans', pricePerKg: 88, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
      { commodity: 'tea', pricePerKg: 155, unit: 'kg', demandLevel: 'high', priceTrend: 'increasing' },
      { commodity: 'pyrethrum', pricePerKg: 270, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
    ],
  },
  {
    county: 'Bomet',
    headquarters: 'Bomet Town',
    latitude: -0.7823,
    longitude: 35.3416,
    markets: [
      { name: 'Bomet Town Market', location: 'Bomet', latitude: -0.7823, longitude: 35.3416 },
      { name: 'Sotik Market', location: 'Sotik', latitude: -0.7167, longitude: 35.1833 },
      { name: 'Mulot Market', location: 'Mulot', latitude: -0.8500, longitude: 35.3833 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 39, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
      { commodity: 'beans', pricePerKg: 86, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
      { commodity: 'tea', pricePerKg: 150, unit: 'kg', demandLevel: 'high', priceTrend: 'increasing' },
      { commodity: 'potatoes', pricePerKg: 44, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
    ],
  },
  {
    county: 'Kakamega',
    headquarters: 'Kakamega Town',
    latitude: 0.2827,
    longitude: 34.7519,
    markets: [
      { name: 'Kakamega Town Market', location: 'Kakamega', latitude: 0.2827, longitude: 34.7519 },
      { name: 'Mumias Market', location: 'Mumias', latitude: 0.3333, longitude: 34.4833 },
      { name: 'Butere Market', location: 'Butere', latitude: 0.2000, longitude: 34.5000 },
      { name: 'Malava Market', location: 'Malava', latitude: 0.3167, longitude: 34.7833 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 42, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
      { commodity: 'beans', pricePerKg: 95, unit: 'kg', demandLevel: 'high', priceTrend: 'increasing' },
      { commodity: 'sukuma wiki', pricePerKg: 35, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
      { commodity: 'tomatoes', pricePerKg: 68, unit: 'kg', demandLevel: 'high', priceTrend: 'decreasing' },
    ],
  },
  {
    county: 'Vihiga',
    headquarters: 'Mbale',
    latitude: 0.0666,
    longitude: 34.7233,
    markets: [
      { name: 'Mbale Market', location: 'Mbale', latitude: 0.0666, longitude: 34.7233 },
      { name: 'Hamisi Market', location: 'Hamisi', latitude: 0.1167, longitude: 34.7833 },
      { name: 'Luanda Market', location: 'Luanda', latitude: 0.0333, longitude: 34.6833 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 43, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
      { commodity: 'beans', pricePerKg: 96, unit: 'kg', demandLevel: 'high', priceTrend: 'increasing' },
      { commodity: 'sukuma wiki', pricePerKg: 36, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
    ],
  },
  {
    county: 'Bungoma',
    headquarters: 'Bungoma Town',
    latitude: 0.5635,
    longitude: 34.5607,
    markets: [
      { name: 'Bungoma Town Market', location: 'Bungoma', latitude: 0.5635, longitude: 34.5607 },
      { name: 'Webuye Market', location: 'Webuye', latitude: 0.6167, longitude: 34.7667 },
      { name: 'Kimilili Market', location: 'Kimilili', latitude: 0.7000, longitude: 34.7000 },
      { name: 'Malakisi Market', location: 'Malakisi', latitude: 0.5833, longitude: 34.3500 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 40, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
      { commodity: 'beans', pricePerKg: 90, unit: 'kg', demandLevel: 'high', priceTrend: 'increasing' },
      { commodity: 'wheat', pricePerKg: 48, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
      { commodity: 'sugar cane', pricePerKg: 8, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
    ],
  },
  {
    county: 'Busia',
    headquarters: 'Busia Town',
    latitude: 0.4608,
    longitude: 34.1112,
    markets: [
      { name: 'Busia Town Market', location: 'Busia', latitude: 0.4608, longitude: 34.1112 },
      { name: 'Malaba Market', location: 'Malaba', latitude: 0.6167, longitude: 34.2833 },
      { name: 'Funyula Market', location: 'Funyula', latitude: 0.2833, longitude: 34.1167 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 41, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
      { commodity: 'beans', pricePerKg: 92, unit: 'kg', demandLevel: 'high', priceTrend: 'increasing' },
      { commodity: 'cassava', pricePerKg: 38, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
    ],
  },
  {
    county: 'Siaya',
    headquarters: 'Siaya Town',
    latitude: -0.0612,
    longitude: 34.2880,
    markets: [
      { name: 'Siaya Town Market', location: 'Siaya', latitude: -0.0612, longitude: 34.2880 },
      { name: 'Bondo Market', location: 'Bondo', latitude: -0.2167, longitude: 34.2667 },
      { name: 'Luanda Market', location: 'Luanda', latitude: -0.0333, longitude: 34.6833 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 44, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
      { commodity: 'beans', pricePerKg: 98, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
      { commodity: 'fish', pricePerKg: 280, unit: 'kg', demandLevel: 'high', priceTrend: 'increasing' },
      { commodity: 'sukuma wiki', pricePerKg: 38, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
    ],
  },
  {
    county: 'Kisumu',
    headquarters: 'Kisumu City',
    latitude: -0.0917,
    longitude: 34.7680,
    markets: [
      { name: 'Kibuye Market', location: 'Kisumu', latitude: -0.0917, longitude: 34.7680 },
      { name: 'Oile Market', location: 'Kisumu', latitude: -0.1017, longitude: 34.7780 },
      { name: 'Kondele Market', location: 'Kisumu', latitude: -0.0817, longitude: 34.7580 },
      { name: 'Maseno Market', location: 'Maseno', latitude: -0.0167, longitude: 34.5833 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 45, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
      { commodity: 'beans', pricePerKg: 100, unit: 'kg', demandLevel: 'high', priceTrend: 'increasing' },
      { commodity: 'fish', pricePerKg: 300, unit: 'kg', demandLevel: 'high', priceTrend: 'increasing' },
      { commodity: 'tomatoes', pricePerKg: 72, unit: 'kg', demandLevel: 'high', priceTrend: 'decreasing' },
      { commodity: 'onions', pricePerKg: 95, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
      { commodity: 'sukuma wiki', pricePerKg: 40, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
    ],
  },
  {
    county: 'Homa Bay',
    headquarters: 'Homa Bay Town',
    latitude: -0.5272,
    longitude: 34.4572,
    markets: [
      { name: 'Homa Bay Town Market', location: 'Homa Bay', latitude: -0.5272, longitude: 34.4572 },
      { name: 'Mbita Market', location: 'Mbita', latitude: -0.4167, longitude: 34.2167 },
      { name: 'Oyugis Market', location: 'Oyugis', latitude: -0.5167, longitude: 34.7500 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 46, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
      { commodity: 'beans', pricePerKg: 102, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
      { commodity: 'fish', pricePerKg: 290, unit: 'kg', demandLevel: 'high', priceTrend: 'increasing' },
      { commodity: 'millet', pricePerKg: 55, unit: 'kg', demandLevel: 'low', priceTrend: 'stable' },
    ],
  },
  {
    county: 'Migori',
    headquarters: 'Migori Town',
    latitude: -1.0634,
    longitude: 34.4731,
    markets: [
      { name: 'Migori Town Market', location: 'Migori', latitude: -1.0634, longitude: 34.4731 },
      { name: 'Rongo Market', location: 'Rongo', latitude: -0.8167, longitude: 34.5500 },
      { name: 'Awendo Market', location: 'Awendo', latitude: -1.1167, longitude: 34.6500 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 47, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
      { commodity: 'beans', pricePerKg: 105, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
      { commodity: 'fish', pricePerKg: 285, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
    ],
  },
  {
    county: 'Kisii',
    headquarters: 'Kisii Town',
    latitude: -0.6817,
    longitude: 34.7665,
    markets: [
      { name: 'Kisii Town Market', location: 'Kisii', latitude: -0.6817, longitude: 34.7665 },
      { name: 'Keroka Market', location: 'Keroka', latitude: -0.7500, longitude: 34.7333 },
      { name: 'Nyamarambe Market', location: 'Nyamarambe', latitude: -0.6167, longitude: 34.8000 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 44, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
      { commodity: 'beans', pricePerKg: 98, unit: 'kg', demandLevel: 'high', priceTrend: 'increasing' },
      { commodity: 'bananas', pricePerKg: 50, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
      { commodity: 'avocados', pricePerKg: 85, unit: 'kg', demandLevel: 'high', priceTrend: 'increasing' },
    ],
  },
  {
    county: 'Nyamira',
    headquarters: 'Nyamira Town',
    latitude: -0.5671,
    longitude: 34.9352,
    markets: [
      { name: 'Nyamira Town Market', location: 'Nyamira', latitude: -0.5671, longitude: 34.9352 },
      { name: 'Nyansiongo Market', location: 'Nyansiongo', latitude: -0.6167, longitude: 34.9000 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 43, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
      { commodity: 'beans', pricePerKg: 96, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
      { commodity: 'tea', pricePerKg: 145, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
      { commodity: 'bananas', pricePerKg: 48, unit: 'kg', demandLevel: 'medium', priceTrend: 'stable' },
    ],
  },
  {
    county: 'Nairobi',
    headquarters: 'Nairobi City',
    latitude: -1.2921,
    longitude: 36.8219,
    markets: [
      { name: 'Wakulima Market', location: 'Nairobi', latitude: -1.2921, longitude: 36.8219 },
      { name: 'Gikomba Market', location: 'Nairobi', latitude: -1.2821, longitude: 36.8319 },
      { name: 'Marikiti Market', location: 'Nairobi', latitude: -1.2721, longitude: 36.8119 },
      { name: 'Kariobangi Market', location: 'Nairobi', latitude: -1.2521, longitude: 36.8619 },
      { name: 'Kawangware Market', location: 'Nairobi', latitude: -1.3021, longitude: 36.7519 },
    ],
    commodities: [
      { commodity: 'maize', pricePerKg: 50, unit: 'kg', demandLevel: 'high', priceTrend: 'increasing' },
      { commodity: 'beans', pricePerKg: 115, unit: 'kg', demandLevel: 'high', priceTrend: 'increasing' },
      { commodity: 'tomatoes', pricePerKg: 90, unit: 'kg', demandLevel: 'high', priceTrend: 'decreasing' },
      { commodity: 'onions', pricePerKg: 110, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
      { commodity: 'cabbages', pricePerKg: 45, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
      { commodity: 'potatoes', pricePerKg: 65, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
      { commodity: 'rice', pricePerKg: 140, unit: 'kg', demandLevel: 'high', priceTrend: 'stable' },
    ],
  },
]

/**
 * Get all county names for dropdown
 */
export function getCountyNames(): string[] {
  return KENYA_COUNTIES_MARKETS.map(c => c.county).sort((a, b) => a.localeCompare(b))
}

/**
 * County coordinates lookup table for fast access
 * Key is lowercase county name, value is { lat, lon }
 */
export const COUNTY_COORDS: Record<string, { lat: number; lon: number }> =
  Object.fromEntries(KENYA_COUNTIES_MARKETS.map(c => [c.county.toLowerCase(), { lat: c.latitude, lon: c.longitude }]))

/**
 * Get markets for a specific county
 */
export function getMarketsByCounty(countyName: string): MarketInfo[] | null {
  const county = KENYA_COUNTIES_MARKETS.find(
    c => c.county.toLowerCase() === countyName.toLowerCase()
  )
  return county?.markets ?? null
}

/**
 * Get county coordinates
 */
export function getCountyCoords(countyName: string): { lat: number; lng: number } | null {
  const county = KENYA_COUNTIES_MARKETS.find(
    c => c.county.toLowerCase() === countyName.toLowerCase()
  )
  return county ? { lat: county.latitude, lng: county.longitude } : null
}

/**
 * Get all commodities for a county
 */
export function getCommoditiesByCounty(countyName: string): CommodityPrice[] | null {
  const county = KENYA_COUNTIES_MARKETS.find(
    c => c.county.toLowerCase() === countyName.toLowerCase()
  )
  return county?.commodities ?? null
}

/**
 * Get county by name with full details
 */
export function getCountyByName(countyName: string): CountyMarkets | null {
  return KENYA_COUNTIES_MARKETS.find(
    c => c.county.toLowerCase() === countyName.toLowerCase()
  ) ?? null
}

/**
 * Search counties by name (partial match)
 */
export function searchCounties(query: string): CountyMarkets[] {
  const q = query.toLowerCase().trim()
  return KENYA_COUNTIES_MARKETS.filter(c => 
    c.county.toLowerCase().includes(q) ||
    c.headquarters.toLowerCase().includes(q)
  )
}
