/**
 * Authentication Utilities
 * 
 * Provides JWT token creation/verification using the `jose` library
 * and password hashing/comparison using `bcryptjs`.
 * 
 * - `hashPassword(password)`: Returns a bcrypt hash of the plaintext password.
 * - `comparePassword(password, hash)`: Compares plaintext password with a hash.
 * - `signToken(payload)`: Creates a signed JWT containing the user's id, email, and role.
 * - `verifyToken(token)`: Verifies and decodes a JWT, returning the payload.
 * - `getAuthUser(request)`: Extracts and verifies the JWT from the Authorization header.
 */

import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'

// JWT secret encoded as Uint8Array for jose
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'agrovault-marketplace-jwt-secret-key-2026'
)

// Token expiration time (7 days)
const TOKEN_EXPIRY = '7d'

// ─── Password Utilities ───

/** Hash a plaintext password with bcrypt (10 salt rounds) */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

/** Compare a plaintext password against a bcrypt hash */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// ─── JWT Utilities ───

/** Payload stored inside the JWT */
export interface TokenPayload {
  userId: string
  email: string
  role: string
}

/** Sign a JWT with the given payload. Returns the compact token string. */
export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET)
}

/** Verify a JWT and return the decoded payload. Throws if invalid or expired. */
export async function verifyToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET)
  return payload as unknown as TokenPayload
}

// ─── Request Auth Helper ───

/**
 * Extract and verify the authenticated user from a Next.js request.
 * Expects the Authorization header in the format: `Bearer <token>`.
 * Returns the token payload if valid, or `null` if missing/invalid.
 */
export async function getAuthUser(request: NextRequest): Promise<TokenPayload | null> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) return null

    const token = authHeader.split(' ')[1]
    if (!token) return null

    return await verifyToken(token)
  } catch {
    return null
  }
}
