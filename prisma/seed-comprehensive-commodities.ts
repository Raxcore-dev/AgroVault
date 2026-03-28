/**
 * Comprehensive Commodity Pricing Seed Script
 * 
 * Seeds all 47 Kenyan counties with realistic agricultural commodity prices
 * Pricing reflects real market conditions:
 * - Cheaper in production regions, more expensive in consumer markets
 * - Regional specialization (crops that thrive locally are cheaper)
 * - Distance-based pricing adjustments
 * 
 * Run with: npx tsx prisma/seed-comprehensive-commodities.ts
 */

import 'dotenv/config'
import { PrismaClient } from '../lib/generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// ─── COMPREHENSIVE COMMODITY DATA FOR ALL 47 KENYAN COUNTIES ───────────────────
// Organized by region with realistic, geographically-aware pricing

const COMPREHENSIVE_COMMODITIES = {
  // ═══════════════════════════════════════════════════════════════════════════
  // COASTAL REGION (5 counties) - Fish, coconuts, cashews abundant
  // ═══════════════════════════════════════════════════════════════════════════
  
  'Mombasa': {
    region: 'Coastal',
    commodities: [
      { name: 'Maize', priceKg: 52, bag: 4680, demand: 'high', trend: 'stable', source: 'imported' },
      { name: 'Beans', priceKg: 115, bag: 10350, demand: 'high', trend: 'stable', source: 'mixed' },
      { name: 'Rice', priceKg: 145, bag: 13050, demand: 'high', trend: 'stable', source: 'imported' },
      { name: 'Wheat', priceKg: 65, bag: 5850, demand: 'medium', trend: 'stable', source: 'imported' },
      { name: 'Fish', priceKg: 280, bag: 25200, demand: 'high', trend: 'increasing', source: 'local' },
      { name: 'Coconuts', priceKg: 55, bag: 4950, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Cashews', priceKg: 180, bag: 16200, demand: 'high', trend: 'increasing', source: 'local' },
      { name: 'Mangoes', priceKg: 85, bag: 7650, demand: 'high', trend: 'seasonal', source: 'local' },
      { name: 'Onions', priceKg: 110, bag: 9900, demand: 'high', trend: 'stable', source: 'imported' },
      { name: 'Tomatoes', priceKg: 95, bag: 8550, demand: 'high', trend: 'fluctuating', source: 'mixed' },
    ]
  },

  'Kwale': {
    region: 'Coastal',
    commodities: [
      { name: 'Maize', priceKg: 48, bag: 4320, demand: 'medium', trend: 'stable', source: 'imported' },
      { name: 'Beans', priceKg: 105, bag: 9450, demand: 'medium', trend: 'increasing', source: 'mixed' },
      { name: 'Cassava', priceKg: 35, bag: 3150, demand: 'low', trend: 'stable', source: 'local' },
      { name: 'Mangoes', priceKg: 65, bag: 5850, demand: 'high', trend: 'increasing', source: 'local' },
      { name: 'Cashews', priceKg: 175, bag: 15750, demand: 'high', trend: 'increasing', source: 'local' },
      { name: 'Fish', priceKg: 270, bag: 24300, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Coconuts', priceKg: 50, bag: 4500, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Onions', priceKg: 105, bag: 9450, demand: 'medium', trend: 'stable', source: 'imported' },
      { name: 'Potatoes', priceKg: 42, bag: 3780, demand: 'medium', trend: 'stable', source: 'mixed' },
      { name: 'Rice', priceKg: 140, bag: 12600, demand: 'medium', trend: 'stable', source: 'imported' },
    ]
  },

  'Kilifi': {
    region: 'Coastal',
    commodities: [
      { name: 'Maize', priceKg: 50, bag: 4500, demand: 'high', trend: 'stable', source: 'imported' },
      { name: 'Beans', priceKg: 110, bag: 9900, demand: 'medium', trend: 'increasing', source: 'mixed' },
      { name: 'Cashews', priceKg: 180, bag: 16200, demand: 'high', trend: 'increasing', source: 'local' },
      { name: 'Coconuts', priceKg: 55, bag: 4950, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Fish', priceKg: 290, bag: 26100, demand: 'high', trend: 'increasing', source: 'local' },
      { name: 'Mangoes', priceKg: 70, bag: 6300, demand: 'high', trend: 'seasonal', source: 'local' },
      { name: 'Rice', priceKg: 142, bag: 12780, demand: 'high', trend: 'stable', source: 'imported' },
      { name: 'Tomatoes', priceKg: 90, bag: 8100, demand: 'high', trend: 'fluctuating', source: 'mixed' },
      { name: 'Onions', priceKg: 108, bag: 9720, demand: 'high', trend: 'stable', source: 'imported' },
      { name: 'Cassava', priceKg: 38, bag: 3420, demand: 'low', trend: 'stable', source: 'local' },
    ]
  },

  'Tana River': {
    region: 'Coastal',
    commodities: [
      { name: 'Maize', priceKg: 55, bag: 4950, demand: 'high', trend: 'increasing', source: 'imported' },
      { name: 'Beans', priceKg: 120, bag: 10800, demand: 'high', trend: 'stable', source: 'imported' },
      { name: 'Millet', priceKg: 90, bag: 8100, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Sorghum', priceKg: 82, bag: 7380, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Fish', priceKg: 300, bag: 27000, demand: 'high', trend: 'increasing', source: 'local' },
      { name: 'Rice', priceKg: 148, bag: 13320, demand: 'high', trend: 'stable', source: 'imported' },
      { name: 'Mangoes', priceKg: 75, bag: 6750, demand: 'high', trend: 'seasonal', source: 'local' },
      { name: 'Coconuts', priceKg: 58, bag: 5220, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Tomatoes', priceKg: 100, bag: 9000, demand: 'high', trend: 'fluctuating', source: 'mixed' },
      { name: 'Onions', priceKg: 115, bag: 10350, demand: 'high', trend: 'stable', source: 'imported' },
    ]
  },

  'Lamu': {
    region: 'Coastal',
    commodities: [
      { name: 'Maize', priceKg: 58, bag: 5220, demand: 'medium', trend: 'stable', source: 'imported' },
      { name: 'Beans', priceKg: 125, bag: 11250, demand: 'medium', trend: 'stable', source: 'imported' },
      { name: 'Fish', priceKg: 320, bag: 28800, demand: 'high', trend: 'increasing', source: 'local' },
      { name: 'Coconuts', priceKg: 60, bag: 5400, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Cashews', priceKg: 185, bag: 16650, demand: 'high', trend: 'increasing', source: 'local' },
      { name: 'Rice', priceKg: 152, bag: 13680, demand: 'high', trend: 'stable', source: 'imported' },
      { name: 'Mangoes', priceKg: 80, bag: 7200, demand: 'high', trend: 'seasonal', source: 'local' },
      { name: 'Wheat', priceKg: 70, bag: 6300, demand: 'medium', trend: 'stable', source: 'imported' },
      { name: 'Tomatoes', priceKg: 105, bag: 9450, demand: 'medium', trend: 'fluctuating', source: 'mixed' },
      { name: 'Onions', priceKg: 120, bag: 10800, demand: 'medium', trend: 'stable', source: 'imported' },
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // NORTH EASTERN REGION (3 counties) - Pastoral, hard to grow crops
  // ═══════════════════════════════════════════════════════════════════════════

  'Garissa': {
    region: 'North Eastern',
    commodities: [
      { name: 'Maize', priceKg: 60, bag: 5400, demand: 'high', trend: 'increasing', source: 'imported' },
      { name: 'Beans', priceKg: 130, bag: 11700, demand: 'high', trend: 'stable', source: 'imported' },
      { name: 'Rice', priceKg: 155, bag: 13950, demand: 'high', trend: 'stable', source: 'imported' },
      { name: 'Millet', priceKg: 95, bag: 8550, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Sorghum', priceKg: 88, bag: 7920, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Wheat', priceKg: 68, bag: 6120, demand: 'medium', trend: 'stable', source: 'imported' },
      { name: 'Onions', priceKg: 125, bag: 11250, demand: 'high', trend: 'stable', source: 'imported' },
      { name: 'Tomatoes', priceKg: 110, bag: 9900, demand: 'high', trend: 'fluctuating', source: 'imported' },
      { name: 'Potatoes', priceKg: 55, bag: 4950, demand: 'high', trend: 'stable', source: 'imported' },
      { name: 'Dates', priceKg: 280, bag: 25200, demand: 'medium', trend: 'seasonal', source: 'local' },
    ]
  },

  'Wajir': {
    region: 'North Eastern',
    commodities: [
      { name: 'Maize', priceKg: 62, bag: 5580, demand: 'high', trend: 'increasing', source: 'imported' },
      { name: 'Beans', priceKg: 135, bag: 12150, demand: 'high', trend: 'stable', source: 'imported' },
      { name: 'Rice', priceKg: 158, bag: 14220, demand: 'high', trend: 'stable', source: 'imported' },
      { name: 'Sorghum', priceKg: 90, bag: 8100, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Millet', priceKg: 98, bag: 8820, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Wheat', priceKg: 70, bag: 6300, demand: 'medium', trend: 'stable', source: 'imported' },
      { name: 'Onions', priceKg: 130, bag: 11700, demand: 'high', trend: 'stable', source: 'imported' },
      { name: 'Tomatoes', priceKg: 115, bag: 10350, demand: 'high', trend: 'fluctuating', source: 'imported' },
      { name: 'Potatoes', priceKg: 58, bag: 5220, demand: 'high', trend: 'stable', source: 'imported' },
      { name: 'Dates', priceKg: 290, bag: 26100, demand: 'medium', trend: 'seasonal', source: 'local' },
    ]
  },

  'Mandera': {
    region: 'North Eastern',
    commodities: [
      { name: 'Maize', priceKg: 65, bag: 5850, demand: 'high', trend: 'increasing', source: 'imported' },
      { name: 'Beans', priceKg: 140, bag: 12600, demand: 'high', trend: 'stable', source: 'imported' },
      { name: 'Rice', priceKg: 162, bag: 14580, demand: 'high', trend: 'stable', source: 'imported' },
      { name: 'Millet', priceKg: 100, bag: 9000, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Sorghum', priceKg: 92, bag: 8280, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Wheat', priceKg: 72, bag: 6480, demand: 'medium', trend: 'stable', source: 'imported' },
      { name: 'Onions', priceKg: 135, bag: 12150, demand: 'high', trend: 'stable', source: 'imported' },
      { name: 'Tomatoes', priceKg: 120, bag: 10800, demand: 'high', trend: 'fluctuating', source: 'imported' },
      { name: 'Potatoes', priceKg: 60, bag: 5400, demand: 'high', trend: 'stable', source: 'imported' },
      { name: 'Dates', priceKg: 310, bag: 27900, demand: 'medium', trend: 'seasonal', source: 'local' },
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // EASTERN REGION (5 counties) - Maize, green grams, semi-arid
  // ═══════════════════════════════════════════════════════════════════════════

  'Marsabit': {
    region: 'Eastern',
    commodities: [
      { name: 'Maize', priceKg: 58, bag: 5220, demand: 'high', trend: 'increasing', source: 'imported' },
      { name: 'Beans', priceKg: 125, bag: 11250, demand: 'high', trend: 'stable', source: 'imported' },
      { name: 'Millet', priceKg: 92, bag: 8280, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Sorghum', priceKg: 85, bag: 7650, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Rice', priceKg: 150, bag: 13500, demand: 'medium', trend: 'stable', source: 'imported' },
      { name: 'Wheat', priceKg: 68, bag: 6120, demand: 'low', trend: 'stable', source: 'imported' },
      { name: 'Onions', priceKg: 120, bag: 10800, demand: 'high', trend: 'stable', source: 'imported' },
      { name: 'Tomatoes', priceKg: 108, bag: 9720, demand: 'high', trend: 'fluctuating', source: 'mixed' },
      { name: 'Potatoes', priceKg: 52, bag: 4680, demand: 'medium', trend: 'stable', source: 'imported' },
      { name: 'Bananas', priceKg: 65, bag: 5850, demand: 'medium', trend: 'seasonal', source: 'imported' },
    ]
  },

  'Isiolo': {
    region: 'Eastern',
    commodities: [
      { name: 'Maize', priceKg: 55, bag: 4950, demand: 'high', trend: 'stable', source: 'imported' },
      { name: 'Beans', priceKg: 118, bag: 10620, demand: 'high', trend: 'stable', source: 'imported' },
      { name: 'Millet', priceKg: 88, bag: 7920, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Sorghum', priceKg: 80, bag: 7200, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Rice', priceKg: 145, bag: 13050, demand: 'medium', trend: 'stable', source: 'imported' },
      { name: 'Wheat', priceKg: 65, bag: 5850, demand: 'low', trend: 'stable', source: 'imported' },
      { name: 'Onions', priceKg: 115, bag: 10350, demand: 'high', trend: 'stable', source: 'imported' },
      { name: 'Tomatoes', priceKg: 102, bag: 9180, demand: 'high', trend: 'fluctuating', source: 'mixed' },
      { name: 'Potatoes', priceKg: 48, bag: 4320, demand: 'medium', trend: 'stable', source: 'imported' },
      { name: 'Green Grams', priceKg: 160, bag: 14400, demand: 'high', trend: 'increasing', source: 'local' },
    ]
  },

  'Meru': {
    region: 'Eastern',
    commodities: [
      { name: 'Maize', priceKg: 40, bag: 3600, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Beans', priceKg: 80, bag: 7200, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Coffee', priceKg: 340, bag: 30600, demand: 'high', trend: 'increasing', source: 'local' },
      { name: 'Tea', priceKg: 115, bag: 10350, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Bananas', priceKg: 60, bag: 5400, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Miraa', priceKg: 800, bag: 72000, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Tomatoes', priceKg: 85, bag: 7650, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Onions', priceKg: 95, bag: 8550, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Green Grams', priceKg: 155, bag: 13950, demand: 'high', trend: 'increasing', source: 'local' },
      { name: 'Rice', priceKg: 135, bag: 12150, demand: 'medium', trend: 'stable', source: 'imported' },
    ]
  },

  'Tharaka-Nithi': {
    region: 'Eastern',
    commodities: [
      { name: 'Maize', priceKg: 43, bag: 3870, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Beans', priceKg: 88, bag: 7920, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Millet', priceKg: 78, bag: 7020, demand: 'low', trend: 'stable', source: 'local' },
      { name: 'Sorghum', priceKg: 72, bag: 6480, demand: 'low', trend: 'stable', source: 'local' },
      { name: 'Miraa', priceKg: 780, bag: 70200, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Bananas', priceKg: 58, bag: 5220, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Tomatoes', priceKg: 80, bag: 7200, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Onions', priceKg: 90, bag: 8100, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Green Grams', priceKg: 148, bag: 13320, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Rice', priceKg: 138, bag: 12420, demand: 'low', trend: 'stable', source: 'imported' },
    ]
  },

  'Embu': {
    region: 'Eastern',
    commodities: [
      { name: 'Maize', priceKg: 42, bag: 3780, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Beans', priceKg: 85, bag: 7650, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Coffee', priceKg: 350, bag: 31500, demand: 'high', trend: 'increasing', source: 'local' },
      { name: 'Tea', priceKg: 120, bag: 10800, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Bananas', priceKg: 62, bag: 5580, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Miraa', priceKg: 800, bag: 72000, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Tomatoes', priceKg: 88, bag: 7920, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Onions', priceKg: 98, bag: 8820, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Green Grams', priceKg: 158, bag: 14220, demand: 'high', trend: 'increasing', source: 'local' },
      { name: 'Rice', priceKg: 140, bag: 12600, demand: 'medium', trend: 'stable', source: 'imported' },
    ]
  },

  'Kitui': {
    region: 'Eastern',
    commodities: [
      { name: 'Maize', priceKg: 48, bag: 4320, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Beans', priceKg: 100, bag: 9000, demand: 'high', trend: 'increasing', source: 'local' },
      { name: 'Millet', priceKg: 85, bag: 7650, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Sorghum', priceKg: 75, bag: 6750, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Green Grams', priceKg: 152, bag: 13680, demand: 'high', trend: 'increasing', source: 'local' },
      { name: 'Tomatoes', priceKg: 92, bag: 8280, demand: 'high', trend: 'fluctuating', source: 'local' },
      { name: 'Onions', priceKg: 102, bag: 9180, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Potatoes', priceKg: 45, bag: 4050, demand: 'medium', trend: 'stable', source: 'imported' },
      { name: 'Bananas', priceKg: 55, bag: 4950, demand: 'medium', trend: 'seasonal', source: 'local' },
      { name: 'Rice', priceKg: 136, bag: 12240, demand: 'low', trend: 'stable', source: 'imported' },
    ]
  },

  'Machakos': {
    region: 'Eastern',
    commodities: [
      { name: 'Maize', priceKg: 45, bag: 4050, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Beans', priceKg: 95, bag: 8550, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Millet', priceKg: 80, bag: 7200, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Sorghum', priceKg: 70, bag: 6300, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Green Grams', priceKg: 150, bag: 13500, demand: 'high', trend: 'increasing', source: 'local' },
      { name: 'Tomatoes', priceKg: 85, bag: 7650, demand: 'high', trend: 'fluctuating', source: 'local' },
      { name: 'Onions', priceKg: 98, bag: 8820, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Potatoes', priceKg: 42, bag: 3780, demand: 'medium', trend: 'stable', source: 'mixed' },
      { name: 'Bananas', priceKg: 52, bag: 4680, demand: 'medium', trend: 'seasonal', source: 'local' },
      { name: 'Mangoes', priceKg: 50, bag: 4500, demand: 'high', trend: 'seasonal', source: 'local' },
    ]
  },

  'Makueni': {
    region: 'Eastern',
    commodities: [
      { name: 'Maize', priceKg: 44, bag: 3960, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Beans', priceKg: 90, bag: 8100, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Millet', priceKg: 75, bag: 6750, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Sorghum', priceKg: 68, bag: 6120, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Green Grams', priceKg: 145, bag: 13050, demand: 'high', trend: 'increasing', source: 'local' },
      { name: 'Mangoes', priceKg: 48, bag: 4320, demand: 'high', trend: 'seasonal', source: 'local' },
      { name: 'Tomatoes', priceKg: 80, bag: 7200, demand: 'high', trend: 'fluctuating', source: 'local' },
      { name: 'Onions', priceKg: 95, bag: 8550, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Watermelon', priceKg: 35, bag: 3150, demand: 'high', trend: 'seasonal', source: 'local' },
      { name: 'Potatoes', priceKg: 40, bag: 3600, demand: 'medium', trend: 'stable', source: 'mixed' },
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CENTRAL REGION (5 counties) - Coffee, tea, maize breadbasket
  // ═══════════════════════════════════════════════════════════════════════════

  'Nyandarua': {
    region: 'Central',
    commodities: [
      { name: 'Maize', priceKg: 38, bag: 3420, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Beans', priceKg: 75, bag: 6750, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Potatoes', priceKg: 40, bag: 3600, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Wheat', priceKg: 60, bag: 5400, demand: 'medium', trend: 'stable', source: 'mixed' },
      { name: 'Barley', priceKg: 55, bag: 4950, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Tea', priceKg: 110, bag: 9900, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Tomatoes', priceKg: 75, bag: 6750, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Onions', priceKg: 85, bag: 7650, demand: 'high', trend: 'stable', source: 'mixed' },
      { name: 'Cabbages', priceKg: 50, bag: 4500, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Carrots', priceKg: 45, bag: 4050, demand: 'high', trend: 'stable', source: 'local' },
    ]
  },

  'Nyeri': {
    region: 'Central',
    commodities: [
      { name: 'Maize', priceKg: 41, bag: 3690, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Beans', priceKg: 82, bag: 7380, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Coffee', priceKg: 360, bag: 32400, demand: 'high', trend: 'increasing', source: 'local' },
      { name: 'Tea', priceKg: 125, bag: 11250, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Potatoes', priceKg: 45, bag: 4050, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Tomatoes', priceKg: 80, bag: 7200, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Onions', priceKg: 92, bag: 8280, demand: 'high', trend: 'stable', source: 'mixed' },
      { name: 'Cabbages', priceKg: 55, bag: 4950, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Carrots', priceKg: 50, bag: 4500, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Wheat', priceKg: 62, bag: 5580, demand: 'medium', trend: 'stable', source: 'mixed' },
    ]
  },

  'Kirinyaga': {
    region: 'Central',
    commodities: [
      { name: 'Maize', priceKg: 42, bag: 3780, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Beans', priceKg: 85, bag: 7650, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Rice', priceKg: 130, bag: 11700, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Coffee', priceKg: 355, bag: 31950, demand: 'high', trend: 'increasing', source: 'local' },
      { name: 'Tea', priceKg: 122, bag: 10980, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Potatoes', priceKg: 43, bag: 3870, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Tomatoes', priceKg: 82, bag: 7380, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Onions', priceKg: 90, bag: 8100, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Cabbages', priceKg: 52, bag: 4680, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Wheat', priceKg: 60, bag: 5400, demand: 'medium', trend: 'stable', source: 'mixed' },
    ]
  },

  'Murang\'a': {
    region: 'Central',
    commodities: [
      { name: 'Maize', priceKg: 43, bag: 3870, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Beans', priceKg: 87, bag: 7830, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Coffee', priceKg: 350, bag: 31500, demand: 'high', trend: 'increasing', source: 'local' },
      { name: 'Tea', priceKg: 118, bag: 10620, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Potatoes', priceKg: 44, bag: 3960, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Tomatoes', priceKg: 83, bag: 7470, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Onions', priceKg: 91, bag: 8190, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Cabbages', priceKg: 53, bag: 4770, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Carrots', priceKg: 48, bag: 4320, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Wheat', priceKg: 61, bag: 5490, demand: 'medium', trend: 'stable', source: 'mixed' },
    ]
  },

  'Kiambu': {
    region: 'Central',
    commodities: [
      { name: 'Maize', priceKg: 45, bag: 4050, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Beans', priceKg: 90, bag: 8100, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Coffee', priceKg: 345, bag: 31050, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Tea', priceKg: 115, bag: 10350, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Vegetables', priceKg: 80, bag: 7200, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Tomatoes', priceKg: 85, bag: 7650, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Onions', priceKg: 95, bag: 8550, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Potatoes', priceKg: 46, bag: 4140, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Cabbages', priceKg: 58, bag: 5220, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Carrots', priceKg: 52, bag: 4680, demand: 'high', trend: 'stable', source: 'local' },
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // RIFT VALLEY REGION (8 counties) - Maize, wheat, tea breadbasket
  // ═══════════════════════════════════════════════════════════════════════════

  'Turkana': {
    region: 'Rift Valley',
    commodities: [
      { name: 'Maize', priceKg: 68, bag: 6120, demand: 'high', trend: 'increasing', source: 'imported' },
      { name: 'Beans', priceKg: 145, bag: 13050, demand: 'high', trend: 'stable', source: 'imported' },
      { name: 'Sorghum', priceKg: 90, bag: 8100, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Millet', priceKg: 95, bag: 8550, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Rice', priceKg: 148, bag: 13320, demand: 'medium', trend: 'stable', source: 'imported' },
      { name: 'Tomatoes', priceKg: 105, bag: 9450, demand: 'high', trend: 'fluctuating', source: 'local' },
      { name: 'Onions', priceKg: 120, bag: 10800, demand: 'high', trend: 'stable', source: 'imported' },
      { name: 'Potatoes', priceKg: 58, bag: 5220, demand: 'high', trend: 'stable', source: 'imported' },
      { name: 'Milk', priceKg: 45, bag: 4050, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Meat', priceKg: 350, bag: 31500, demand: 'high', trend: 'stable', source: 'local' },
    ]
  },

  'West Pokot': {
    region: 'Rift Valley',
    commodities: [
      { name: 'Maize', priceKg: 50, bag: 4500, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Beans', priceKg: 105, bag: 9450, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Millet', priceKg: 85, bag: 7650, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Sorghum', priceKg: 78, bag: 7020, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Wheat', priceKg: 58, bag: 5220, demand: 'medium', trend: 'stable', source: 'mixed' },
      { name: 'Potatoes', priceKg: 48, bag: 4320, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Tomatoes', priceKg: 85, bag: 7650, demand: 'high', trend: 'fluctuating', source: 'local' },
      { name: 'Onions', priceKg: 98, bag: 8820, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Milk', priceKg: 42, bag: 3780, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Meat', priceKg: 320, bag: 28800, demand: 'high', trend: 'stable', source: 'local' },
    ]
  },

  'Samburu': {
    region: 'Rift Valley',
    commodities: [
      { name: 'Maize', priceKg: 65, bag: 5850, demand: 'high', trend: 'increasing', source: 'imported' },
      { name: 'Beans', priceKg: 140, bag: 12600, demand: 'high', trend: 'stable', source: 'imported' },
      { name: 'Millet', priceKg: 92, bag: 8280, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Sorghum', priceKg: 85, bag: 7650, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Rice', priceKg: 145, bag: 13050, demand: 'medium', trend: 'stable', source: 'imported' },
      { name: 'Milk', priceKg: 40, bag: 3600, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Meat', priceKg: 330, bag: 29700, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Tomatoes', priceKg: 95, bag: 8550, demand: 'medium', trend: 'fluctuating', source: 'local' },
      { name: 'Potatoes', priceKg: 55, bag: 4950, demand: 'medium', trend: 'stable', source: 'imported' },
      { name: 'Onions', priceKg: 110, bag: 9900, demand: 'high', trend: 'stable', source: 'imported' },
    ]
  },

  'Trans Nzoia': {
    region: 'Rift Valley',
    commodities: [
      { name: 'Maize', priceKg: 35, bag: 3150, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Beans', priceKg: 70, bag: 6300, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Wheat', priceKg: 55, bag: 4950, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Sunflower', priceKg: 65, bag: 5850, demand: 'medium', trend: 'increasing', source: 'local' },
      { name: 'Potatoes', priceKg: 42, bag: 3780, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Tomatoes', priceKg: 72, bag: 6480, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Onions', priceKg: 80, bag: 7200, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Cabbages', priceKg: 48, bag: 4320, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Milk', priceKg: 38, bag: 3420, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Rice', priceKg: 130, bag: 11700, demand: 'medium', trend: 'stable', source: 'imported' },
    ]
  },

  'Uasin Gishu': {
    region: 'Rift Valley',
    commodities: [
      { name: 'Maize', priceKg: 36, bag: 3240, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Beans', priceKg: 72, bag: 6480, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Wheat', priceKg: 56, bag: 5040, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Barley', priceKg: 52, bag: 4680, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Potatoes', priceKg: 43, bag: 3870, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Tomatoes', priceKg: 75, bag: 6750, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Onions', priceKg: 85, bag: 7650, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Cabbages', priceKg: 50, bag: 4500, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Milk', priceKg: 39, bag: 3510, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Rice', priceKg: 132, bag: 11880, demand: 'medium', trend: 'stable', source: 'imported' },
    ]
  },

  'Elgeyo-Marakwet': {
    region: 'Rift Valley',
    commodities: [
      { name: 'Maize', priceKg: 38, bag: 3420, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Beans', priceKg: 78, bag: 7020, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Potatoes', priceKg: 42, bag: 3780, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Wheat', priceKg: 58, bag: 5220, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Tomatoes', priceKg: 78, bag: 7020, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Onions', priceKg: 88, bag: 7920, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Cabbages', priceKg: 52, bag: 4680, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Carrots', priceKg: 45, bag: 4050, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Milk', priceKg: 40, bag: 3600, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Rice', priceKg: 133, bag: 11970, demand: 'low', trend: 'stable', source: 'imported' },
    ]
  },

  'Nandi': {
    region: 'Rift Valley',
    commodities: [
      { name: 'Maize', priceKg: 37, bag: 3330, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Beans', priceKg: 75, bag: 6750, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Tea', priceKg: 110, bag: 9900, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Coffee', priceKg: 330, bag: 29700, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Potatoes', priceKg: 41, bag: 3690, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Tomatoes', priceKg: 73, bag: 6570, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Onions', priceKg: 82, bag: 7380, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Cabbages', priceKg: 48, bag: 4320, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Milk', priceKg: 37, bag: 3330, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Rice', priceKg: 131, bag: 11790, demand: 'low', trend: 'stable', source: 'imported' },
    ]
  },

  'Baringo': {
    region: 'Rift Valley',
    commodities: [
      { name: 'Maize', priceKg: 48, bag: 4320, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Beans', priceKg: 98, bag: 8820, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Millet', priceKg: 82, bag: 7380, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Sorghum', priceKg: 75, bag: 6750, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Potatoes', priceKg: 46, bag: 4140, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Tomatoes', priceKg: 80, bag: 7200, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Onions', priceKg: 92, bag: 8280, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Milk', priceKg: 41, bag: 3690, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Meat', priceKg: 300, bag: 27000, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Rice', priceKg: 135, bag: 12150, demand: 'low', trend: 'stable', source: 'imported' },
    ]
  },

  'Laikipia': {
    region: 'Rift Valley',
    commodities: [
      { name: 'Maize', priceKg: 40, bag: 3600, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Beans', priceKg: 82, bag: 7380, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Wheat', priceKg: 58, bag: 5220, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Barley', priceKg: 54, bag: 4860, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Peas', priceKg: 90, bag: 8100, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Potatoes', priceKg: 44, bag: 3960, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Tomatoes', priceKg: 77, bag: 6930, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Onions', priceKg: 88, bag: 7920, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Milk', priceKg: 39, bag: 3510, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Rice', priceKg: 133, bag: 11970, demand: 'low', trend: 'stable', source: 'imported' },
    ]
  },

  'Nakuru': {
    region: 'Rift Valley',
    commodities: [
      { name: 'Maize', priceKg: 39, bag: 3510, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Beans', priceKg: 80, bag: 7200, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Wheat', priceKg: 57, bag: 5130, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Potatoes', priceKg: 43, bag: 3870, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Tomatoes', priceKg: 70, bag: 6300, demand: 'high', trend: 'decreasing', source: 'local' },
      { name: 'Onions', priceKg: 85, bag: 7650, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Cabbages', priceKg: 50, bag: 4500, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Milk', priceKg: 38, bag: 3420, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Meat', priceKg: 290, bag: 26100, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Rice', priceKg: 132, bag: 11880, demand: 'medium', trend: 'stable', source: 'imported' },
    ]
  },

  'Narok': {
    region: 'Rift Valley',
    commodities: [
      { name: 'Maize', priceKg: 38, bag: 3420, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Beans', priceKg: 78, bag: 7020, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Wheat', priceKg: 56, bag: 5040, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Barley', priceKg: 53, bag: 4770, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Potatoes', priceKg: 42, bag: 3780, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Tomatoes', priceKg: 75, bag: 6750, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Onions', priceKg: 88, bag: 7920, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Milk', priceKg: 37, bag: 3330, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Meat', priceKg: 310, bag: 27900, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Rice', priceKg: 130, bag: 11700, demand: 'low', trend: 'stable', source: 'imported' },
    ]
  },

  'Kajiado': {
    region: 'Rift Valley',
    commodities: [
      { name: 'Maize', priceKg: 44, bag: 3960, demand: 'high', trend: 'stable', source: 'imported' },
      { name: 'Beans', priceKg: 90, bag: 8100, demand: 'high', trend: 'stable', source: 'imported' },
      { name: 'Millet', priceKg: 80, bag: 7200, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Sorghum', priceKg: 72, bag: 6480, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Potatoes', priceKg: 47, bag: 4230, demand: 'high', trend: 'stable', source: 'imported' },
      { name: 'Tomatoes', priceKg: 80, bag: 7200, demand: 'high', trend: 'stable', source: 'imported' },
      { name: 'Onions', priceKg: 92, bag: 8280, demand: 'high', trend: 'stable', source: 'imported' },
      { name: 'Milk', priceKg: 40, bag: 3600, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Meat', priceKg: 305, bag: 27450, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Rice', priceKg: 135, bag: 12150, demand: 'low', trend: 'stable', source: 'imported' },
    ]
  },

  'Kericho': {
    region: 'Rift Valley',
    commodities: [
      { name: 'Maize', priceKg: 37, bag: 3330, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Beans', priceKg: 76, bag: 6840, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Tea', priceKg: 115, bag: 10350, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Coffee', priceKg: 335, bag: 30150, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Pyrethrum', priceKg: 180, bag: 16200, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Potatoes', priceKg: 40, bag: 3600, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Tomatoes', priceKg: 72, bag: 6480, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Onions', priceKg: 82, bag: 7380, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Cabbages', priceKg: 48, bag: 4320, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Rice', priceKg: 130, bag: 11700, demand: 'low', trend: 'stable', source: 'imported' },
    ]
  },

  'Bomet': {
    region: 'Rift Valley',
    commodities: [
      { name: 'Maize', priceKg: 36, bag: 3240, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Beans', priceKg: 74, bag: 6660, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Tea', priceKg: 112, bag: 10080, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Coffee', priceKg: 328, bag: 29520, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Potatoes', priceKg: 39, bag: 3510, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Tomatoes', priceKg: 70, bag: 6300, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Onions', priceKg: 80, bag: 7200, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Millet', priceKg: 78, bag: 7020, demand: 'low', trend: 'stable', source: 'local' },
      { name: 'Cabbages', priceKg: 46, bag: 4140, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Rice', priceKg: 128, bag: 11520, demand: 'low', trend: 'stable', source: 'imported' },
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WESTERN REGION (4 counties) - Maize, beans, sugar cane
  // ═══════════════════════════════════════════════════════════════════════════

  'Kakamega': {
    region: 'Western',
    commodities: [
      { name: 'Maize', priceKg: 40, bag: 3600, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Beans', priceKg: 82, bag: 7380, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Sorghum', priceKg: 70, bag: 6300, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Millet', priceKg: 75, bag: 6750, demand: 'low', trend: 'stable', source: 'local' },
      { name: 'Cassava', priceKg: 38, bag: 3420, demand: 'low', trend: 'stable', source: 'local' },
      { name: 'Tomatoes', priceKg: 78, bag: 7020, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Onions', priceKg: 88, bag: 7920, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Bananas', priceKg: 55, bag: 4950, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Rice', priceKg: 135, bag: 12150, demand: 'medium', trend: 'stable', source: 'imported' },
      { name: 'Sugar Cane', priceKg: 12, bag: 1080, demand: 'high', trend: 'stable', source: 'local' },
    ]
  },

  'Vihiga': {
    region: 'Western',
    commodities: [
      { name: 'Maize', priceKg: 42, bag: 3780, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Beans', priceKg: 85, bag: 7650, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Sorghum', priceKg: 72, bag: 6480, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Vegetables', priceKg: 60, bag: 5400, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Tomatoes', priceKg: 80, bag: 7200, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Onions', priceKg: 90, bag: 8100, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Bananas', priceKg: 58, bag: 5220, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Cassava', priceKg: 40, bag: 3600, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Rice', priceKg: 137, bag: 12330, demand: 'medium', trend: 'stable', source: 'imported' },
      { name: 'Sugar Cane', priceKg: 13, bag: 1170, demand: 'high', trend: 'stable', source: 'local' },
    ]
  },

  'Busia': {
    region: 'Western',
    commodities: [
      { name: 'Maize', priceKg: 41, bag: 3690, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Beans', priceKg: 83, bag: 7470, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Cassava', priceKg: 40, bag: 3600, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Sweet Potatoes', priceKg: 45, bag: 4050, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Tomatoes', priceKg: 80, bag: 7200, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Onions', priceKg: 89, bag: 8010, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Bananas', priceKg: 57, bag: 5130, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Rice', priceKg: 136, bag: 12240, demand: 'medium', trend: 'stable', source: 'imported' },
      { name: 'Sugar Cane', priceKg: 13, bag: 1170, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Fish', priceKg: 260, bag: 23400, demand: 'high', trend: 'stable', source: 'local' },
    ]
  },

  'Bungoma': {
    region: 'Western',
    commodities: [
      { name: 'Maize', priceKg: 39, bag: 3510, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Beans', priceKg: 80, bag: 7200, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Wheat', priceKg: 55, bag: 4950, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Sorghum', priceKg: 68, bag: 6120, demand: 'low', trend: 'stable', source: 'local' },
      { name: 'Sugar Cane', priceKg: 12, bag: 1080, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Tomatoes', priceKg: 77, bag: 6930, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Onions', priceKg: 87, bag: 7830, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Bananas', priceKg: 54, bag: 4860, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Rice', priceKg: 133, bag: 11970, demand: 'medium', trend: 'stable', source: 'imported' },
      { name: 'Vegetables', priceKg: 58, bag: 5220, demand: 'high', trend: 'stable', source: 'local' },
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // NYANZA REGION (5 counties) - Fish, rice, maize, bananas
  // ═══════════════════════════════════════════════════════════════════════════

  'Siaya': {
    region: 'Nyanza',
    commodities: [
      { name: 'Maize', priceKg: 43, bag: 3870, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Beans', priceKg: 88, bag: 7920, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Sorghum', priceKg: 73, bag: 6570, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Millet', priceKg: 78, bag: 7020, demand: 'low', trend: 'stable', source: 'local' },
      { name: 'Fish', priceKg: 280, bag: 25200, demand: 'high', trend: 'increasing', source: 'local' },
      { name: 'Rice', priceKg: 135, bag: 12150, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Tomatoes', priceKg: 82, bag: 7380, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Onions', priceKg: 93, bag: 8370, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Bananas', priceKg: 60, bag: 5400, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Sweet Potatoes', priceKg: 48, bag: 4320, demand: 'medium', trend: 'stable', source: 'local' },
    ]
  },

  'Kisumu': {
    region: 'Nyanza',
    commodities: [
      { name: 'Maize', priceKg: 44, bag: 3960, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Beans', priceKg: 90, bag: 8100, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Rice', priceKg: 135, bag: 12150, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Fish', priceKg: 300, bag: 27000, demand: 'high', trend: 'increasing', source: 'local' },
      { name: 'Sorghum', priceKg: 75, bag: 6750, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Tomatoes', priceKg: 85, bag: 7650, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Onions', priceKg: 95, bag: 8550, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Bananas', priceKg: 62, bag: 5580, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Sweet Potatoes', priceKg: 50, bag: 4500, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Cassava', priceKg: 42, bag: 3780, demand: 'low', trend: 'stable', source: 'local' },
    ]
  },

  'Homa Bay': {
    region: 'Nyanza',
    commodities: [
      { name: 'Maize', priceKg: 42, bag: 3780, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Beans', priceKg: 86, bag: 7740, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Millet', priceKg: 76, bag: 6840, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Sorghum', priceKg: 72, bag: 6480, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Fish', priceKg: 270, bag: 24300, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Rice', priceKg: 133, bag: 11970, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Tomatoes', priceKg: 82, bag: 7380, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Onions', priceKg: 92, bag: 8280, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Bananas', priceKg: 58, bag: 5220, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Sweet Potatoes', priceKg: 46, bag: 4140, demand: 'medium', trend: 'stable', source: 'local' },
    ]
  },

  'Migori': {
    region: 'Nyanza',
    commodities: [
      { name: 'Maize', priceKg: 41, bag: 3690, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Beans', priceKg: 84, bag: 7560, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Sorghum', priceKg: 71, bag: 6390, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Millet', priceKg: 77, bag: 6930, demand: 'low', trend: 'stable', source: 'local' },
      { name: 'Rice', priceKg: 132, bag: 11880, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Fish', priceKg: 290, bag: 26100, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Tomatoes', priceKg: 80, bag: 7200, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Onions', priceKg: 90, bag: 8100, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Bananas', priceKg: 56, bag: 5040, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Sweet Potatoes', priceKg: 44, bag: 3960, demand: 'medium', trend: 'stable', source: 'local' },
    ]
  },

  'Kisii': {
    region: 'Nyanza',
    commodities: [
      { name: 'Maize', priceKg: 43, bag: 3870, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Beans', priceKg: 88, bag: 7920, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Bananas', priceKg: 55, bag: 4950, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Avocados', priceKg: 80, bag: 7200, demand: 'high', trend: 'increasing', source: 'local' },
      { name: 'Tea', priceKg: 108, bag: 9720, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Tomatoes', priceKg: 85, bag: 7650, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Onions', priceKg: 93, bag: 8370, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Rice', priceKg: 133, bag: 11970, demand: 'medium', trend: 'stable', source: 'imported' },
      { name: 'Cabbages', priceKg: 55, bag: 4950, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Sweet Potatoes', priceKg: 50, bag: 4500, demand: 'medium', trend: 'stable', source: 'local' },
    ]
  },

  'Nyamira': {
    region: 'Nyanza',
    commodities: [
      { name: 'Maize', priceKg: 42, bag: 3780, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Beans', priceKg: 86, bag: 7740, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Bananas', priceKg: 52, bag: 4680, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Tea', priceKg: 105, bag: 9450, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Tomatoes', priceKg: 83, bag: 7470, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Onions', priceKg: 91, bag: 8190, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Rice', priceKg: 131, bag: 11790, demand: 'medium', trend: 'stable', source: 'imported' },
      { name: 'Cabbages', priceKg: 53, bag: 4770, demand: 'high', trend: 'stable', source: 'local' },
      { name: 'Sweet Potatoes', priceKg: 48, bag: 4320, demand: 'medium', trend: 'stable', source: 'local' },
      { name: 'Avocados', priceKg: 75, bag: 6750, demand: 'high', trend: 'increasing', source: 'local' },
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // NAIROBI (1 county) - Urban market hub, highest prices
  // ═══════════════════════════════════════════════════════════════════════════

  'Nairobi': {
    region: 'Nairobi',
    commodities: [
      { name: 'Maize', priceKg: 48, bag: 4320, demand: 'high', trend: 'stable', source: 'imported' },
      { name: 'Beans', priceKg: 95, bag: 8550, demand: 'high', trend: 'stable', source: 'imported' },
      { name: 'Rice', priceKg: 150, bag: 13500, demand: 'high', trend: 'stable', source: 'imported' },
      { name: 'Wheat', priceKg: 62, bag: 5580, demand: 'high', trend: 'stable', source: 'imported' },
      { name: 'Potatoes', priceKg: 50, bag: 4500, demand: 'high', trend: 'stable', source: 'imported' },
      { name: 'Tomatoes', priceKg: 90, bag: 8100, demand: 'high', trend: 'fluctuating', source: 'mixed' },
      { name: 'Onions', priceKg: 100, bag: 9000, demand: 'high', trend: 'stable', source: 'imported' },
      { name: 'Cabbages', priceKg: 55, bag: 4950, demand: 'high', trend: 'stable', source: 'imported' },
      { name: 'Carrots', priceKg: 55, bag: 4950, demand: 'high', trend: 'stable', source: 'imported' },
      { name: 'Bananas', priceKg: 70, bag: 6300, demand: 'high', trend: 'stable', source: 'imported' },
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TAITA TAVETA (1 county) - Semi-arid but produces some crops
  // ═══════════════════════════════════════════════════════════════════════════

  'Taita-Taveta': {
    region: 'Coastal',
    commodities: [
      { name: 'Maize', priceKg: 46, bag: 4140, demand: 'medium', trend: 'stable', source: 'imported' },
      { name: 'Beans', priceKg: 100, bag: 9000, demand: 'medium', trend: 'stable', source: 'imported' },
      { name: 'Tomatoes', priceKg: 80, bag: 7200, demand: 'high', trend: 'decreasing', source: 'local' },
      { name: 'Onions', priceKg: 95, bag: 8550, demand: 'high', trend: 'stable', source: 'imported' },
      { name: 'Potatoes', priceKg: 48, bag: 4320, demand: 'medium', trend: 'stable', source: 'imported' },
      { name: 'Rice', priceKg: 142, bag: 12780, demand: 'medium', trend: 'stable', source: 'imported' },
      { name: 'Wheat', priceKg: 64, bag: 5760, demand: 'medium', trend: 'stable', source: 'imported' },
      { name: 'Millet', priceKg: 82, bag: 7380, demand: 'low', trend: 'stable', source: 'local' },
      { name: 'Mangoes', priceKg: 72, bag: 6480, demand: 'high', trend: 'seasonal', source: 'local' },
      { name: 'Cassava', priceKg: 36, bag: 3240, demand: 'low', trend: 'stable', source: 'local' },
    ]
  },
}

async function main() {
  console.log('🌱 Starting comprehensive commodity price seed...')
  console.log(`📊 Seeding ${Object.keys(COMPREHENSIVE_COMMODITIES).length} counties with detailed pricing...\n`)

  let totalCreated = 0
  let totalUpdated = 0
  let totalErrors = 0

  for (const [countyName, countyData] of Object.entries(COMPREHENSIVE_COMMODITIES)) {
    console.log(`📍 ${countyData.region} - ${countyName}`)

    for (const commodity of countyData.commodities) {
      try {
        const existing = await prisma.commodityPrice.findUnique({
          where: {
            county_commodity: {
              county: countyName,
              commodity: commodity.name,
            },
          },
        })

        if (existing) {
          await prisma.commodityPrice.update({
            where: {
              county_commodity: {
                county: countyName,
                commodity: commodity.name,
              },
            },
            data: {
              pricePerKg: commodity.priceKg,
              pricePerBag: commodity.bag,
              previousPrice: existing.pricePerKg,
              priceTrend: commodity.trend,
              demandLevel: commodity.demand,
              lastUpdated: new Date(),
              notes: `${commodity.source} source | ${countyData.region} region`,
            },
          })
          totalUpdated++
        } else {
          await prisma.commodityPrice.create({
            data: {
              county: countyName,
              commodity: commodity.name,
              pricePerKg: commodity.priceKg,
              pricePerBag: commodity.bag,
              priceTrend: commodity.trend,
              demandLevel: commodity.demand,
              unit: 'kg',
              isActive: true,
              source: 'seed',
              notes: `${commodity.source} source | ${countyData.region} region`,
            },
          })
          totalCreated++
        }
      } catch (error) {
        totalErrors++
        console.error(`  ❌ Error: ${commodity.name} - ${error instanceof Error ? error.message : String(error)}`)
      }
    }
  }

  console.log('\n✅ Seed completed!')
  console.log(`📊 Created: ${totalCreated}`)
  console.log(`📊 Updated: ${totalUpdated}`)
  console.log(`📊 Errors: ${totalErrors}`)
  console.log(`📊 Total records: ${totalCreated + totalUpdated}`)
  console.log(`🎯 All 47 Kenyan counties populated with realistic farm commodities and pricing!`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
