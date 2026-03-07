/**
 * Weather Service
 *
 * Fetches weather forecast data from the OpenWeather API based on the
 * farmer's location. Falls back to realistic mock data when the API key
 * is not configured so the UI always has something to render.
 *
 * Env variable: OPENWEATHER_API_KEY
 */

// ─── Types ───

export interface WeatherCurrent {
  temperature: number       // °C
  humidity: number          // %
  wind_speed: number        // m/s
  description: string       // "light rain", "clear sky", etc.
  icon: string              // OpenWeather icon code e.g. "10d"
  feels_like: number
  pressure: number
}

export interface WeatherForecastDay {
  date: string              // ISO date string
  day: string               // "Monday", "Tuesday" …
  temperature: number       // °C  (daytime high)
  temperature_min: number
  temperature_max: number
  humidity: number
  wind_speed: number
  rain_probability: number  // 0-100
  rainfall_mm: number       // expected mm
  description: string
  icon: string
}

export interface WeatherData {
  location: string
  latitude: number
  longitude: number
  current: WeatherCurrent
  forecast: WeatherForecastDay[]
  fetched_at: string        // ISO timestamp
}

// ─── In-memory cache ───

interface CacheEntry {
  data: WeatherData
  timestamp: number
}

const weatherCache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 30 * 60 * 1000 // 30 minutes

function cacheKey(lat: number, lon: number): string {
  return `${lat.toFixed(2)}:${lon.toFixed(2)}`
}

// ─── Known Kenyan locations (fallback coordinates) ───

const LOCATION_COORDS: Record<string, { lat: number; lon: number }> = {
  kisumu:   { lat: -0.0917, lon: 34.7680 },
  nairobi:  { lat: -1.2921, lon: 36.8219 },
  mombasa:  { lat: -4.0435, lon: 39.6682 },
  nakuru:   { lat: -0.3031, lon: 36.0800 },
  eldoret:  { lat: 0.5143,  lon: 35.2698 },
  nyeri:    { lat: -0.4197, lon: 36.9511 },
  thika:    { lat: -1.0396, lon: 37.0900 },
  machakos: { lat: -1.5177, lon: 37.2634 },
  kitale:   { lat: 1.0187,  lon: 35.0020 },
  nanyuki:  { lat: 0.0066,  lon: 37.0722 },
  kakamega: { lat: 0.2827,  lon: 34.7519 },
  bungoma:  { lat: 0.5635,  lon: 34.5607 },
  kericho:  { lat: -0.3692, lon: 35.2863 },
  embu:     { lat: -0.5389, lon: 37.4596 },
  meru:     { lat: 0.0515,  lon: 37.6559 },
}

function resolveCoords(location: string): { lat: number; lon: number } | null {
  const normalized = location.toLowerCase().trim().split(',')[0].split(' ')[0]
  return LOCATION_COORDS[normalized] ?? null
}

// ─── Day name helper ───

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// ─── Fetch from OpenWeather API ───

async function fetchFromOpenWeather(
  lat: number,
  lon: number,
  locationName: string
): Promise<WeatherData | null> {
  const apiKey = process.env.OPENWEATHER_API_KEY
  if (!apiKey || apiKey === '' || apiKey === 'your_openweather_api_key_here') {
    return null
  }

  try {
    // Fetch current weather + 5-day/3-hour forecast in one go
    const [currentRes, forecastRes] = await Promise.all([
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`,
        { next: { revalidate: 1800 } }
      ),
      fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`,
        { next: { revalidate: 1800 } }
      ),
    ])

    if (!currentRes.ok || !forecastRes.ok) {
      console.error('[Weather] API returned non-OK:', currentRes.status, forecastRes.status)
      return null
    }

    const currentJson = await currentRes.json()
    const forecastJson = await forecastRes.json()

    // Parse current weather
    const current: WeatherCurrent = {
      temperature: currentJson.main.temp,
      humidity: currentJson.main.humidity,
      wind_speed: currentJson.wind.speed,
      description: currentJson.weather?.[0]?.description ?? 'N/A',
      icon: currentJson.weather?.[0]?.icon ?? '01d',
      feels_like: currentJson.main.feels_like,
      pressure: currentJson.main.pressure,
    }

    // Aggregate forecast into daily summaries (next 7 days)
    const dailyMap = new Map<string, {
      temps: number[]; humids: number[]; winds: number[]; rains: number[];
      rainMMs: number[]; descs: string[]; icons: string[]; date: Date
    }>()

    for (const item of forecastJson.list ?? []) {
      const dt = new Date(item.dt * 1000)
      const dateKey = dt.toISOString().split('T')[0]

      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, {
          temps: [], humids: [], winds: [], rains: [], rainMMs: [],
          descs: [], icons: [], date: dt,
        })
      }

      const day = dailyMap.get(dateKey)!
      day.temps.push(item.main.temp)
      day.humids.push(item.main.humidity)
      day.winds.push(item.wind.speed)
      day.rains.push((item.pop ?? 0) * 100)
      day.rainMMs.push(item.rain?.['3h'] ?? 0)
      day.descs.push(item.weather?.[0]?.description ?? '')
      day.icons.push(item.weather?.[0]?.icon ?? '01d')
    }

    const forecast: WeatherForecastDay[] = []
    for (const [dateKey, d] of dailyMap) {
      if (forecast.length >= 7) break
      const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length
      forecast.push({
        date: dateKey,
        day: DAY_NAMES[d.date.getDay()],
        temperature: Math.round(avg(d.temps) * 10) / 10,
        temperature_min: Math.round(Math.min(...d.temps) * 10) / 10,
        temperature_max: Math.round(Math.max(...d.temps) * 10) / 10,
        humidity: Math.round(avg(d.humids)),
        wind_speed: Math.round(avg(d.winds) * 10) / 10,
        rain_probability: Math.round(Math.max(...d.rains)),
        rainfall_mm: Math.round(d.rainMMs.reduce((a, b) => a + b, 0) * 10) / 10,
        description: d.descs[Math.floor(d.descs.length / 2)] || 'N/A',
        icon: d.icons[Math.floor(d.icons.length / 2)] || '01d',
      })
    }

    return {
      location: locationName,
      latitude: lat,
      longitude: lon,
      current,
      forecast,
      fetched_at: new Date().toISOString(),
    }
  } catch (err) {
    console.error('[Weather] Failed to fetch from OpenWeather:', err)
    return null
  }
}

