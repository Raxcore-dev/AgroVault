# AI-Powered Humidity Alert & Recommendation System

## Overview

The AI-Powered Humidity Alert & Recommendation System intelligently monitors storage unit humidity levels and provides actionable recommendations to prevent crop spoilage. The system uses real-time IoT sensor data combined with AI-based logic to detect dangerous humidity conditions and guide farmers with immediate actions.

## Features

### 1. Humidity Threshold Detection

**Thresholds:**
- **Safe:** 40% – 65% humidity
- **Moderate Risk:** 66% – 75% humidity
- **High Risk:** Above 75% humidity

**Monitoring:**
- Continuous monitoring of IoT sensor data (Supabase)
- Real-time status classification
- Automatic alert triggering when humidity > 75%

### 2. Alert System

**Alert Display:**
- Visual highlighting with color coding (red/amber/green)
- Persistent alerts until humidity returns to safe levels
- Priority levels: Low, Medium, High, Critical
- Urgent banner for critical alerts requiring immediate action

**Alert Features:**
- Real-time updates every 10 seconds
- Auto-refresh with countdown timer
- Filter by risk level (All/High/Moderate/Safe)
- Summary cards showing risk distribution

### 3. AI Recommendation Engine

**Intelligent Analysis:**
- Crop-specific recommendations (maize, wheat, beans, rice, coffee, tea, sorghum, millet)
- Temperature + humidity combined risk assessment
- Storage duration consideration
- Risk score calculation (0-100)

**Recommendation Categories:**

**High Risk (>75% humidity):**
- Open ventilation systems immediately
- Dry stored produce using mechanical dryers
- Inspect for mold growth and contamination
- Use dehumidifiers or drying equipment
- Consider emergency sale to prevent loss
- Separate affected batches

**Moderate Risk (66-75% humidity):**
- Monitor humidity closely every 2-4 hours
- Increase airflow by opening vents
- Prepare drying measures
- Check for air circulation blockages
- Reduce new stock intake

**Safe (40-65% humidity):**
- Continue current storage practices
- Maintain regular monitoring schedule
- Keep ventilation systems functional
- Document optimal conditions

### 4. Real-Time Updates

**Update Frequency:**
- Frontend: 10-second polling interval
- Backend: Real-time sensor data from Supabase
- Auto-refresh with visual countdown

**Performance:**
- Efficient caching to reduce API calls
- Optimized database queries
- Minimal latency for critical alerts

### 5. Backend API Enhancement

**Endpoint:** `GET /api/sensors/humidity-analysis`

