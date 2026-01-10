import { type LocalBoard, type LocalCard, type LocalColumn, db } from '@/lib/db'
import { useCallback, useEffect, useState } from 'react'
import { ulid } from 'ulid'

export interface BoardData {
  board: LocalBoard
  columns: Array<LocalColumn & { cards: LocalCard[] }>
}

export function useLocalBoard(boardId: string) {
  const [data, setData] = useState<BoardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadBoard = useCallback(async () => {
    try {
      setLoading(true)
      const board = await db.boards.get(boardId)

      if (!board) {
        setData(null)
        setError(null)
        setLoading(false)
        return
      }

      const columns = await db.columns.where('boardId').equals(boardId).sortBy('position')

      const columnsWithCards = await Promise.all(
        columns.map(async (col: LocalColumn) => {
          const cards = await db.cards.where('columnId').equals(col.id).sortBy('position')
          return { ...col, cards }
        }),
      )

      setData({ board, columns: columnsWithCards })
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load board')
    } finally {
      setLoading(false)
    }
  }, [boardId])

  useEffect(() => {
    loadBoard()
  }, [loadBoard])

  const createBoard = async (name: string, title: string) => {
    const id = ulid()
    const now = new Date()
    await db.boards.add({
      id,
      name,
      title,
      createdAt: now,
      updatedAt: now,
    })
    return id
  }

  const updateBoardTitle = async (title: string) => {
    if (!data) return
    await db.boards.update(boardId, { title, updatedAt: new Date() })
    await loadBoard()
  }

  const deleteBoard = async () => {
    await db.cards
      .where('columnId')
      .anyOf(
        (await db.columns.where('boardId').equals(boardId).toArray()).map((c: LocalColumn) => c.id),
      )
      .delete()
    await db.columns.where('boardId').equals(boardId).delete()
    await db.boards.delete(boardId)
  }

  const createColumn = async (title: string) => {
    if (!data) return
    const position = data.columns.length
    const id = ulid()
    const now = new Date()
    await db.columns.add({
      id,
      boardId,
      title,
      position,
      createdAt: now,
      updatedAt: now,
    })
    await loadBoard()
    return id
  }

  const updateColumnTitle = async (columnId: string, title: string) => {
    await db.columns.update(columnId, { title, updatedAt: new Date() })
    await loadBoard()
  }

  const deleteColumn = async (columnId: string) => {
    await db.cards.where('columnId').equals(columnId).delete()
    await db.columns.delete(columnId)
    await loadBoard()
  }

  const reorderColumns = async (updates: Array<{ id: string; position: number }>) => {
    await Promise.all(
      updates.map((u) => db.columns.update(u.id, { position: u.position, updatedAt: new Date() })),
    )
    await loadBoard()
  }

  const createCard = async (columnId: string, content: string) => {
    if (!data) return
    const column = data.columns.find((c) => c.id === columnId)
    if (!column) return

    const position = column.cards.length
    const id = ulid()
    const now = new Date()
    await db.cards.add({
      id,
      columnId,
      content,
      position,
      createdAt: now,
      updatedAt: now,
    })
    await loadBoard()
    return id
  }

  const updateCardContent = async (cardId: string, content: string) => {
    await db.cards.update(cardId, { content, updatedAt: new Date() })
    await loadBoard()
  }

  const moveCard = async (cardId: string, columnId: string, position: number) => {
    await db.cards.update(cardId, { columnId, position, updatedAt: new Date() })
    await loadBoard()
  }

  const deleteCard = async (cardId: string) => {
    await db.cards.delete(cardId)
    await loadBoard()
  }

  const reorderCards = async (updates: Array<{ id: string; position: number }>) => {
    await Promise.all(
      updates.map((u) => db.cards.update(u.id, { position: u.position, updatedAt: new Date() })),
    )
    await loadBoard()
  }

  const exportBoard = async () => {
    if (!data) return null
    return JSON.stringify(data, null, 2)
  }

  const importBoard = async (jsonData: string) => {
    try {
      const imported = JSON.parse(jsonData) as BoardData

      await db.boards.add({
        ...imported.board,
        id: ulid(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      for (const col of imported.columns) {
        const newColId = ulid()
        await db.columns.add({
          ...col,
          id: newColId,
          boardId: imported.board.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        for (const card of col.cards) {
          await db.cards.add({
            ...card,
            id: ulid(),
            columnId: newColId,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
        }
      }

      await loadBoard()
    } catch (_err) {
      throw new Error('Invalid board data')
    }
  }

  return {
    data,
    loading,
    error,
    createBoard,
    updateBoardTitle,
    deleteBoard,
    createColumn,
    updateColumnTitle,
    deleteColumn,
    reorderColumns,
    createCard,
    updateCardContent,
    moveCard,
    deleteCard,
    reorderCards,
    exportBoard,
    importBoard,
    refresh: loadBoard,
  }
}
