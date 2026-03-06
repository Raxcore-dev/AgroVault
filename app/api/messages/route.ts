/**
 * GET /api/messages?productId=xxx&otherUserId=yyy
 *   Returns chat messages between the authenticated user and another user
 *   about a specific product. Messages are ordered chronologically.
 * 
 * POST /api/messages
 *   Sends a new chat message. Requires authentication.
 *   Body: { receiverId, productId, message }
 * 
 * Security: Only logged-in users can send/read messages.
 * Messages are scoped to a product conversation between two users.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// ─── GET: Fetch Chat Messages ───
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const otherUserId = searchParams.get('otherUserId')

    if (!productId || !otherUserId) {
      return NextResponse.json(
        { error: 'productId and otherUserId are required.' },
        { status: 400 }
      )
    }

    // Fetch messages where the authenticated user is either sender or receiver
    // in the conversation with `otherUserId` about `productId`
    const messages = await prisma.message.findMany({
      where: {
        productId,
        OR: [
          { senderId: auth.userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: auth.userId },
        ],
      },
      orderBy: { timestamp: 'asc' },
      include: {
        sender: { select: { id: true, name: true, role: true } },
        receiver: { select: { id: true, name: true, role: true } },
      },
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('[Messages GET] Error:', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

// ─── POST: Send a Message ───
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    const body = await request.json()
    const { receiverId, productId, message } = body

    // ─── Validation ───
    if (!receiverId || !productId || !message) {
      return NextResponse.json(
        { error: 'receiverId, productId, and message are required.' },
        { status: 400 }
      )
    }

    if (receiverId === auth.userId) {
      return NextResponse.json(
        { error: 'You cannot send a message to yourself.' },
        { status: 400 }
      )
    }

    // Verify receiver exists
    const receiver = await prisma.user.findUnique({ where: { id: receiverId } })
    if (!receiver) {
      return NextResponse.json({ error: 'Receiver not found.' }, { status: 404 })
    }

    // Verify product exists
    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 })
    }

    // ─── Create message ───
    const newMessage = await prisma.message.create({
      data: {
        senderId: auth.userId,
        receiverId,
        productId,
        message,
      },
      include: {
        sender: { select: { id: true, name: true, role: true } },
        receiver: { select: { id: true, name: true, role: true } },
      },
    })

    return NextResponse.json({ message: newMessage }, { status: 201 })
  } catch (error) {
    console.error('[Messages POST] Error:', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
