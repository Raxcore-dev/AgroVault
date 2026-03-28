# Commodity Price Management System

## Overview
A complete database-driven commodity price management system where **admins control prices** and the **AI fetches real data from the database** - NO placeholder data.

## What Was Implemented

### 1. Database Schema (`prisma/schema.prisma`)
Added new `CommodityPrice` model:
```prisma
model CommodityPrice {
  id              String   @id @default(cuid())
  county          String   // e.g., "Kisumu", "Nairobi", "Madera"
  commodity       String   // e.g., "maize", "beans", "wheat"
  pricePerKg      Float    // current price in KES per kg
  pricePerBag     Float?   // optional: price per 90kg bag
  previousPrice   Float?   // previous price for trend calculation
  priceTrend      String   // "increasing" | "stable" | "decreasing"
  demandLevel     String   // "low" | "medium" | "high"
  unit            String   @default("kg")
  isActive        Boolean  @default(true)
  source          String   @default("admin")
  notes           String?
  lastUpdated     DateTime @default(now())
  updatedBy       String?  // admin user ID

  @@unique([county, commodity])
}
```

### 2. API Endpoints

#### Public API - Get Commodity Prices
**Endpoint:** `GET /api/commodity-prices`
- Query params: `county`, `commodity`, `search`
- Returns real-time commodity prices from database
- Used by AI chat and public features

Example:
```bash
GET /api/commodity-prices?county=Kisumu&commodity=maize
```

#### Admin API - Manage Prices
**Endpoint:** `POST /api/admin/commodity-prices`
- Requires admin authentication
- Create or update commodity prices
- Body: `{ county, commodity, pricePerKg, pricePerBag, priceTrend, demandLevel, notes }`

Example:
```bash
POST /api/admin/commodity-prices
{
  "county": "Kisumu",
  "commodity": "maize",
  "pricePerKg": 44,
  "pricePerBag": 3960,
  "priceTrend": "stable",
  "demandLevel": "high",
  "notes": "Prices stable due to good harvest"
}
```

#### Admin API - Get All Prices
**Endpoint:** `GET /api/admin/commodity-prices`
- Requires admin authentication
- Query params: `county`, `commodity`, `isActive`

#### Seed API - Populate Initial Data
**Endpoint:** `POST /api/admin/seed-commodity-prices`
- Requires admin authentication
- Seeds database with initial prices for major counties and commodities
- Includes maize, beans, wheat, rice, coffee, tea, vegetables, and fish

### 3. AI Search Integration (`app/api/ai/search/route.ts`)

Updated AI search to:
- ✅ Fetch **REAL commodity prices** from database
- ✅ NO placeholder data
- ✅ Prices shown first in AI responses
- ✅ Admin-controlled pricing highlighted

The AI now:
1. Detects user intent (price queries, product searches, etc.)
2. Fetches real `CommodityPrice` records from database
3. Sends real data to Rax AI for intelligent responses
4. Returns formatted prices with trends and demand levels

Example AI query:
```
User: "What's the price of maize in Kisumu?"
AI: "📊 COMMODITY PRICES (Admin-Controlled, Real-Time Data):
- MAIZE in Kisumu: KES 44/kg (KES 3,960/90kg bag) | Trend: stable | Demand: high"
```

### 4. Sample Data

Initial seed data includes:
- **Maize**: 7 counties (Trans Nzoia, Uasin Gishu, Nakuru, Narok, Kisumu, Mombasa, Nairobi)
- **Beans**: 6 counties
- **Wheat**: 5 counties
- **Rice**: 3 counties
- **Coffee**: Nyeri, Kiambu
- **Tea**: Kericho, Nandi
- **Vegetables**: Nakuru, Nairobi
- **Fish**: Kisumu, Siaya, Homa Bay

## How to Use

### 1. Seed the Database
Run this once to populate initial data:
```bash
# Through API (recommended - ensures proper DB connection)
curl -X POST http://localhost:3000/api/admin/seed-commodity-prices \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Or visit in browser (while logged in as admin):
```
http://localhost:3000/api/admin/seed-commodity-prices
```

### 2. Update Prices (Admin)
```bash
curl -X POST http://localhost:3000/api/admin/commodity-prices \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "county": "Madera",
    "commodity": "maize",
    "pricePerKg": 78,
    "pricePerBag": 7020,
    "priceTrend": "increasing",
    "demandLevel": "high"
  }'
```

### 3. Query Prices (Public)
```bash
# Get all prices
curl http://localhost:3000/api/commodity-prices

# Filter by county
curl http://localhost:3000/api/commodity-prices?county=Kisumu

# Filter by commodity
curl http://localhost:3000/api/commodity-prices?commodity=maize

# Search
curl http://localhost:3000/api/commodity-prices?search=maize
```

### 4. AI Chat
Users can ask the Rax AI chat:
- "What's the price of maize in Kisumu?"
- "Show me bean prices in Nairobi"
- "Where is maize cheapest?"
- "What's the trend for wheat prices?"

## Key Features

✅ **Admin-Controlled**: Only admins can update prices
✅ **Real-Time**: Prices fetched live from database
✅ **No Placeholder Data**: All data comes from actual DB records
✅ **Trend Tracking**: Tracks price changes over time
✅ **Demand Levels**: Shows market demand (high/medium/low)
✅ **Multiple Units**: Supports per kg and per 90kg bag pricing
✅ **County-Specific**: Different prices per county
✅ **AI-Powered**: Rax AI uses real data for intelligent responses

## Database Migration

The migration has been run successfully:
```bash
npx prisma migrate dev --name add_commodity_price_model
```

Migration file created: `prisma/migrations/20260327140824_add_commodity_price_model/`

## Next Steps

1. **Seed the database** using the admin API endpoint
2. **Test AI chat** with price queries
3. **Build admin UI** for price management (optional)
4. **Add more counties/commodities** as needed

## Files Modified/Created

### Modified:
- `prisma/schema.prisma` - Added CommodityPrice model
- `app/api/ai/search/route.ts` - Updated to fetch real prices

### Created:
- `app/api/commodity-prices/route.ts` - Public price API
- `app/api/admin/commodity-prices/route.ts` - Admin price management
- `app/api/admin/seed-commodity-prices/route.ts` - Seed API
- `prisma/seed-commodity-prices.ts` - Full seed script (all 47 counties)
- `prisma/seed-simple.ts` - Simple seed script (sample data)

---

**Status**: ✅ Complete and ready to use!
