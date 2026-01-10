import type { D1Database, KVNamespace, R2Bucket } from '@cloudflare/workers-types'

export type Bindings = {
  DB: D1Database
  BUCKET: R2Bucket
  RATE_LIMIT_KV: KVNamespace
  ENVIRONMENT: string
}
