import { ExportDialog } from '@/components/dialogs/ExportDialog'
import { ImportDialog } from '@/components/dialogs/ImportDialog'
import { PinPromptDialog } from '@/components/dialogs/PinPromptDialog'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { Button } from '@/components/ui/button'
import {
  PopoverBody,
  PopoverButton,
  PopoverContent,
  PopoverHeader,
  PopoverRoot,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useLocalBoard } from '@/hooks/useLocalBoard'
import { useTheme } from '@/hooks/useTheme'
import { db } from '@/lib/db'
import { boardService } from '@/services/board.service'
import { Download, Moon, MoreVertical, Plus, Sun, Upload } from 'lucide-react'
import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { ulid } from 'ulid'

const DEFAULT_BOARD_ID = 'home-board'

export function Home() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [showShare, setShowShare] = React.useState(false)
  const [showPinPrompt, setShowPinPrompt] = React.useState(false)
  const [showImport, setShowImport] = React.useState(false)
  const [showExport, setShowExport] = React.useState(false)
  const [shareData, setShareData] = React.useState<{ name: string; title: string } | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [isInitialized, setIsInitialized] = React.useState(false)
  const [editingTitle, setEditingTitle] = React.useState(false)

  const {
    data,
    loading,
    updateBoardTitle,
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
    refresh,
  } = useLocalBoard(DEFAULT_BOARD_ID)

  // Initialize default board with 3 columns on mount
  React.useEffect(() => {
    const initBoard = async () => {
      const existing = await db.boards.get(DEFAULT_BOARD_ID)
      if (!existing) {
        const now = new Date()
        await db.boards.add({
          id: DEFAULT_BOARD_ID,
          name: 'home',
          title: 'My Kanban Board',
          createdAt: now,
          updatedAt: now,
        })

        // Create default 3 columns: To-do, In Progress, Done
        await db.columns.bulkAdd([
          {
            id: ulid(),
            boardId: DEFAULT_BOARD_ID,
            title: 'To-do',
            position: 0,
            createdAt: now,
            updatedAt: now,
          },
          {
            id: ulid(),
            boardId: DEFAULT_BOARD_ID,
            title: 'In Progress',
            position: 1,
            createdAt: now,
            updatedAt: now,
          },
          {
            id: ulid(),
            boardId: DEFAULT_BOARD_ID,
            title: 'Done',
            position: 2,
            createdAt: now,
            updatedAt: now,
          },
        ])

        // Refresh the hook to load the newly created board
        refresh()
      }
      setIsInitialized(true)
    }
    initBoard()
  }, [refresh])

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onCreateTask: () => {
      // Focus first column's "add card" button
      if (data && data.columns.length > 0) {
        // Trigger add card for first column
        const firstColumn = data.columns[0]
        if (firstColumn) {
          createCard(firstColumn.id, '')
        }
      }
    },
    onShare: () => {
      handleShare()
    },
  })

  const handleShare = () => {
    if (!data) return
    setShowShare(true)
  }

  const handleShareSubmit = (name: string, title: string) => {
    setShareData({ name, title })
    setShowShare(false)
    setShowPinPrompt(true)
  }

  const handlePinSubmit = async (pin: string) => {
    if (!shareData || !data) return

    try {
      // Create shared board on server
      await boardService.createBoard(shareData.name, shareData.title, pin)

      // Upload columns and cards
      boardService.setPin(pin)
      for (const col of data.columns) {
        const newCol = await boardService.createColumn(shareData.name, col.title, col.position)
        for (const card of col.cards) {
          await boardService.createCard(shareData.name, newCol.id, card.content, card.position)
        }
      }

      // Navigate to shared board
      navigate(`/board/${shareData.name}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share board')
      setShowPinPrompt(false)
    }
  }

  const handleImport = async (jsonData: string) => {
    try {
      await importBoard(jsonData)
      setShowImport(false)
      refresh()
    } catch {
      throw new Error('Failed to import board')
    }
  }

  const handleUpdateTitle = (title: string) => {
    if (title.trim()) {
      updateBoardTitle(title.trim())
    }
    setEditingTitle(false)
  }

  if (!isInitialized || loading || !data) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-background self-center mt-4 shadow-2xl/20 shadow-neutral-400 w-[80vw] rounded-3xl ">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4 ">
            <h1 className="text-xl font-bold">nokanban.pro</h1>
          </div>

          <div className="flex gap-2 items-center">
            <button
              onClick={toggleTheme}
              type="button"
              className="w-10 h-10 rounded-full border-2 border-neutral-300 dark:border-neutral-700 flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              ) : (
                <Moon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              )}
            </button>
          </div>
        </div>
        {error && (
          <div className="border-t bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
      </header>

      {/* Board */}
      <div className="flex-1 overflow-hidden flex flex-col items-center">
        <div className="w-full max-w-[80%] flex flex-col h-full">
          <div className="w-full flex flex-row items-center">
            {editingTitle ? (
              <input
                defaultValue={data.board.title}
                className="w-full text-3xl font-bold tracking-wider text-start py-8 text-foreground bg-transparent border-none outline-none focus:ring-0"
                onBlur={(e) => handleUpdateTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleUpdateTitle(e.currentTarget.value)
                  } else if (e.key === 'Escape') {
                    setEditingTitle(false)
                  }
                }}
              />
            ) : (
              <div className="w-full flex flex-row justify-between items-center">
                <h1
                  className="text-3xl font-bold tracking-wider text-start py-8 text-foreground cursor-pointer hover:opacity-70 transition-opacity"
                  onDoubleClick={() => setEditingTitle(true)}
                >
                  {data.board.title}
                </h1>
              </div>
            )}

            <div className="flex flex-row gap-2">
              <Button onClick={handleShare} variant="default">
                Share
              </Button>
              <PopoverRoot>
                <PopoverTrigger>
                  <button
                    className="w-10 h-10 rounded-full border-2 border-neutral-300 dark:border-neutral-700 flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    type="button"
                  >
                    <MoreVertical className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                  </button>
                </PopoverTrigger>
                <PopoverContent>
                  <PopoverHeader>Quick Actions</PopoverHeader>
                  <PopoverBody>
                    <PopoverButton onClick={() => setShowImport(true)}>
                      <Upload className="w-4 h-4" />
                      <span>Import</span>
                    </PopoverButton>
                    <PopoverButton onClick={() => setShowExport(true)}>
                      <Download className="w-4 h-4" />
                      <span>Export</span>
                    </PopoverButton>
                    <PopoverButton onClick={() => createColumn('New Column')}>
                      <Plus className="w-4 h-4" />
                      <span>New Column</span>
                    </PopoverButton>
                  </PopoverBody>
                </PopoverContent>
              </PopoverRoot>
            </div>
          </div>

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
        </div>
      </div>

      {/* Share Dialog - Step 1: Enter name and title */}
      {showShare && (
        <ShareBoardDialog
          open={showShare}
          onOpenChange={setShowShare}
          onSubmit={handleShareSubmit}
          defaultTitle={data.board.title}
        />
      )}

      {/* PIN Prompt - Step 2: Create PIN */}
      <PinPromptDialog
        open={showPinPrompt}
        onOpenChange={setShowPinPrompt}
        onSubmit={handlePinSubmit}
        error={error || undefined}
      />

      <ImportDialog open={showImport} onOpenChange={setShowImport} onImport={handleImport} />

      <ExportDialog
        open={showExport}
        onOpenChange={setShowExport}
        onExport={exportBoard}
        boardTitle={data.board.title}
      />
    </div>
  )
}

// Share Board Dialog Component
function ShareBoardDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultTitle,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (name: string, title: string) => void
  defaultTitle: string
}) {
  const [name, setName] = React.useState('')
  const [title, setTitle] = React.useState(defaultTitle)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() && title.trim()) {
      onSubmit(name.trim(), title.trim())
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? 'flex' : 'hidden'} items-center justify-center`}
      onClick={() => onOpenChange(false)}
      onKeyDown={(e) => e.key === 'Escape' && onOpenChange(false)}
    >
      <div className="fixed inset-0 bg-black/50" />
      <div
        className="relative z-50 w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <h2 className="mb-2 text-lg font-semibold">Share Board</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Create a shared board from your local board. Choose a unique name.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="board-name" className="text-sm font-medium">
              Board Name (URL)
            </label>
            <input
              id="board-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="my-team-board"
              pattern="[a-z0-9-]{4,50}"
              minLength={4}
              maxLength={50}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <p className="text-xs text-muted-foreground">
              4-50 characters, lowercase letters, numbers, hyphens
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="board-title" className="text-sm font-medium">
              Board Title
            </label>
            <input
              id="board-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Team Board"
              maxLength={100}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="rounded-md bg-muted p-3 text-sm">
            <p className="font-semibold">Next step:</p>
            <p className="text-muted-foreground">
              You'll create a 4-digit PIN to protect this board.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Continue</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
