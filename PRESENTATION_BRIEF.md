# AgroVault Presentation Brief for AI Slide Generation

## Project Title
**AgroVault: Agricultural Storage & Market Intelligence Platform**

## Tagline
"Reducing Food Spoilage Through Smart Storage Monitoring and Direct Market Access"

---

## SLIDE 1: Title Slide
**Title**: AgroVault
**Subtitle**: Agricultural Storage & Market Intelligence Platform
**Tagline**: Empowering Farmers, Reducing Spoilage, Connecting Markets
**Visual Suggestion**: Agricultural imagery - modern farm with technology overlay, or storage facility with digital monitoring icons

---

## SLIDE 2: The Problem
**Title**: The Agricultural Challenge in Kenya

**Key Statistics & Problems**:
- 30-40% of agricultural produce is lost to spoilage annually in Kenya
- Farmers lack real-time storage condition monitoring
- Limited access to current market prices leads to poor selling decisions
- Disconnected supply chain between farmers and buyers
- Poor storage conditions cause massive financial losses
- Farmers sell at low prices due to spoilage risk and lack of market information

**Visual Suggestion**: Infographic showing spoilage statistics, or split image showing spoiled produce vs. fresh produce

---

## SLIDE 3: Our Solution
**Title**: AgroVault - A Comprehensive Agricultural Platform

**Core Solution Components**:
1. **Real-Time Storage Monitoring** - Track temperature and humidity 24/7
2. **AI-Powered Spoilage Prediction** - Early warning system for risk assessment
3. **Market Intelligence** - Live market prices and trend analysis
4. **Direct Marketplace** - Connect farmers directly with buyers
5. **Weather Insights** - Agricultural weather forecasts and recommendations
6. **Farm Jobs Board** - Labor marketplace for agricultural work

**Visual Suggestion**: Circular diagram or hexagon layout showing 6 interconnected features around central "AgroVault" logo

---

## SLIDE 4: How It Works - Storage Monitoring
**Title**: Smart Storage Monitoring System

**Process Flow**:
1. Farmers register storage units with capacity and location
2. IoT sensors track temperature and humidity in real-time
3. System compares readings against commodity-specific safe thresholds
4. Automated alerts sent when conditions breach safe levels
5. Historical data visualization for trend analysis
6. Dashboard shows all storage units at a glance

**Key Benefits**:
- Prevent spoilage before it happens
- Optimize storage conditions
- Reduce losses by up to 60%
- Data-driven decision making

**Visual Suggestion**: Flow diagram showing sensor → data → alert → action, or dashboard screenshot mockup

---

## SLIDE 5: AI-Powered Spoilage Detection
**Title**: Predictive Analytics for Spoilage Prevention

**How AI Helps**:
- Analyzes storage conditions (temperature, humidity, duration)
- Compares against commodity-specific thresholds
- Calculates spoilage risk level (Low/Medium/High)
- Provides actionable recommendations
- Suggests optimal markets for quick sale if risk is high
- Considers weather patterns and seasonal factors

**Example Alert**:
"⚠️ HIGH RISK: Maize in Storage Unit A
- Temperature: 28°C (above safe threshold)
- Humidity: 75% (too high)
- Recommendation: Sell within 3 days at Kibuye Market (KES 45/kg)"

**Visual Suggestion**: AI brain icon with data inputs, risk meter showing low/medium/high, or alert notification mockup

---

## SLIDE 6: Market Intelligence
**Title**: Real-Time Market Data & Price Trends

**Features**:
- Live market prices from multiple locations across Kenya
- Price trend analysis and predictions
- Commodity-specific market recommendations
- Distance-based market suggestions
- Demand level indicators
- Best time to sell recommendations

**Market Data Displayed**:
- Current price per kg
- 7-day price trend (↑ increasing, ↓ decreasing, → stable)
- Demand level (High/Medium/Low)
- Distance from farmer's location
- Market contact information

**Visual Suggestion**: Line graph showing price trends, or map of Kenya with market locations and prices

---

## SLIDE 7: Integrated Marketplace
**Title**: Direct Farmer-to-Buyer Marketplace

**For Farmers**:
- List products with photos, price, quantity
- Link products to monitored storage units
- "Monitored Storage" badge builds buyer trust
- Manage listings and availability
- Direct messaging with buyers
- Track inquiries and sales

