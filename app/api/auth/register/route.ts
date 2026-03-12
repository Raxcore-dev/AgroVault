/**
 * POST /api/auth/register
 * 
 * Registers a new user (farmer or job applicant).
 * 
 * Request body:
 *   - name: string (required)
 *   - email: string (required, must be unique)
 *   - password: string (required, min 6 characters)
 *   - role: "farmer" | "job_applicant" (defaults to "job_applicant")
 *   - phone: string (optional)
 *   - location: string (optional, e.g. "Nakuru")
 * 
 * Returns:
 *   - 201: { user, token } on success
 *   - 400: Validation error
 *   - 409: Email already registered
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, signToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, role, phone, location } = body

    // ─── Validation ───
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required.' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters.' },
        { status: 400 }
      )
    }

    if (role && !['farmer', 'job_applicant'].includes(role)) {
      return NextResponse.json(
        { error: 'Role must be "farmer" or "job_applicant".' },
        { status: 400 }
      )
    }

    // ─── Check for existing user ───
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists.' },
        { status: 409 }
      )
    }

    // ─── Create user with hashed password ───
    const hashedPassword = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'job_applicant',
        phone: phone || null,
        location: location || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        location: true,
        createdAt: true,
      },
    })

    // ─── Generate JWT token ───
    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    return NextResponse.json({ user, token }, { status: 201 })
  } catch (error) {
    console.error('[Register] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    )
  }
}
