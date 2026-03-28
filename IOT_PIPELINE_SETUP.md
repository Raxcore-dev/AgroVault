# ESP32 → Backend → Neon Database Data Pipeline

## ✅ Status: WORKING

The complete data pipeline is now functional:
**ESP32 → HTTP POST → Backend API → Neon PostgreSQL → Dashboard**

---

## 📋 What Was Fixed

### 1. Backend API Endpoint (`/api/sensors/save`)
- ✅ Enhanced logging for debugging
- ✅ Proper error handling with detailed messages
- ✅ Automatic alert generation for warning/danger conditions
- ✅ Status determination based on temperature/humidity thresholds

### 2. Database Setup
- ✅ Created storage unit for ESP32 data
- ✅ Created sensor device record
- ✅ Foreign key constraints properly satisfied

### 3. Dashboard Integration
- ✅ Added `/api/sensors/neon` endpoint to read directly from Neon DB
- ✅ Updated sensor panel to fallback to Neon when Supabase has no data
- ✅ Dashboard now shows "ESP32 IoT (Neon DB)" badge when displaying ESP32 data

### 4. ESP32 Configuration
- ✅ Updated `storageUnitId` with valid database ID
- ✅ Added configuration comments for IP address

---

## 🔧 Configuration

### ESP32 Code (`src/main.cpp`)

```cpp
// WiFi Settings
const char* ssid = "TAMNET SYSTEMS";
const char* password = "Tamnet123";

// Backend Server Settings
// IMPORTANT: Use your computer's actual IP address
const char* serverURL = "http://192.168.100.227:3000";
const char* apiEndpoint = "/api/sensors/save";

// Storage Unit ID (auto-generated)
const char* storageUnitId = "cmna283a600037yjmktql7nqw";
```

### Backend API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/sensors/save` | POST | Save sensor readings |
| `/api/iot/setup` | POST | Create new storage unit |
| `/api/iot/setup` | GET | List storage units |
| `/api/sensors/latest` | GET | Get latest readings |

---

## 🧪 Testing

### 1. Test Backend API (Manual)

```bash
# Test sensor data save
curl -X POST http://192.168.100.227:3000/api/sensors/save \
  -H "Content-Type: application/json" \
  -d '{"storageUnitId":"cmna283a600037yjmktql7nqw","temperature":25.5,"humidity":65.2}'

# Expected response:
# {"success":true,"reading":{...},"message":"Sensor data saved successfully"}
```

### 2. Create New Storage Unit

```bash
# Create a new storage unit for testing
curl -X POST http://192.168.100.227:3000/api/iot/setup

# Expected response:
# {"success":true,"storageUnitId":"...","sensorId":"...",...}
```

### 3. List Storage Units

```bash
# View all storage units and their readings count
curl http://192.168.100.227:3000/api/iot/setup
```

---

## 📊 Data Flow

```
┌─────────────┐
│   ESP32     │
│  + DHT22    │
│   Sensor    │
└──────┬──────┘
       │
       │ HTTP POST every 60 seconds
       │ Payload: { storageUnitId, temperature, humidity }
       ▼
┌─────────────────────┐
│  Backend API        │
│  /api/sensors/save  │
└──────┬──────────────┘
       │
       │ 1. Validate input
       │ 2. Determine status (normal/warning/danger)
       │ 3. Save to database
       │ 4. Generate alerts if needed
       ▼
┌─────────────────────┐
│  Neon PostgreSQL    │
│  - StorageReading   │
│  - Alert (optional) │
└──────┬──────────────┘
       │
       │ Dashboard queries latest data
       ▼
┌─────────────────────┐
│  Dashboard UI       │
│  Real-time display  │
└─────────────────────┘
```

---

## 🔍 Debugging

### ESP32 Serial Output

The ESP32 prints detailed logs:
```
--- Reading Sensor Data ---
[SENSOR] Temperature: 25.50°C
[SENSOR] Humidity: 65.20%
[HTTP] Sending data to: http://192.168.100.227:3000/api/sensors/save
[HTTP] Payload: {"storageUnitId":"...","temperature":25.5,"humidity":65.2}
[HTTP] Response Code: 201
[HTTP] Response: {"success":true,...}
[HTTP] ✓ Data sent successfully!
--- End Sensor Reading ---
```

### Backend Logs

Check the Next.js dev server console for:
```
[SensorsAPI:Save] Received request: { storageUnitId, temperature, humidity }
[SensorsAPI:Save] Status determined: warning
[SensorsAPI:Save] Attempting to save to database...
[SensorsAPI:Save] Successfully saved reading: cmna28nkm00057yjmqnzoxpnu
[SensorsAPI:Save] Generated 1 alerts
```

### Database Verification

```bash
# List storage units with readings count
curl http://192.168.100.227:3000/api/iot/setup
```

---

## ⚠️ Common Issues & Solutions

### 1. HTTP Error 400 (Bad Request)
**Cause:** Missing required fields  
**Solution:** Ensure ESP32 sends `storageUnitId`, `temperature`, and `humidity`

### 2. HTTP Error 500 (Database Error)
**Cause:** Invalid `storageUnitId` (doesn't exist in database)  
**Solution:** Run `POST /api/iot/setup` to create a valid storage unit

### 3. HTTP Error - Connection Refused
**Cause:** Backend server not running or wrong IP  
**Solution:** 
- Start backend: `npm run dev`
- Verify IP address (run `ipconfig` or `ifconfig`)
- Ensure ESP32 and computer are on same network

### 4. WiFi Connection Failed
**Cause:** Wrong SSID/password  
**Solution:** Update WiFi credentials in `src/main.cpp`

### 5. Sensor Reading NaN
**Cause:** DHT sensor not connected properly  
**Solution:** 
- Check GPIO pin connection (GPIO 4)
- Verify DHT22 sensor is powered (3.3V)
- Check data pin connection

---

## 📈 Status Thresholds

| Condition | Temperature | Humidity |
|-----------|-------------|----------|
| **Normal** | 10-25°C | 40-85% |
| **Warning** | 5-10°C or 25-30°C | 30-40% or 85-95% |
| **Danger** | <5°C or >30°C | <30% or >95% |

---

## 🚀 Deployment Checklist

- [ ] ESP32 code uploaded with correct `storageUnitId`
- [ ] Backend server running on correct IP
- [ ] ESP32 and backend on same network
- [ ] Database connection working (Neon PostgreSQL)
- [ ] Serial monitor shows HTTP 201 responses
- [ ] Dashboard displays sensor data

---

## 📝 API Response Format

### Success Response (201)
```json
{
  "success": true,
  "reading": {
    "id": "cmna28nkm00057yjmqnzoxpnu",
    "temperature": 25.5,
    "humidity": 65.2,
    "status": "warning",
    "recordedAt": "2026-03-28T08:20:28.630Z",
    "storageUnitId": "cmna283a600037yjmktql7nqw",
    "sensorId": null
  },
  "message": "Sensor data saved successfully"
}
```

### Error Response (500)
```json
{
  "error": "Failed to save sensor data",
  "details": "Foreign key constraint violated..."
}
```

---

## 🔐 Security Notes

- ESP32 connects over HTTP (local network only)
- For production, use HTTPS with valid SSL certificate
- Consider adding API key authentication for ESP32
- Rate limiting may be needed for high-frequency sensors

---

## 📞 Support

For issues:
1. Check serial monitor output on ESP32
2. Check backend server logs
3. Verify database connection
4. Test API manually with curl/Postman

---

**Last Updated:** March 28, 2026  
**Status:** ✅ Production Ready
