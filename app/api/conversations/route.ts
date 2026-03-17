/**
 * GET /api/conversations
 * Returns all conversations for the authenticated user
 * 
 * POST /api/conversations
 * Creates or fetches an existing conversation between buyer and farmer for a product
 * Body: { productId, farmerId }
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// GET: Fetch all conversations for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    // Fetch conversations where user is either buyer or farmer
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { buyerId: auth.userId },
          { farmerId: auth.userId }
        ]
      },
      include: {
        buyer: {
          select: { id: true, name: true, phone: true, location: true }
        },
        farmer: {
          select: { id: true, name: true, phone: true, location: true }
        },
        product: {
          select: {
            id: true,
            productName: true,
            price: true,
            unit: true,
            productImage: true,
            isAvailable: true
          }
        },
        messages: {
          orderBy: { timestamp: 'desc' },
          take: 1,
          select: {
            id: true,
            message: true,
            timestamp: true,
            senderId: true,
            isRead: true
          }
        },
        _count: {
          select: {
            messages: {
              where: {
                receiverId: auth.userId,
                isRead: false
              }
            }
          }
        }
      },
      orderBy: { lastMessageAt: 'desc' }
    })

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error('[Conversations GET] Error:', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

// POST: Create or fetch existing conversation
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, farmerId } = body

    if (!productId || !farmerId) {
      return NextResponse.json(
        { error: 'productId and farmerId are required.' },
        { status: 400 }
      )
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        farmer: {
          select: { id: true, name: true, phone: true, location: true }
        }
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 })
    }

    // Verify farmer owns the product
    if (product.farmerId !== farmerId) {
      return NextResponse.json({ error: 'Invalid farmer for this product.' }, { status: 400 })
    }

    // Prevent farmer from messaging themselves
    if (auth.userId === farmerId) {
      return NextResponse.json({ error: 'Cannot start conversation with yourself.' }, { status: 400 })
    }

    // Check if conversation already exists
    let conversation = await prisma.conversation.findUnique({
      where: {
        buyerId_farmerId_productId: {
          buyerId: auth.userId,
          farmerId: farmerId,
          productId: productId
        }
      },
      include: {
        buyer: {
          select: { id: true, name: true, phone: true, location: true }
        },
        farmer: {
          select: { id: true, name: true, phone: true, location: true }
        },
        product: {
          select: {
            id: true,
            productName: true,
            price: true,
            unit: true,
            productImage: true,
            isAvailable: true
          }
        }
      }
    })

    // Create new conversation if it doesn't exist
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          buyerId: auth.userId,
          farmerId: farmerId,
          productId: productId
        },
        include: {
          buyer: {
            select: { id: true, name: true, phone: true, location: true }
          },
          farmer: {
            select: { id: true, name: true, phone: true, location: true }
          },
          product: {
            select: {
              id: true,
              productName: true,
              price: true,
              unit: true,
              productImage: true,
              isAvailable: true
            }
          }
        }
      })
    }

    return NextResponse.json({ conversation }, { status: conversation ? 200 : 201 })
  } catch (error) {
    console.error('[Conversations POST] Error:', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