**For Buyers**:
- Browse products by location, category, price
- Filter by quantity available
- View storage conditions and quality indicators
- Contact farmers directly
- Negotiate prices
- Reduce middleman costs

**Key Advantage**: Products from monitored storage units show quality assurance, commanding premium prices

**Visual Suggestion**: Split screen showing farmer listing interface and buyer browsing interface, or marketplace grid with product cards

---

## SLIDE 8: Technology Stack
**Title**: Built on Modern, Scalable Technology

**Frontend**:
- Next.js 14 (React 18) - Fast, SEO-friendly
- Tailwind CSS - Responsive, mobile-first design
- TypeScript - Type-safe development

**Backend**:
- Node.js with Next.js API Routes
- PostgreSQL Database - Reliable, scalable
- Prisma ORM - Type-safe database access
- JWT Authentication - Secure user sessions

**Integrations**:
- Cloudinary - Image storage and optimization
- Weather API - Agricultural forecasts
- IoT Sensors - Real-time monitoring

**Visual Suggestion**: Tech stack diagram with logos, or layered architecture diagram

---

## SLIDE 9: User Experience - Dual Role System
**Title**: Tailored Experiences for Farmers & Buyers

**Farmer Dashboard**:
- Storage unit overview with live conditions
- Spoilage alerts and recommendations
- Market analysis and price trends
- Product listings management
- Job postings for farm labor
- Weather insights
- Notifications center

**Buyer Dashboard**:
- Marketplace product browsing
- Advanced filtering and search
- Saved searches and favorites
- Direct messaging with farmers
- Job opportunities
- Market trends

**Visual Suggestion**: Side-by-side screenshots of farmer dashboard vs buyer dashboard

---

## SLIDE 10: Design Philosophy
**Title**: Professional, Agricultural-Focused Design

