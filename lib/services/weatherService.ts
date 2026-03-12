/**
 * Weather Service
 *
 * Fetches real weather forecast data from the Open-Meteo API (free, no key required)
 * based on the farmer's location. Falls back to mock data only if the API is unreachable.
 */

// ─── Types ───

export interface WeatherCurrent {
  temperature: number       // °C
  humidity: number          // %
  wind_speed: number        // m/s
  description: string       // "light rain", "clear sky", etc.
  icon: string              // OpenWeather-style icon code for UI mapping
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

// ─── All 47 Kenya county headquarters coordinates ───────────────────────────
// Keys are fully-normalised county names (lowercase, strip leading/trailing spaces).
// Multi-word counties ("trans nzoia") use the full name as key.
// HQ town aliases are listed after the county entries.

const LOCATION_COORDS: Record<string, { lat: number; lon: number }> = {
  // ── Coast ──────────────────────────────────────────────────────────────────
  'mombasa':         { lat: -4.0435, lon: 39.6682 },
  'kwale':           { lat: -4.1720, lon: 39.4523 },
  'kilifi':          { lat: -3.6305, lon: 39.8499 },
  'tana river':      { lat: -1.4980, lon: 40.0300 },
  'lamu':            { lat: -2.2686, lon: 40.9020 },
  'taita-taveta':    { lat: -3.3943, lon: 38.3607 },
  // ── North Eastern ──────────────────────────────────────────────────────────
  'garissa':         { lat: -0.4536, lon: 42.1355 },
  'wajir':           { lat:  1.7471, lon: 40.0573 },
  'mandera':         { lat:  3.9373, lon: 41.8569 },
  // ── Eastern ────────────────────────────────────────────────────────────────
  'marsabit':        { lat:  2.3284, lon: 37.9947 },
  'isiolo':          { lat:  0.3540, lon: 37.5820 },
  'meru':            { lat:  0.0515, lon: 37.6559 },
  'tharaka-nithi':   { lat: -0.3390, lon: 37.6480 },
  'embu':            { lat: -0.5389, lon: 37.4596 },
  'kitui':           { lat: -1.3670, lon: 38.0100 },
  'machakos':        { lat: -1.5177, lon: 37.2634 },
  'makueni':         { lat: -1.7895, lon: 37.6257 },
  // ── Central ────────────────────────────────────────────────────────────────
  'nyandarua':       { lat: -0.2660, lon: 36.3791 },
  'nyeri':           { lat: -0.4197, lon: 36.9511 },
  'kirinyaga':       { lat: -0.4974, lon: 37.2805 },
  "murang'a":        { lat: -0.7195, lon: 37.1504 },
  'kiambu':          { lat: -1.1716, lon: 36.8350 },
  // ── Nairobi ────────────────────────────────────────────────────────────────
  'nairobi':         { lat: -1.2921, lon: 36.8219 },
  // ── Rift Valley ────────────────────────────────────────────────────────────
  'turkana':         { lat:  3.1193, lon: 35.5966 },
  'west pokot':      { lat:  1.2390, lon: 35.1125 },
  'samburu':         { lat:  1.0983, lon: 36.6988 },
  'trans nzoia':     { lat:  1.0187, lon: 35.0020 },
  'uasin gishu':     { lat:  0.5143, lon: 35.2698 },
  'elgeyo-marakwet': { lat:  0.6713, lon: 35.5093 },
  'nandi':           { lat:  0.2049, lon: 35.0994 },
  'baringo':         { lat:  0.4896, lon: 35.7428 },
  'laikipia':        { lat:  0.0066, lon: 37.0722 },
  'nakuru':          { lat: -0.3031, lon: 36.0800 },
  'narok':           { lat: -1.0800, lon: 35.8690 },
  'kajiado':         { lat: -1.8534, lon: 36.7773 },
  'kericho':         { lat: -0.3692, lon: 35.2863 },
  'bomet':           { lat: -0.7823, lon: 35.3416 },
  // ── Western ────────────────────────────────────────────────────────────────
  'kakamega':        { lat:  0.2827, lon: 34.7519 },
  'vihiga':          { lat:  0.0666, lon: 34.7233 },
  'bungoma':         { lat:  0.5635, lon: 34.5607 },
  'busia':           { lat:  0.4608, lon: 34.1112 },
  // ── Nyanza ─────────────────────────────────────────────────────────────────
  'siaya':           { lat: -0.0612, lon: 34.2880 },
  'kisumu':          { lat: -0.0917, lon: 34.7680 },
  'homa bay':        { lat: -0.5272, lon: 34.4572 },
  'migori':          { lat: -1.0634, lon: 34.4731 },
  'kisii':           { lat: -0.6817, lon: 34.7665 },
  'nyamira':         { lat: -0.5671, lon: 34.9352 },
  // ── HQ town aliases (backward-compat) ──────────────────────────────────────
  'eldoret':         { lat:  0.5143, lon: 35.2698 }, // Uasin Gishu HQ
  'kitale':          { lat:  1.0187, lon: 35.0020 }, // Trans Nzoia HQ
  'nanyuki':         { lat:  0.0066, lon: 37.0722 }, // Laikipia HQ
  'thika':           { lat: -1.0396, lon: 37.0900 }, // Kiambu area
  'lodwar':          { lat:  3.1193, lon: 35.5966 }, // Turkana HQ
  'kapenguria':      { lat:  1.2390, lon: 35.1125 }, // West Pokot HQ
  'maralal':         { lat:  1.0983, lon: 36.6988 }, // Samburu HQ
  'kapsabet':        { lat:  0.2049, lon: 35.0994 }, // Nandi HQ
  'kabarnet':        { lat:  0.4896, lon: 35.7428 }, // Baringo HQ
  'narok town':      { lat: -1.0800, lon: 35.8690 },
  'kajiado town':    { lat: -1.8534, lon: 36.7773 },
  'wote':            { lat: -1.7895, lon: 37.6257 }, // Makueni HQ
  'chuka':           { lat: -0.3390, lon: 37.6480 }, // Tharaka-Nithi HQ
  'kerugoya':        { lat: -0.4974, lon: 37.2805 }, // Kirinyaga HQ
  'ol kalou':        { lat: -0.2660, lon: 36.3791 }, // Nyandarua HQ
  'hola':            { lat: -1.4980, lon: 40.0300 }, // Tana River HQ
  'wundanyi':        { lat: -3.3943, lon: 38.3607 }, // Taita-Taveta HQ
  'mbale':           { lat:  0.0666, lon: 34.7233 }, // Vihiga HQ
  'iten':            { lat:  0.6713, lon: 35.5093 }, // Elgeyo-Marakwet HQ
  'bomet town':      { lat: -0.7823, lon: 35.3416 },
  'kisii town':      { lat: -0.6817, lon: 34.7665 },
}

/**
 * Resolve a human-readable location name to lat/lon.
 *
 * Strategy (in order):
 *  1. Full normalised name  ("trans nzoia" → LOCATION_COORDS["trans nzoia"])
 *  2. First word only       ("kisumu city" → LOCATION_COORDS["kisumu"])
 */
function resolveCoords(location: string): { lat: number; lon: number } | null {
  const cleaned = location.toLowerCase().trim().split(',')[0].trim()
  if (LOCATION_COORDS[cleaned]) return LOCATION_COORDS[cleaned]
  const firstWord = cleaned.split(' ')[0]
  return LOCATION_COORDS[firstWord] ?? null
}

// ─── Day name helper ───

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// ─── WMO Weather Code → description & icon mapping ───

function wmoToDescription(code: number): string {
  if (code === 0) return 'clear sky'
  if (code === 1) return 'mainly clear'
  if (code === 2) return 'partly cloudy'
  if (code === 3) return 'overcast'
  if (code === 45 || code === 48) return 'foggy'
  if (code >= 51 && code <= 55) return 'drizzle'
  if (code >= 56 && code <= 57) return 'freezing drizzle'
  if (code === 61) return 'light rain'
  if (code === 63) return 'moderate rain'
  if (code === 65) return 'heavy rain'
  if (code >= 66 && code <= 67) return 'freezing rain'
  if (code >= 71 && code <= 77) return 'snow'
  if (code === 80) return 'light rain showers'
  if (code === 81) return 'moderate rain showers'
  if (code === 82) return 'heavy rain showers'
  if (code >= 85 && code <= 86) return 'snow showers'
  if (code === 95) return 'thunderstorm'
  if (code === 96 || code === 99) return 'thunderstorm with hail'
  return 'partly cloudy'
}

function wmoToIcon(code: number): string {
  if (code === 0) return '01d'
  if (code <= 2) return '02d'
  if (code === 3) return '04d'
  if (code === 45 || code === 48) return '50d'
  if (code >= 51 && code <= 57) return '09d'
  if (code >= 61 && code <= 67) return '10d'
  if (code >= 71 && code <= 77) return '13d'
  if (code >= 80 && code <= 82) return '09d'
  if (code >= 85 && code <= 86) return '13d'
  if (code >= 95) return '11d'
  return '02d'
}

// ─── Fetch from Open-Meteo (free, no API key) ───

async function fetchFromOpenMeteo(
  lat: number,
  lon: number,
  locationName: string,
): Promise<WeatherData | null> {
  try {
    const currentParams = [
      'temperature_2m',
      'relative_humidity_2m',
      'wind_speed_10m',
      'apparent_temperature',
      'surface_pressure',
      'weather_code',
    ].join(',')

    const dailyParams = [
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_probability_max',
      'precipitation_sum',
      'wind_speed_10m_max',
      'weather_code',
      'relative_humidity_2m_mean',
    ].join(',')

    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lon}` +
      `&current=${currentParams}` +
      `&daily=${dailyParams}` +
      `&wind_speed_unit=ms` +
      `&timezone=auto` +
      `&forecast_days=7`

    const res = await fetch(url, { next: { revalidate: 1800 } })

    if (!res.ok) {
      console.error('[Weather] Open-Meteo returned non-OK:', res.status)
      return null
    }

    const json = await res.json()

    const cur = json.current
    const daily = json.daily

    if (!cur || !daily) {
      console.error('[Weather] Unexpected Open-Meteo response shape')
      return null
    }

    const current: WeatherCurrent = {
      temperature: Math.round(cur.temperature_2m * 10) / 10,
      humidity: Math.round(cur.relative_humidity_2m),
      wind_speed: Math.round(cur.wind_speed_10m * 10) / 10,
      description: wmoToDescription(cur.weather_code),
      icon: wmoToIcon(cur.weather_code),
      feels_like: Math.round(cur.apparent_temperature * 10) / 10,
      pressure: Math.round(cur.surface_pressure),
    }

    const forecast: WeatherForecastDay[] = []
    const times: string[] = daily.time ?? []

    for (let i = 0; i < times.length && i < 7; i++) {
      const dateStr = times[i]
      const dt = new Date(dateStr + 'T12:00:00')
      const wmoCode = daily.weather_code[i] ?? 0
      const rainProb = daily.precipitation_probability_max?.[i] ?? 0

      forecast.push({
        date: dateStr,
        day: DAY_NAMES[dt.getDay()],
        temperature: Math.round(daily.temperature_2m_max[i] * 10) / 10,
        temperature_min: Math.round(daily.temperature_2m_min[i] * 10) / 10,
        temperature_max: Math.round(daily.temperature_2m_max[i] * 10) / 10,
        humidity: Math.round(daily.relative_humidity_2m_mean?.[i] ?? 0),
        wind_speed: Math.round(daily.wind_speed_10m_max[i] * 10) / 10,
        rain_probability: Math.round(rainProb),
        rainfall_mm: Math.round((daily.precipitation_sum[i] ?? 0) * 10) / 10,
        description: wmoToDescription(wmoCode),
        icon: wmoToIcon(wmoCode),
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
    console.error('[Weather] Failed to fetch from Open-Meteo:', err)
    return null
  }
}

// ─── Fallback mock data (only used if Open-Meteo is unreachable) ───

function generateMockForecast(locationName: string, lat: number, lon: number): WeatherData {
  const now = new Date()
  const baseTemp = lat < 0 ? 27 : 25

  const forecast: WeatherForecastDay[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() + i)

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
 * Fetch real weather data for a location via Open-Meteo.
 * Uses cached data if available. Falls back to mock only if the API is unreachable.
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

  // Fetch real data from Open-Meteo
  const realData = await fetchFromOpenMeteo(lat, lon, location)
  if (realData) {
    weatherCache.set(key, { data: realData, timestamp: Date.now() })
    return realData
  }

  // Fallback to mock only if API is unreachable
  console.warn('[Weather] Open-Meteo unreachable, using mock data for', location)
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
  locationName: string,
): Promise<WeatherData> {
  const key = cacheKey(lat, lon)

  const cached = weatherCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data
  }

  const realData = await fetchFromOpenMeteo(lat, lon, locationName)
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
