/**
 * GET /api/weather
 * 
 * Fetches accurate weather data for the authenticated farmer's location.
 * Combines Open-Meteo API forecast with real-time IoT sensor data.
 * 
 * Query parameters:
 *   - refresh: Force refresh cache (optional)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// Cache for weather data (60 seconds)
const weatherCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 60 * 1000 // 60 seconds

interface WeatherData {
  location: {
    latitude: number
    longitude: number
    name: string
  }
  external: {
    temperature: number
    humidity: number
    windSpeed: number
    weatherCode: number
    description: string
    timestamp: string
  }
  storage: {
    hasData: boolean
    averageTemperature: number | null
    averageHumidity: number | null
    units: Array<{
      id: string
      name: string
      temperature: number
      humidity: number
      status: string
      recordedAt: string
    }>
  }
  comparison: {
    temperatureDiff: number | null
    humidityDiff: number | null
    hasSignificantDifference: boolean
    warning: string | null
  }
  forecast: Array<{
    date: string
    temperatureMax: number
    temperatureMin: number
    humidity: number
    precipitation: number
    weatherCode: number
  }>
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    if (auth.role !== 'farmer') {
      return NextResponse.json({ error: 'Only farmers can access weather data.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const forceRefresh = searchParams.get('refresh') === 'true'

    // Check cache
    const cacheKey = `weather_${auth.userId}`
    const cached = weatherCache.get(cacheKey)
    if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data)
    }

    // Fetch farmer's location
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        location: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 })
    }

    // Determine location coordinates
    let latitude: number
    let longitude: number
    let locationName: string

    // Fallback to default Kenya coordinates based on user location string
    const defaultLocations: Record<string, { lat: number; lon: number }> = {
      'Nairobi': { lat: -1.2921, lon: 36.8219 },
      'Nakuru': { lat: -0.3031, lon: 36.0800 },
      'Kisumu': { lat: -0.1022, lon: 34.7617 },
      'Mombasa': { lat: -4.0435, lon: 39.6682 },
      'Eldoret': { lat: 0.5143, lon: 35.2698 }
    }

    const userLocation = user.location || 'Nairobi'
    const coords = defaultLocations[userLocation] || defaultLocations['Nairobi']
    latitude = coords.lat
    longitude = coords.lon
    locationName = userLocation

    // Fetch weather data from Open-Meteo API
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=Africa/Nairobi`

    const weatherResponse = await fetch(weatherUrl)
    if (!weatherResponse.ok) {
      throw new Error('Failed to fetch weather data from Open-Meteo')
    }

    const weatherData = await weatherResponse.json()

    // Parse current weather
    const currentWeather = weatherData.current_weather
    const currentHourIndex = new Date().getHours()
    const currentHumidity = weatherData.hourly.relative_humidity_2m[currentHourIndex] || 60

    // Parse forecast (next 7 days)
    const forecast = weatherData.daily.time.slice(0, 7).map((date: string, index: number) => ({
      date,
      temperatureMax: weatherData.daily.temperature_2m_max[index],
      temperatureMin: weatherData.daily.temperature_2m_min[index],
      humidity: currentHumidity, // Use current humidity as approximation
      precipitation: weatherData.daily.precipitation_sum[index],
      weatherCode: weatherData.daily.weather_code[index]
    }))

    // Fetch real-time sensor data from storage units
    const storageUnits = await prisma.storageUnit.findMany({
      where: { farmerId: auth.userId },
      include: {
        readings: {
          orderBy: { recordedAt: 'desc' },
          take: 1
        }
      }
    })

    const storageData = storageUnits
      .filter(unit => unit.StorageReading.length > 0)
      .map(unit => ({
        id: unit.id,
        name: unit.name,
        temperature: unit.StorageReading[0].temperature,
        humidity: unit.StorageReading[0].humidity,
        status: unit.StorageReading[0].status,
        recordedAt: unit.StorageReading[0].recordedAt.toISOString()
      }))

    const hasStorageData = storageData.length > 0
    const averageTemperature = hasStorageData
      ? storageData.reduce((sum, unit) => sum + unit.temperature, 0) / storageData.length
      : null
    const averageHumidity = hasStorageData
      ? storageData.reduce((sum, unit) => sum + unit.humidity, 0) / storageData.length
      : null

    // Compare external weather with internal storage conditions
    const temperatureDiff = averageTemperature !== null
      ? Math.abs(currentWeather.temperature - averageTemperature)
      : null
    const humidityDiff = averageHumidity !== null
      ? Math.abs(currentHumidity - averageHumidity)
      : null

    const hasSignificantDifference = temperatureDiff !== null && temperatureDiff > 3
    const warning = hasSignificantDifference
      ? `⚠️ External weather (${currentWeather.temperature.toFixed(1)}°C) differs significantly from storage conditions (${averageTemperature?.toFixed(1)}°C). Storage sensors show more accurate internal conditions.`
      : null

    // Build response
    const response: WeatherData = {
      location: {
        latitude,
        longitude,
        name: locationName
      },
      external: {
        temperature: currentWeather.temperature,
        humidity: currentHumidity,
        windSpeed: currentWeather.windspeed,
        weatherCode: currentWeather.weathercode,
        description: getWeatherDescription(currentWeather.weathercode),
        timestamp: currentWeather.time
      },
      storage: {
        hasData: hasStorageData,
        averageTemperature,
        averageHumidity,
        units: storageData
      },
      comparison: {
        temperatureDiff,
        humidityDiff,
        hasSignificantDifference,
        warning
      },
      forecast
    }

    // Cache the response
    weatherCache.set(cacheKey, { data: response, timestamp: Date.now() })

    return NextResponse.json(response)
  } catch (error) {
    console.error('[Weather API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch weather data. Please try again later.' },
      { status: 500 }
    )
  }
}

/**
 * Convert WMO weather code to human-readable description
 */
function getWeatherDescription(code: number): string {
  const descriptions: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail'
  }

  return descriptions[code] || 'Unknown'
}
