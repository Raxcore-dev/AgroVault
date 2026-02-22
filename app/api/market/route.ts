import { generateMarketData } from '@/lib/mock-data'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const county = searchParams.get('county') || 'all'
  const data = generateMarketData(county)
  return Response.json(data)
}
