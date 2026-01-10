import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { ulid } from 'ulid'
import { ulidType } from '../types'
import { boards } from './boards'

export const columns = sqliteTable('columns', {
  id: ulidType('id')
    .primaryKey()
    .$defaultFn(() => ulid()),

  boardId: ulidType('board_id')
    .notNull()
    .references(() => boards.id, { onDelete: 'cascade' }),

  title: text('title').notNull(),

  // Position for ordering (0, 1, 2, etc.)
  position: integer('position').notNull(),

  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),

  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
})

export type Column = typeof columns.$inferSelect
export type InsertColumn = typeof columns.$inferInsert
