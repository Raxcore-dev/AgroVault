/**
 * Supabase Client
 *
 * Provides two pre-configured Supabase clients:
 *   - `supabase`      — uses the anon key (safe for client-side / public queries)
 *   - `supabaseAdmin` — uses the service role key (server-side only, full access)
 *
 * Sensor readings are stored in the `sensor_readings` table in Supabase.
 * The `storage_unit_id` column matches the StorageUnit IDs in the Neon database.
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl) {
  throw new Error('Missing environment variable: SUPABASE_URL')
}
if (!supabaseAnonKey) {
  throw new Error('Missing environment variable: SUPABASE_ANON_KEY')
}

/** Anon client — suitable for read-only, row-level-security-gated queries */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Admin/service-role client — bypasses RLS.
 * Only instantiate server-side (API routes, services).
 * Falls back to anon client if service key is absent.
 */
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : supabase

// ─── Table / column name constants ───────────────────────────────────────────

export const SENSOR_TABLE = 'sensor_readings' as const

export interface SensorRow {
  id: string
  storage_unit_id: string
  temperature: number
  humidity: number
  timestamp: string   // ISO 8601
}
