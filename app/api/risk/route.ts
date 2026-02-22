import { generateSensorData, generateRiskData } from '@/lib/mock-data'

export async function GET() {
  const sensorData = generateSensorData()
  const riskData = generateRiskData(sensorData)
  return Response.json(riskData)
}
