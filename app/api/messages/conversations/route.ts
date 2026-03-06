/**
 * GET /api/messages/conversations
 * 
 * Returns all chat conversations for the authenticated user.
 * Groups messages by product + other user, showing the last message in each.
 * Useful for the chat inbox / sidebar.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    // Get all messages where the user is sender or receiver
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: auth.userId },
          { receiverId: auth.userId },
        ],
      },
      orderBy: { timestamp: 'desc' },
      include: {
        sender: { select: { id: true, name: true, role: true } },
        receiver: { select: { id: true, name: true, role: true } },
        product: { select: { id: true, productName: true, productImage: true } },
      },
    })

    // Group into unique conversations (by productId + otherUserId)
    const conversationMap = new Map<string, typeof messages[0]>()
    for (const msg of messages) {
      const otherUserId = msg.senderId === auth.userId ? msg.receiverId : msg.senderId
      const key = `${msg.productId}-${otherUserId}`
      // Keep only the most recent message per conversation
      if (!conversationMap.has(key)) {
        conversationMap.set(key, msg)
      }
    }

    const conversations = Array.from(conversationMap.values()).map((msg) => {
      const otherUser = msg.senderId === auth.userId ? msg.receiver : msg.sender
      return {
        productId: msg.productId,
        product: msg.product,
        otherUser,
        lastMessage: msg.message,
        lastTimestamp: msg.timestamp,
      }
    })

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error('[Conversations] Error:', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
