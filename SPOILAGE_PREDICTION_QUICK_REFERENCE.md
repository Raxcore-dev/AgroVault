# 🌾 AgroVault Spoilage Prediction - Quick Reference Card

## 🚀 Quick Start

### For Farmers

1. **Access Dashboard**
   ```
   Navigate to: /dashboard/realtime-predictictions
   ```

2. **Monitor Predictions**
   - 🟢 **Safe**: Continue monitoring
   - 🟡 **Warning**: Check every 30 minutes
   - 🟠 **High Risk**: Take action within 24 hours
   - 🔴 **Critical**: Emergency action required NOW

3. **Understand Alerts**
   - Early warnings appear at the top
   - Critical alerts show in red banners
   - Recommendations are actionable steps

4. **Use Market Recommendations**
   - When risk is high, AI suggests best markets
   - Shows price, distance, and demand
   - Helps minimize losses

---

## 🔧 For Developers

### Environment Setup

```bash
# .env.local
RAX_API_KEY=your_rax_api_key_here
DATABASE_URL=postgresql://...
```

### Key Files

```
AgroVault/
├── lib/services/
│   ├── ai-spoilage-prediction.ts       # Main AI engine
│   ├── market-intelligence-rax.ts      # Market recommendations
│   ├── historical-data-service.ts      # Trend analysis
│   └── commodity-sensitivity.ts        # Crop profiles
├── app/api/
│   ├── sensors/prediction/route.ts     # Prediction endpoint
│   ├── spoilage-predictions/
│   │   ├── route.ts                    # GET predictions
│   │   └── generate-alerts/route.ts    # Create alerts
│   └── market-intelligence/
│       └── spoilage-triggered-insights/
├── components/
│   └── ai-spoilage-prediction-card.tsx # UI component
└── app/(dashboard)/dashboard/
    ├── realtime-predictions/page.tsx   # Main dashboard
    └── spoilage-predictions/page.tsx   # Enhanced view
```

### API Endpoints

#### Get Predictions
```bash
GET /api/sensors/prediction
Headers: Authorization: Bearer <token>
Query: ?storageUnitId=xxx&includeTrends=true

Response: {
  predictions: [...],
  summary: {
    totalPredictions: 5,
    criticalRiskCount: 1,
    highRiskCount: 2,
    warningCount: 1,
    safeCount: 1
  }
}
```

#### Generate Alerts
```bash
POST /api/spoilage-predictions/generate-alerts
Headers: Authorization: Bearer <token>

Creates alerts for high-risk predictions
```

#### Market Intelligence
```bash
GET /api/market-intelligence?commodity=maize&location=Kisumu
POST /api/market-intelligence/spoilage-triggered-insights
```

### Testing

```bash
# Run test suite
npx tsx test-spoilage-prediction.ts

# Test API manually
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/sensors/prediction
```

### Add New Commodity

Edit `lib/services/ai-spoilage-prediction.ts`:

```typescript
const COMMODITY_PROFILES: Record<string, CommodityProfile> = {
  // Add new crop:
  avocado: {
    name: 'Avocado',
    optimalTempRange: { min: 20, max: 25 },
    optimalHumidityRange: { min: 85, max: 90 },
    maxStorageDays: 28,
    spoilageSensitivity: 'high',
  },
}
```

---

## 📊 Risk Assessment Logic

### Temperature Risk

| Condition | Deviation from Optimal | Risk Points |
|-----------|----------------------|-------------|
| Critical  | > 10°C above max     | +40         |
| High      | 5-10°C above max     | +25         |
| Moderate  | 0-5°C above max      | +10         |
| Safe      | Within range         | 0           |

### Humidity Risk

| Condition | Deviation from Optimal | Risk Points |
|-----------|----------------------|-------------|
| Critical  | > 15% above max      | +40         |
| High      | 8-15% above max      | +25         |
| Moderate  | 0-8% above max       | +10         |
| Safe      | Within range         | 0           |

### Trend Risk

| Trend | Change % | Risk Points |
|-------|----------|-------------|
| Rapid Rise | > 10% | +20         |
| Rise       | 5-10% | +15         |
| Stable     | 0-5%  | 0           |
| Falling    | < 0%  | -5 (bonus)  |

### Duration Risk

| Exposure Time | Risk Points |
|---------------|-------------|
| > 30 minutes  | +15         |
| 15-30 minutes | +10         |
| 5-15 minutes  | +5          |
| < 5 minutes   | 0           |

### Risk Level Calculation

```
Total Score = Temperature + Humidity + Trend + Duration

0-24:   🟢 Safe
25-49:  🟡 Warning
50-74:  🟠 High Risk
75-100: 🔴 Critical
```

---

## 🎯 Commodity Profiles (Quick Reference)

| Crop | Optimal Temp | Optimal Humidity | Max Storage | Sensitivity |
|------|-------------|------------------|-------------|-------------|
| Maize | 15-25°C | 12-14% (moisture) | 180 days | High |
| Beans | 15-25°C | 12-14% | 180 days | High |
| Wheat | 15-25°C | 12-13.5% | 365 days | Medium |
| Rice | 14-22°C | 12-14% | 365 days | Medium |
| Potatoes | 4-10°C | 85-90% | 120 days | High |
| Tomatoes | 12-18°C | 85-90% | 21 days | High |
| Onions | 0-5°C | 65-70% | 180 days | Medium |
| Cabbage | 0-5°C | 90-95% | 90 days | High |

