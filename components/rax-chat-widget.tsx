/**
 * Rax AI Chat Widget Component
 * 
 * AI-powered chat assistant that helps farmers search through the AgroVault database.
 * Uses Rax AI to provide intelligent responses about:
 * - Products available in specific counties
 * - Market prices and trends
 * - Storage facilities and conditions
 * - Weather advisories
 * - Job opportunities
 * - General agricultural information
 */

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Send, Bot, Loader2, Sparkles, MessageCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuth } from '@/lib/auth-context'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  suggestions?: string[]
  data?: any
}

interface RaxChatWidgetProps {
  county?: string
  onClose: () => void
  initialQuery?: string
}

const SUGGESTED_QUERIES = [
  "What products are available in this county?",
  "Show me market prices for maize",
  "Are there any storage facilities nearby?",
  "What's the weather forecast for farming?",
  "Find job opportunities in agriculture",
  "Give me tips for storing grains",
]

export function RaxChatWidget({ county, onClose, initialQuery }: RaxChatWidgetProps) {
  const { user, token } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: county 
        ? `Hello! I'm Rax, your AI agricultural assistant. I can help you find information about products, markets, storage facilities, and more in **${county}**. What would you like to know?`
        : `Hello! I'm Rax, your AI agricultural assistant. I can help you find information about products, markets, storage facilities, weather advisories, and job opportunities across Kenya. Select a county above or ask me anything!`,
      timestamp: new Date(),
      suggestions: SUGGESTED_QUERIES.slice(0, 3),
    }
    setMessages([welcomeMessage])

    // Handle initial query if provided
    if (initialQuery) {
      setTimeout(() => handleSend(initialQuery), 1000)
    }
  }, [county])

  // Send message
  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input
    if (!textToSend.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setIsTyping(true)

    try {
      const response = await fetch('/api/ai/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          query: textToSend.trim(),
          county: county || undefined,
          userId: user?.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        suggestions: data.suggestions?.length ? data.suggestions : undefined,
        data: data.data,
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error getting AI response:', error)
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setIsTyping(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Card className="w-full max-w-2xl h-[600px] flex flex-col border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40 rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-primary border-2 border-white rounded-full animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">Rax AI Assistant</h3>
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">
              {county ? `Searching in ${county}` : 'Search across all counties'}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 rounded-lg hover:bg-muted/50"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-white'
                    : message.role === 'system'
                    ? 'bg-danger/10 text-danger border border-danger/20'
                    : 'bg-muted text-foreground'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium text-primary">Rax AI</span>
                  </div>
                )}
                
                {/* Render markdown-like content */}
                <div className="text-sm whitespace-pre-wrap break-words">
                  {message.content.split('**').map((part, i) => 
                    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                  )}
                </div>

                {/* Suggestions */}
                {message.suggestions && message.role === 'assistant' && (
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/50">
                    {message.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium">
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                {/* Data display */}
                {message.data && (
                  <div className="mt-3 p-3 bg-white/50 rounded-lg border border-border/50">
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(message.data, null, 2)}
                    </pre>
                  </div>
                )}

                <div className={`text-[10px] mt-2 ${
                  message.role === 'user' 
                    ? 'text-white/70' 
                    : message.role === 'system'
                    ? 'text-red-600/70'
                    : 'text-muted-foreground/70'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-lg px-4 py-3 bg-muted">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-primary">Rax AI is thinking</span>
                </div>
                <div className="flex gap-1 mt-2">
                  <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card rounded-b-lg">
        {/* Quick suggestions */}
        {messages.length <= 2 && (
          <div className="flex flex-wrap gap-2 mb-3 pb-3 border-b border-border/50">
            <MessageCircle className="h-4 w-4 text-muted-foreground self-center" />
            {SUGGESTED_QUERIES.slice(0, 4).map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={isLoading}
                className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium disabled:opacity-50">
                {suggestion}
              </button>
            ))}
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Rax anything about agriculture..."
              className="w-full rounded-lg border border-border bg-background px-4 py-3 pl-11 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
              disabled={isLoading}
            />
            <Bot className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <Button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="h-11 w-11 rounded-lg bg-primary hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            size="icon">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        
        <div className="flex items-center gap-2 mt-2 px-1">
          <AlertCircle className="h-3 w-3 text-muted-foreground" />
          <p className="text-[10px] text-muted-foreground">
            Rax AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </Card>
  )
}
