import { RaxAI } from 'rax-ai';
import type { MarketData } from '@/lib/data/kenya-market-data';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RAX_API_KEY;
    
    console.log('[AgroVault] API Key present:', !!apiKey);
    console.log('[AgroVault] API Key value:', apiKey?.substring(0, 10) + '...');
    
    if (!apiKey || apiKey === 'your_rax_api_key_here' || apiKey === '') {
      return Response.json(
        { error: 'RAX_API_KEY not configured. Please add your API key to .env.local' },
        { status: 500 }
      );
    }
    
    const rax = new RaxAI({ apiKey });
    const { county, marketData } = await request.json();

    console.log('[AgroVault] Processing analysis for county:', county);
    console.log('[AgroVault] Market data items:', marketData?.length);

    const systemPrompt = `You are a helpful agricultural market analyst. Analyze the provided crop market data and provide actionable insights for farmers in Kenya. Keep the analysis concise, comprehensive, and use clear language suitable for farmers. Provide Market overview, recommendations (Buy/Hold/Sell) and risk factors.`;

    const userPrompt = `Analyze the following crop market data for ${county}:

Market Data:
${marketData
      .map(
        (item: MarketData) =>
          `- ${item.crop}: KES ${item.price} (${item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '→'} ${Math.abs(item.priceChange)} from previous)`
      )
      .join('\n')}`;

    console.log('[AgroVault] Sending request to RaxAI...');
    
    const response = await rax.chat({
      model: 'rax-4.0',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    });

    // Cast response to any to handle different response formats from RaxAI
    const responseAny = response as unknown as Record<string, unknown>;
    console.log('[AgroVault] RaxAI response:', JSON.stringify(response, null, 2));

    // Handle different response formats from RaxAI
    let analysisText = '';
    if (response.choices?.[0]?.message?.content) {
      analysisText = response.choices[0].message.content;
    } else if (responseAny.content) {
      analysisText = responseAny.content as string;
    } else if (responseAny.text) {
      analysisText = responseAny.text as string;
    } else {
      // Try to find any content in the response
      analysisText = JSON.stringify(response);
    }

    if (!analysisText || analysisText === 'No analysis generated.') {
      analysisText = "Unable to generate analysis. Please try again later.";
    }

    console.log('[AgroVault] Tokens used by RaxAI:', response.usage?.total_tokens);

    return Response.json({ analysis: analysisText });
  } catch (error) {
    console.error('[AgroVault] Market analysis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return Response.json(
      { error: `Failed to generate market analysis: ${errorMessage}` },
      { status: 500 }
    );
  }
}
