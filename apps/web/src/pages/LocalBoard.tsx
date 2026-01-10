import { ExportDialog } from '@/components/dialogs/ExportDialog'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { Button } from '@/components/ui/button'
import { useLocalBoard } from '@/hooks/useLocalBoard'
import * as React from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export function LocalBoard() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [showExport, setShowExport] = React.useState(false)
  const [editingTitle, setEditingTitle] = React.useState(false)

  const {
    data,
    loading,
    error,
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
  } = useLocalBoard(id || '')

  const handleDeleteBoard = async () => {
    if (confirm('Delete this board? This cannot be undone.')) {
      await deleteBoard()
      navigate('/')
    }
  }

  const handleUpdateTitle = async (newTitle: string) => {
    if (newTitle.trim()) {
      await updateBoardTitle(newTitle.trim())
    }
    setEditingTitle(false)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading board...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error || 'Board not found'}</p>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')}>
              ← Home
            </Button>
            {editingTitle ? (
              <input
                defaultValue={data.board.title}
                className="rounded border px-2 py-1 text-xl font-semibold"
                onBlur={(e) => handleUpdateTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleUpdateTitle(e.currentTarget.value)
                  }
                }}
              />
            ) : (
              <h1 className="text-xl font-semibold" onDoubleClick={() => setEditingTitle(true)}>
                {data.board.title}
              </h1>
            )}
            <span className="rounded bg-muted px-2 py-1 text-xs">Local</span>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowExport(true)}>
              Export
            </Button>
            <Button variant="destructive" onClick={handleDeleteBoard}>
              Delete
            </Button>
          </div>
        </div>
      </header>

      {/* Board */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          columns={data.columns}
          onAddColumn={createColumn}
          onUpdateColumnTitle={updateColumnTitle}
          onDeleteColumn={deleteColumn}
          onReorderColumns={reorderColumns}
          onAddCard={createCard}
          onUpdateCard={updateCardContent}
          onDeleteCard={deleteCard}
          onMoveCard={moveCard}
          onReorderCards={reorderCards}
        />
      </div>

      <ExportDialog
        open={showExport}
        onOpenChange={setShowExport}
        onExport={exportBoard}
        boardTitle={data.board.title}
      />
    </div>
  )
}
