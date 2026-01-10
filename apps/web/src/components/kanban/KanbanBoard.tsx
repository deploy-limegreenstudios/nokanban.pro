import { cn } from '@/lib/utils'
import * as React from 'react'

interface Card {
  id: string
  content: string
  position: number
}

interface Column {
  id: string
  title: string
  position: number
  cards: Card[]
}

interface KanbanBoardProps {
  columns: Column[]
  onAddColumn?: (title: string) => void
  onUpdateColumnTitle?: (columnId: string, title: string) => void
  onDeleteColumn?: (columnId: string) => void
  onReorderColumns?: (updates: Array<{ id: string; position: number }>) => void
  onAddCard?: (columnId: string, content: string) => void
  onUpdateCard?: (cardId: string, content: string) => void
  onDeleteCard?: (cardId: string) => void
  onMoveCard?: (cardId: string, columnId: string, position: number) => void
  onReorderCards?: (updates: Array<{ id: string; position: number }>) => void
  readOnly?: boolean
}

export function KanbanBoard({
  columns,
  onAddColumn,
  onUpdateColumnTitle,
  onDeleteColumn,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onMoveCard,
  readOnly = false,
}: KanbanBoardProps) {
  const [draggedCard, setDraggedCard] = React.useState<{
    card: Card
    sourceColumnId: string
  } | null>(null)
  const [dropTarget, setDropTarget] = React.useState<string | null>(null)
  const [addingCardTo, setAddingCardTo] = React.useState<string | null>(null)
  const [newCardTitle, setNewCardTitle] = React.useState('')
  const [editingCard, setEditingCard] = React.useState<string | null>(null)
  const [editingColumn, setEditingColumn] = React.useState<string | null>(null)
  const [showAddColumn, setShowAddColumn] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (addingCardTo && inputRef.current) {
      inputRef.current.focus()
    }
  }, [addingCardTo])

  const handleDragStart = (card: Card, columnId: string) => {
    setDraggedCard({ card, sourceColumnId: columnId })
  }

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    setDropTarget(columnId)
  }

  const handleDrop = (targetColumnId: string) => {
    if (!draggedCard || draggedCard.sourceColumnId === targetColumnId) {
      setDraggedCard(null)
      setDropTarget(null)
      return
    }

    // Move card to target column
    const targetColumn = columns.find((c) => c.id === targetColumnId)
    if (!targetColumn) return

    const newPosition = targetColumn.cards.length
    onMoveCard?.(draggedCard.card.id, targetColumnId, newPosition)

    setDraggedCard(null)
    setDropTarget(null)
  }

  const handleAddCard = (columnId: string) => {
    if (!newCardTitle.trim()) return

    onAddCard?.(columnId, newCardTitle.trim())
    setNewCardTitle('')
    setAddingCardTo(null)
  }

  const handleUpdateColumnTitle = (columnId: string, title: string) => {
    if (title.trim()) {
      onUpdateColumnTitle?.(columnId, title.trim())
    }
    setEditingColumn(null)
  }

  const handleUpdateCard = (cardId: string, content: string) => {
    if (content.trim()) {
      onUpdateCard?.(cardId, content.trim())
    }
    setEditingCard(null)
  }

  const handleAddColumn = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const title = formData.get('columnTitle') as string
    if (title.trim()) {
      onAddColumn?.(title.trim())
      setShowAddColumn(false)
      e.currentTarget.reset()
    }
  }

  return (
    <div className="flex h-full gap-4 overflow-x-auto p-4 pb-4 justify-center">
      {columns.map((column) => {
        const isDropActive = dropTarget === column.id && draggedCard?.sourceColumnId !== column.id

        return (
          <div
            key={column.id}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDrop={() => handleDrop(column.id)}
            onDragLeave={() => setDropTarget(null)}
            className={cn(
              'min-w-[280px] max-w-[280px] rounded-xl p-3 transition-all duration-200',
              'bg-neutral-100 dark:bg-neutral-900 border-2',
              isDropActive
                ? 'border-neutral-400 dark:border-neutral-600 border-dashed bg-neutral-200 dark:bg-neutral-800'
                : 'border-transparent',
            )}
          >
            {/* Column Header */}
            <div className="mb-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-2 flex-1">
                {editingColumn === column.id ? (
                  <input
                    defaultValue={column.title}
                    className="flex-1 rounded border border-neutral-300 dark:border-neutral-700 px-2 py-1 text-sm font-semibold bg-white dark:bg-neutral-950"
                    onBlur={(e) => handleUpdateColumnTitle(column.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleUpdateColumnTitle(column.id, e.currentTarget.value)
                      } else if (e.key === 'Escape') {
                        setEditingColumn(null)
                      }
                    }}
                  />
                ) : (
                  <h2
                    className="text-sm font-semibold text-foreground flex-1"
                    onDoubleClick={() => !readOnly && setEditingColumn(column.id)}
                  >
                    {column.title}
                  </h2>
                )}
                <span className="rounded-full bg-neutral-200 dark:bg-neutral-800 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:text-neutral-400">
                  {column.cards.length}
                </span>
              </div>
              {!readOnly && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (column.cards.length > 0) {
                      if (
                        confirm(`Delete "${column.title}" and all ${column.cards.length} cards?`)
                      ) {
                        onDeleteColumn?.(column.id)
                      }
                    } else {
                      onDeleteColumn?.(column.id)
                    }
                  }}
                  className="rounded p-1 text-neutral-400 dark:text-neutral-500 transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-red-600 dark:hover:text-red-400"
                  aria-label="Delete card"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <title>Delete</title>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>

            {/* Cards */}
            <div className="flex min-h-[100px] flex-col gap-2">
              {column.cards
                .sort((a, b) => a.position - b.position)
                .map((card) => {
                  const isDragging = draggedCard?.card.id === card.id

                  return (
                    <div
                      key={card.id}
                      draggable={!readOnly}
                      onDragStart={() => handleDragStart(card, column.id)}
                      onDragEnd={() => setDraggedCard(null)}
                      className={cn(
                        'cursor-grab rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 p-3 shadow-sm transition-all duration-150',
                        'hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing',
                        isDragging && 'rotate-2 opacity-50',
                      )}
                    >
                      {editingCard === card.id ? (
                        <textarea
                          defaultValue={card.content}
                          className="w-full resize-none rounded border border-neutral-300 dark:border-neutral-700 px-2 py-1 text-sm bg-white dark:bg-neutral-950"
                          rows={3}
                          onBlur={(e) => handleUpdateCard(card.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.ctrlKey) {
                              handleUpdateCard(card.id, e.currentTarget.value)
                            } else if (e.key === 'Escape') {
                              setEditingCard(null)
                            }
                          }}
                        />
                      ) : (
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className="flex-1 whitespace-pre-wrap text-sm text-foreground"
                            onDoubleClick={() => !readOnly && setEditingCard(card.id)}
                          >
                            {card.content}
                          </p>
                          {!readOnly && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                onDeleteCard?.(card.id)
                              }}
                              className="text-neutral-400 dark:text-neutral-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              aria-label="Delete card"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}

              {/* Add Card */}
              {!readOnly &&
                (addingCardTo === column.id ? (
                  <input
                    ref={inputRef}
                    type="text"
                    value={newCardTitle}
                    onChange={(e) => setNewCardTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddCard(column.id)
                      } else if (e.key === 'Escape') {
                        setAddingCardTo(null)
                        setNewCardTitle('')
                      }
                    }}
                    onBlur={() => {
                      if (newCardTitle.trim()) {
                        handleAddCard(column.id)
                      } else {
                        setAddingCardTo(null)
                        setNewCardTitle('')
                      }
                    }}
                    placeholder="Enter card title..."
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm text-foreground outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-500 shadow-sm"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setAddingCardTo(column.id)}
                    className="flex w-full items-center justify-center gap-1 rounded-lg p-2 text-sm text-neutral-500 dark:text-neutral-400 transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <title>Add</title>
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add a card
                  </button>
                ))}
            </div>
          </div>
        )
      })}

      {/* Add Column */}
      {!readOnly && (
        <div className="flex flex-col min-w-[280px]">
          {showAddColumn ? (
            <div className="rounded-xl bg-neutral-100 dark:bg-neutral-900 p-3">
              <form onSubmit={handleAddColumn}>
                <input
                  name="columnTitle"
                  placeholder="Enter column title..."
                  className="mb-2 w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="rounded bg-neutral-900 dark:bg-neutral-100 px-3 py-1.5 text-xs font-medium text-white dark:text-neutral-900 transition-colors hover:bg-neutral-800 dark:hover:bg-neutral-200"
                  >
                    Add Column
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddColumn(false)}
                    className="rounded p-1.5 text-neutral-500 dark:text-neutral-400 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100"
                    aria-label="Cancel"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <title>Cancel</title>
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddColumn(true)}
              className="flex w-full items-center justify-center gap-1 rounded-xl bg-neutral-100 dark:bg-neutral-900 p-3 text-sm font-medium text-neutral-500 dark:text-neutral-400 transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-800"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <title>Add</title>
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add column
            </button>
          )}
        </div>
      )}
    </div>
  )
}
