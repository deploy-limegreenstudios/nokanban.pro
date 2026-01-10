import type { Context } from 'hono'
import type { DbInstance } from '../database/db'
import { BoardRepository, CardRepository, ColumnRepository } from '../database/repositories'
import { hashPin } from '../middleware/pin-auth.middleware'
import type {
  CreateBoardInput,
  CreateCardInput,
  CreateColumnInput,
  MoveCardInput,
  ReorderCardsInput,
  ReorderColumnsInput,
} from '../validators/board.validator'

export class BoardController {
  private boardRepo: BoardRepository
  private columnRepo: ColumnRepository
  private cardRepo: CardRepository

  constructor(db: DbInstance) {
    this.boardRepo = new BoardRepository(db)
    this.columnRepo = new ColumnRepository(db)
    this.cardRepo = new CardRepository(db)
  }

  // Create new board
  async createBoard(c: Context, input: CreateBoardInput) {
    // Check if name already exists
    const existing = await this.boardRepo.findByName(input.name)
    if (existing) {
      return c.json({ error: 'Board name already taken', code: 409 }, 409)
    }

    // Hash PIN
    const pinHash = await hashPin(input.pin)

    // Create board
    const board = await this.boardRepo.create({
      name: input.name,
      title: input.title,
      pinHash,
    })

    // Return without PIN hash
    return c.json(
      {
        id: board.id,
        name: board.name,
        title: board.title,
        createdAt: board.createdAt,
      },
      201,
    )
  }

  // Get board by name (public info only)
  async getBoardByName(c: Context, name: string) {
    const board = await this.boardRepo.findByName(name)

    if (!board) {
      return c.json({ error: 'Board not found', code: 404 }, 404)
    }

    // Update last activity
    await this.boardRepo.updateLastActivity(board.id)

    // Get columns with cards
    const columns = await this.columnRepo.findByBoardId(board.id)
    const columnsWithCards = await Promise.all(
      columns.map(async (col) => {
        const cards = await this.cardRepo.findByColumnId(col.id)
        return {
          id: col.id,
          title: col.title,
          position: col.position,
          cards: cards.map((card) => ({
            id: card.id,
            content: card.content,
            position: card.position,
            createdAt: card.createdAt,
            updatedAt: card.updatedAt,
          })),
          createdAt: col.createdAt,
          updatedAt: col.updatedAt,
        }
      }),
    )

    return c.json({
      id: board.id,
      name: board.name,
      title: board.title,
      columns: columnsWithCards,
      createdAt: board.createdAt,
      updatedAt: board.updatedAt,
    })
  }

  // Delete board
  async deleteBoard(c: Context, boardId: string) {
    await this.boardRepo.delete(boardId)
    return c.json({ message: 'Board deleted successfully' })
  }

  // Create column
  async createColumn(c: Context, boardId: string, input: CreateColumnInput) {
    const column = await this.columnRepo.create({
      boardId,
      title: input.title,
      position: input.position,
    })

    await this.boardRepo.updateLastActivity(boardId)

    return c.json(
      {
        id: column.id,
        title: column.title,
        position: column.position,
        createdAt: column.createdAt,
        updatedAt: column.updatedAt,
      },
      201,
    )
  }

  // Update column title
  async updateColumnTitle(c: Context, boardId: string, columnId: string, title: string) {
    const column = await this.columnRepo.updateTitle(columnId, title)

    if (!column) {
      return c.json({ error: 'Column not found', code: 404 }, 404)
    }

    await this.boardRepo.updateLastActivity(boardId)

    return c.json({
      id: column.id,
      title: column.title,
      updatedAt: column.updatedAt,
    })
  }

  // Reorder columns
  async reorderColumns(c: Context, boardId: string, input: ReorderColumnsInput) {
    await this.columnRepo.updatePositions(input.columns)
    await this.boardRepo.updateLastActivity(boardId)

    return c.json({ message: 'Columns reordered successfully' })
  }

  // Delete column
  async deleteColumn(c: Context, boardId: string, columnId: string) {
    await this.columnRepo.delete(columnId)
    await this.boardRepo.updateLastActivity(boardId)

    return c.json({ message: 'Column deleted successfully' })
  }

  // Create card
  async createCard(c: Context, boardId: string, columnId: string, input: CreateCardInput) {
    const card = await this.cardRepo.create({
      columnId,
      content: input.content,
      position: input.position,
    })

    await this.boardRepo.updateLastActivity(boardId)

    return c.json(
      {
        id: card.id,
        content: card.content,
        position: card.position,
        createdAt: card.createdAt,
        updatedAt: card.updatedAt,
      },
      201,
    )
  }

  // Update card content
  async updateCardContent(c: Context, boardId: string, cardId: string, content: string) {
    const card = await this.cardRepo.updateContent(cardId, content)

    if (!card) {
      return c.json({ error: 'Card not found', code: 404 }, 404)
    }

    await this.boardRepo.updateLastActivity(boardId)

    return c.json({
      id: card.id,
      content: card.content,
      updatedAt: card.updatedAt,
    })
  }

  // Move card to different column
  async moveCard(c: Context, boardId: string, cardId: string, input: MoveCardInput) {
    const card = await this.cardRepo.updateColumnAndPosition(cardId, input.columnId, input.position)

    if (!card) {
      return c.json({ error: 'Card not found', code: 404 }, 404)
    }

    await this.boardRepo.updateLastActivity(boardId)

    return c.json({
      id: card.id,
      columnId: card.columnId,
      position: card.position,
      updatedAt: card.updatedAt,
    })
  }

  // Reorder cards within column
  async reorderCards(c: Context, boardId: string, _columnId: string, input: ReorderCardsInput) {
    await this.cardRepo.updatePositions(input.cards)
    await this.boardRepo.updateLastActivity(boardId)

    return c.json({ message: 'Cards reordered successfully' })
  }

  // Delete card
  async deleteCard(c: Context, boardId: string, cardId: string) {
    await this.cardRepo.delete(cardId)
    await this.boardRepo.updateLastActivity(boardId)

    return c.json({ message: 'Card deleted successfully' })
  }
}
