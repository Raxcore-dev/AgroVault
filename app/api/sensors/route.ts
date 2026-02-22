import { generateSensorData } from '@/lib/mock-data'

export async function GET() {
  const data = generateSensorData()
  return Response.json(data)
}
