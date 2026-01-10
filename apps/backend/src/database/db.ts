import * as fs from 'node:fs'
import * as path from 'node:path'
import type { D1Database } from '@cloudflare/workers-types'
import Database from 'better-sqlite3'
import { drizzle as drizzleBetterSQLite } from 'drizzle-orm/better-sqlite3'
import { drizzle as drizzleD1 } from 'drizzle-orm/d1'

export const getDb = (d1?: D1Database, env?: string) => {
  if (env === 'development' && !d1) {
    const dbDir = path.join(
      process.cwd(),
      '.wrangler',
      'state',
      'v3',
      'd1',
      'miniflare-D1DatabaseObject',
    )

    const files = fs.readdirSync(dbDir)
    const dbFile = files.find(
      (f) => f.endsWith('.sqlite') && !f.includes('-shm') && !f.includes('-wal'),
    )

    if (!dbFile) {
      throw new Error(`No SQLite database found in ${dbDir}. Make sure to run 'bun run dev' first.`)
    }

    const dbPath = path.join(dbDir, dbFile)
    const sqlite = new Database(dbPath)
    return drizzleBetterSQLite(sqlite)
    // biome-ignore lint/style/noUselessElse: <explanation>
  } else {
    if (!d1) {
      throw new Error('D1 database instance is required in production')
    }
    return drizzleD1(d1)
  }
}

export type DbInstance = ReturnType<typeof getDb>
