import { PinPromptDialog } from '@/components/dialogs/PinPromptDialog'
import { ShareDialog } from '@/components/dialogs/ShareDialog'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { Button } from '@/components/ui/button'
import { useSharedBoard } from '@/hooks/useSharedBoard'
import * as React from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export function SharedBoard() {
  const { name } = useParams<{ name: string }>()
  const navigate = useNavigate()
  const [showShare, setShowShare] = React.useState(false)
  const [showPinPrompt, setShowPinPrompt] = React.useState(false)
  const [pinError, setPinError] = React.useState<string | null>(null)

  const {
    data,
    loading,
    error,
    isPinSet,
    setPin,
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
  } = useSharedBoard(name || '')

  const handlePinSubmit = (pin: string) => {
    setPinError(null)
    try {
      setPin(pin)
      setShowPinPrompt(false)
    } catch (err) {
      setPinError(err instanceof Error ? err.message : 'Invalid PIN')
    }
  }

  const handleDeleteBoard = async () => {
    if (confirm('Delete this board? This cannot be undone.')) {
      try {
        await deleteBoard()
        navigate('/')
      } catch (err) {
        setPinError(err instanceof Error ? err.message : 'Failed to delete board')
      }
    }
  }

  const handleEdit = () => {
    if (!isPinSet) {
      setShowPinPrompt(true)
    }
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
            <h1 className="text-xl font-semibold">{data.title}</h1>
            <span className="rounded bg-muted px-2 py-1 text-xs">Shared</span>
            {isPinSet && (
              <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-700">
                Unlocked
              </span>
            )}
          </div>

          <div className="flex gap-2">
            {!isPinSet && (
              <Button variant="outline" onClick={handleEdit}>
                Unlock to Edit
              </Button>
            )}
            <Button variant="outline" onClick={() => setShowShare(true)}>
              Share
            </Button>
            {isPinSet && (
              <Button variant="destructive" onClick={handleDeleteBoard}>
                Delete
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Board */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          columns={data.columns}
          onAddColumn={isPinSet ? createColumn : undefined}
          onUpdateColumnTitle={isPinSet ? updateColumnTitle : undefined}
          onDeleteColumn={isPinSet ? deleteColumn : undefined}
          onReorderColumns={isPinSet ? reorderColumns : undefined}
          onAddCard={isPinSet ? createCard : undefined}
          onUpdateCard={isPinSet ? updateCardContent : undefined}
          onDeleteCard={isPinSet ? deleteCard : undefined}
          onMoveCard={isPinSet ? moveCard : undefined}
          onReorderCards={isPinSet ? reorderCards : undefined}
          readOnly={!isPinSet}
        />
      </div>

      <ShareDialog open={showShare} onOpenChange={setShowShare} boardName={name || ''} />

      <PinPromptDialog
        open={showPinPrompt}
        onOpenChange={setShowPinPrompt}
        onSubmit={handlePinSubmit}
        error={pinError || undefined}
      />
    </div>
  )
}
