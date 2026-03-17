/**
 * Messages Dashboard Page
 * 
 * Displays all conversations for the authenticated user.
 * Shows conversation list with last message preview and unread count.
 */

'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { MessageCircle, Package, User, Clock } from 'lucide-react'
import { ChatModal } from '@/components/chat-modal'

interface Conversation {
  id: string
  buyer: {
    id: string
    name: string
    phone: string | null
    location: string | null
  }
  farmer: {
    id: string
    name: string
    phone: string | null
    location: string | null
  }
  product: {
    id: string
    productName: string
    price: number
    unit: string
    productImage: string | null
    isAvailable: boolean
  }
  messages: Array<{
    id: string
    message: string
    timestamp: string
    senderId: string
    isRead: boolean
  }>
  _count: {
    messages: number
  }
  lastMessageAt: string
}

export default function MessagesPage() {
  const { token, user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)

  useEffect(() => {
    fetchConversations()
    
    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchConversations, 5000)
    return () => clearInterval(interval)
  }, [token])

  const fetchConversations = async () => {
    if (!token) return

    try {
      const res = await fetch('/api/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const getOtherParticipant = (conversation: Conversation) => {
    return user?.id === conversation.buyer.id ? conversation.farmer : conversation.buyer
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Messages</h1>
          <p className="mt-2 text-muted-foreground">
            Your conversations with buyers and sellers
          </p>
        </div>

        {conversations.length === 0 ? (
          <div className="card-elevated rounded-xl p-12 text-center">
            <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No conversations yet</h3>
            <p className="text-muted-foreground">
              Start a conversation by contacting a seller on a product page
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {conversations.map((conversation) => {
              const otherParticipant = getOtherParticipant(conversation)
              const lastMessage = conversation.messages[0]
              const unreadCount = conversation._count.messages

              return (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className="card-elevated rounded-xl p-5 hover:shadow-md transition-shadow text-left w-full"
                >
                  <div className="flex items-start gap-4">
                    {/* Product Image */}
                    {conversation.product.productImage ? (
                      <img
                        src={conversation.product.productImage}
                        alt={conversation.product.productName}
                        className="h-16 w-16 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Package className="h-8 w-8 text-primary" />
                      </div>
                    )}

                    {/* Conversation Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground shrink-0" />
                            <h3 className="font-semibold text-foreground truncate">
                              {otherParticipant.name}
                            </h3>
                          </div>
                          <p className="text-sm text-muted-foreground truncate mt-1">
                            {conversation.product.productName}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {lastMessage && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTimestamp(lastMessage.timestamp)}
                            </span>
                          )}
                          {unreadCount > 0 && (
                            <span className="h-5 w-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-semibold">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                      </div>

                      {lastMessage && (
                        <p className={`text-sm mt-2 truncate ${
                          !lastMessage.isRead && lastMessage.senderId !== user?.id
                            ? 'font-semibold text-foreground'
                            : 'text-muted-foreground'
                        }`}>
                          {lastMessage.senderId === user?.id ? 'You: ' : ''}
                          {lastMessage.message}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          conversation.product.isAvailable
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {conversation.product.isAvailable ? 'Available' : 'Sold Out'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          KES {conversation.product.price.toLocaleString()}/{conversation.product.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Chat Modal */}
      {selectedConversation && (
        <ChatModal
          productId={selectedConversation.product.id}
          farmerId={selectedConversation.farmer.id}
          farmerName={selectedConversation.farmer.name}
          productName={selectedConversation.product.productName}
          onClose={() => {
            setSelectedConversation(null)
            fetchConversations() // Refresh conversations when closing chat
          }}
        />
      )}
    </div>
  )
}