**Color Palette**:
- **Deep Green (#2E7D32)** - Primary actions, trust, agriculture
- **Harvest Orange (#FB8C00)** - Call-to-action, urgency
- **Tech Blue (#1976D2)** - Analytics, data visualization
- **Light Gray (#F5F7F6)** - Clean background
- **Dark Charcoal (#212121)** - Professional text

**Design Principles**:
- Clean, fintech-inspired interface
- Agricultural color scheme
- Mobile-first responsive design
- Accessibility compliant
- Intuitive navigation
- Data visualization focus

**Visual Suggestion**: Color palette swatches, or before/after design comparison

---

## SLIDE 11: Key Features Deep Dive
**Title**: Feature Highlights

**1. Weather Insights**
- 7-day agricultural forecasts
- Planting recommendations
- Harvest timing suggestions
- Risk alerts (drought, floods, frost)

**2. Farm Jobs Board**
- Farmers post labor requirements
- Workers apply with experience
- Location-based job matching
- Pay transparency

**3. Messaging System**
- Direct farmer-buyer communication
- Product inquiry management
- Job application discussions
- In-app notifications

**4. Alert System**
- Temperature/humidity warnings
- Spoilage risk notifications
- Market opportunity alerts
- Weather warnings

**Visual Suggestion**: Four-quadrant layout with icons for each feature

---

## SLIDE 12: Database Architecture
**Title**: Robust Data Model

**Core Data Models**:
- **Users** - Farmers and buyers with role-based access
- **Storage Units** - Physical storage facilities with capacity
- **Commodities** - Products stored with tracking
- **Products** - Marketplace listings
- **Storage Readings** - Sensor data time series
- **Alerts** - Automated notifications
- **Messages** - User communications
- **Jobs** - Labor marketplace
- **Markets** - Price data from physical markets

**Relationships**:
- Users own storage units and list products
- Storage units contain commodities and generate readings
- Readings trigger alerts based on thresholds
- Products link to storage units for quality assurance

**Visual Suggestion**: Entity relationship diagram (ERD) or database schema visualization

---

## SLIDE 13: Security & Authentication
**Title**: Enterprise-Grade Security

**Security Features**:
- **Password Security**: bcrypt hashing with salt
- **JWT Authentication**: Secure token-based sessions
- **Role-Based Access Control**: Farmer/buyer permissions
- **API Protection**: All endpoints require authentication
- **Input Validation**: Server-side validation on all inputs
- **Environment Security**: Sensitive data in environment variables
- **HTTPS**: Encrypted data transmission

**Privacy**:
- User data encrypted at rest
- No sharing of personal information
- GDPR-compliant data handling
- User controls over data visibility

**Visual Suggestion**: Security shield icon with checkmarks, or lock and key imagery

---

## SLIDE 14: Impact & Benefits
**Title**: Real-World Impact

**For Farmers**:
- ✅ Reduce spoilage losses by up to 60%
- ✅ Increase profits through better market timing
- ✅ Access to wider buyer network
- ✅ Data-driven storage management
- ✅ Premium prices for monitored storage products
- ✅ Reduced dependency on middlemen

**For Buyers**:
- ✅ Direct access to fresh produce
- ✅ Quality assurance through storage monitoring
- ✅ Competitive pricing
- ✅ Transparent supply chain
- ✅ Reduced procurement costs
- ✅ Support local farmers

**For the Agricultural Sector**:
- ✅ Reduced food waste
- ✅ Improved food security
- ✅ Efficient supply chain
- ✅ Technology adoption in agriculture
- ✅ Economic growth for rural communities

**Visual Suggestion**: Three columns with icons showing benefits for each stakeholder group

---

## SLIDE 15: Market Opportunity
**Title**: Addressing a Massive Market

**Market Size**:
- Kenya's agricultural sector: 33% of GDP
- 75% of workforce in agriculture
- $10B+ annual agricultural output
- 5M+ smallholder farmers
- Growing demand for agri-tech solutions

**Target Users**:
- **Primary**: Smallholder farmers (1-10 acres)
- **Secondary**: Medium-scale farmers (10-50 acres)
- **Buyers**: Wholesalers, retailers, processors, exporters

**Growth Potential**:
- Expand to other East African countries
- Add more commodity types
- IoT sensor hardware sales
- Premium analytics subscriptions
- B2B enterprise solutions

**Visual Suggestion**: Market size infographic, pie chart of agricultural GDP, or growth projection graph

---

## SLIDE 16: Competitive Advantage
**Title**: What Makes AgroVault Unique

**Our Differentiators**:
1. **All-in-One Platform** - Storage monitoring + marketplace + market intelligence
2. **AI-Powered Insights** - Predictive analytics, not just data display
3. **Quality Assurance** - Monitored storage badge builds trust
4. **Mobile-First** - Accessible on any device, even low-end smartphones
5. **Localized** - Kenya-specific markets, crops, and conditions
6. **Affordable** - Accessible pricing for smallholder farmers
7. **Direct Connection** - Eliminates middlemen, increases farmer profits

**vs. Competitors**:
- Traditional marketplaces: No storage monitoring
- IoT solutions: No marketplace integration
- Market data platforms: No direct buyer connection
- AgroVault: Complete ecosystem

**Visual Suggestion**: Comparison table or Venn diagram showing unique overlap of features

---

## SLIDE 17: Business Model
**Title**: Sustainable Revenue Streams

**Revenue Sources**:
1. **Marketplace Commission** - 3-5% on successful transactions
2. **Premium Subscriptions** - Advanced analytics and features
3. **IoT Sensor Sales** - Hardware for storage monitoring
4. **Data Analytics** - Aggregated market insights for enterprises
5. **Advertising** - Featured listings and promotions
6. **API Access** - Third-party integrations

**Pricing Tiers**:
- **Free**: Basic marketplace access, limited storage units
- **Farmer Pro** ($10/month): Unlimited storage units, AI insights, priority support
- **Enterprise** (Custom): Multi-location, API access, dedicated support

**Visual Suggestion**: Pricing table or revenue stream pie chart

---

## SLIDE 18: Roadmap & Future Features
**Title**: Vision for Growth

**Phase 1 (Current)** ✅:
- Storage monitoring and alerts
- Marketplace with direct messaging
- Market intelligence dashboard
- Farm jobs board

**Phase 2 (Q2 2024)** 🚧:
- Mobile app (iOS & Android)
- IoT sensor hardware integration
- Payment gateway integration
- SMS alerts for low-connectivity areas

**Phase 3 (Q3-Q4 2024)** 📋:
- Blockchain-based supply chain tracking
- Crop insurance integration
- Financial services (loans, savings)
- Logistics and delivery coordination

**Phase 4 (2025+)** 🔮:
- Expansion to Tanzania, Uganda, Ethiopia
- Drone monitoring integration
- Carbon credit marketplace
- AI crop disease detection

**Visual Suggestion**: Timeline or roadmap with phases and milestones

---

## SLIDE 19: Technical Performance
**Title**: Built for Scale and Speed

**Performance Metrics**:
- **Page Load Time**: < 2 seconds
- **API Response Time**: < 200ms average
- **Database Queries**: Optimized with indexing
- **Image Loading**: Cloudinary CDN for fast delivery
- **Mobile Performance**: 90+ Lighthouse score
- **Uptime**: 99.9% availability target

**Scalability**:
- Horizontal scaling with load balancers
- Database replication for high availability
- Caching strategies for frequently accessed data
- Microservices architecture ready

**Optimization Strategies**:
- Critical data loads first (dashboard stats)
- Background loading for secondary data (AI analysis, weather)
- Code splitting and lazy loading
- Image optimization and responsive images

**Visual Suggestion**: Performance dashboard with metrics, or speed gauge showing fast load times

---

## SLIDE 20: User Testimonials (Conceptual)
**Title**: Farmer Success Stories

**Testimonial 1 - John Kamau, Maize Farmer, Nakuru**:
"AgroVault helped me reduce my spoilage from 35% to just 8%. The alerts told me exactly when to sell, and I got 20% better prices through the marketplace. Game changer!"

**Testimonial 2 - Grace Wanjiru, Vegetable Farmer, Kiambu**:
"I used to rely on middlemen who paid very low prices. Now I sell directly to buyers through AgroVault and make 40% more profit. The storage monitoring gives buyers confidence in my produce quality."

**Testimonial 3 - David Omondi, Produce Buyer, Nairobi**:
"Finding quality produce was always a challenge. AgroVault's monitored storage badge helps me identify farmers with proper storage. I get fresher products and better prices."

**Visual Suggestion**: Photo placeholders with quote bubbles, or testimonial cards with star ratings

---

## SLIDE 21: Social Impact
**Title**: Beyond Profit - Creating Social Value

**Impact Areas**:

**Food Security**:
- Reduce food waste by 30-40%
- Increase food availability in markets
- Stabilize food prices

**Economic Empowerment**:
- Increase farmer incomes by 25-40%
- Create jobs in agri-tech sector
- Empower women farmers with market access

**Technology Adoption**:
- Digital literacy for rural farmers
- IoT and AI in agriculture
- Bridge urban-rural digital divide

**Environmental Sustainability**:
- Reduce food waste = lower carbon footprint
- Optimize resource usage
- Promote sustainable farming practices

**Community Development**:
- Strengthen farmer cooperatives
- Knowledge sharing through platform
- Rural economic growth

**Visual Suggestion**: Impact infographic with icons, or before/after community comparison

---

## SLIDE 22: Team & Expertise (Customizable)
**Title**: Built by Agricultural Technology Experts

**Team Structure** (Customize with actual team):
- **Founder/CEO**: Agricultural economics background
- **CTO**: Full-stack development, IoT expertise
- **Head of Product**: UX/UI design, farmer engagement
- **Agricultural Advisor**: Agronomist with 15+ years experience
- **Data Scientist**: AI/ML for predictive analytics
- **Business Development**: Market expansion and partnerships

**Advisory Board**:
- Agricultural policy experts
- Technology investors
- Farmer cooperative leaders
- Supply chain specialists

**Visual Suggestion**: Team photos with roles, or organizational chart

---

## SLIDE 23: Partnerships & Ecosystem
**Title**: Strategic Collaborations

**Current/Potential Partners**:

**Technology Partners**:
- IoT sensor manufacturers
- Cloud infrastructure providers (AWS, Azure)
- Mobile network operators for SMS alerts

**Agricultural Partners**:
- Farmer cooperatives and associations
- Agricultural extension services
- Seed and fertilizer companies

**Financial Partners**:
- Microfinance institutions
- Agricultural banks
- Insurance companies

**Government & NGOs**:
- Ministry of Agriculture
- Kenya Agricultural Research Institute
- International development organizations

**Market Partners**:
- Wholesale markets
- Retail chains
- Export companies

**Visual Suggestion**: Partnership ecosystem diagram with logos, or network visualization

---

## SLIDE 24: Call to Action - For Investors
**Title**: Investment Opportunity

**Why Invest in AgroVault**:
- ✅ Massive addressable market ($10B+ agricultural sector)
- ✅ Proven problem with clear solution
- ✅ Scalable technology platform
- ✅ Multiple revenue streams
- ✅ Social impact + financial returns
- ✅ Expansion potential across East Africa
- ✅ Strong unit economics

**Funding Ask**: $500K - $2M Seed Round

**Use of Funds**:
- 40% - Product development and mobile app
- 25% - IoT hardware development and deployment
- 20% - Marketing and farmer acquisition
- 10% - Team expansion
- 5% - Operations and infrastructure

**Projected Returns**:
- Break-even: 18-24 months
- 5-year revenue projection: $10M+
- Exit opportunities: Acquisition or Series A

**Visual Suggestion**: Pie chart of fund allocation, or growth projection graph

---

## SLIDE 25: Call to Action - For Farmers & Buyers
**Title**: Join the AgroVault Community

**For Farmers**:
📱 **Sign Up Today**
- Free account to get started
- Add your first storage unit
- List your products on the marketplace
- Start reducing spoilage immediately

**For Buyers**:
🛒 **Start Sourcing Better**
- Browse quality-assured products
- Connect directly with farmers
- Get competitive prices
- Support local agriculture

**Get Started**:
- Website: www.agrovault.co.ke (example)
- Mobile: Download on App Store / Google Play
- Support: support@agrovault.co.ke
- Phone: +254 XXX XXX XXX

**Visual Suggestion**: QR code for sign-up, app download buttons, contact information with icons

---

## SLIDE 26: Demo & Screenshots
**Title**: See AgroVault in Action

**Key Screenshots to Include**:
1. **Farmer Dashboard** - Overview with storage units and alerts
2. **Storage Monitoring** - Real-time temperature/humidity graphs
3. **Spoilage Alert** - AI-generated warning with recommendations
4. **Marketplace Browse** - Product grid with filters
5. **Product Details** - Listing with monitored storage badge
6. **Market Analysis** - Price trends and market recommendations
7. **Mobile View** - Responsive design on smartphone

**Live Demo Available**: Request a personalized demo

**Visual Suggestion**: Multiple screenshot thumbnails in grid layout, or device mockups showing the interface

---

## SLIDE 27: Technical Architecture
**Title**: Scalable System Design

**Architecture Layers**:

**Presentation Layer**:
- Next.js React application
- Responsive web interface
- Progressive Web App (PWA) capabilities

**Application Layer**:
- Next.js API Routes
- RESTful API design
- JWT authentication middleware
- Role-based access control

**Business Logic Layer**:
- Spoilage risk calculation algorithms
- Market analysis engine
- Alert generation system
- Recommendation engine

**Data Layer**:
- PostgreSQL relational database
- Prisma ORM for type-safe queries
- Database indexing for performance
- Automated backups

**Integration Layer**:
- IoT sensor data ingestion
- Weather API integration
- Cloudinary image storage
- SMS gateway for alerts

**Visual Suggestion**: Layered architecture diagram, or system flow diagram

---

## SLIDE 28: Risk Mitigation
**Title**: Addressing Potential Challenges

**Risk 1: Farmer Adoption**
- **Mitigation**: Free tier, simple onboarding, local language support, farmer training programs

**Risk 2: Internet Connectivity in Rural Areas**
- **Mitigation**: Offline mode, SMS alerts, USSD integration, progressive web app

**Risk 3: IoT Sensor Costs**
- **Mitigation**: Subsidized hardware, rental model, partnerships with sensor manufacturers

**Risk 4: Market Competition**
- **Mitigation**: First-mover advantage, comprehensive feature set, strong farmer relationships

**Risk 5: Data Privacy Concerns**
- **Mitigation**: Transparent privacy policy, user data controls, compliance with regulations

**Risk 6: Payment Processing**
- **Mitigation**: Multiple payment options, mobile money integration, escrow services

**Visual Suggestion**: Risk matrix or mitigation strategy table

---

## SLIDE 29: Success Metrics & KPIs
**Title**: Measuring Impact and Growth

**User Metrics**:
- Registered farmers: Target 10,000 in Year 1
- Active buyers: Target 2,000 in Year 1
- Monthly active users (MAU): 60% of registered users
- User retention rate: 75% after 6 months

**Platform Metrics**:
- Storage units monitored: 5,000+ in Year 1
- Products listed: 20,000+ annually
- Transactions facilitated: $2M+ GMV in Year 1
- Messages exchanged: 50,000+ monthly

**Impact Metrics**:
- Average spoilage reduction: 50%
- Average farmer income increase: 30%
- Food waste prevented: 5,000 tonnes annually
- Farmer satisfaction score: 4.5/5

**Technical Metrics**:
- System uptime: 99.9%
- Average response time: <200ms
- Mobile app rating: 4.5+ stars

**Visual Suggestion**: KPI dashboard mockup or metrics infographic

---

## SLIDE 30: Closing - Vision Statement
**Title**: Building the Future of African Agriculture

**Our Vision**:
"To become the leading agricultural technology platform in East Africa, empowering millions of farmers with smart tools to reduce waste, increase profits, and feed the continent sustainably."

**Our Mission**:
"Leverage technology to solve critical agricultural challenges, connecting farmers directly with markets while providing intelligent insights for better decision-making."

**Core Values**:
- 🌱 **Farmer-First**: Always prioritize farmer needs and success
- 🤝 **Trust & Transparency**: Build trust through quality and honesty
- 💡 **Innovation**: Continuously improve with technology
- 🌍 **Sustainability**: Promote environmental and economic sustainability
- 📈 **Impact**: Measure success by real-world impact

**Join Us**: Be part of the agricultural revolution

**Visual Suggestion**: Inspiring agricultural imagery, farmer in field with smartphone, or sunrise over farmland

---

## SLIDE 31: Thank You & Contact
**Title**: Let's Transform Agriculture Together

**Contact Information**:
- **Website**: www.agrovault.co.ke
- **Email**: info@agrovault.co.ke
- **Phone**: +254 XXX XXX XXX
- **Address**: Nairobi, Kenya

**Social Media**:
- LinkedIn: /company/agrovault
- Twitter: @agrovault
- Facebook: /agrovault
- Instagram: @agrovault_ke

**For Investors**: investors@agrovault.co.ke
**For Partnerships**: partnerships@agrovault.co.ke
**For Support**: support@agrovault.co.ke

**Schedule a Demo**: [QR Code or Link]

**Thank You!**

**Visual Suggestion**: Contact card layout with icons, QR code, team photo, or logo

---

## ADDITIONAL NOTES FOR AI SLIDE GENERATOR

### Design Guidelines:
- **Color Scheme**: Use the AgroVault colors (Deep Green #2E7D32, Harvest Orange #FB8C00, Tech Blue #1976D2)
- **Font**: Professional sans-serif (Montserrat, Inter, or Poppins recommended)
- **Style**: Clean, modern, fintech-inspired with agricultural elements
- **Icons**: Use agricultural and technology icons throughout
- **Images**: High-quality photos of farmers, crops, technology, African agriculture
- **Charts**: Use green/orange/blue color palette for data visualization
- **Consistency**: Maintain consistent layout and styling across all slides

### Slide Layout Preferences:
- Title at top with accent color underline
- Bullet points with icons
- 2-3 column layouts for comparisons
- Ample white space - not too crowded
- Large, readable fonts (minimum 18pt for body text)
- High contrast for readability

### Tone:
- Professional yet approachable
- Data-driven but human-centered
- Optimistic about impact
- Confident but not arrogant
- Focus on farmer success stories

### Customization Notes:
- Replace placeholder contact information with actual details
- Add real team member information in Slide 22
- Include actual testimonials if available
- Update funding ask and projections based on actual needs
- Add real partnership logos if applicable
- Include actual performance metrics if available

### Presentation Flow:
- Slides 1-3: Hook (Problem and Solution)
- Slides 4-11: Product Deep Dive
- Slides 12-13: Technical Foundation
- Slides 14-16: Market and Impact
- Slides 17-18: Business Model
- Slides 19-20: Validation
- Slides 21-23: Social Impact and Team
- Slides 24-25: Call to Action
- Slides 26-30: Technical Details and Metrics
- Slide 31: Closing

### Recommended Total Slides:
- **Investor Pitch**: Use slides 1-3, 4-7, 14-18, 22-25, 30-31 (15-20 slides)
- **Product Demo**: Use slides 1-3, 4-13, 26-27, 31 (15-18 slides)
- **Farmer Onboarding**: Use slides 1-3, 4-7, 14, 20, 25, 31 (10-12 slides)
- **Full Presentation**: All 31 slides for comprehensive overview

---

**Document Version**: 1.0
**Last Updated**: 2024
**Purpose**: AI-assisted slide generation for AgroVault presentations
