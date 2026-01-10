import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import * as React from 'react'

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExport: () => Promise<string | null>
  boardTitle: string
}

export function ExportDialog({ open, onOpenChange, onExport, boardTitle }: ExportDialogProps) {
  const [exporting, setExporting] = React.useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const data = await onExport()
      if (!data) return

      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${boardTitle.replace(/\s+/g, '-')}-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      onOpenChange(false)
    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      setExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Board</DialogTitle>
          <DialogDescription>Download your board data as JSON file.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-md bg-muted p-3 text-sm">
            <p className="font-semibold">What's included:</p>
            <ul className="mt-1 list-inside list-disc space-y-1 text-muted-foreground">
              <li>All columns and cards</li>
              <li>Board title and structure</li>
              <li>Timestamps for all items</li>
            </ul>
          </div>

          <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
            <p>You can import this file later to restore or duplicate the board.</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={exporting}>
            {exporting ? 'Exporting...' : 'Export'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
