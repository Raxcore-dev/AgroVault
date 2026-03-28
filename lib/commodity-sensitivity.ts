/**
 * Commodity Sensitivity Rules for Spoilage Prediction
 *
 * Defines optimal storage conditions and risk behaviors for different commodities.
 * Used by the AI prediction system to assess spoilage risk.
 */

export interface CommoditySensitivity {
  maxTemp: number;        // Maximum safe temperature (°C)
  minTemp: number;        // Minimum safe temperature (°C)
  maxHumidity: number;    // Maximum safe humidity (%)
  minHumidity: number;    // Minimum safe humidity (%)
  optimalTemp: number;    // Optimal temperature (°C)
  optimalHumidity: number; // Optimal humidity (%)
  spoilageTimeHours: number; // Expected shelf life in hours under optimal conditions
  riskBehavior: string;   // Description of how commodity responds to bad conditions
  sensitivityLevel: 'low' | 'medium' | 'high' | 'very_high';
}

export const COMMODITY_SENSITIVITY: Record<string, CommoditySensitivity> = {
  // Fruits
  'avocado': {
    maxTemp: 25,
    minTemp: 5,
    maxHumidity: 90,
    minHumidity: 85,
    optimalTemp: 20,
    optimalHumidity: 88,
    spoilageTimeHours: 168, // 7 days
    riskBehavior: 'Ripens quickly at high temperature, develops brown spots',
    sensitivityLevel: 'high',
  },
  'tomato': {
    maxTemp: 25,
    minTemp: 10,
    maxHumidity: 90,
    minHumidity: 85,
    optimalTemp: 20,
    optimalHumidity: 88,
    spoilageTimeHours: 120, // 5 days
    riskBehavior: 'Softens and rots rapidly in high heat and humidity',
    sensitivityLevel: 'high',
  },
  'banana': {
    maxTemp: 30,
    minTemp: 13,
    maxHumidity: 90,
    minHumidity: 85,
    optimalTemp: 25,
    optimalHumidity: 88,
    spoilageTimeHours: 96, // 4 days
    riskBehavior: 'Over-ripens quickly, develops black spots at high temperature',
    sensitivityLevel: 'very_high',
  },
  'mango': {
    maxTemp: 30,
    minTemp: 10,
    maxHumidity: 85,
    minHumidity: 80,
    optimalTemp: 25,
    optimalHumidity: 82,
    spoilageTimeHours: 144, // 6 days
    riskBehavior: 'Ripens unevenly, develops sap burn at high temperature',
    sensitivityLevel: 'high',
  },
  'orange': {
    maxTemp: 25,
    minTemp: 5,
    maxHumidity: 90,
    minHumidity: 85,
    optimalTemp: 15,
    optimalHumidity: 88,
    spoilageTimeHours: 336, // 14 days
    riskBehavior: 'Develops mold at high humidity, dries out at low humidity',
    sensitivityLevel: 'medium',
  },
  
  // Grains
  'maize': {
    maxTemp: 25,
    minTemp: 10,
    maxHumidity: 70,
    minHumidity: 60,
    optimalTemp: 20,
    optimalHumidity: 65,
    spoilageTimeHours: 2160, // 90 days
    riskBehavior: 'Mold growth and aflatoxin risk at high humidity',
    sensitivityLevel: 'high',
  },
  'wheat': {
    maxTemp: 25,
    minTemp: 10,
    maxHumidity: 70,
    minHumidity: 60,
    optimalTemp: 20,
    optimalHumidity: 65,
    spoilageTimeHours: 2160, // 90 days
    riskBehavior: 'Susceptible to weevil infestation and mold at high humidity',
    sensitivityLevel: 'medium',
  },
  'rice': {
    maxTemp: 30,
    minTemp: 10,
    maxHumidity: 70,
    minHumidity: 60,
    optimalTemp: 25,
    optimalHumidity: 65,
    spoilageTimeHours: 2880, // 120 days
    riskBehavior: 'Develops yellowing and mold at high humidity',
    sensitivityLevel: 'medium',
  },
  'beans': {
    maxTemp: 25,
    minTemp: 10,
    maxHumidity: 65,
    minHumidity: 55,
    optimalTemp: 20,
    optimalHumidity: 60,
    spoilageTimeHours: 2160, // 90 days
    riskBehavior: 'Bruchid beetle infestation and mold at high humidity',
    sensitivityLevel: 'high',
  },
  
  // Vegetables
  'potato': {
    maxTemp: 20,
    minTemp: 4,
    maxHumidity: 90,
    minHumidity: 85,
    optimalTemp: 10,
    optimalHumidity: 88,
    spoilageTimeHours: 720, // 30 days
    riskBehavior: 'Sprouts and softens at high temperature, rots at high humidity',
    sensitivityLevel: 'medium',
  },
  'onion': {
    maxTemp: 25,
    minTemp: 0,
    maxHumidity: 75,
    minHumidity: 65,
    optimalTemp: 15,
    optimalHumidity: 70,
    spoilageTimeHours: 2160, // 90 days
    riskBehavior: 'Sprouts and rots at high humidity, dries out at low humidity',
    sensitivityLevel: 'medium',
  },
  'cabbage': {
    maxTemp: 20,
    minTemp: 0,
    maxHumidity: 95,
    minHumidity: 90,
    optimalTemp: 5,
    optimalHumidity: 93,
    spoilageTimeHours: 336, // 14 days
    riskBehavior: 'Wilts and develops bacterial soft rot at high temperature',
    sensitivityLevel: 'high',
  },
  'kale': {
    maxTemp: 20,
    minTemp: 0,
    maxHumidity: 95,
    minHumidity: 90,
    optimalTemp: 5,
    optimalHumidity: 93,
    spoilageTimeHours: 168, // 7 days
    riskBehavior: 'Wilts rapidly, develops yellowing at high temperature',
    sensitivityLevel: 'very_high',
  },
  
  // Default (for unknown commodities)
  'default': {
    maxTemp: 30,
    minTemp: 10,
    maxHumidity: 80,
    minHumidity: 60,
    optimalTemp: 20,
    optimalHumidity: 70,
    spoilageTimeHours: 480, // 20 days
    riskBehavior: 'Quality degradation at extreme temperatures and humidity',
    sensitivityLevel: 'medium',
  },
};

/**
 * Get sensitivity rules for a commodity
 */
export function getCommoditySensitivity(commodityName: string): CommoditySensitivity {
  const normalizedName = commodityName.toLowerCase().trim();
  return COMMODITY_SENSITIVITY[normalizedName] || COMMODITY_SENSITIVITY['default'];
}

/**
 * Calculate risk multiplier based on commodity sensitivity
 */
export function getRiskMultiplier(sensitivityLevel: string): number {
  const multipliers: Record<string, number> = {
    'low': 1.0,
    'medium': 1.5,
    'high': 2.0,
    'very_high': 3.0,
  };
  return multipliers[sensitivityLevel] || 1.5;
}
