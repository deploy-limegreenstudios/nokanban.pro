import { createMiddleware } from 'hono/factory'
import { envValidator } from '../config/env'
import type { Bindings } from '../types/bindings'
import { getDb } from './db'

export const dbMiddleware = createMiddleware<{
  Bindings: Bindings
  Variables: {
    db: ReturnType<typeof getDb>
  }
}>(async (c, next) => {
  const validatedEnv = envValidator.validate(c.env)
  const db = getDb(c.env.DB, validatedEnv.ENVIRONMENT)
  c.set('db', db)
  await next()
})