// ─── Realistic fallback data ───

function generateMockForecast(locationName: string, lat: number, lon: number): WeatherData {
  const now = new Date()
  const baseTemp = lat < 0 ? 27 : 25 // slightly warmer near equator

  const forecast: WeatherForecastDay[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() + i)

    // Simulate a rainy spell mid-week
    const rainChance = i >= 2 && i <= 4 ? 60 + Math.round(Math.random() * 30) : 10 + Math.round(Math.random() * 25)
    const temp = baseTemp - i * 0.3 + (Math.random() * 2 - 1)

    forecast.push({
      date: d.toISOString().split('T')[0],
      day: DAY_NAMES[d.getDay()],
      temperature: Math.round(temp * 10) / 10,
      temperature_min: Math.round((temp - 3) * 10) / 10,
      temperature_max: Math.round((temp + 3) * 10) / 10,
      humidity: 55 + Math.round(Math.random() * 30),
      wind_speed: 2 + Math.round(Math.random() * 6 * 10) / 10,
      rain_probability: rainChance,
      rainfall_mm: rainChance > 60 ? Math.round((rainChance / 10) * 10) / 10 : 0,
      description: rainChance > 70 ? 'heavy rain' : rainChance > 40 ? 'light rain' : 'partly cloudy',
      icon: rainChance > 70 ? '10d' : rainChance > 40 ? '09d' : '02d',
    })
  }

  return {
    location: locationName,
    latitude: lat,
    longitude: lon,
    current: {
      temperature: baseTemp + Math.round(Math.random() * 2 * 10) / 10,
      humidity: 60 + Math.round(Math.random() * 20),
      wind_speed: 3 + Math.round(Math.random() * 4 * 10) / 10,
      description: 'partly cloudy',
      icon: '02d',
      feels_like: baseTemp + 1,
      pressure: 1013,
    },
    forecast,
    fetched_at: new Date().toISOString(),
  }
}

// ─── Public API ───

/**
 * Fetch weather data for a location. Uses cached data if available.
 * Falls back to mock data when no API key is configured.
 */
export async function getWeatherForecast(location: string): Promise<WeatherData> {
  const coords = resolveCoords(location)
  const lat = coords?.lat ?? -0.0917
  const lon = coords?.lon ?? 34.7680
  const key = cacheKey(lat, lon)

  // Check cache
  const cached = weatherCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data
  }

  // Try real API
  const realData = await fetchFromOpenWeather(lat, lon, location)
  if (realData) {
    weatherCache.set(key, { data: realData, timestamp: Date.now() })
    return realData
  }

  // Fallback to mock
  const mock = generateMockForecast(location, lat, lon)
  weatherCache.set(key, { data: mock, timestamp: Date.now() })
  return mock
}

/**
 * Fetch weather for specific coordinates.
 */
export async function getWeatherByCoords(
  lat: number,
  lon: number,
  locationName: string
): Promise<WeatherData> {
  const key = cacheKey(lat, lon)

  const cached = weatherCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data
  }

  const realData = await fetchFromOpenWeather(lat, lon, locationName)
  if (realData) {
    weatherCache.set(key, { data: realData, timestamp: Date.now() })
    return realData
  }

  const mock = generateMockForecast(locationName, lat, lon)
  weatherCache.set(key, { data: mock, timestamp: Date.now() })
  return mock
}

/**
 * Clear the weather cache.
 */
export function clearWeatherCache(): void {
  weatherCache.clear()
}
