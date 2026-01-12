import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import * as React from 'react'

interface ColumnDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  columnTitle: string
  cardCount: number
  onConfirmDelete: () => void
}

export function ColumnDeleteDialog({
  open,
  onOpenChange,
  columnTitle,
  cardCount,
  onConfirmDelete,
}: ColumnDeleteDialogProps) {
  const [confirmText, setConfirmText] = React.useState('')
  const isValid = confirmText === 'DELETE'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (cardCount === 0 || isValid) {
      onConfirmDelete()
      onOpenChange(false)
      setConfirmText('')
    }
  }

  React.useEffect(() => {
    if (!open) {
      setConfirmText('')
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Column</DialogTitle>
          <DialogDescription>
            {cardCount === 0
              ? `Are you sure you want to delete "${columnTitle}"?`
              : `This will delete "${columnTitle}" and all ${cardCount} card${cardCount > 1 ? 's' : ''} inside it.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {cardCount > 0 && (
              <div className="space-y-2">
                <Label htmlFor="confirm-delete">
                  Type <span className="font-bold text-destructive">DELETE</span> to confirm
                </Label>
                <Input
                  id="confirm-delete"
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                  placeholder="DELETE"
                  autoFocus
                  className="font-mono"
                />
              </div>
            )}

            <div className="rounded-md bg-destructive/10 p-3 text-sm">
              <p className="font-semibold text-destructive">Warning:</p>
              <p className="text-muted-foreground mt-1">
                {cardCount === 0
                  ? 'This action cannot be undone.'
                  : `This will permanently delete all ${cardCount} card${cardCount > 1 ? 's' : ''} in this column. This action cannot be undone.`}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                setConfirmText('')
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={cardCount > 0 && !isValid}>
              Delete Column
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
