import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { ulid } from 'ulid'
import { ulidType } from '../types'
import { columns } from './columns'

export const cards = sqliteTable('cards', {
  id: ulidType('id')
    .primaryKey()
    .$defaultFn(() => ulid()),

  columnId: ulidType('column_id')
    .notNull()
    .references(() => columns.id, { onDelete: 'cascade' }),

  content: text('content').notNull(),

  // Position within column (0, 1, 2, etc.)
  position: integer('position').notNull(),

  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),

  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
})

export type Card = typeof cards.$inferSelect
export type InsertCard = typeof cards.$inferInsert
