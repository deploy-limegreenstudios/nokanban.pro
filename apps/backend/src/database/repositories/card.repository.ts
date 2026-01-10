import { and, eq } from 'drizzle-orm'
import type { DbInstance } from '../db'
import { type Card, type InsertCard, cards } from '../schema'

export class CardRepository {
  constructor(private db: DbInstance) {}

  async findById(id: string): Promise<Card | undefined> {
    const result = await this.db.select().from(cards).where(eq(cards.id, id)).limit(1)
    return result[0]
  }

  async findByColumnId(columnId: string): Promise<Card[]> {
    return this.db.select().from(cards).where(eq(cards.columnId, columnId)).orderBy(cards.position)
  }

  async create(card: InsertCard): Promise<Card> {
    const result = await this.db.insert(cards).values(card).returning()
    if (!result[0]) {
      throw new Error('Failed to create card')
    }
    return result[0]
  }

  async updateContent(id: string, content: string): Promise<Card | undefined> {
    const result = await this.db.update(cards).set({ content }).where(eq(cards.id, id)).returning()
    return result[0]
  }

  async updatePosition(id: string, position: number): Promise<Card | undefined> {
    const result = await this.db.update(cards).set({ position }).where(eq(cards.id, id)).returning()
    return result[0]
  }

  async updateColumnAndPosition(
    id: string,
    columnId: string,
    position: number,
  ): Promise<Card | undefined> {
    const result = await this.db
      .update(cards)
      .set({ columnId, position })
      .where(eq(cards.id, id))
      .returning()
    return result[0]
  }

  async updatePositions(updates: Array<{ id: string; position: number }>): Promise<void> {
    for (const update of updates) {
      await this.db.update(cards).set({ position: update.position }).where(eq(cards.id, update.id))
    }
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(cards).where(eq(cards.id, id))
  }

  async deleteByColumnId(columnId: string): Promise<void> {
    await this.db.delete(cards).where(eq(cards.columnId, columnId))
  }
}
