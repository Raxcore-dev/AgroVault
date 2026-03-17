# AgroVault - Agricultural Storage & Market Intelligence Platform

A comprehensive agricultural technology platform designed to help farmers reduce spoilage, optimize storage conditions, access real-time market data, and connect directly with buyers through an integrated marketplace.

## 🌾 Overview

AgroVault is a full-stack web application that bridges the gap between farmers and buyers in the agricultural supply chain. It provides real-time monitoring of storage conditions, AI-powered spoilage risk assessment, market price intelligence, and a direct marketplace for buying and selling agricultural products.

### Key Features

- **Real-Time Storage Monitoring**: Track temperature and humidity in storage units with live sensor data
- **AI-Powered Spoilage Detection**: Predict spoilage risk based on storage conditions and commodity type
- **Market Intelligence**: Access real-time market prices, trends, and recommendations
- **Integrated Marketplace**: Farmers list products, buyers browse and purchase directly
- **Weather Insights**: Get weather forecasts and agricultural recommendations
- **Farm Jobs Board**: Post and apply for farm labor opportunities
- **Dual-Role System**: Separate experiences for farmers and buyers

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 14+ (React 18+)
- **Styling**: Tailwind CSS with custom agricultural color scheme
- **UI Components**: Custom components + Lucide icons
- **State Management**: React Context API
- **HTTP Client**: Fetch API

### Backend
- **Runtime**: Node.js with Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based with bcrypt password hashing
- **File Storage**: Cloudinary for image uploads
- **API**: RESTful endpoints

### DevOps & Tools
- **Package Manager**: npm/pnpm
- **Build Tool**: Next.js built-in
- **Environment**: Node.js 18+
- **Port**: 3000 (default)

## 📋 Project Structure

```
AgroVault/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── products/             # Marketplace product endpoints
│   │   ├── storage-units/        # Storage unit management
│   │   ├── commodities/          # Commodity management
│   │   ├── alerts/               # Alert system
│   │   ├── messages/             # Messaging between users
│   │   ├── jobs/                 # Farm jobs endpoints
│   │   ├── upload/               # Image upload to Cloudinary
│   │   └── market/               # Market data endpoints
│   ├── dashboard/                # Farmer dashboard
│   │   ├── page.tsx              # Main dashboard
│   │   ├── storage-units/        # Storage management
│   │   ├── commodities/          # Commodity tracking
│   │   ├── alerts/               # Alert management
│   │   ├── market-analysis/      # Market & risk analysis
│   │   ├── weather/              # Weather insights
│   │   ├── jobs/                 # Job management
│   │   └── notifications/        # Notifications
│   ├── marketplace/              # Marketplace module
│   │   ├── page.tsx              # Browse products
│   │   ├── add-product/          # List new product
│   │   ├── my-listings/          # Manage listings
│   │   ├── [id]/                 # Product details
│   │   └── edit/[id]/            # Edit product
│   ├── jobs/                     # Farm jobs listing
│   ├── login/                    # Authentication pages
│   ├── register/
│   ├── market/                   # Market analysis page
│   ├── globals.css               # Global styles & theme
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home/dashboard redirect
├── components/                   # Reusable React components
│   ├── marketplace/              # Marketplace-specific components
│   │   ├── product-card.tsx
│   │   ├── product-filters.tsx
│   │   ├── chat-widget.tsx
│   │   └── farmer-map.tsx
│   ├── ui/                       # UI components
│   ├── sidebar.tsx               # Navigation sidebar
│   ├── header.tsx                # Top header
│   ├── mobile-nav.tsx            # Mobile navigation
│   ├── app-shell.tsx             # App layout wrapper
│   ├── error-boundary.tsx        # Error handling
│   ├── stats-overview.tsx        # Dashboard stats
│   ├── storage-card.tsx          # Storage unit display
│   ├── alerts.tsx                # Alert components
│   ├── weather-widgets.tsx       # Weather display
│   ├── market-chart.tsx          # Market data visualization
│   └── ai-market-analysis.tsx    # AI insights
├── hooks/                        # Custom React hooks
│   ├── use-auth.ts               # Auth context hook
│   ├── use-agrovault-data.ts     # Data fetching
│   ├── use-mobile.ts             # Mobile detection
│   ├── use-role-guard.ts         # Role-based access
│   └── use-toast.ts              # Toast notifications
├── lib/                          # Utility functions & services
│   ├── auth-context.tsx          # Auth provider
│   ├── auth.ts                   # Auth utilities
│   ├── api-auth.ts               # API authentication
│   ├── prisma.ts                 # Prisma client
│   ├── cloudinary.ts             # Cloudinary integration
│   ├── utils.ts                  # General utilities
│   ├── role-routes.ts            # Role-based routing
│   ├── services/                 # API service functions
│   └── data/                     # Mock/seed data
├── prisma/                       # Database schema & migrations
│   ├── schema.prisma             # Data models
│   ├── migrations/               # Database migrations
│   └── seed.ts                   # Database seeding
├── public/                       # Static assets
├── styles/                       # Additional stylesheets
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # Tailwind configuration
├── next.config.mjs               # Next.js configuration
└── .env.local                    # Environment variables
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- PostgreSQL database
- Cloudinary account (for image uploads)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AgroVault
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following in `.env.local`:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/agrovault"
   
   # JWT Secret
   JWT_SECRET="your-secret-key-here"
   
   # Cloudinary
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   
   # API
   NEXT_PUBLIC_API_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

   The application will be available at `http://localhost:3000`

