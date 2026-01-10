import { z } from 'zod'

// Board name: 4+ chars, alphanumeric + hyphens only
const boardNameSchema = z
  .string()
  .min(4, 'Board name must be at least 4 characters')
  .max(50, 'Board name must be at most 50 characters')
  .regex(/^[a-zA-Z0-9-]+$/, 'Board name can only contain letters, numbers, and hyphens')

// PIN: exactly 4 digits
const pinSchema = z
  .string()
  .length(4, 'PIN must be exactly 4 digits')
  .regex(/^\d{4}$/, 'PIN must contain only digits')

// Board title: 1-100 chars
const boardTitleSchema = z
  .string()
  .min(1, 'Title cannot be empty')
  .max(100, 'Title must be at most 100 characters')

// Column title: 1-100 chars
const columnTitleSchema = z
  .string()
  .min(1, 'Column title cannot be empty')
  .max(100, 'Column title must be at most 100 characters')

// Card content: 1-1000 chars
const cardContentSchema = z
  .string()
  .min(1, 'Card content cannot be empty')
  .max(1000, 'Card content must be at most 1000 characters')

// ULID format validation
const ulidSchema = z.string().length(26)

// Create board
export const createBoardSchema = z.object({
  name: boardNameSchema,
  title: boardTitleSchema,
  pin: pinSchema,
})

export type CreateBoardInput = z.infer<typeof createBoardSchema>

// Get board by name
export const getBoardByNameSchema = z.object({
  name: boardNameSchema,
})

// Create column
export const createColumnSchema = z.object({
  title: columnTitleSchema,
  position: z.number().int().min(0),
})

export type CreateColumnInput = z.infer<typeof createColumnSchema>

// Update column title
export const updateColumnTitleSchema = z.object({
  title: columnTitleSchema,
})

// Update column position
export const updateColumnPositionSchema = z.object({
  position: z.number().int().min(0),
})

// Reorder columns
export const reorderColumnsSchema = z.object({
  columns: z.array(
    z.object({
      id: ulidSchema,
      position: z.number().int().min(0),
    }),
  ),
})

export type ReorderColumnsInput = z.infer<typeof reorderColumnsSchema>

// Create card
export const createCardSchema = z.object({
  content: cardContentSchema,
  position: z.number().int().min(0),
})

export type CreateCardInput = z.infer<typeof createCardSchema>

// Update card content
export const updateCardContentSchema = z.object({
  content: cardContentSchema,
})

// Update card position within column
export const updateCardPositionSchema = z.object({
  position: z.number().int().min(0),
})

// Move card to different column
export const moveCardSchema = z.object({
  columnId: ulidSchema,
  position: z.number().int().min(0),
})

export type MoveCardInput = z.infer<typeof moveCardSchema>

// Reorder cards within column
export const reorderCardsSchema = z.object({
  cards: z.array(
    z.object({
      id: ulidSchema,
      position: z.number().int().min(0),
    }),
  ),
})

export type ReorderCardsInput = z.infer<typeof reorderCardsSchema>
