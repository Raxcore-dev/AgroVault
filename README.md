# AgroVault - Agricultural Storage & Market Intelligence Platform

A modern, multi-page agricultural management system with real-time monitoring, market analysis powered by Groq AI, and comprehensive risk assessment.

## Features

### Multi-Page Architecture
- **Dashboard** - Overview with quick stats, storage facility status, and navigation to all sections
- **Temperature Monitoring** - 24-hour temperature trends with real-time data visualization
- **Humidity Tracking** - Humidity levels across all storage facilities with historical trends
- **Market Analysis** - AI-powered crop price analysis with county-based filtering and Groq AI insights
- **Risk Assessment** - Spoilage risk scoring with mitigation strategies and actionable recommendations

### Design System
- **Modern Color Palette**: Purple primary (#262 80% 50%), golden accent (#39 89% 51%) with professional neutrals
- **Responsive Layout**: Mobile-first design with sidebar on desktop and bottom nav on mobile
- **Gradient Backgrounds**: Subtle gradients for visual depth and hierarchy
- **Accessible Components**: Built with shadcn/ui and Radix UI for accessibility

### Data & Intelligence
- **Stable Market Data**: Fixed crop prices to prevent random fluctuations
  - Maize: 8,500 KES (trending up)
  - Beans: 12,500 KES (trending down)
  - Wheat: 15,000 KES (trending up)
  - Rice & Sorghum with consistent pricing
- **Real-time Polling**: 10-second update intervals for sensor and market data
- **AI-Powered Analysis**: Groq AI market analysis with actionable recommendations
- **County-Based Filtering**: Market analysis filtered by county selection

## Technology Stack

- **Framework**: Next.js 16 with React 19
- **UI Components**: shadcn/ui with Tailwind CSS v4
- **Charts**: Recharts for data visualization
- **AI Integration**: Vercel AI SDK with Groq provider
- **Icons**: lucide-react for consistent iconography

## Getting Started

### Prerequisites
- Node.js 18+
- GROQ_API_KEY environment variable (for market AI analysis)

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
echo "GROQ_API_KEY=your_groq_api_key_here" > .env.local

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
app/
├── page.tsx              # Dashboard overview
├── temperature/
│   └── page.tsx          # Temperature monitoring
├── humidity/
│   └── page.tsx          # Humidity tracking
├── market/
│   └── page.tsx          # Market analysis with county filter
├── risk/
│   └── page.tsx          # Risk assessment
├── api/
│   ├── sensors/route.ts  # Sensor data endpoint
│   ├── market/route.ts   # Market data endpoint
│   ├── risk/route.ts     # Risk scoring endpoint
│   └── market-analysis/route.ts  # AI market analysis
└── layout.tsx            # Root layout with sidebar/mobile nav

components/
├── sidebar.tsx           # Desktop navigation
├── mobile-nav.tsx        # Mobile bottom navigation
├── ai-market-analysis.tsx # Groq AI analysis component
├── market-chart.tsx      # Price comparison chart
├── temperature-chart.tsx # Temperature trend chart
├── market-table.tsx      # Detailed market data
└── storage-card.tsx      # Storage facility cards

lib/
└── mock-data.ts          # Stable mock data generators
```

## API Endpoints

- `GET /api/sensors` - Current temperature/humidity readings
- `GET /api/market?county=XX` - Crop prices by county
- `GET /api/risk` - Storage spoilage risk assessment
- `POST /api/market-analysis` - AI-powered market insights (Groq)

## Market Data Stability

Market prices are now fixed to prevent random fluctuations:

```typescript
const STABLE_PRICES = {
  'Maize': { price: 8500, trend: 'up', change: 150 },
  'Beans': { price: 12500, trend: 'down', change: -200 },
  'Wheat': { price: 15000, trend: 'up', change: 250 },
  // ...
}
```

This ensures consistent data for farmers making informed decisions.

## Color Scheme

- **Primary**: Purple (#262 80% 50%) - Trust and growth
- **Secondary**: Light Purple (#263 80% 55%)
- **Accent**: Golden (#39 89% 51%) - Warmth and agriculture
- **Success**: Green (#142 72% 29%) - Low risk
- **Warning**: Amber (#39 89% 51%) - Medium risk
- **Danger**: Red (#0 84% 60%) - High risk

## AI Integration

The Market Analysis page uses Groq AI to generate intelligent insights:

1. Select a county to filter market data
2. Click "Generate Analysis" button
3. Groq AI analyzes crop prices and trends
4. Provides recommendations: Buy/Hold/Sell for each crop
5. Risk factors and optimal timing suggestions

## Environment Variables

```
GROQ_API_KEY=your_api_key_here
```

## Development

- Hot module replacement (HMR) enabled
- TypeScript strict mode
- Automatic dependency installation with pnpm
- Responsive design tested on mobile, tablet, and desktop

## Deployment

Deploy to Vercel with one click:

```bash
pnpm run build
pnpm start
```

## License

MIT
