export const counties = [
  { id: 'all', name: 'All Counties' },
  { id: 'nairobi', name: 'Nairobi' },
  { id: 'mombasa', name: 'Mombasa' },
  { id: 'kisumu', name: 'Kisumu' },
  { id: 'nakuru', name: 'Nakuru' },
  { id: 'kiambu', name: 'Kiambu' },
  { id: 'machakos', name: 'Machakos' },
]

export const storages = [
  { id: '1', name: 'Storage A', location: 'Nairobi CBD', capacity: 5000 },
  { id: '2', name: 'Storage B', location: 'Mombasa Port', capacity: 8000 },
  { id: '3', name: 'Storage C', location: 'Kisumu', capacity: 3000 },
  { id: '4', name: 'Storage D', location: 'Nakuru', capacity: 6000 },
]

export interface SensorData {
  storageId: string
  temperature: number
  humidity: number
  timestamp: number
}

export interface MarketData {
  crop: string
  price: number
  trend: 'up' | 'down' | 'stable'
  priceChange: number
  county: string
}

export interface RiskData {
  storageId: string
  riskLevel: 'low' | 'medium' | 'high'
  spoilageRisk: number
  recommendation: string
}

// Stable market prices - do not change on each call
const STABLE_PRICES: Record<string, { price: number; trend: 'up' | 'down' | 'stable'; change: number }> = {
  'Maize': { price: 8500, trend: 'up', change: 150 },
  'Beans': { price: 12500, trend: 'down', change: -200 },
  'Wheat': { price: 15000, trend: 'up', change: 250 },
  'Rice': { price: 18000, trend: 'stable', change: 0 },
  'Sorghum': { price: 6500, trend: 'up', change: 100 },
}

export function generateSensorData(): SensorData[] {
  return storages.map((storage) => ({
    storageId: storage.id,
    temperature: 18 + Math.random() * 8,
    humidity: 55 + Math.random() * 15,
    timestamp: Date.now(),
  }))
}

export function generateMarketData(county: string): MarketData[] {
  return Object.entries(STABLE_PRICES).map(([crop, data]) => ({
    crop,
    price: data.price,
    trend: data.trend,
    priceChange: data.change,
    county: county === 'all' ? 'National Average' : county,
  }))
}

export function generateRiskData(sensorData: SensorData[]): RiskData[] {
  return sensorData.map((sensor) => {
    const tempRisk = Math.abs(sensor.temperature - 20) / 10
    const humidityRisk = Math.abs(sensor.humidity - 65) / 20
    const totalRisk = (tempRisk + humidityRisk) / 2

    let riskLevel: 'low' | 'medium' | 'high'
    let recommendation = ''

    if (totalRisk < 0.3) {
      riskLevel = 'low'
      recommendation = 'Conditions optimal. Continue monitoring.'
    } else if (totalRisk < 0.7) {
      riskLevel = 'medium'
      recommendation = 'Adjust ventilation or cooling system.'
    } else {
      riskLevel = 'high'
      recommendation = 'Urgent: Immediate action required to prevent spoilage.'
    }

    return {
      storageId: sensor.storageId,
      riskLevel,
      spoilageRisk: Math.min(totalRisk * 100, 100),
      recommendation,
    }
  })
}
