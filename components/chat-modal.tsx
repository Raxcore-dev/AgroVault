/**
 * Chat Modal Component
 * 
 * Real-time chat interface for buyer-seller communication about a product.
 * Features: message list, send message, auto-scroll, polling for new messages.
 */

'use client'

import { useEffect, useState, useRef } from 'react'
import { X, Send, Loader2, Package, User, MessageCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { formatKES } from '@/lib/services/spoilage-prediction'

interface Message {
  id: string
  message: string
  timestamp: string
  senderId: string
  sender: {
    id: string
    name: string
  }
}

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
}

interface ChatModalProps {
  productId: string
  farmerId: string
  farmerName: string
  productName: string
  onClose: () => void
}

export function ChatModal({ productId, farmerId, farmerName, productName, onClose }: ChatModalProps) {
  const { token, user } = useAuth()
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Fetch or create conversation
  const initializeConversation = async () => {
    if (!token) return

    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId, farmerId })
      })

      if (res.ok) {
        const data = await res.json()
        setConversation(data.conversation)
        fetchMessages(data.conversation.id)
      }
    } catch (error) {
      console.error('Error initializing conversation:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch messages
  const fetchMessages = async (conversationId: string) => {
    if (!token) return

    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
        setTimeout(scrollToBottom, 100)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !conversation || !token) return

    setSending(true)
    try {
      const res = await fetch(`/api/conversations/${conversation.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: newMessage.trim() })
      })

      if (res.ok) {
        const data = await res.json()
        setMessages(prev => [...prev, data.message])
        setNewMessage('')
        setTimeout(scrollToBottom, 100)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  // Initialize conversation on mount
  useEffect(() => {
    initializeConversation()
  }, [])

  // Polling for new messages every 3 seconds
  useEffect(() => {
    if (!conversation) return

    pollingIntervalRef.current = setInterval(() => {
      fetchMessages(conversation.id)
    }, 3000)

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [conversation])

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Starting conversation...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!conversation) {
    return null
  }

  const otherParticipant = user?.id === conversation.buyer.id ? conversation.farmer : conversation.buyer

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{otherParticipant.name}</h3>
              <p className="text-xs text-muted-foreground truncate">{conversation.product.productName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center shrink-0"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-3 bg-muted/30 border-b border-border">
          <div className="flex items-center gap-3">
            {conversation.product.productImage ? (
              <img
                src={conversation.product.productImage}
                alt={conversation.product.productName}
                className="h-12 w-12 rounded-lg object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{conversation.product.productName}</p>
              <p className="text-sm text-primary font-semibold">
                {formatKES(conversation.product.price)}/{conversation.product.unit}
              </p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              conversation.product.isAvailable 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {conversation.product.isAvailable ? 'Available' : 'Sold Out'}
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-foreground">Start the conversation</p>
              <p className="text-xs text-muted-foreground mt-1">
                Send a message to {otherParticipant.name} about this product
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwnMessage = msg.senderId === user?.id
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        isOwnMessage
                          ? 'bg-primary text-white'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                    </div>
                    <p className={`text-xs text-muted-foreground mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="btn-primary h-10 w-10 p-0 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