## 📱 User Roles

### Farmer
- Manage storage units and monitor conditions
- Track commodities and receive spoilage alerts
- List products on the marketplace
- View market analysis and price trends
- Post farm jobs and manage applications
- Access weather insights

### Buyer
- Browse marketplace products
- Filter by location, price, category
- Contact farmers directly
- View product details and seller information
- Apply for farm jobs

## 🎨 Design System

### Color Palette
- **Primary Green**: `#2E7D32` - Main actions and branding
- **Secondary Orange**: `#FB8C00` - Call-to-action buttons
- **Accent Blue**: `#1976D2` - Analytics and secondary actions
- **Light Gray**: `#F5F7F6` - Background
- **Dark Charcoal**: `#212121` - Text

### Typography
- **Font Family**: Geist (system-ui fallback)
- **Headings**: Bold, 1.25rem - 2rem
- **Body**: Regular, 0.875rem - 1rem
- **Captions**: Muted, 0.75rem

## 🔐 Authentication

### Login Flow
1. User enters email and password
2. Server validates credentials against bcrypt hash
3. JWT token generated and stored in localStorage
4. User redirected based on role (farmer → dashboard, buyer → marketplace)

### Protected Routes
- Farmer-only routes redirect buyers to marketplace
- Buyer-only routes redirect farmers to dashboard
- Unauthenticated users redirected to login

### API Authentication
All protected endpoints require:
```
Authorization: Bearer <jwt-token>
```

## 📊 Database Schema

### Core Models

**User**
- id, name, email, password (hashed), role, phone, location
- Relations: products, messages, storage units, jobs

**Product**
- id, productName, description, price, quantity, unit
- productImage, locationName, latitude, longitude, category
- isAvailable, harvestDate, createdAt, updatedAt
- Relations: farmer, storageUnit, messages

**StorageUnit**
- id, name, location, capacity, latitude, longitude
- Relations: farmer, commodities, alerts, readings, products

**Commodity**
- id, commodityName, quantity, unit, dateStored
- expectedStorageDuration, createdAt, updatedAt
- Relations: storageUnit, alerts

**StorageReading**
- id, temperature, humidity, status, recordedAt
- Relations: storageUnit

**Alert**
- id, alertType, message, severity, isRead, timestamp
- spoilageRisk, recommendedAction, recommendedMarket
- Relations: storageUnit, commodity, market

**Message**
- id, message, timestamp, senderId, receiverId
- productId (optional), jobId (optional)
- Relations: sender, receiver, product, job

**Job**
- id, title, cropType, description, workersNeeded
- payPerDay, location, latitude, longitude, startDate, isOpen
- Relations: farmer, applications, messages

**JobApplication**
- id, message, status, createdAt, updatedAt
- Relations: job, worker

**Market**
- id, marketName, location, commodity, pricePerKg
- latitude, longitude, lastUpdated

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Products (Marketplace)
- `GET /api/products` - List products with filters
- `POST /api/products` - Create product (farmer only)
- `GET /api/products/[id]` - Get product details
- `PATCH /api/products/[id]` - Update product (owner only)
- `DELETE /api/products/[id]` - Delete product (owner only)
- `GET /api/products/my-listings` - Get farmer's listings

