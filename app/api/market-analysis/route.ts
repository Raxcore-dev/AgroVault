import { generateText } from 'ai'
import { createGroq } from '@ai-sdk/groq'
import type { MarketData } from '@/lib/mock-data'

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { county, marketData } = await request.json()

    const prompt = `You are an agricultural market analyst. Analyze the following crop market data for ${county} and provide actionable insights for farmers.

Market Data:
${marketData
  .map(
    (item: MarketData) =>
      `- ${item.crop}: KES ${item.price} (${item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '→'} ${Math.abs(item.priceChange)} from previous)`
  )
  .join('\n')}

Please provide:
1. Market overview and trends
2. Specific recommendations for each crop (Buy/Hold/Sell)
3. Risk factors to consider
4. Optimal timing for market transactions

Keep the analysis concise but comprehensive. Use clear language suitable for farmers.`

    const { text } = await generateText({
      model: groq('mixtral-8x7b-32768'),
      prompt,
      maxTokens: 1024,
    })

    return Response.json({ analysis: text })
  } catch (error) {
    console.error('[v0] Market analysis error:', error)
    return Response.json(
      { error: 'Failed to generate market analysis' },
      { status: 500 }
    )
  }
}
