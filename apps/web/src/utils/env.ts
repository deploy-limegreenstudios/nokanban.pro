import { createEnv } from '@cf-starter/env'
import { z } from 'zod'

export const envValidator = createEnv({
  client: {
    VITE_API_BASE_URL: z.string().url(),
  },
})

export const env = envValidator.validate(import.meta.env)
