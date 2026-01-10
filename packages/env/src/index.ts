import { z } from 'zod'

/**
 * Type-safe environment variable validation utility
 *
 * Supports two modes:
 * 1. Immediate validation: Pass runtimeEnv to validate immediately
 * 2. Deferred validation: Omit runtimeEnv and call .validate() later
 *
 * @example
 * ```ts
 * import { createEnv } from '@cf-starter/env'
 * import { z } from 'zod'
 *
 * // Immediate mode (for build-time)
 * export const env = createEnv({
 *   server: {
 *     DATABASE_URL: z.string().url(),
 *   },
 *   runtimeEnv: process.env,
 * })
 *
 * // Deferred mode (for runtime)
 * export const envValidator = createEnv({
 *   server: {
 *     DATABASE_URL: z.string().url(),
 *   },
 * })
 *
 * const validated = envValidator.validate(c.env)
 * ```
 */
export function createEnv<
  TServer extends z.ZodRawShape = Record<string, never>,
  TClient extends z.ZodRawShape = Record<string, never>,
>(config: {
  server?: TServer
  client?: TClient
  runtimeEnv?: Record<string, string | undefined>
  skipValidation?: boolean
}): z.infer<z.ZodObject<TServer>> &
  z.infer<z.ZodObject<TClient>> & {
    validate: (
      env: Record<string, unknown>,
    ) => z.infer<z.ZodObject<TServer>> & z.infer<z.ZodObject<TClient>>
  } {
  const {
    server = {} as TServer,
    client = {} as TClient,
    runtimeEnv,
    skipValidation = false,
  } = config

  // Create validation function
  const validate = (envToValidate: Record<string, unknown>) => {
    if (skipValidation) {
      // biome-ignore lint/suspicious/noExplicitAny: Generic type inference requires any
      return envToValidate as any
    }

    const serverSchema = z.object(server)
    const clientSchema = z.object(client)

    const serverEnv: Record<string, unknown> = {}
    const clientEnv: Record<string, unknown> = {}

    for (const key of Object.keys(server)) {
      serverEnv[key] = envToValidate[key]
    }

    for (const key of Object.keys(client)) {
      clientEnv[key] = envToValidate[key]
    }

    const parsedServer = serverSchema.safeParse(serverEnv)
    const parsedClient = clientSchema.safeParse(clientEnv)

    if (!parsedServer.success) {
      console.error('❌ Invalid server environment variables:')
      console.error(parsedServer.error.flatten().fieldErrors)
      throw new Error('Invalid server environment variables')
    }

    if (!parsedClient.success) {
      console.error('❌ Invalid client environment variables:')
      console.error(parsedClient.error.flatten().fieldErrors)
      throw new Error('Invalid client environment variables')
    }

    return {
      ...parsedServer.data,
      ...parsedClient.data,
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    } as any
  }

  // If runtimeEnv is provided, validate immediately (immediate mode)
  if (runtimeEnv) {
    const result = validate(runtimeEnv)
    // Attach validate function for consistency
    return {
      ...result,
      validate,
    }
  }

  // Otherwise, return object with validate method (deferred mode)
  return {
    validate,
    // biome-ignore lint/suspicious/noExplicitAny: Return type includes validate method not in inferred type
  } as any
}
