# AgroVault IoT Sensor Firmware

Complete IoT firmware for the AgroVault agriculture monitoring system. Reads temperature and humidity from DHT22 sensor and sends data to your backend.

## Prerequisites
- Visual Studio Code with PlatformIO extension
- ESP32 microcontroller board
- DHT22 temperature/humidity sensor
- WiFi access
- Backend server running (AgroVault Next.js app)

## Hardware Connections

### ESP32 to DHT22 Sensor
```
DHT22 Pin 1 (VCC)  → ESP32 3.3V
DHT22 Pin 2 (Data) → ESP32 GPIO 4
DHT22 Pin 3 (NC)   → Not connected
DHT22 Pin 4 (GND)  → ESP32 GND
```

(Optional 10k Ω resistor between VCC and Data pin for noise filtering)

## Setup Instructions

### 1. Configure WiFi & Backend Settings
Edit `src/main.cpp` and update these lines:

```cpp
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverURL = "http://your-backend-domain.com";
const char* storageUnitId = "your_storage_unit_id_here";
```

### 2. Get Your Storage Unit ID
1. Log in to AgroVault backend
2. Go to Dashboard → Your Storage Units
3. Copy the ID of the storage unit you want to monitor
4. Paste it in `storageUnitId`

### 3. Upload Firmware
```bash
# Using PlatformIO CLI
pio run -t upload

# Or use VS Code:
# - Click "Upload" button in PlatformIO sidebar
```

### 4. Monitor Serial Output
```bash
# Watch the ESP32 output
pio device monitor --baud 115200

# Or in VS Code:
# - Click "Serial Monitor" in PlatformIO sidebar
```

Expected output:
```
========================================
AgroVault IoT Sensor System - Starting
========================================

[WiFi] Connecting to: YOUR_WIFI_SSID
[WiFi] ✓ Connected!
[WiFi] IP Address: 192.168.1.100

✓ System ready! Starting sensor readings...

--- Reading Sensor Data ---
[SENSOR] Temperature: 24.50°C
[SENSOR] Humidity: 65.30%
[HTTP] Sending data to: http://your-backend-domain.com/api/sensors/save
[HTTP] Response Code: 201
[HTTP] ✓ Data sent successfully!
--- End Sensor Reading ---
```

## Troubleshooting

### Sensor Not Reading
- Check DHT22 connections (especially GPIO 4 and GND)
- Verify DHT22 pin is not damaged
- Try 10k pull-up resistor between VCC and Data pin

### WiFi Connection Failed
- Double-check SSID and password
- Verify WiFi is 2.4GHz (ESP32 doesn't support 5GHz)
- Check if WiFi is operational

### HTTP Request Failed
- Verify backend URL is correct (include `http://` or `https://`)
- Ensure backend server is running (`npm run dev`)
- Check firewall allows outbound HTTP requests
- Verify storage unit ID exists in database

### "Failed to read from DHT sensor"
- Sensor may be defective
- Check DHT22 wiring
- Try running the DHT sensor example code to diagnose

## Configuration

### Change Read Interval
Edit in `src/main.cpp`:
```cpp
#define READ_INTERVAL 60000  // milliseconds (currently 60 seconds)
```

### Change Sensor Pin
Edit in `src/main.cpp`:
```cpp
#define DHTPIN 4  // GPIO pin number
```

### Change DHT Sensor Type
```cpp
#define DHTTYPE DHT11   // or DHT22 (DHT11 less accurate)
```

## API Endpoint

Your data is sent to: `POST /api/sensors/save`

**Request Body:**
```json
{
  "storageUnitId": "clpx5vyzq0000bz0h9x4y8z9j",
  "temperature": 24.5,
  "humidity": 65.3
}
```

**Response (Success 201):**
```json
{
  "success": true,
  "reading": {
    "id": "clpx5vyzq0000bz0h9x4y8z9k",
    "storageUnitId": "clpx5vyzq0000bz0h9x4y8z9j",
    "temperature": 24.5,
    "humidity": 65.3,
    "status": "normal",
    "recordedAt": "2026-03-27T10:30:00.000Z"
  }
}
```

## Data Status Categories

- **normal**: Temp 10-25°C, Humidity 40-85%
- **warning**: Temp 5-10°C or 25-30°C, Humidity 30-40% or 85-95%
- **danger**: Temp <5°C or >30°C, Humidity <30% or >95%

Alerts are automatically generated for warning and danger statuses.

## Monitoring Data in AgroVault

After sensor is running:
1. Go to Dashboard
2. Select your storage unit
3. View real-time temperature & humidity graphs
4. Check alerts for any issues

## Notes

- Data is sent every 60 seconds (configurable)
- Sensor readings are timestamped server-side
- Automatic alerts generated for out-of-range values
- WiFi reconnects automatically if connection drops
