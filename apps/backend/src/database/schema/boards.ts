import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { ulid } from 'ulid'
import { ulidType } from '../types'

export const boards = sqliteTable('boards', {
  id: ulidType('id')
    .primaryKey()
    .$defaultFn(() => ulid()),

  // Custom name for URL (unique, 4+ chars, alphanumeric + hyphens)
  name: text('name').notNull().unique(),

  // Display title for the board
  title: text('title').notNull(),

  // PIN hash (PBKDF2 format like passwords)
  pinHash: text('pin_hash').notNull(),

  // Last activity timestamp for 30-day cleanup
  lastActivityAt: integer('last_activity_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),

  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),

  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
})

export type Board = typeof boards.$inferSelect
export type InsertBoard = typeof boards.$inferInsert
