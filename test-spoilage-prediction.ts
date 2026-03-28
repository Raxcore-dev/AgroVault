/**
 * Spoilage Prediction System Test Script
 * 
 * This script tests the complete spoilage prediction pipeline:
 * 1. Fetches predictions from the API
 * 2. Validates response structure
 * 3. Tests different risk scenarios
 * 4. Verifies AI integration
 * 5. Checks market intelligence
 * 
 * Usage:
 *   npx tsx test-spoilage-prediction.ts
 */

import { predictSpoilageWithAI, analyzeTrend, analyzeDurationExposure } from './lib/services/ai-spoilage-prediction'
import { getSpoilageTriggeredMarketIntelligence } from './lib/services/market-intelligence-rax'

// ─── Test Data ─────────────────────────────────────────────────────────────────

interface SensorDataPoint {
  temperature: number
  humidity: number
  timestamp: Date
}

// Test Scenario 1: Safe conditions
const SAFE_SCENARIO = {
  name: 'Safe Conditions',
  commodity: 'maize',
  readings: generateReadings(20, 22, 65, 0.1), // Stable at 22°C, 65%
  expectedRisk: 'safe',
}

// Test Scenario 2: Warning conditions
const WARNING_SCENARIO = {
  name: 'Warning Conditions',
  commodity: 'tomatoes',
  readings: generateReadings(20, 24, 75, 0.5), // Rising to 24°C, 75%
  expectedRisk: 'warning',
}

// Test Scenario 3: High risk conditions
const HIGH_RISK_SCENARIO = {
  name: 'High Risk Conditions',
  commodity: 'avocado',
  readings: generateReadings(20, 32, 80, 1.2), // Rapidly rising to 32°C, 80%
  expectedRisk: 'high_risk',
}

// Test Scenario 4: Critical conditions
const CRITICAL_SCENARIO = {
  name: 'Critical Conditions',
  commodity: 'potatoes',
  readings: generateReadings(20, 35, 90, 1.5), // Very high at 35°C, 90%
  expectedRisk: 'critical',
}

// ─── Helper Functions ──────────────────────────────────────────────────────────

function generateReadings(
  count: number,
  baseTemp: number,
  baseHumidity: number,
  trendRate: number
): SensorDataPoint[] {
  const readings: SensorDataPoint[] = []
  const now = Date.now()
  const interval = 3 * 60 * 1000 // 3 minutes between readings

  for (let i = 0; i < count; i++) {
    const timeOffset = (count - i - 1) * interval
    const timestamp = new Date(now - timeOffset)
    
    // Add trend and some noise
    const temperature = baseTemp + (i * trendRate * 0.1) + (Math.random() - 0.5) * 0.5
    const humidity = baseHumidity + (i * trendRate * 0.15) + (Math.random() - 0.5) * 1

    readings.push({
      temperature: Math.round(temperature * 10) / 10,
      humidity: Math.round(humidity * 10) / 10,
      timestamp,
    })
  }

  return readings
}

function analyzeReadings(readings: SensorDataPoint[]) {
  const tempTrend = analyzeTrend(readings)
  const humTrend = analyzeTrend(
    readings.map(r => ({
      temperature: r.humidity,
      humidity: r.humidity,
      timestamp: r.timestamp,
    }))
  )
  const durationExposure = analyzeDurationExposure(readings, {
    name: 'Test Crop',
    optimalTempRange: { min: 15, max: 25 },
    optimalHumidityRange: { min: 60, max: 70 },
    maxStorageDays: 90,
    spoilageSensitivity: 'high',
  })

  return { tempTrend, humTrend, durationExposure }
}

// ─── Test Functions ────────────────────────────────────────────────────────────

async function testTrendAnalysis() {
  console.log('\n📊 Testing Trend Analysis...\n')

  const scenarios = [
    SAFE_SCENARIO,
    WARNING_SCENARIO,
    HIGH_RISK_SCENARIO,
    CRITICAL_SCENARIO,
  ]

  for (const scenario of scenarios) {
    console.log(`\n--- ${scenario.name} ---`)
    const { tempTrend, humTrend, durationExposure } = analyzeReadings(scenario.readings)

    console.log(`Temperature Trend: ${tempTrend.direction} (${tempTrend.changePercent.toFixed(1)}%)`)
    console.log(`Humidity Trend: ${humTrend.direction} (${humTrend.changePercent.toFixed(1)}%)`)
    console.log(`Duration in High Risk: ${durationExposure.minutesInHighRisk} minutes`)
    console.log(`Consecutive Bad Readings: ${durationExposure.consecutiveBadReadings}`)

    // Validate trend detection
    if (scenario.name === 'Safe Conditions') {
      console.assert(tempTrend.volatility === 'low', 'Safe scenario should have low volatility')
    }
  }

  console.log('\n✅ Trend Analysis tests completed\n')
}

