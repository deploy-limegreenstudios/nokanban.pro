import { createEnv } from '@cf-starter/env'
import { z } from 'zod'

export const envValidator = createEnv({
  server: {
    ENVIRONMENT: z.enum(['development', 'production', 'test']).default('development'),
  },
})

export const getEnv = (bindings: Record<string, unknown>) => {
  return envValidator.validate(bindings)
}

export type Env = ReturnType<typeof getEnv>
