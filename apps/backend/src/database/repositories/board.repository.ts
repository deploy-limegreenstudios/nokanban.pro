import { eq, lt } from 'drizzle-orm'
import type { DbInstance } from '../db'
import { type Board, type InsertBoard, boards } from '../schema'

export class BoardRepository {
  constructor(private db: DbInstance) {}

  async findById(id: string): Promise<Board | undefined> {
    const result = await this.db.select().from(boards).where(eq(boards.id, id)).limit(1)
    return result[0]
  }

  async findByName(name: string): Promise<Board | undefined> {
    const result = await this.db.select().from(boards).where(eq(boards.name, name)).limit(1)
    return result[0]
  }

  async create(board: InsertBoard): Promise<Board> {
    const result = await this.db.insert(boards).values(board).returning()
    if (!result[0]) {
      throw new Error('Failed to create board')
    }
    return result[0]
  }

  async updateLastActivity(id: string): Promise<void> {
    await this.db.update(boards).set({ lastActivityAt: new Date() }).where(eq(boards.id, id))
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(boards).where(eq(boards.id, id))
  }

  async deleteInactive(daysAgo: number): Promise<number> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo)

    const result = await this.db
      .delete(boards)
      .where(lt(boards.lastActivityAt, cutoffDate))
      .returning()

    return result.length
  }
}
