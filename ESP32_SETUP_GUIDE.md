# ESP32 IoT Sensor Setup Guide

## Overview

This guide shows you how to set up your ESP32 device to monitor storage conditions and send real-time data to AgroVault.

## Hardware Required

- ESP32 Development Board
- DHT22 (or DHT11) Temperature & Humidity Sensor
- Jumper wires
- Breadboard (optional)

## Wiring Diagram

```
DHT22 Sensor    →    ESP32
-------------       --------
VCC (5V or 3.3V) →   VIN or 3.3V
GND              →   GND
DATA             →   GPIO 14
10k Pull-up      →   Between VCC and DATA
```

## Step 1: Register Your Sensor

1. **Login to AgroVault** at `http://localhost:3000`
2. **Create a storage unit** if you haven't already
3. **Go to Sensors page** at `http://localhost:3000/dashboard/sensors`
4. **Click "Register Sensor"**
5. Fill in the form:
   - **Storage Unit**: Select the unit to monitor
   - **Device Name**: e.g., "Maize Silo Sensor"
   - **Device ID**: Unique ID (e.g., `esp32_silo_01` or ESP32 MAC address)
   - **Device Type**: ESP32-DHT22
6. **Copy the ESP32 code** provided after registration

## Step 2: Upload Code to ESP32

### Option A: Using Arduino IDE

1. Install ESP32 board support in Arduino IDE
2. Install required libraries:
   - `DHT sensor library` by Adafruit
   - `WiFi` (built-in for ESP32)

3. Upload this code (replace values with your registration details):

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

// ================== CONFIGURATION ==================
// Replace these with your values from sensor registration

const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";

// Your server URL (use your computer's IP on same network)
const char* serverURL = "http://192.168.100.227:3000/api/sensors/save";

// Your registered Device ID (from registration page)
const char* deviceId = "esp32_silo_01";

// ===================================================

#define DHTPIN 14
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);

unsigned long lastSendTime = 0;
const unsigned long SEND_INTERVAL = 60000; // Send every 60 seconds

void setup() {
  Serial.begin(115200);
  dht.begin();

  // Connect to WiFi
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);

  int timeout = 0;
  while (WiFi.status() != WL_CONNECTED && timeout < 20) {
    delay(500);
    Serial.print(".");
    timeout++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✓ Connected to WiFi");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n✗ WiFi connection failed");
  }
}

void loop() {
  // Read sensor data
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  // Check if readings are valid
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("✗ Failed to read from DHT sensor");
    delay(2000);
    return;
  }

  // Print readings
  Serial.print("Temperature: ");
  Serial.print(temperature);
  Serial.print("°C | Humidity: ");
  Serial.print(humidity);
  Serial.println("%");

  // Send to server if interval has passed
  unsigned long currentTime = millis();
  if (currentTime - lastSendTime >= SEND_INTERVAL) {
    sendToServer(temperature, humidity);
    lastSendTime = currentTime;
  }

  delay(2000);
}

void sendToServer(float temperature, float humidity) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("✗ WiFi not connected, skipping send");
    return;
  }

  HTTPClient http;
  http.begin(serverURL);
  http.addHeader("Content-Type", "application/json");

  // Create JSON payload with deviceId
  String payload = "{\"deviceId\":\"" + String(deviceId) + 
                   "\",\"temperature\":" + String(temperature, 1) + 
                   ",\"humidity\":" + String(humidity, 1) + "}";

  Serial.print("Sending: ");
  Serial.println(payload);

  int httpResponseCode = http.POST(payload);

  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
    Serial.println("Response: " + response);

    if (httpResponseCode == 201) {
      Serial.println("✓ Data sent successfully!");
    }
  } else {
    Serial.print("✗ Error sending data: ");
    Serial.println(httpResponseCode);
  }

  http.end();
}
```

### Option B: Using PlatformIO

1. Create a new PlatformIO project for ESP32
2. Add dependencies in `platformio.ini`:

```ini
[env:esp32dev]
platform = espressif32
board = esp32dev
framework = arduino
lib_deps = 
  adafruit/DHT sensor library@^1.4.4
  adafruit/Adafruit Unified Sensor@^1.1.4
```

3. Copy the code above to `src/main.cpp`
4. Build and upload: `pio run --target upload`

## Step 3: Verify Data is Being Received

1. **Open AgroVault dashboard** at `http://localhost:3000`
2. **Go to your storage unit** at `/dashboard/storage-units/[your-unit-id]`
3. **Check for sensor readings** - they should appear within 60 seconds
4. **View live data** on the temperature/humidity monitoring pages

## Troubleshooting

### ESP32 Won't Connect to WiFi

- Check SSID and password are correct
- Ensure ESP32 is within WiFi range
- Try using 2.4GHz WiFi (ESP32 doesn't support 5GHz)

### Can't Connect to Server

- Make sure your computer and ESP32 are on the same network
- Use your computer's local IP address (not localhost)
- Check firewall settings - port 3000 must be open
- Test with: `curl http://YOUR_IP:3000`

### Sensor Readings Show NaN

- Check wiring connections
- Ensure pull-up resistor is connected (10k between VCC and DATA)
- Try a different GPIO pin
- Verify DHT library is installed correctly

### "Sensor Not Registered" Error

- Register your sensor at `/dashboard/sensors` first
- Make sure deviceId in code matches registration exactly
- Check that sensor is linked to correct storage unit

## Advanced Configuration

### Change Update Frequency

Modify `SEND_INTERVAL` in the code:
```cpp
const unsigned long SEND_INTERVAL = 30000; // Send every 30 seconds
```

### Use Deep Sleep for Battery Power

```cpp
#include <esp_sleep.h>

#define uS_TO_S_FACTOR 1000000ULL
#define TIME_TO_SLEEP  60 // Sleep for 60 seconds

void setup() {
  // ... existing setup code ...
  
  // Configure deep sleep
  esp_sleep_enable_timer_wakeup(TIME_TO_SLEEP * uS_TO_S_FACTOR);
}

void loop() {
  // Read and send data
  // ...
  
  // Go to sleep
  Serial.println("Going to sleep...");
  esp_deep_sleep_start();
}
```

### Add Multiple Sensors

Register each sensor with a unique deviceId:
```cpp
// Sensor 1 - Temperature
const char* deviceId1 = "esp32_silo_01_temp";

// Sensor 2 - Humidity  
const char* deviceId2 = "esp32_silo_01_humidity";
```

## API Reference

### Sensor Registration
```
POST /api/sensors/register
Body: {
  "storageUnitId": "string",
  "deviceId": "string",
  "deviceName": "string",
  "deviceType": "string"
}
```

### Send Sensor Data
```
POST /api/sensors/save
Body: {
  "deviceId": "string",  // OR storageUnitId
  "temperature": number,
  "humidity": number
}
```

## Support

For issues or questions:
1. Check the sensor logs at `/dashboard/sensors`
2. View ESP32 serial output in Arduino IDE
3. Check server logs in terminal running `npm run dev`