---

## ⚡ Real-Time Update Flow

```
1. Dashboard loads → Fetches predictions
2. Sets interval → Refreshes every 10 seconds
3. Each refresh:
   - Gets latest sensor data
   - Analyzes trends (last 20-60 readings)
   - Calls AI if conditions changed
   - Updates UI with new predictions
4. User sees:
   - Live risk levels
   - Updated trends
   - Fresh recommendations
   - New alerts (if any)
```

---

## 🚨 Alert Triggers

### Automatic Alert Generation

Alerts are created when:
- ✅ Risk level = `high_risk` or `critical`
- ✅ Spoilage probability ≥ 40%
- ✅ Early warning with high urgency
- ✅ No similar alert in last 24 hours

### Alert Severity Mapping

| Risk Level | Alert Severity | Color |
|------------|---------------|-------|
| Critical   | critical      | Red   |
| High Risk  | danger        | Orange|
| Warning    | warning       | Yellow|

---

## 💡 AI Prompt Structure

### System Prompt
```
You are an expert agricultural AI specializing in post-harvest 
spoilage prediction for Kenyan farmers.

Key principles:
1. Early detection is critical
2. Consider trends, not just current values
3. Duration of exposure matters more than spikes
4. Provide actionable, specific recommendations
5. Consider economic impact
```

### User Input
```
COMMODITY: {crop}
- Optimal ranges: {temp}/{humidity}
- Current: {temp}°C, {humidity}%
- Trend: {direction} ({rate}/min, {change}%)
- Duration: {minutes} in high-risk
- Location: {location}
- Quantity: {amount} {unit}
```

### Expected Output
```json
{
  "riskLevel": "high_risk",
  "confidence": 87,
  "spoilageProbability": 65,
  "predictedTimeToSpoilage": "24-48 hours",
  "explanation": "...",
  "primaryRiskFactors": [...],
  "recommendations": [...],
  "earlyWarning": { ... },
  "marketSuggestion": { ... }
}
```

---

## 🐛 Troubleshooting

### Issue: No predictions showing

**Check:**
1. Storage units exist and have commodities
2. Sensor readings in database (StorageReading table)
3. Authentication token is valid
4. API endpoint returns data

**Debug:**
```bash
# Check database
npx prisma studio

# Test API
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/sensors/prediction
```

### Issue: AI predictions failing

**Check:**
1. `RAX_API_KEY` in `.env.local`
2. API key is valid and has credits
3. Network connectivity to RAX API
4. Check console logs for errors

**Fallback:**
- System automatically uses rule-based if AI fails
- Check logs for "Fallback to rule-based" messages

### Issue: Market intelligence not showing

**Check:**
1. Risk level is high enough (≥ 50% probability)
2. Markets exist in database for location
3. Storage unit has coordinates (lat/lng)
4. Distance calculation is working

**Debug:**
```bash
# Check markets in database
SELECT * FROM "Market" WHERE commodity ILIKE '%maize%';

# Check storage unit coordinates
SELECT id, name, latitude, longitude FROM "StorageUnit";
```

### Issue: Trends not detected

**Check:**
1. Minimum 2 readings required (need 12+ for good analysis)
2. Readings are timestamped correctly
3. Time interval between readings (should be 1-5 minutes)
4. Trend threshold (currently 0.5 per hour)

**Debug:**
```typescript
// In historical-data-service.ts
console.log('Readings count:', readings.length)
console.log('Time span:', timeSpanMinutes)
console.log('Rate per hour:', ratePerHour)
```

---

## 📈 Performance Optimization

### Caching Strategy

```typescript
// 30-second cache for predictions
const CACHE_TTL_MS = 30 * 1000

// Cache key includes current conditions
const cacheKey = `${unitId}-${commodityId}-${temp}-${humidity}`
```

### Database Indexing

```prisma
// Ensure these indexes exist:
@@index([storageUnitId])
@@index([recordedAt])
@@index([commodityName])
```

### AI Call Optimization

- Cache predictions for 30 seconds
- Only call AI if conditions change significantly
- Use fallback for non-critical situations
- Batch market intelligence calls

---

## 🔐 Security Notes

- ✅ Authentication required for all endpoints
- ✅ Farmer can only access their own data
- ✅ Role-based access (farmer/admin)
- ✅ JWT token validation
- ✅ SQL injection prevention (Prisma ORM)

---

## 📞 Quick Help

### Common Questions

**Q: How often should predictions update?**
A: Every 10 seconds for real-time monitoring. Can be toggled off by user.

**Q: What if sensor data is missing?**
A: System shows "No sensor data" message. Add sensors or manual readings.

**Q: Can I add custom commodities?**
A: Yes, edit `COMMODITY_PROFILES` in `ai-spoilage-prediction.ts`.

**Q: How accurate are predictions?**
A: AI confidence is shown (0-100%). Higher confidence = more reliable.

**Q: What if AI is down?**
A: Automatic fallback to rule-based prediction system.

---

*Quick Reference v1.0 | Last Updated: March 28, 2026*
