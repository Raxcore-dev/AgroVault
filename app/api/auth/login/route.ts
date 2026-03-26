/**
 * POST /api/auth/login
 * 
 * Authenticates a user with email and password.
 * 
 * Request body:
 *   - email: string (required)
 *   - password: string (required)
 * 
 * Returns:
 *   - 200: { user, token } on success
 *   - 400: Missing fields
 *   - 401: Invalid credentials
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { comparePassword, signToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // ─── Validation ───
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      )
    }

    // ─── Find user by email ───
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      )
    }

    // ─── Verify password ───
    const isValid = await comparePassword(password, user.password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      )
    }

    // ─── Generate JWT token ───
    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    // Return user data (without password) and token
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        createdAt: user.createdAt,
      },
      token,
    })
  } catch (error) {
    console.error('[Login] Error:', error)
    
    // Check if it's a database connection error
    if (error instanceof Error && error.message.includes('ETIMEDOUT')) {
      return NextResponse.json(
        { error: 'Database connection timeout. Please try again in a moment.' },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    )
  }
}
