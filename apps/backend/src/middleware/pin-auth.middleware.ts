import { createMiddleware } from 'hono/factory'
import type { DbInstance } from '../database/db'
import type { Bindings } from '../types/bindings'

/**
 * Middleware to verify PIN for protected board endpoints
 * Expects 'X-Board-Pin' header with the plain PIN
 */
export const pinAuthMiddleware = createMiddleware<{
  Bindings: Bindings
  Variables: {
    db: DbInstance
    boardId: string
  }
}>(async (c, next) => {
  const pin = c.req.header('X-Board-Pin')
  const boardId = c.get('boardId')

  if (!pin) {
    return c.json({ error: 'PIN required', code: 401 }, 401)
  }

  if (!boardId) {
    return c.json({ error: 'Board ID not found in context', code: 500 }, 500)
  }

  const db = c.get('db')

  // Import repositories
  const { BoardRepository } = await import('../database/repositories')
  const boardRepo = new BoardRepository(db)

  const board = await boardRepo.findById(boardId)

  if (!board) {
    return c.json({ error: 'Board not found', code: 404 }, 404)
  }

  // Verify PIN using Web Crypto API (PBKDF2)
  const isValid = await verifyPin(pin, board.pinHash)

  if (!isValid) {
    return c.json({ error: 'Invalid PIN', code: 401 }, 401)
  }

  await next()
})

/**
 * Hash a PIN using PBKDF2
 * Format: pbkdf2:iterations:salt:hash
 */
export async function hashPin(pin: string): Promise<string> {
  const iterations = 100000
  const salt = crypto.getRandomValues(new Uint8Array(16))

  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(pin),
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  )

  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    256,
  )

  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

  const saltArray = Array.from(salt)
  const saltHex = saltArray.map((b) => b.toString(16).padStart(2, '0')).join('')

  return `pbkdf2:${iterations}:${saltHex}:${hashHex}`
}

/**
 * Verify a PIN against a stored hash
 */
export async function verifyPin(pin: string, storedHash: string): Promise<boolean> {
  const parts = storedHash.split(':')

  if (parts.length !== 4 || parts[0] !== 'pbkdf2') {
    return false
  }

  const iterations = Number.parseInt(parts[1] || '0', 10)
  const saltHex = parts[2]
  const hashHex = parts[3]

  if (!saltHex || !hashHex) {
    return false
  }

  // Convert hex salt back to Uint8Array
  const saltMatches = saltHex.match(/.{2}/g)
  if (!saltMatches) {
    return false
  }
  const saltArray = new Uint8Array(saltMatches.map((byte) => Number.parseInt(byte, 16)))

  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(pin),
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  )

  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltArray,
      iterations: iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    256,
  )

  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const computedHashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

  return computedHashHex === hashHex
}
