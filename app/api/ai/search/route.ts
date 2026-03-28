import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { RaxAI } from 'rax-ai'

/**
 * POST /api/ai/search
 * 
 * AI-powered agricultural search endpoint using Rax AI.
 * Searches through:
 * - Products listed by farmers
 * - Markets and their prices
 * - Storage facilities
 * - Job opportunities
 * - Weather advisories
 * 
 * Returns intelligent responses with relevant data from the database.
 */

interface SearchRequest {
  query: string
  county?: string
  userId?: string
}

interface SearchResult {
  type: 'product' | 'market' | 'storage' | 'job' | 'weather' | 'general'
  data: any
  relevance: number
}

export async function POST(request: NextRequest) {
  try {
    // Optional auth check
    const user = await getAuthUser(request)
    
    const body: SearchRequest = await request.json()
    const { query, county, userId } = body

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    // Get Rax AI client
    const apiKey = process.env.RAX_API_KEY
    if (!apiKey || apiKey === 'your_rax_api_key_here' || apiKey === '') {
      // Return fallback response without AI
      return await handleSearchWithoutAI(query, county)
    }

    const rax = new RaxAI({ apiKey })

    // Step 1: Gather relevant data from database based on query intent
    const contextData = await gatherContextData(query, county)

    // Step 2: Build prompt for Rax AI
    const prompt = buildSearchPrompt(query, county, contextData)

    // Step 3: Get AI response
    const response = await rax.chat({
      model: 'rax-4.0',
      messages: [
        {
          role: 'system',
          content: `You are Rax, an intelligent agricultural assistant for AgroVault, a platform connecting Kenyan farmers with markets, storage facilities, and resources.
          
Your role:
- Help farmers find products, markets, storage facilities, jobs, and weather information
- Provide actionable insights and recommendations
- Be concise, friendly, and professional
- Use **bold** for emphasis on important information
- If you don't have specific data, acknowledge it and provide general guidance
- Always prioritize the farmer's best interests

Format your responses clearly with:
- Key findings highlighted
- Specific numbers and prices when available
- Actionable next steps
- Relevant suggestions for follow-up questions`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    // Extract response text
    const aiResponse = extractResponseText(response)

    // Generate follow-up suggestions
    const suggestions = generateSuggestions(query, contextData)

    return NextResponse.json({
      response: aiResponse,
      suggestions,
      data: contextData,
      query,
      county,
    })
  } catch (error) {
    console.error('Error in AI search:', error)
    
    // Fallback to non-AI search
    const user = await getAuthUser(request)
    const body: SearchRequest = await request.json()
    return await handleSearchWithoutAI(body.query, body.county)
  }
}

/**
 * Gather relevant data from database based on query intent
 * ALL data is fetched from the database - NO placeholder data
 */
async function gatherContextData(query: string, county?: string) {
  const queryLower = query.toLowerCase()
  
  const contextData: any = {
    products: [],
    markets: [],
    commodityPrices: [], // NEW: Real admin-controlled prices from DB
    storageUnits: [],
    jobs: [],
    weatherAdvisories: [],
    queryIntent: detectQueryIntent(queryLower),
  }

  // Detect what the user is looking for
  const intent = contextData.queryIntent

  // Search products
  if (intent.includes('product') || intent.includes('market') || intent.includes('buy') || intent.includes('sell')) {
    try {
      const productQuery: any = {
        where: {
          isAvailable: true,
        },
        include: {
          farmer: {
            select: {
              name: true,
              phone: true,
              location: true,
            },
          },
        },
        take: 10,
      }

      if (county) {
        productQuery.where.locationName = county
      }

      if (intent.some(i => ['maize', 'corn', 'grain'].includes(i))) {
        productQuery.where.productName = { contains: 'maize', mode: 'insensitive' as const }
      } else if (intent.some(i => ['bean', 'pulse'].includes(i))) {
        productQuery.where.productName = { contains: 'bean', mode: 'insensitive' as const }
      }

      contextData.products = await prisma.product.findMany(productQuery)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  // Search markets
  if (intent.includes('market') || intent.includes('price') || intent.includes('sell')) {
    try {
      const marketQuery: any = {
        take: 10,
      }

      if (county) {
        marketQuery.where = { location: county }
      }

      contextData.markets = await prisma.market.findMany(marketQuery)
    } catch (error) {
      console.error('Error fetching markets:', error)
    }
  }

  // NEW: Fetch commodity prices from database (admin-controlled)
  if (intent.includes('price') || intent.includes('market') || intent.includes('cost') || intent.includes('buy') || intent.includes('sell')) {
    try {
      const priceQuery: any = {
        where: {
          isActive: true,
        },
        take: 50,
      }

      if (county) {
        priceQuery.where = { county }
      }

      // Filter by commodity if mentioned in query
      const commodities = ['maize', 'beans', 'wheat', 'rice', 'millet', 'sorghum', 'coffee', 'tea']
      for (const commodity of commodities) {
        if (queryLower.includes(commodity)) {
          priceQuery.where.commodity = commodity
          break
        }
      }

      contextData.commodityPrices = await prisma.commodityPrice.findMany(priceQuery)
    } catch (error) {
      console.error('Error fetching commodity prices:', error)
    }
  }

  // Search storage units
  if (intent.includes('storage') || intent.includes('warehouse') || intent.includes('silo')) {
    try {
      const storageQuery: any = {
        take: 10,
      }

      if (county) {
        storageQuery.where = { location: county }
      }

      contextData.storageUnits = await prisma.storageUnit.findMany(storageQuery)
    } catch (error) {
      console.error('Error fetching storage units:', error)
    }
  }

  // Search jobs
  if (intent.includes('job') || intent.includes('work') || intent.includes('labor') || intent.includes('harvest')) {
    try {
      const jobQuery: any = {
        where: {
          isOpen: true,
        },
        include: {
          farmer: {
            select: {
              name: true,
              phone: true,
              location: true,
            },
          },
        },
        take: 10,
      }

      if (county) {
        jobQuery.where.location = county
      }

      contextData.jobs = await prisma.job.findMany(jobQuery)
    } catch (error) {
      console.error('Error fetching jobs:', error)
    }
  }

  // Get weather advisories
  if (intent.includes('weather') || intent.includes('forecast') || intent.includes('rain') || intent.includes('climate')) {
    try {
      const weatherQuery: any = {
        take: 5,
        orderBy: { createdAt: 'desc' },
      }

      contextData.weatherAdvisories = await prisma.weatherCropAdvisory.findMany(weatherQuery)
    } catch (error) {
      console.error('Error fetching weather advisories:', error)
    }
  }

  // If county is specified, get county-specific stats
  if (county) {
    try {
      const [productCount, marketCount, storageCount, jobCount] = await Promise.all([
        prisma.product.count({ where: { locationName: county, isAvailable: true } }),
        prisma.market.count({ where: { location: county } }),
        prisma.storageUnit.count({ where: { location: county } }),
        prisma.job.count({ where: { location: county, isOpen: true } }),
      ])

      contextData.countyStats = {
        name: county,
        productCount,
        marketCount,
        storageCount,
        jobCount,
      }
    } catch (error) {
      console.error('Error fetching county stats:', error)
    }
  }

  return contextData
}

/**
 * Detect user's search intent from query
 */
function detectQueryIntent(query: string): string[] {
  const intent: string[] = []
  
  const intentKeywords: Record<string, string[]> = {
    product: ['product', 'products', 'buy', 'sell', 'available', 'maize', 'beans', 'crop', 'harvest', 'produce'],
    market: ['market', 'markets', 'price', 'prices', 'buyer', 'buyers', 'selling'],
    storage: ['storage', 'warehouse', 'silo', 'store', 'storing', 'facility', 'facilities'],
    job: ['job', 'jobs', 'work', 'worker', 'workers', 'labor', 'harvest', 'employment'],
    weather: ['weather', 'forecast', 'rain', 'climate', 'temperature', 'humidity', 'season'],
    advisory: ['advisory', 'advice', 'recommendation', 'tips', 'guide', 'help'],
  }

  for (const [category, keywords] of Object.entries(intentKeywords)) {
    if (keywords.some(keyword => query.includes(keyword))) {
      intent.push(category)
    }
  }

  // Add specific commodity mentions
  const commodities = ['maize', 'beans', 'wheat', 'rice', 'millet', 'sorghum', 'coffee', 'tea', 'vegetables']
  commodities.forEach(commodity => {
    if (query.includes(commodity)) {
      intent.push(commodity)
    }
  })

  return intent.length > 0 ? intent : ['general']
}

/**
 * Build prompt for Rax AI with context data
 * ALL data comes from the database - NO placeholder data
 */
function buildSearchPrompt(query: string, county: string | undefined, contextData: any): string {
  let prompt = `User query: "${query}"\n`

  if (county) {
    prompt += `County: ${county}\n\n`
  } else {
    prompt += `County: Not specified (searching all counties)\n\n`
  }

  // Add context data
  if (contextData.countyStats) {
    prompt += `County Statistics for ${contextData.countyStats.name}:\n`
    prompt += `- Available Products: ${contextData.countyStats.productCount}\n`
    prompt += `- Markets: ${contextData.countyStats.marketCount}\n`
    prompt += `- Storage Facilities: ${contextData.countyStats.storageCount}\n`
    prompt += `- Available Jobs: ${contextData.countyStats.jobCount}\n\n`
  }

  // NEW: Add commodity prices (MOST IMPORTANT - admin-controlled)
  if (contextData.commodityPrices?.length > 0) {
    prompt += `📊 COMMODITY PRICES (Admin-Controlled, Real-Time Data):\n`
    contextData.commodityPrices.forEach((p: any) => {
      const bagInfo = p.pricePerBag ? ` (KES ${p.pricePerBag.toLocaleString()}/90kg bag)` : ''
      prompt += `- ${p.commodity.toUpperCase()} in ${p.county}: KES ${p.pricePerKg.toLocaleString()}/kg${bagInfo} | Trend: ${p.priceTrend} | Demand: ${p.demandLevel}\n`
    })
    prompt += '\n'
  }

  if (contextData.products?.length > 0) {
    prompt += `Available Products:\n`
    contextData.products.forEach((p: any) => {
      prompt += `- ${p.productName}: ${p.quantity} ${p.unit} at KES ${p.price}/${p.unit} in ${p.locationName} (Farmer: ${p.farmer.name})\n`
    })
    prompt += '\n'
  }

  if (contextData.markets?.length > 0) {
    prompt += `Markets and Prices:\n`
    contextData.markets.forEach((m: any) => {
      prompt += `- ${m.marketName} (${m.location}): ${m.commodity} at KES ${m.pricePerKg}/kg, Demand: ${m.demandLevel}, Trend: ${m.priceTrend}\n`
    })
    prompt += '\n'
  }

  if (contextData.storageUnits?.length > 0) {
    prompt += `Storage Facilities:\n`
    contextData.storageUnits.forEach((s: any) => {
      prompt += `- ${s.name} in ${s.location}: Capacity ${s.capacity} tonnes\n`
    })
    prompt += '\n'
  }

  if (contextData.jobs?.length > 0) {
    prompt += `Job Opportunities:\n`
    contextData.jobs.forEach((j: any) => {
      prompt += `- ${j.title}: ${j.workersNeeded} workers needed, KES ${j.payPerDay}/day, Start: ${new Date(j.startDate).toLocaleDateString()}\n`
    })
    prompt += '\n'
  }

  if (contextData.weatherAdvisories?.length > 0) {
    prompt += `Recent Weather Advisories:\n`
    contextData.weatherAdvisories.slice(0, 3).forEach((w: any) => {
      prompt += `- ${w.overallStrategy}\n`
    })
    prompt += '\n'
  }

  prompt += `\nBased on this data, provide a helpful, comprehensive response to the user's query. Include specific numbers, prices, and actionable recommendations.`

  return prompt
}

/**
 * Extract text response from Rax AI response object
 */
function extractResponseText(response: any): string {
  if (typeof response === 'string') {
    return response
  }
  
  if (response.choices && Array.isArray(response.choices) && response.choices.length > 0) {
    const choice = response.choices[0]
    return choice.message?.content || choice.text || ''
  }
  
  if (response.message?.content) {
    return response.message.content
  }
  
  if (response.content) {
    return response.content
  }
  
  return JSON.stringify(response, null, 2)
}

/**
 * Generate follow-up question suggestions
 */
function generateSuggestions(query: string, contextData: any): string[] {
  const suggestions: string[] = []
  const intent = contextData.queryIntent

  if (intent.includes('product')) {
    suggestions.push('How do I contact the farmer?')
    suggestions.push('What is the quality of these products?')
  }

  if (intent.includes('market')) {
    suggestions.push('Which market has the best prices?')
    suggestions.push('How do I get to this market?')
  }

  if (intent.includes('storage')) {
    suggestions.push('What are the storage conditions?')
    suggestions.push('How much does storage cost?')
  }

  if (intent.includes('weather')) {
    suggestions.push('What crops should I plant this season?')
    suggestions.push('How do I protect my harvest from rain?')
  }

  if (contextData.countyStats) {
    suggestions.push(`Show me all products in ${contextData.countyStats.name}`)
    suggestions.push(`What jobs are available in ${contextData.countyStats.name}?`)
  }

  // Add general suggestions if we don't have specific ones
  if (suggestions.length === 0) {
    suggestions.push(
      'What products are available near me?',
      'Show me market prices',
      'How do I get started?',
    )
  }

  return suggestions.slice(0, 4)
}

/**
 * Handle search without AI (fallback)
 * ALL data from database - NO placeholder data
 */
async function handleSearchWithoutAI(query: string, county?: string) {
  const contextData = await gatherContextData(query, county)

  let response = `I found the following information for your search "${query}":\n\n`

  if (contextData.countyStats) {
    response += `📊 **${contextData.countyStats.name} Statistics:**\n`
    response += `- ${contextData.countyStats.productCount} products available\n`
    response += `- ${contextData.countyStats.marketCount} markets\n`
    response += `- ${contextData.countyStats.storageCount} storage facilities\n`
    response += `- ${contextData.countyStats.jobCount} job opportunities\n\n`
  }

  // NEW: Show commodity prices first (most important)
  if (contextData.commodityPrices?.length > 0) {
    response += `💰 **Commodity Prices (Admin-Controlled):**\n`
    contextData.commodityPrices.slice(0, 10).forEach((p: any) => {
      const bagInfo = p.pricePerBag ? ` (KES ${p.pricePerBag.toLocaleString()}/90kg bag)` : ''
      response += `- **${p.commodity}** in ${p.county}: KES ${p.pricePerKg.toLocaleString()}/kg${bagInfo} | ${p.priceTrend} | ${p.demandLevel} demand\n`
    })
    response += '\n'
  }

  if (contextData.products?.length > 0) {
    response += `🌾 **Available Products:**\n`
    contextData.products.slice(0, 5).forEach((p: any) => {
      response += `- ${p.productName}: ${p.quantity} ${p.unit} at KES ${p.price} in ${p.locationName}\n`
    })
    response += '\n'
  }

  if (contextData.markets?.length > 0) {
    response += `🏪 **Markets:**\n`
    contextData.markets.slice(0, 5).forEach((m: any) => {
      response += `- ${m.marketName}: ${m.commodity} at KES ${m.pricePerKg}/kg\n`
    })
    response += '\n'
  }

  if (contextData.jobs?.length > 0) {
    response += `💼 **Job Opportunities:**\n`
    contextData.jobs.slice(0, 5).forEach((j: any) => {
      response += `- ${j.title}: ${j.workersNeeded} workers, KES ${j.payPerDay}/day\n`
    })
    response += '\n'
  }

  if (Object.keys(contextData).filter(k => Array.isArray(contextData[k])).length === 0) {
    response += `No specific results found. Try browsing our marketplace, checking job listings, or exploring market prices directly from the dashboard.`
  }

  const suggestions = generateSuggestions(query, contextData)

  return NextResponse.json({
    response,
    suggestions,
    data: contextData,
    query,
    county,
  })
}
