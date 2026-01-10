import { createMiddleware } from 'hono/factory'
import type { Bindings } from '../types/bindings'

/**
 * Rate limiting middleware using Cloudflare KV
 * Limits requests per IP address
 */
export const rateLimitMiddleware = (options: {
  limit: number
  windowMs: number
  keyPrefix?: string
}) => {
  return createMiddleware<{
    Bindings: Bindings
  }>(async (c, next) => {
    const kv = c.env.RATE_LIMIT_KV
    const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown'
    const key = `${options.keyPrefix || 'rl'}:${ip}`

    // Get current count
    const current = await kv.get(key)
    const count = current ? Number.parseInt(current, 10) : 0

    // Check if limit exceeded
    if (count >= options.limit) {
      return c.json(
        {
          error: 'Too many requests',
          code: 429,
          retryAfter: Math.ceil(options.windowMs / 1000),
        },
        429,
      )
    }

    // Increment counter
    const ttl = Math.floor(options.windowMs / 1000)
    await kv.put(key, (count + 1).toString(), { expirationTtl: ttl })

    await next()
  })
}

/**
 * Board-specific rate limiting
 * Combines IP + Board ID for rate limiting
 */
export const boardRateLimitMiddleware = (options: {
  limit: number
  windowMs: number
}) => {
  return createMiddleware<{
    Bindings: Bindings
    Variables: {
      boardId: string
    }
  }>(async (c, next) => {
    const kv = c.env.RATE_LIMIT_KV
    const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown'
    const boardId = c.get('boardId')

    if (!boardId) {
      return c.json({ error: 'Board ID not found in context', code: 500 }, 500)
    }

    const key = `board_rl:${boardId}:${ip}`

    // Get current count
    const current = await kv.get(key)
    const count = current ? Number.parseInt(current, 10) : 0

    // Check if limit exceeded
    if (count >= options.limit) {
      return c.json(
        {
          error: 'Too many requests for this board',
          code: 429,
          retryAfter: Math.ceil(options.windowMs / 1000),
        },
        429,
      )
    }

    // Increment counter
    const ttl = Math.floor(options.windowMs / 1000)
    await kv.put(key, (count + 1).toString(), { expirationTtl: ttl })

    await next()
  })
}
