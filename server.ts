/**
 * Custom Next.js Server with Socket.IO
 * 
 * This file wraps the Next.js server with Socket.IO to enable
 * real-time WebSocket communication for the chat feature.
 * 
 * How it works:
 * 1. Creates an HTTP server
 * 2. Attaches Socket.IO to it (on path `/api/socketio`)
 * 3. Handles Next.js requests via the same HTTP server
 * 4. Manages chat rooms (one per conversation: userA-userB-productId)
 * 
 * To run: `npx tsx server.ts` (or add to package.json scripts)
 * 
 * Events:
 *   - `join-room`: Client joins a conversation room
 *   - `send-message`: Client sends a message; server broadcasts to the room
 *   - `new-message`: Server emits new messages to all users in the room
 */

import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { Server as SocketIOServer } from 'socket.io'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

// Create the Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  // Create an HTTP server
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Attach Socket.IO to the HTTP server
  const io = new SocketIOServer(httpServer, {
    path: '/api/socketio',
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })

  // ─── Socket.IO Event Handlers ───
  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`)

    // Join a conversation room
    // Room format: "userId1-userId2-productId" (IDs sorted alphabetically)
    socket.on('join-room', (room: string) => {
      socket.join(room)
      console.log(`[Socket.IO] ${socket.id} joined room: ${room}`)
    })

    // Handle sending a message
    // When a client sends a message, broadcast it to all OTHER users in the room
    socket.on('send-message', (data: { room: string; message: unknown }) => {
      socket.to(data.room).emit('new-message', data.message)
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`)
    })
  })

  // Start listening
  httpServer.listen(port, () => {
    console.log(`
  ╔══════════════════════════════════════════════╗
  ║  🌾 AgroVault Server                         ║
  ║  Ready on http://${hostname}:${port}              ║
  ║  Socket.IO path: /api/socketio               ║
  ║  Mode: ${dev ? 'Development' : 'Production'}                          ║
  ╚══════════════════════════════════════════════╝
    `)
  })
})
