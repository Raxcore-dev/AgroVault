import { RaxAI } from 'rax-ai';
import type { MarketData } from '@/lib/data/kenya-market-data';

const rax = new RaxAI({ apiKey: process.env.RAX_API_KEY });

export async function POST(request: Request) {
  try {
    const { county, marketData } = await request.json();

    const systemPrompt = `You are a helpful agricultural market analyst. Analyze the provided crop market data and provide actionable insights for farmers in Kenya. Keep the analysis concise, comprehensive, and use clear language suitable for farmers. Provide Market overview, recommendations (Buy/Hold/Sell) and risk factors.`;

    const userPrompt = `Analyze the following crop market data for ${county}:

Market Data:
${marketData
        .map(
          (item: MarketData) =>
            `- ${item.crop}: KES ${item.price} (${item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '→'} ${Math.abs(item.priceChange)} from previous)`
        )
        .join('\n')}`;

    const response = await rax.chat({
      model: 'rax-4.0',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    });

    const analysisText = response.choices[0]?.message?.content || "No analysis generated.";

    console.log('[AgroVault] Tokens used by RaxAI:', response.usage?.total_tokens);

    return Response.json({ analysis: analysisText });
  } catch (error) {
    console.error('[AgroVault] Market analysis error:', error);
    return Response.json(
      { error: 'Failed to generate market analysis' },
      { status: 500 }
    );
  }
}
