# AI-Powered Spoilage Prediction System

## Overview

The **Spoilage Prediction System** in AgroVault has been transformed into an **intelligent predictive analysis system** powered by **RAX AI**. It analyzes real-time sensor data, detects trends, and predicts spoilage risk BEFORE it happens.

---

## 🎯 Key Features

### 1. Real-Time Predictive Analysis
- Analyzes temperature and humidity data every 10 seconds
- Detects trends (rising/falling/stable) in real-time
- Calculates duration of exposure to risky conditions
- Predicts spoilage probability with confidence scores

### 2. RAX AI Integration
- Uses RAX AI (`rax-4.0` model) for intelligent analysis
- Sends structured input with commodity data, sensor readings, and trends
- Receives AI-generated risk assessments, explanations, and recommendations
- Automatic fallback to rule-based predictions if AI is unavailable

### 3. Early Warning System
- Detects deteriorating conditions BEFORE they become critical
- Identifies patterns like "Rising humidity trend" or "Sustained high temperature"
- Provides urgency levels (low/medium/high)
- Enables proactive intervention to prevent losses

### 4. Market Intelligence Integration
- Fetches real-time market prices based on location
- Recommends best markets for selling when risk is high
- Considers price, distance, and spoilage urgency
- Provides actionable market suggestions

### 5. Dynamic Recommendations
- AI-generated actionable recommendations
- Commodity-specific advice
- Priority-based actions (urgent → moderate → maintenance)
- Examples:
  - "Dry the maize immediately to prevent mold growth"
  - "Increase ventilation in the storage unit"
  - "Sell the produce early due to high spoilage risk"

---

## 📁 File Structure

```
AgroVault/
├── lib/services/
│   ├── ai-spoilage-prediction.ts       # Core AI prediction service
│   ├── aiAnalysisService.ts            # Existing AI analysis (complementary)
│   └── spoilage-prediction-enhanced.ts # Enhanced rule-based predictions
│
├── app/api/sensors/
│   └── prediction/
│       └── route.ts                    # API endpoint for predictions
│
├── components/
│   └── ai-spoilage-prediction-card.tsx # UI component for predictions
│
└── app/(dashboard)/dashboard/
    └── realtime-predictions/
        └── page.tsx                    # Real-time predictions dashboard
```

---

## 🔧 Technical Implementation

### 1. Historical Data Analysis

**Trend Detection:**
```typescript
// Analyzes last 20 readings (~3-5 minutes of data)
const temperatureTrend = analyzeTrend(readings)
const humidityTrend = analyzeTrend(readings)

// Returns:
{
  direction: 'rising' | 'falling' | 'stable',
  ratePerMinute: number,
  changePercent: number,
  volatility: 'low' | 'moderate' | 'high'
}
```

**Duration Analysis:**
```typescript
// Tracks time spent in risky conditions
const durationExposure = analyzeDurationExposure(readings, commodityProfile)

// Returns:
{
  minutesInHighRisk: number,
  consecutiveBadReadings: number,
  worstConditionDuration: string
}
```

### 2. Risk Prediction Levels

| Level | Score | Color | Description |
|-------|-------|-------|-------------|
| ✅ Safe | 0-24 | Green | Optimal conditions, no risk |
| ⚠️ Warning | 25-49 | Yellow | Conditions worsening, monitor closely |
| 🟠 High Risk | 50-74 | Orange | Spoilage likely soon, take action |
| 🔴 Critical | 75-100 | Red | Severe spoilage imminent, emergency action |

### 3. RAX AI Integration

**Input Structure:**
```json
{
  "commodity": "maize",
  "currentTemperature": 34,
  "currentHumidity": 82,
  "temperatureTrend": {
    "direction": "rising",
    "ratePerMinute": 0.15,
    "changePercent": 8.5
  },
  "humidityTrend": {
    "direction": "rising",
    "ratePerMinute": 0.25,
    "changePercent": 12.3
  },
  "durationExposure": {
    "minutesInHighRisk": 35,
    "consecutiveBadReadings": 12,
    "worstConditionDuration": "35 minutes"
  },
  "location": "Kisumu",
  "daysInStorage": 45,
  "quantityStored": 500,
  "unit": "kg"
}
```

