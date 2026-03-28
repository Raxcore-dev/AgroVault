#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

// ========== CONFIGURATION ==========
// WiFi Settings
const char* ssid = "TAMNET SYSTEMS";
const char* password = "Tamnet123";

// Backend Server Settings
// IMPORTANT: Use your computer's actual IP address (not localhost)
// ESP32 and computer must be on the same network
const char* serverURL = "http://192.168.100.227:3000";

// API Endpoint for sensor data
const char* apiEndpoint = "/api/sensors/save";

// Storage Unit ID - Created via: POST /api/iot/setup
// This ID links sensor data to a specific storage unit in the database
const char* storageUnitId = "cmna283a600037yjmktql7nqw";

// Sensor Settings
#define DHTPIN 14        // GPIO pin connected to DHT data pin
#define DHTTYPE DHT22   // DHT 22 sensor (or DHT11)

// Reading interval (milliseconds)
#define READ_INTERVAL 60000  // Read and send data every 60 seconds

// ========== INITIALIZATION ==========
DHT dht(DHTPIN, DHTTYPE);
HTTPClient http;
unsigned long lastReadTime = 0;

// ========== FUNCTION DECLARATIONS ==========
void setupWiFi();
void connectToWiFi();
void readAndSendSensorData();
void printLocalTime();

// ========== SETUP ==========
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n\n========================================");
  Serial.println("AgroVault IoT Sensor System - Starting");
  Serial.println("========================================\n");

  // Initialize DHT sensor
  dht.begin();
  Serial.println("[SENSOR] DHT22 initialized on GPIO " + String(DHTPIN));

  // Connect to WiFi
  setupWiFi();

  Serial.println("\n✓ System ready! Starting sensor readings...\n");
}

// ========== MAIN LOOP ==========
void loop() {
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WiFi] Connection lost, reconnecting...");
    connectToWiFi();
  }

  // Read and send sensor data at intervals
  unsigned long currentTime = millis();
  if (currentTime - lastReadTime >= READ_INTERVAL) {
    lastReadTime = currentTime;
    readAndSendSensorData();
  }

  delay(1000);
}

// ========== WIFI SETUP ==========
void setupWiFi() {
  Serial.println("[WiFi] Connecting to: " + String(ssid));

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WiFi] ✓ Connected!");
    Serial.println("[WiFi] IP Address: " + WiFi.localIP().toString());
  } else {
    Serial.println("\n[WiFi] ✗ Failed to connect! Check SSID and password.");
  }
}

void connectToWiFi() {
  WiFi.disconnect();
  delay(1000);
  setupWiFi();
}

// ========== SENSOR READING & DATA SEND ==========
void readAndSendSensorData() {
  Serial.println("\n--- Reading Sensor Data ---");

  // Read temperature and humidity
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();  // Celsius

  // Check if readings are valid
  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("[SENSOR] ✗ Failed to read from DHT sensor!");
    Serial.println("[SENSOR] - Check sensor connection");
    Serial.println("[SENSOR] - Verify correct GPIO pin");
    return;
  }

  Serial.println("[SENSOR] Temperature: " + String(temperature, 2) + "°C");
  Serial.println("[SENSOR] Humidity: " + String(humidity, 2) + "%");

  // Prepare JSON payload
  StaticJsonDocument<200> jsonDoc;
  jsonDoc["storageUnitId"] = storageUnitId;
  jsonDoc["temperature"] = temperature;
  jsonDoc["humidity"] = humidity;

  String jsonString;
  serializeJson(jsonDoc, jsonString);

  Serial.println("[HTTP] Sending data to: " + String(serverURL) + String(apiEndpoint));
  Serial.println("[HTTP] Payload: " + jsonString);

  // Send POST request
  http.begin(String(serverURL) + String(apiEndpoint));
  http.addHeader("Content-Type", "application/json");

  int httpResponseCode = http.POST(jsonString);

  if (httpResponseCode > 0) {
    String response = http.getString();

    Serial.println("[HTTP] Response Code: " + String(httpResponseCode));
    Serial.println("[HTTP] Response: " + response);

    if (httpResponseCode == 201 || httpResponseCode == 200) {
      Serial.println("[HTTP] ✓ Data sent successfully!");
    } else {
      Serial.println("[HTTP] ✗ Server returned error code: " + String(httpResponseCode));
    }
  } else {
    Serial.println("[HTTP] ✗ Request failed! Error: " + http.errorToString(httpResponseCode));
    Serial.println("[HTTP] Troubleshooting:");
    Serial.println("  - Check WiFi connection");
    Serial.println("  - Verify backend URL is correct");
    Serial.println("  - Ensure backend server is running");
  }

  http.end();
  Serial.println("--- End Sensor Reading ---\n");
}

// ========== DIAGNOSTIC FUNCTIONS (Optional) ==========
void printSystemStatus() {
  Serial.println("\n========== System Status ==========");
  Serial.println("WiFi Status: " + String(WiFi.status() == WL_CONNECTED ? "Connected" : "Disconnected"));
  Serial.println("IP Address: " + WiFi.localIP().toString());
  Serial.println("Signal Strength: " + String(WiFi.RSSI()) + " dBm");
  Serial.println("Storage Unit ID: " + String(storageUnitId));
  Serial.println("Read Interval: " + String(READ_INTERVAL / 1000) + " seconds");
  Serial.println("===================================\n");
}
