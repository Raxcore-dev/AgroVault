/**
 * GET /api/conversations/[id]/messages
 * Fetches all messages in a conversation
 * 
 * POST /api/conversations/[id]/messages
 * Sends a new message in the conversation
 * Body: { message }
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// GET: Fetch all messages in a conversation
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    const conversationId = params.id

    // Verify conversation exists and user is a participant
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { buyerId: true, farmerId: true }
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 })
    }

    // Check if user is a participant
    if (conversation.buyerId !== auth.userId && conversation.farmerId !== auth.userId) {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 })
    }

    // Fetch messages
    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: { id: true, name: true }
        }
      },
      orderBy: { timestamp: 'asc' }
    })

    // Mark messages as read for the current user
    await prisma.message.updateMany({
      where: {
        conversationId,
        receiverId: auth.userId,
        isRead: false
      },
      data: { isRead: true }
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('[Messages GET] Error:', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

// POST: Send a new message
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    const conversationId = params.id
    const body = await request.json()
    const { message: messageText } = body

    if (!messageText || messageText.trim().length === 0) {
      return NextResponse.json({ error: 'Message cannot be empty.' }, { status: 400 })
    }

    // Verify conversation exists and user is a participant
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { buyerId: true, farmerId: true }
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 })
    }

    // Check if user is a participant
    if (conversation.buyerId !== auth.userId && conversation.farmerId !== auth.userId) {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 })
    }

    // Determine receiver
    const receiverId = conversation.buyerId === auth.userId 
      ? conversation.farmerId 
      : conversation.buyerId

    // Create message
    const message = await prisma.message.create({
      data: {
        message: messageText.trim(),
        senderId: auth.userId,
        receiverId,
        conversationId
      },
      include: {
        sender: {
          select: { id: true, name: true }
        }
      }
    })

    // Update conversation's lastMessageAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() }
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('[Messages POST] Error:', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
