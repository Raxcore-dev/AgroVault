/**
 * Chat Widget Component
 * 
 * Real-time chat interface between users about a specific product or job.
 * Features:
 *   - Displays message history
 *   - Sends new messages via the API
 *   - Polls for new messages every 3 seconds for real-time feel
 *   - Auto-scrolls to the latest message
 * 
 * Props:
 *   - productId?: The product this conversation is about
 *   - jobId?: The job this conversation is about
 *   - otherUserId: The user on the other side
 *   - otherUserName: Display name of the other user
 *   - onClose: Callback to close the chat widget
 */

'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Send, X, MessageCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

interface Message {
  id: string
  message: string
  timestamp: string
  senderId: string
  receiverId: string
  sender: { id: string; name: string; role: string }
  receiver: { id: string; name: string; role: string }
}

interface ChatWidgetProps {
  productId?: string
  jobId?: string
  otherUserId: string
  otherUserName: string
  onClose: () => void
}

export function ChatWidget({ productId, jobId, otherUserId, otherUserName, onClose }: ChatWidgetProps) {
  const { user, token } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Build the query params for messages API
  const contextParam = productId
    ? `productId=${productId}`
    : `jobId=${jobId}`

  // Auto-scroll to the latest message
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Fetch message history
  const fetchMessages = useCallback(async (showLoading = false) => {
    if (!token) return
    if (showLoading) setIsLoading(true)
    try {
      const res = await fetch(
        `/api/messages?${contextParam}&otherUserId=${otherUserId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages)
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err)
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }, [token, contextParam, otherUserId])

  // Initial fetch
  useEffect(() => {
    fetchMessages(true)
  }, [fetchMessages])

  // Poll for new messages every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => fetchMessages(false), 3000)
    return () => clearInterval(interval)
  }, [fetchMessages])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Send a message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !token || isSending) return

    setIsSending(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: otherUserId,
          ...(productId ? { productId } : { jobId }),
          message: newMessage.trim(),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const sentMessage = data.message

        // Add to local state immediately
        setMessages((prev) => [...prev, sentMessage])
        setNewMessage('')
      }
    } catch (err) {
      console.error('Failed to send message:', err)
    } finally {
      setIsSending(false)
    }
  }

  if (!user) {
    return (
      <div className="card-elevated rounded-xl p-6 text-center">
        <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          Please <a href="/login" className="text-primary font-semibold hover:underline">log in</a> to chat with the farmer.
        </p>
      </div>
    )
  }

  return (
    <div className="card-elevated rounded-xl overflow-hidden flex flex-col h-[450px]">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-primary/5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">
              {otherUserName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{otherUserName}</p>
            <p className="text-[11px] text-muted-foreground">Chat about this product</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle className="h-10 w-10 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">No messages yet.</p>
            <p className="text-xs text-muted-foreground">Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === user.id
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                    isMe
                      ? 'bg-primary text-white rounded-br-md'
                      : 'bg-muted text-foreground rounded-bl-md'
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-muted-foreground'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSend} className="flex items-center gap-2 px-4 py-3 border-t border-border bg-white">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || isSending}
          className="rounded-lg bg-primary p-2.5 text-white transition-colors hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}
