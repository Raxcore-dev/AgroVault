#!/bin/bash
# ESP32 Data Pipeline Test Script
# Tests the complete flow from API to database

BACKEND_URL="http://localhost:3000"
STORAGE_UNIT_ID="cmna283a600037yjmktql7nqw"

echo "======================================"
echo "  AgroVault IoT Pipeline Test"
echo "======================================"
echo ""

# Test 1: Save sensor data
echo "📊 Test 1: Saving sensor data..."
RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/sensors/save" \
  -H "Content-Type: application/json" \
  -d "{\"storageUnitId\":\"$STORAGE_UNIT_ID\",\"temperature\":25.5,\"humidity\":65.2}")

if echo "$RESPONSE" | grep -q '"success":true'; then
  echo "   ✅ Sensor data saved successfully!"
  READING_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo "   Reading ID: $READING_ID"
else
  echo "   ❌ Failed to save sensor data"
  echo "   Response: $RESPONSE"
fi
echo ""

# Test 2: Get storage units
echo "📦 Test 2: Checking storage units..."
RESPONSE=$(curl -s "$BACKEND_URL/api/iot/setup")

if echo "$RESPONSE" | grep -q '"success":true'; then
  echo "   ✅ Storage units retrieved successfully!"
  
  # Count storage units
  UNIT_COUNT=$(echo "$RESPONSE" | grep -o '"id":"cmna283a600037yjmktql7nqw"' | wc -l)
  if [ "$UNIT_COUNT" -gt 0 ]; then
    echo "   ✅ ESP32 Test Silo found!"
    
    # Check readings count
    READING_COUNT=$(echo "$RESPONSE" | grep -o '"readings":\[{' | wc -l)
    echo "   Total readings in system: $READING_COUNT+"
  else
    echo "   ⚠️  ESP32 Test Silo not found"
  fi
else
  echo "   ❌ Failed to retrieve storage units"
fi
echo ""

# Test 3: Create new storage unit (optional)
echo "🆕 Test 3: Creating new storage unit (for future use)..."
RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/iot/setup")

if echo "$RESPONSE" | grep -q '"success":true'; then
  echo "   ✅ New storage unit created!"
  NEW_ID=$(echo "$RESPONSE" | grep -o '"storageUnitId":"[^"]*"' | cut -d'"' -f4)
  echo "   New Storage Unit ID: $NEW_ID"
else
  echo "   ⚠️  Could not create new storage unit"
fi
echo ""

echo "======================================"
echo "  Test Complete!"
echo "======================================"
echo ""
echo "Next Steps:"
echo "1. Upload ESP32 code with storageUnitId: $STORAGE_UNIT_ID"
echo "2. Monitor ESP32 serial output for HTTP 201 responses"
echo "3. Check dashboard for real-time sensor data"
echo ""