### Storage Units
- `GET /api/storage-units` - List storage units
- `POST /api/storage-units` - Create storage unit
- `GET /api/storage-units/[id]` - Get storage unit details
- `GET /api/storage-units/my-units` - Get farmer's units

### Commodities
- `GET /api/commodities` - List commodities
- `POST /api/commodities` - Create commodity
- `GET /api/commodities/[id]` - Get commodity details

### Alerts
- `GET /api/alerts` - List alerts
- `PATCH /api/alerts/[id]` - Mark alert as read

### Messages
- `GET /api/messages` - Get conversations
- `POST /api/messages` - Send message
- `GET /api/messages/[id]` - Get message thread

### Jobs
- `GET /api/jobs` - List jobs
- `POST /api/jobs` - Create job (farmer only)
- `GET /api/jobs/[id]` - Get job details
- `POST /api/jobs/[id]/apply` - Apply for job

### Market Data
- `GET /api/market/prices` - Get market prices
- `GET /api/market/trends` - Get price trends
- `GET /api/market/analysis` - Get AI market analysis

### Upload
- `POST /api/upload` - Upload image to Cloudinary

## 🎯 Key Features Explained

### Real-Time Storage Monitoring
- Farmers add storage units with capacity and location
- System tracks temperature and humidity readings
- Alerts triggered when conditions breach safe thresholds
- Historical data available for analysis

### Spoilage Risk Assessment
- AI analyzes storage conditions against commodity thresholds
- Considers temperature, humidity, storage duration
- Provides risk level (low/medium/high) and recommendations
- Suggests optimal markets for quick sale if risk is high

### Marketplace
- Farmers list products with images, price, quantity, location
- Products linked to monitored storage units show "Monitored" badge
- Buyers filter by location, price, category, quantity
- Direct messaging between farmers and buyers
- Product details show seller information and storage status

### Market Intelligence
- Real-time market prices from multiple locations
- Price trend analysis and predictions
- Commodity-specific recommendations
- Weather-based agricultural insights

### Farm Jobs
- Farmers post labor requirements with pay and location
- Workers browse and apply with messages
- Farmers manage applications and accept/reject

## 🛠️ Development

### Running Tests
```bash
npm run test
```

### Building for Production
```bash
npm run build
npm start
```

### Code Quality
- ESLint configured for code standards
- TypeScript for type safety
- Prettier for code formatting

### Environment-Specific Configuration
- Development: `npm run dev` (port 3000, hot reload)
- Production: `npm start` (port 3000, optimized build)

## 📈 Performance Optimizations

- **Dashboard Loading**: Critical data (stats, storage) loads first, secondary data (AI analysis, weather) loads asynchronously
- **Image Optimization**: Cloudinary integration for responsive images
- **Database Queries**: Optimized with Prisma includes and selects
- **Caching**: Browser caching for static assets
- **Code Splitting**: Next.js automatic route-based splitting

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Role-Based Access Control**: Endpoint and route protection
- **Input Validation**: Server-side validation on all endpoints
- **CORS**: Configured for API security
- **Environment Variables**: Sensitive data in .env.local

## 🐛 Error Handling

- **Error Boundary**: React component catches rendering errors
- **API Error Responses**: Consistent error format with status codes
- **User-Friendly Messages**: Clear error messages for users
- **Logging**: Console logging for debugging

## 📱 Responsive Design

- Mobile-first approach with Tailwind CSS
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Mobile navigation drawer for small screens
- Touch-friendly interface elements

## 🌐 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📚 Documentation

### Component Documentation
Each component includes JSDoc comments explaining:
- Purpose and functionality
- Props and their types
- Usage examples
- Related components

### API Documentation
Each endpoint includes:
- HTTP method and path
- Query/body parameters
- Response format
- Error codes
- Authentication requirements

## 🚀 Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Docker
```bash
docker build -t agrovault .
docker run -p 3000:3000 agrovault
```

### Environment Setup for Production
- Set `NODE_ENV=production`
- Configure production database URL
- Set secure JWT_SECRET
- Configure Cloudinary credentials
- Enable HTTPS

## 📞 Support & Contribution

### Reporting Issues
- Create detailed bug reports with reproduction steps
- Include error messages and screenshots
- Specify browser and OS

### Contributing
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- Agricultural data and market insights from Kenya agricultural sources
- Weather data integration
- Community feedback and testing

## 📞 Contact

For questions or support, please contact the development team or open an issue on the repository.

---

**Last Updated**: 2024
**Version**: 1.0.0
**Status**: Active Development