**Expected Output:**
```json
{
  "riskLevel": "high_risk",
  "confidence": 87,
  "spoilageProbability": 65,
  "predictedTimeToSpoilage": "24-48 hours",
  "explanation": "Based on current conditions (34°C, 82% humidity) and maize storage requirements...",
  "primaryRiskFactors": [
    "High temperature: 34°C (optimal: 25°C max)",
    "High humidity: 82% (optimal: 70% max)",
    "Rapidly increasing humidity (+12.3%)"
  ],
  "recommendations": [
    "🌡️ Reduce temperature immediately - improve ventilation",
    "💧 Reduce humidity urgently - use dehumidifiers",
    "📈 Humidity rising rapidly - increase air circulation"
  ],
  "earlyWarning": {
    "triggered": true,
    "message": "⚠️ Rapidly increasing humidity detected - conditions may worsen soon",
    "urgency": "high",
    "detectedPattern": "Rising humidity trend"
  },
  "marketSuggestion": {
    "action": "sell_soon",
    "reason": "High spoilage risk - consider selling within 24-48 hours",
    "bestMarket": {
      "name": "Kibuye Market",
      "location": "Kisumu",
      "pricePerKg": 80,
      "distance": 12
    }
  }
}
```

### 4. Real-Time Updates

**Auto-refresh every 10 seconds:**
```typescript
useEffect(() => {
  if (!autoRefresh) return
  const intervalId = setInterval(() => {
    fetchPredictions()
  }, 10000) // 10 seconds
  return () => clearInterval(intervalId)
}, [autoRefresh, fetchPredictions])
```

**API Endpoint:**
```
GET /api/sensors/prediction
Headers: Authorization: Bearer <token>

Query Parameters:
- storageUnitId (optional): Filter by specific unit
- includeTrends (default: true): Include trend data
- forceAI (default: false): Force AI analysis (bypass cache)

Response:
{
  "predictions": [...],
  "summary": {
    "totalPredictions": 5,
    "criticalRiskCount": 1,
    "highRiskCount": 2,
    "warningCount": 1,
    "safeCount": 1,
    "totalEstimatedLoss": 15000,
    "earlyWarningsCount": 3
  },
  "lastUpdated": "2026-03-27T10:30:00Z",
  "refreshInterval": 10000
}
```

---

## 🎨 Dashboard UI

### Real-Time Predictions Page

**URL:** `/dashboard/realtime-predictions`

**Features:**
- Live connection status indicator
- Auto-refresh toggle (ON/OFF)
- Manual refresh button
- Summary cards (Total, Critical, High Risk, Warning, Safe, At Risk)
- Filter tabs by risk level
- Early warning banner
- Critical alert banner
- Prediction cards grid (2 columns on XL screens)

**Prediction Card Displays:**
- Storage unit name and location
- Commodity type and quantity
- Current temperature & humidity with trend indicators
- AI prediction analysis with confidence gauge
- Spoilage probability bar
- Predicted time to spoilage
- Early warning alerts (if triggered)
- Risk factors list
- Recommended actions
- Market suggestion with best market details
- Estimated economic loss
- Duration exposure info

---

## 🚀 Usage Examples

### Example 1: Fetching All Predictions

```typescript
const response = await fetch('/api/sensors/prediction', {
  headers: { Authorization: `Bearer ${token}` }
})
const data = await response.json()

console.log(data.predictions) // Array of predictions
console.log(data.summary)     // Summary statistics
```

### Example 2: Fetching Specific Unit Prediction

```typescript
const response = await fetch('/api/sensors/prediction?storageUnitId=unit123', {
  headers: { Authorization: `Bearer ${token}` }
})
const prediction = response.json()
```

### Example 3: Using the Prediction Card Component

```tsx
import { AISpoilagePredictionCard } from '@/components/ai-spoilage-prediction-card'

function PredictionsGrid({ predictions }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {predictions.map((prediction) => (
        <AISpoilagePredictionCard
          key={`${prediction.storageUnitId}-${prediction.commodityName}`}
          prediction={prediction}
        />
      ))}
    </div>
  )
}
```

