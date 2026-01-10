import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { logger } from './config/logger'

import type { getDb } from './database/db'
import { dbMiddleware } from './database/middleware'

import boardRoutes from './routes/board.routes'
import type { Bindings } from './types/bindings'

const app = new Hono<{
  Bindings: Bindings
  Variables: {
    db: ReturnType<typeof getDb>
  }
}>().basePath('/api/v1')

app.use(
  '*',
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'X-Board-Pin'],
  }),
)

app.use('*', dbMiddleware)

app.get('/health', (c) => {
  logger.info({ env: c.env.ENVIRONMENT }, 'health check')
  return c.json({
    message: 'nokanban.pro API',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  })
})

app.route('/boards', boardRoutes)

app.notFound((c) => {
  return c.json({ error: 'Not Found', code: 404 }, 404)
})

app.onError((err, c) => {
  logger.error({ err }, 'Application error')
  return c.json(
    {
      error: 'Internal Server Error',
      code: 500,
      message: err.message,
    },
    500,
  )
})

export default app
