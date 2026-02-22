export interface MarketData {
  crop: string;
  price: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  priceChange: number;
  county: string;
}

export const KENYA_COUNTIES = [
  'Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita-Taveta', 'Garissa', 'Wajir',
  'Mandera', 'Marsabit', 'Isiolo', 'Meru', 'Tharaka-Nithi', 'Embu', 'Kitui', 'Machakos',
  'Makueni', 'Nyandarua', 'Nyeri', 'Kirinyaga', 'Murang\'a', 'Kiambu', 'Turkana', 'West Pokot',
  'Samburu', 'Trans Nzoia', 'Uasin Gishu', 'Elgeyo-Marakwet', 'Nandi', 'Baringo', 'Laikipia',
  'Nakuru', 'Narok', 'Kajiado', 'Kericho', 'Bomet', 'Kakamega', 'Vihiga', 'Bungoma',
  'Busia', 'Siaya', 'Kisumu', 'Homa Bay', 'Migori', 'Kisii', 'Nyamira', 'Nairobi'
];

// Base indicative prices in KES for standard wholesale units
const BASE_PRICES: Record<string, { price: number; unit: string; trend: 'up' | 'down' | 'stable'; change: number }> = {
  'Maize': { price: 3800, unit: '90kg Bag', trend: 'down', change: -150 },
  'Beans': { price: 9500, unit: '90kg Bag', trend: 'up', change: 400 },
  'Wheat': { price: 4500, unit: '90kg Bag', trend: 'stable', change: 0 },
  'Potatoes': { price: 3200, unit: '50kg Bag', trend: 'up', change: 250 },
  'Tomatoes': { price: 6500, unit: 'Crate', trend: 'down', change: -500 },
  'Cabbages': { price: 2000, unit: 'Net', trend: 'stable', change: 0 },
  'Onions': { price: 8500, unit: 'Net', trend: 'up', change: 300 },
  'Rice': { price: 10500, unit: '50kg Bag', trend: 'stable', change: 0 },
};

// Regional pricing logic
export function generateKenyaMarketData(county: string): MarketData[] {
  return Object.entries(BASE_PRICES).map(([crop, data]) => {
    let multiplier = 1.0;

    // Apply realistic regional variations
    if (county !== 'all') {
      const isUrban = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'].includes(county);
      if (isUrban) {
        multiplier *= 1.15; // Higher demand/transport costs in major cities
      }

      switch (crop) {
        case 'Maize':
          if (['Uasin Gishu', 'Trans Nzoia', 'Kakamega', 'Bungoma'].includes(county)) multiplier *= 0.85; // Breadbasket
          if (['Turkana', 'Garissa', 'Wajir', 'Mandera', 'Marsabit'].includes(county)) multiplier *= 1.30; // Arid
          break;
        case 'Wheat':
          if (['Narok', 'Meru', 'Uasin Gishu'].includes(county)) multiplier *= 0.90;
          break;
        case 'Potatoes':
          if (['Nyandarua', 'Nakuru', 'Meru', 'Bomet', 'Elgeyo-Marakwet'].includes(county)) multiplier *= 0.70;
          break;
        case 'Tomatoes':
          if (['Kajiado', 'Makueni', 'Machakos', 'Kirinyaga'].includes(county)) multiplier *= 0.80;
          break;
        case 'Rice':
          if (['Kirinyaga', 'Busia', 'Kisumu', 'Migori'].includes(county)) multiplier *= 0.85; // Mwea, Ahero, etc.
          break;
        case 'Tea': // Just in case added later
          if (['Kericho', 'Bomet', 'Nandi', 'Nyeri', 'Murang\'a'].includes(county)) multiplier *= 0.9;
          break;
      }
    }

    const calculatedPrice = Math.round((data.price * multiplier) / 50) * 50; // Round to nearest 50 KES
    
    // Slightly adjust trend and change based on county multiplier
    const finalChange = multiplier > 1 ? data.change + Math.round(data.change * 0.2) : Math.round(data.change * 0.8);
    
    return {
      crop,
      price: calculatedPrice,
      unit: data.unit,
      trend: data.trend,
      priceChange: finalChange,
      county: county === 'all' ? 'National Average' : county,
    };
  });
}