---

## ⚙️ Configuration

### Environment Variables

```env
# RAX AI API Key
RAX_API_KEY=your_rax_api_key_here

# Sensor Mode (simulation or live)
SENSOR_MODE=simulation

# Supabase Configuration (for live sensors)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_key
```

### Commodity Profiles

The system includes pre-configured profiles for common commodities:

```typescript
const COMMODITY_PROFILES = {
  maize: {
    optimalTempRange: { min: 15, max: 25 },
    optimalHumidityRange: { min: 12, max: 14 }, // Grain moisture %
    maxStorageDays: 180,
    spoilageSensitivity: 'high',
  },
  beans: { ... },
  wheat: { ... },
  potatoes: { ... },
  // ... more commodities
}
```

---

## 🛡️ Error Handling

### AI Unavailable
If RAX AI is unavailable (no API key, network error, etc.), the system automatically falls back to rule-based predictions:
- Threshold-based risk assessment
- Trend analysis still works
- Recommendations generated from predefined rules

### No Sensor Data
If no sensor data is available:
- Returns empty predictions array
- Displays "No data available" message
- Continues monitoring for new data

### Cache Strategy
- 30-second cache for predictions
- Reduces AI API calls
- Maintains real-time feel
- Can be bypassed with `forceAI=true`

---

## 📊 Risk Assessment Logic

### Temperature Risk Factors
- >10°C above optimal: +40 spoilage probability
- >5°C above optimal: +25 spoilage probability
- >0°C above optimal: +10 spoilage probability

### Humidity Risk Factors
- >15% above optimal: +40 spoilage probability
- >8% above optimal: +25 spoilage probability
- >0% above optimal: +10 spoilage probability

### Trend Risk Factors
- Rapidly rising humidity (>10%): +20, triggers early warning
- Rapidly rising temperature (>8%): +15, triggers early warning

### Duration Risk Factors
- >30 minutes in bad conditions: +15 spoilage probability

---

## 🎯 Benefits

### For Farmers
1. **Prevent Losses**: Detect spoilage risk before it's too late
2. **Save Money**: Early intervention is cheaper than losing crops
3. **Maximize Profits**: Market recommendations help sell at best prices
4. **Peace of Mind**: Real-time monitoring with automatic alerts
5. **Data-Driven Decisions**: AI-powered insights, not guesswork

### For the System
1. **Proactive**: Predicts issues before they become critical
2. **Intelligent**: Learns from patterns and trends
3. **Scalable**: Works with any number of storage units
4. **Reliable**: Fallback mechanisms ensure always-on operation
5. **Real-Time**: 10-second updates for immediate awareness

---

## 🔮 Future Enhancements

Potential improvements for future versions:

1. **Machine Learning**: Train models on historical spoilage data
2. **Weather Integration**: Factor in external weather forecasts
3. **SMS/WhatsApp Alerts**: Send critical warnings via SMS
4. **Multi-Language Support**: Swahili and other local languages
5. **Historical Analytics**: Charts showing risk trends over time
6. **Automated Controls**: Integrate with IoT devices for automatic ventilation
7. **Community Insights**: Aggregate anonymized data for regional trends
8. **Insurance Integration**: Share risk data with agricultural insurers

---

## 📚 Related Documentation

- [Sensor Service Implementation](./lib/services/sensorService.ts)
- [RAX AI Service](./lib/services/aiAnalysisService.ts)
- [Market Intelligence](./MARKETPLACE_IMPLEMENTATION.md)
- [Humidity Alert System](./HUMIDITY_ALERT_SYSTEM.md)

---

## 🤝 Support

For issues or questions:
1. Check the logs: `console.error` messages provide detailed error info
2. Verify RAX API key is set correctly
3. Ensure sensor data is flowing (check Supabase or simulation mode)
4. Review commodity profiles for accuracy

---

**Built with ❤️ for Kenyan Farmers** | **AgroVault © 2026**
