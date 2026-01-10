import { type ApiColumn, boardService } from '@/services/board.service'
import { useCallback, useEffect, useState } from 'react'

export interface SharedBoardData {
  id: string
  name: string
  title: string
  columns: Array<ApiColumn>
}

export function useSharedBoard(boardName: string, pin?: string) {
  const [data, setData] = useState<SharedBoardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPinSet, setIsPinSet] = useState(false)

  const loadBoard = useCallback(async () => {
    try {
      setLoading(true)
      const board = await boardService.getBoard(boardName)
      setData({
        id: board.id,
        name: board.name,
        title: board.title,
        columns: board.columns,
      })
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load board')
    } finally {
      setLoading(false)
    }
  }, [boardName])

  useEffect(() => {
    if (pin) {
      boardService.setPin(pin)
      setIsPinSet(true)
    }
    loadBoard()
  }, [pin, loadBoard])

  const setPin = (newPin: string) => {
    boardService.setPin(newPin)
    setIsPinSet(true)
  }

  const clearPin = () => {
    boardService.clearPin()
    setIsPinSet(false)
  }

  const createBoard = async (name: string, title: string, pin: string) => {
    const board = await boardService.createBoard(name, title, pin)
    boardService.setPin(pin)
    setIsPinSet(true)
    return board
  }

  const deleteBoard = async () => {
    if (!isPinSet) throw new Error('PIN required')
    await boardService.deleteBoard(boardName)
  }

  const createColumn = async (title: string) => {
    if (!isPinSet) throw new Error('PIN required')
    if (!data) return
    const position = data.columns.length
    await boardService.createColumn(boardName, title, position)
    await loadBoard()
  }

  const updateColumnTitle = async (columnId: string, title: string) => {
    if (!isPinSet) throw new Error('PIN required')
    await boardService.updateColumnTitle(boardName, columnId, title)
    await loadBoard()
  }

  const deleteColumn = async (columnId: string) => {
    if (!isPinSet) throw new Error('PIN required')
    await boardService.deleteColumn(boardName, columnId)
    await loadBoard()
  }

  const reorderColumns = async (updates: Array<{ id: string; position: number }>) => {
    if (!isPinSet) throw new Error('PIN required')
    await boardService.reorderColumns(boardName, updates)
    await loadBoard()
  }

  const createCard = async (columnId: string, content: string) => {
    if (!isPinSet) throw new Error('PIN required')
    if (!data) return
    const column = data.columns.find((c) => c.id === columnId)
    if (!column) return
    const position = column.cards.length
    await boardService.createCard(boardName, columnId, content, position)
    await loadBoard()
  }

  const updateCardContent = async (cardId: string, content: string) => {
    if (!isPinSet) throw new Error('PIN required')
    await boardService.updateCardContent(boardName, cardId, content)
    await loadBoard()
  }

  const moveCard = async (cardId: string, columnId: string, position: number) => {
    if (!isPinSet) throw new Error('PIN required')
    await boardService.moveCard(boardName, cardId, columnId, position)
    await loadBoard()
  }

  const deleteCard = async (cardId: string) => {
    if (!isPinSet) throw new Error('PIN required')
    await boardService.deleteCard(boardName, cardId)
    await loadBoard()
  }

  const reorderCards = async (updates: Array<{ id: string; position: number }>) => {
    if (!isPinSet) throw new Error('PIN required')
    const columnId = data?.columns.find((col) =>
      col.cards.some((card) => card.id === updates[0]?.id),
    )?.id
    if (!columnId) return
    await boardService.reorderCards(boardName, columnId, updates)
    await loadBoard()
  }

  return {
    data,
    loading,
    error,
    isPinSet,
    setPin,
    clearPin,
    createBoard,
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
    refresh: loadBoard,
  }
}
