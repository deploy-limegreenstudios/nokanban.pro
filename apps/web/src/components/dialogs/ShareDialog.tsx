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

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  boardName: string
}

export function ShareDialog({ open, onOpenChange, boardName }: ShareDialogProps) {
  const [copied, setCopied] = React.useState(false)
  const shareUrl = `${window.location.origin}/board/${boardName}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Board</DialogTitle>
          <DialogDescription>
            Share this URL with others. They'll need the PIN to edit the board.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="share-url">Board URL</Label>
            <div className="flex gap-2">
              <Input id="share-url" value={shareUrl} readOnly className="flex-1" />
              <Button onClick={handleCopy} variant="outline">
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>

          <div className="rounded-md bg-muted p-3 text-sm">
            <p className="font-semibold">Important:</p>
            <ul className="mt-1 list-inside list-disc space-y-1 text-muted-foreground">
              <li>Keep your PIN secure</li>
              <li>Only share with trusted collaborators</li>
              <li>Boards are deleted after 30 days of inactivity</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
