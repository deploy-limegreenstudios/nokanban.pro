import { zValidator } from '@hono/zod-validator'
import type { Context, Next } from 'hono'
import { Hono } from 'hono'
import { BoardController } from '../controllers/board.controller'
import type { DbInstance } from '../database/db'
import { pinAuthMiddleware } from '../middleware/pin-auth.middleware'
import { boardRateLimitMiddleware, rateLimitMiddleware } from '../middleware/rate-limit.middleware'
import type { Bindings } from '../types/bindings'
import {
  createBoardSchema,
  createCardSchema,
  createColumnSchema,
  getBoardByNameSchema,
  moveCardSchema,
  reorderCardsSchema,
  reorderColumnsSchema,
  updateCardContentSchema,
  updateColumnTitleSchema,
} from '../validators/board.validator'

const boardRoutes = new Hono<{
  Bindings: Bindings
  Variables: {
    db: DbInstance
    boardId: string
  }
}>()

// Rate limit: 10 board creations per 15 minutes
boardRoutes.post(
  '/',
  rateLimitMiddleware({ limit: 10, windowMs: 15 * 60 * 1000, keyPrefix: 'create_board' }),
  zValidator('json', createBoardSchema),
  async (c) => {
    const db = c.get('db')
    const controller = new BoardController(db)
    const input = c.req.valid('json')
    return controller.createBoard(c, input)
  },
)

// Get board by name (public, no auth)
boardRoutes.get('/:name', async (c) => {
  const db = c.get('db')
  const controller = new BoardController(db)
  const name = c.req.param('name')
  return controller.getBoardByName(c, name)
})

// Middleware to extract boardId from name param
const extractBoardId = async (c: Context, next: Next) => {
  const db = c.get('db')
  const name = c.req.param('name')

  const { BoardRepository } = await import('../database/repositories')
  const boardRepo = new BoardRepository(db)
  const board = await boardRepo.findByName(name)

  if (!board) {
    return c.json({ error: 'Board not found', code: 404 }, 404)
  }

  c.set('boardId', board.id)
  await next()
}

// Protected routes - require PIN auth
const protectedRoutes = new Hono<{
  Bindings: Bindings
  Variables: {
    db: DbInstance
    boardId: string
  }
}>()

protectedRoutes.use('*', extractBoardId)
protectedRoutes.use('*', pinAuthMiddleware)
protectedRoutes.use('*', boardRateLimitMiddleware({ limit: 100, windowMs: 60 * 1000 }))

// Delete board
protectedRoutes.delete('/:name', async (c) => {
  const db = c.get('db')
  const controller = new BoardController(db)
  const boardId = c.get('boardId')
  return controller.deleteBoard(c, boardId)
})

// Create column
protectedRoutes.post('/:name/columns', zValidator('json', createColumnSchema), async (c) => {
  const db = c.get('db')
  const controller = new BoardController(db)
  const boardId = c.get('boardId')
  const input = c.req.valid('json')
  return controller.createColumn(c, boardId, input)
})

// Update column title
protectedRoutes.patch(
  '/:name/columns/:columnId/title',
  zValidator('json', updateColumnTitleSchema),
  async (c) => {
    const db = c.get('db')
    const controller = new BoardController(db)
    const boardId = c.get('boardId')
    const columnId = c.req.param('columnId')
    const { title } = c.req.valid('json')
    return controller.updateColumnTitle(c, boardId, columnId, title)
  },
)

// Reorder columns
protectedRoutes.patch(
  '/:name/columns/reorder',
  zValidator('json', reorderColumnsSchema),
  async (c) => {
    const db = c.get('db')
    const controller = new BoardController(db)
    const boardId = c.get('boardId')
    const input = c.req.valid('json')
    return controller.reorderColumns(c, boardId, input)
  },
)

// Delete column
protectedRoutes.delete('/:name/columns/:columnId', async (c) => {
  const db = c.get('db')
  const controller = new BoardController(db)
  const boardId = c.get('boardId')
  const columnId = c.req.param('columnId')
  return controller.deleteColumn(c, boardId, columnId)
})

// Create card
protectedRoutes.post(
  '/:name/columns/:columnId/cards',
  zValidator('json', createCardSchema),
  async (c) => {
    const db = c.get('db')
    const controller = new BoardController(db)
    const boardId = c.get('boardId')
    const columnId = c.req.param('columnId')
    const input = c.req.valid('json')
    return controller.createCard(c, boardId, columnId, input)
  },
)

// Update card content
protectedRoutes.patch(
  '/:name/cards/:cardId/content',
  zValidator('json', updateCardContentSchema),
  async (c) => {
    const db = c.get('db')
    const controller = new BoardController(db)
    const boardId = c.get('boardId')
    const cardId = c.req.param('cardId')
    const { content } = c.req.valid('json')
    return controller.updateCardContent(c, boardId, cardId, content)
  },
)

// Move card to different column
protectedRoutes.patch(
  '/:name/cards/:cardId/move',
  zValidator('json', moveCardSchema),
  async (c) => {
    const db = c.get('db')
    const controller = new BoardController(db)
    const boardId = c.get('boardId')
    const cardId = c.req.param('cardId')
    const input = c.req.valid('json')
    return controller.moveCard(c, boardId, cardId, input)
  },
)

// Reorder cards within column
protectedRoutes.patch(
  '/:name/columns/:columnId/cards/reorder',
  zValidator('json', reorderCardsSchema),
  async (c) => {
    const db = c.get('db')
    const controller = new BoardController(db)
    const boardId = c.get('boardId')
    const columnId = c.req.param('columnId')
    const input = c.req.valid('json')
    return controller.reorderCards(c, boardId, columnId, input)
  },
)

// Delete card
protectedRoutes.delete('/:name/cards/:cardId', async (c) => {
  const db = c.get('db')
  const controller = new BoardController(db)
  const boardId = c.get('boardId')
  const cardId = c.req.param('cardId')
  return controller.deleteCard(c, boardId, cardId)
})

// Mount protected routes
boardRoutes.route('/', protectedRoutes)

export default boardRoutes