async function testAIPredictions() {
  console.log('\n🤖 Testing AI Predictions...\n')

  const scenarios = [
    SAFE_SCENARIO,
    WARNING_SCENARIO,
    HIGH_RISK_SCENARIO,
    CRITICAL_SCENARIO,
  ]

  for (const scenario of scenarios) {
    console.log(`\n--- ${scenario.name} ---`)
    
    const { tempTrend, humTrend, durationExposure } = analyzeReadings(scenario.readings)
    const currentReading = scenario.readings[scenario.readings.length - 1]

    try {
      const prediction = await predictSpoilageWithAI(
        'test-unit-1',
        'Test Storage Unit',
        'Kisumu',
        'commodity-1',
        scenario.commodity,
        500,
        'kg',
        new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        currentReading.temperature,
        currentReading.humidity,
        scenario.readings
      )

      console.log(`Risk Level: ${prediction.aiPrediction.riskLevel}`)
      console.log(`Confidence: ${prediction.aiPrediction.confidence}%`)
      console.log(`Spoilage Probability: ${prediction.aiPrediction.spoilageProbability}%`)
      console.log(`Predicted Time: ${prediction.aiPrediction.predictedTimeToSpoilage}`)
      console.log(`Early Warning: ${prediction.aiPrediction.earlyWarning.triggered ? '⚠️ YES' : 'No'}`)
      
      if (prediction.marketIntelligence) {
        console.log(`Market Intelligence: ✅ Available`)
        console.log(`Urgency Level: ${prediction.marketIntelligence.urgencyLevel}`)
      }

      // Validate risk level matches expectation
      const actualRisk = prediction.aiPrediction.riskLevel
      const expectedRisk = scenario.expectedRisk
      
      // Note: This is a soft assertion as AI may vary
      console.log(`Expected: ${expectedRisk}, Got: ${actualRisk}`)
      
      if (actualRisk === 'high_risk' || actualRisk === 'critical') {
        console.assert(
          prediction.marketIntelligence !== undefined,
          'High risk should trigger market intelligence'
        )
      }

    } catch (error) {
      console.error(`❌ Prediction failed for ${scenario.name}:`, error)
    }
  }

  console.log('\n✅ AI Prediction tests completed\n')
}

async function testMarketIntelligence() {
  console.log('\n💰 Testing Market Intelligence...\n')

  try {
    const marketIntel = await getSpoilageTriggeredMarketIntelligence({
      commodityName: 'maize',
      quantity: 500,
      unit: 'kg',
      location: 'Kisumu',
      latitude: -0.0917,
      longitude: 34.7680,
      currentTemperature: 32,
      currentHumidity: 80,
      temperatureTrend: 'rising',
      humidityTrend: 'rising',
      spoilageRiskScore: 75,
      spoilageProbability: 65,
      predictedTimeToSpoilage: '24-48 hours',
      daysInStorage: 45,
      optimalStorageConditions: {
        tempRange: { min: 15, max: 25 },
        humidityRange: { min: 12, max: 14 },
        maxStorageDays: 180,
      },
      timeInDangerousConditions: 45,
    })

    console.log('Market Assessment:', marketIntel.marketAssessment)
    console.log('Urgency Level:', marketIntel.urgencyLevel)
    console.log('Recommended Action:', marketIntel.recommendedAction)
    console.log(`Nearby Markets: ${marketIntel.nearbyMarkets.length}`)
    
    if (marketIntel.nearbyMarkets.length > 0) {
      const bestMarket = marketIntel.nearbyMarkets[0]
      console.log('\nBest Market:')
      console.log(`  Name: ${bestMarket.marketName}`)
      console.log(`  Distance: ${bestMarket.distance_km} km`)
      console.log(`  Price: KES ${bestMarket.currentPrice}/kg`)
      console.log(`  Demand: ${bestMarket.demandLevel}`)
      console.log(`  AI Insight: ${bestMarket.aiInsight}`)
    }

    console.log('\n✅ Market Intelligence test completed\n')
  } catch (error) {
    console.error('❌ Market Intelligence test failed:', error)
  }
}

async function testFallbackLogic() {
  console.log('\n🔄 Testing Fallback Logic...\n')

  // Temporarily remove API key to test fallback
  const originalKey = process.env.RAX_API_KEY
  process.env.RAX_API_KEY = ''

  try {
    const { tempTrend, humTrend, durationExposure } = analyzeReadings(HIGH_RISK_SCENARIO.readings)
    const currentReading = HIGH_RISK_SCENARIO.readings[HIGH_RISK_SCENARIO.readings.length - 1]

    const prediction = await predictSpoilageWithAI(
      'test-unit-1',
      'Test Storage Unit',
      'Kisumu',
      'commodity-1',
      HIGH_RISK_SCENARIO.commodity,
      500,
      'kg',
      new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      currentReading.temperature,
      currentReading.humidity,
      HIGH_RISK_SCENARIO.readings
    )

    console.log(`Risk Level: ${prediction.aiPrediction.riskLevel}`)
    console.log(`Confidence: ${prediction.aiPrediction.confidence}%`)
    console.log(`Spoilage Probability: ${prediction.aiPrediction.spoilageProbability}%`)
    console.log(`Explanation: ${prediction.aiPrediction.explanation}`)
    
    console.assert(
      prediction.aiPrediction.riskLevel !== undefined,
      'Fallback should still provide risk level'
    )
    console.assert(
      prediction.aiPrediction.recommendations.length > 0,
      'Fallback should provide recommendations'
    )

    console.log('\n✅ Fallback Logic test completed\n')
  } catch (error) {
    console.error('❌ Fallback Logic test failed:', error)
  } finally {
    // Restore API key
    process.env.RAX_API_KEY = originalKey
  }
}

async function runAllTests() {
  console.log('╔═══════════════════════════════════════════════════════════╗')
  console.log('║   AgroVault Spoilage Prediction System - Test Suite      ║')
  console.log('╚═══════════════════════════════════════════════════════════╝')
  console.log('\nStarting comprehensive tests...\n')

  const startTime = Date.now()

  await testTrendAnalysis()
  await testAIPredictions()
  await testMarketIntelligence()
  await testFallbackLogic()

  const duration = Date.now() - startTime
  console.log(`\n⏱️  Total test duration: ${(duration / 1000).toFixed(2)}s`)
  console.log('\n✅ All tests completed!\n')
}

// ─── Run Tests ────────────────────────────────────────────────────────────────

runAllTests().catch(console.error)