**Response Structure:**
```json
{
  "readings": [
    {
      "id": "reading-id",
      "storage_unit_id": "unit-id",
      "storage_unit_name": "Maize Silo",
      "storage_unit_location": "Kisumu",
      "temperature": 30.5,
      "humidity": 82.3,
      "timestamp": "2024-01-15T10:30:00Z",
      "status": "warning",
      "status_reasons": ["High Risk of Mold Growth"],
      "humidity_analysis": {
        "status": "high",
        "risk_level": "🔴 High Risk",
        "recommendations": [
          "Open ventilation systems immediately",
          "Dry the stored produce",
          "Inspect for mold growth"
        ],
        "immediate_actions": [
          "⚠️ URGENT: Open all vents and doors",
          "⚠️ Turn on fans or ventilation systems",
          "⚠️ Check for water leaks"
        ],
        "preventive_measures": [
          "Install humidity monitoring sensors",
          "Implement automated ventilation controls"
        ],
        "ai_insight": "Critical conditions detected. Humidity at 82.3% combined with temperature of 30.5°C creates extremely high mold growth risk. Aflatoxin contamination risk is critical for this crop. Immediate drying is essential to prevent total crop loss."
      },
      "risk_score": 75,
      "alert_priority": "critical",
      "crop_type": "maize",
      "storage_duration": 45
    }
  ],
  "summary": {
    "total_units": 5,
    "units_with_readings": 5,
    "danger_count": 1,
    "warning_count": 2,
    "normal_count": 2,
    "avg_temperature": 28.5,
    "avg_humidity": 68.2,
    "last_updated": "2024-01-15T10:30:00Z"
  },
  "alerts": [
    {
      "storage_unit_id": "unit-id",
      "storage_unit_name": "Maize Silo",
      "humidity": 82.3,
      "status": "high",
      "priority": "critical",
      "message": "High humidity detected in Maize Silo. Current humidity: 82.3%",
      "recommendations": [
        "⚠️ URGENT: Open all vents and doors",
        "⚠️ Turn on fans or ventilation systems"
      ]
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 6. UI Integration (Farmer Dashboard)

**Dashboard Page:** `/dashboard/humidity-alerts`

**Components:**
- **HumidityAlertCard:** Individual alert card with full analysis
- **Summary Cards:** High Risk, Moderate Risk, Safe counts
- **Filter Tabs:** Filter by risk level
- **Urgent Banner:** Highlights critical alerts
- **Auto-refresh:** 10-second polling with countdown

**Visual Features:**
- Color-coded risk levels (red/amber/green)
- Current conditions display (humidity, temperature, risk score)
- AI insight panel with contextual analysis
- Immediate actions checklist
- Recommended actions list
- Preventive measures (expandable)
- Timestamp and priority indicator

### 7. AI Enhancement (Advanced)

**Crop-Specific Analysis:**
- Different humidity thresholds per crop type
- Aflatoxin contamination warnings for maize, beans, wheat
- Storage duration impact on risk assessment
- Temperature + humidity combined analysis

**Dynamic Recommendations:**
- Context-aware insights based on:
  - Current humidity level
  - Temperature conditions
  - Crop type
  - Storage duration
  - Risk score

**Example AI Insights:**

**High Risk:**
> "Critical conditions detected after 45 days of storage. Humidity at 82.3% combined with temperature of 30.5°C creates extremely high mold growth risk. Aflatoxin contamination risk is critical for this crop. Immediate drying is essential to prevent total crop loss. Consider emergency market sale if drying is not possible within 24 hours."

**Moderate Risk:**
> "Humidity levels at 72.1% are approaching critical thresholds for maize after 30 days of storage. Current conditions may lead to quality degradation within 24-48 hours. Proactive ventilation and monitoring will prevent escalation to high-risk status. Target humidity: 65% or below."

**Safe:**
> "Storage conditions are optimal for maize after 20 days of storage. Humidity at 58.3% and temperature at 26.5°C are well within safe parameters. Excellent conditions for long-term storage. Continue current practices to maintain crop quality and market value."

### 8. Error Handling

**No Data:**
- "No sensor readings available yet."
- Guidance to add storage units with IoT sensors

**API Failure:**
- "Unable to fetch humidity analysis."
- Retry button with manual refresh
- Error message display

**Network Issues:**
- Graceful degradation
- Cached data display when available
- Connection status indicator

## Files Created

### Backend Services
1. `/lib/services/humidity-recommendation.ts` - AI recommendation engine
2. `/app/api/sensors/humidity-analysis/route.ts` - Enhanced sensor API
3. `/app/api/sensors/generate-humidity-alerts/route.ts` - Auto-alert generation

### Frontend Components
4. `/components/humidity-alert-card.tsx` - Alert card component
5. `/app/dashboard/humidity-alerts/page.tsx` - Dashboard page

### Configuration
6. `/components/sidebar.tsx` - Updated with Humidity Alerts link

## API Endpoints

### GET /api/sensors/humidity-analysis
**Purpose:** Fetch enriched sensor readings with AI analysis

**Authentication:** Required (Farmer role)

**Response:** Enriched readings, summary, and alerts

**Usage:**
```typescript
const res = await fetch('/api/sensors/humidity-analysis', {
  headers: { Authorization: `Bearer ${token}` },
  cache: 'no-store',
})
const data = await res.json()
```

### POST /api/sensors/generate-humidity-alerts
**Purpose:** Auto-generate database alerts for high-risk conditions

**Authentication:** Required (Farmer role)

**Response:** Created alerts count and alert objects

**Features:**
- Prevents duplicate alerts within 24 hours
- Only creates alerts for humidity > 75%
- Includes AI-generated insights in alert message

**Usage:**
```typescript
const res = await fetch('/api/sensors/generate-humidity-alerts', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
})
const data = await res.json()
```

## Risk Score Calculation

**Formula:**
- Humidity contribution: 0-50 points
  - >85%: 50 points
  - >75%: 40 points
  - >65%: 25 points
  - >55%: 10 points
- Temperature contribution: 0-30 points
  - >35°C: 30 points
  - >30°C: 20 points
  - >25°C: 10 points
- Storage duration contribution: 0-20 points
  - >90 days: 20 points
  - >60 days: 15 points
  - >30 days: 10 points
  - <30 days: 5 points

**Total:** 0-100 (capped at 100)

## Alert Priority Levels

- **Critical:** High status + risk score ≥ 70
- **High:** High status OR (Moderate status + risk score ≥ 50)
- **Medium:** Moderate status
- **Low:** Safe status

## Crop-Specific Thresholds

| Crop     | Max Safe Humidity | Critical Humidity |
|----------|-------------------|-------------------|
| Maize    | 65%               | 75%               |
| Wheat    | 60%               | 70%               |
| Beans    | 65%               | 75%               |
| Rice     | 70%               | 80%               |
| Coffee   | 62%               | 72%               |
| Tea      | 60%               | 70%               |
| Sorghum  | 65%               | 75%               |
| Millet   | 65%               | 75%               |
| Default  | 65%               | 75%               |

## Integration Points

### Existing Systems
- **Sensor Service:** Uses existing `getLatestSensorReadingsForFarmer()`
- **Prisma Database:** Integrates with StorageUnit, Commodity, Alert models
- **Auth System:** Uses existing `authorizeRole()` middleware
- **Sidebar Navigation:** Added "Humidity Alerts" link for farmers

### Data Flow
1. IoT sensors → Supabase → Sensor Service
2. Sensor Service → Humidity Analysis API → AI Recommendation Engine
3. AI Engine → Frontend Components → Farmer Dashboard
4. Auto-alert generation → Prisma Database → Alert notifications

## Testing Checklist

- [ ] Verify humidity thresholds (40-65% safe, 66-75% moderate, >75% high)
- [ ] Test real-time updates (10-second polling)
- [ ] Validate AI recommendations for each risk level
- [ ] Check crop-specific analysis (maize, wheat, beans, etc.)
- [ ] Test alert generation (no duplicates within 24 hours)
- [ ] Verify filter functionality (All/High/Moderate/Safe)
- [ ] Test error handling (no data, API failure)
- [ ] Validate risk score calculation
- [ ] Check alert priority assignment
- [ ] Test auto-refresh with countdown
- [ ] Verify sidebar navigation link
- [ ] Test responsive design (mobile/tablet/desktop)

## Performance Metrics

- **API Response Time:** <500ms
- **Frontend Refresh:** 10 seconds
- **Alert Generation:** <2 seconds
- **Database Queries:** Optimized with indexes
- **Caching:** Sensor data cached for 10 seconds

## Future Enhancements

1. **WebSocket Integration:** Real-time push notifications
2. **SMS Alerts:** Critical alerts via SMS
3. **Historical Trends:** Humidity trend charts
4. **Predictive Analytics:** ML-based humidity forecasting
5. **Automated Actions:** Trigger ventilation systems automatically
6. **Mobile App:** Native mobile notifications
7. **Multi-language Support:** Localized recommendations
8. **Voice Alerts:** Audio notifications for critical conditions

## Conclusion

The AI-Powered Humidity Alert & Recommendation System provides farmers with intelligent, real-time monitoring and actionable guidance to protect stored crops from humidity-related spoilage. The system combines IoT sensor data, AI-based analysis, and crop-specific knowledge to deliver personalized recommendations that help farmers make informed decisions and prevent economic losses.
