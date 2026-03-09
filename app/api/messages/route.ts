/**
 * GET /api/messages?productId=xxx&otherUserId=yyy
 * GET /api/messages?jobId=xxx&otherUserId=yyy
 *   Returns chat messages between the authenticated user and another user
 *   about a specific product or job. Messages are ordered chronologically.
 * 
 * POST /api/messages
 *   Sends a new chat message. Requires authentication.
 *   Body: { receiverId, message, productId? | jobId? }
 * 
 * Security: Only logged-in users can send/read messages.
 * Messages are scoped to a product/job conversation between two users.
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
    const jobId = searchParams.get('jobId')
    const otherUserId = searchParams.get('otherUserId')

    if (!otherUserId) {
      return NextResponse.json(
        { error: 'otherUserId is required.' },
        { status: 400 }
      )
    }

    if (!productId && !jobId) {
      return NextResponse.json(
        { error: 'productId or jobId is required.' },
        { status: 400 }
      )
    }

    // Build where clause depending on context type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contextFilter: any = productId ? { productId } : { jobId }

    // Fetch messages where the authenticated user is either sender or receiver
    const messages = await prisma.message.findMany({
      where: {
        ...contextFilter,
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
    const { receiverId, productId, jobId, message } = body

    // ─── Validation ───
    if (!receiverId || !message) {
      return NextResponse.json(
        { error: 'receiverId and message are required.' },
        { status: 400 }
      )
    }

    if (!productId && !jobId) {
      return NextResponse.json(
        { error: 'productId or jobId is required.' },
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

    // Verify context exists (product or job)
    if (productId) {
      const product = await prisma.product.findUnique({ where: { id: productId } })
      if (!product) {
        return NextResponse.json({ error: 'Product not found.' }, { status: 404 })
      }
    } else if (jobId) {
      const job = await prisma.job.findUnique({ where: { id: jobId } })
      if (!job) {
        return NextResponse.json({ error: 'Job not found.' }, { status: 404 })
      }
    }

    // ─── Create message ───
    const newMessage = await prisma.message.create({
      data: {
        senderId: auth.userId,
        receiverId,
        message,
        ...(productId ? { productId } : { jobId }),
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
