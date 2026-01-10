import { and, eq } from 'drizzle-orm'
import type { DbInstance } from '../db'
import { type Column, type InsertColumn, columns } from '../schema'

export class ColumnRepository {
  constructor(private db: DbInstance) {}

  async findById(id: string): Promise<Column | undefined> {
    const result = await this.db.select().from(columns).where(eq(columns.id, id)).limit(1)
    return result[0]
  }

  async findByBoardId(boardId: string): Promise<Column[]> {
    return this.db
      .select()
      .from(columns)
      .where(eq(columns.boardId, boardId))
      .orderBy(columns.position)
  }

  async create(column: InsertColumn): Promise<Column> {
    const result = await this.db.insert(columns).values(column).returning()
    if (!result[0]) {
      throw new Error('Failed to create column')
    }
    return result[0]
  }

  async updateTitle(id: string, title: string): Promise<Column | undefined> {
    const result = await this.db
      .update(columns)
      .set({ title })
      .where(eq(columns.id, id))
      .returning()
    return result[0]
  }

  async updatePosition(id: string, position: number): Promise<Column | undefined> {
    const result = await this.db
      .update(columns)
      .set({ position })
      .where(eq(columns.id, id))
      .returning()
    return result[0]
  }

  async updatePositions(updates: Array<{ id: string; position: number }>): Promise<void> {
    for (const update of updates) {
      await this.db
        .update(columns)
        .set({ position: update.position })
        .where(eq(columns.id, update.id))
    }
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(columns).where(eq(columns.id, id))
  }

  async deleteByBoardId(boardId: string): Promise<void> {
    await this.db.delete(columns).where(eq(columns.boardId, boardId))
  }
}
