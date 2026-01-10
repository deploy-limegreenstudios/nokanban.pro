import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import * as React from 'react'

interface ImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (jsonData: string) => Promise<void>
}

export function ImportDialog({ open, onOpenChange, onImport }: ImportDialogProps) {
  const [importing, setImporting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    setError(null)

    try {
      const text = await file.text()
      JSON.parse(text) // Validate JSON
      await onImport(text)
      onOpenChange(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid board data')
    } finally {
      setImporting(false)
    }
  }

  const handleClose = () => {
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Board</DialogTitle>
          <DialogDescription>Import a board from a JSON file.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="import-file">Select JSON file</Label>
            <input
              ref={fileInputRef}
              id="import-file"
              type="file"
              accept=".json,application/json"
              onChange={handleFileSelect}
              disabled={importing}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="rounded-md bg-muted p-3 text-sm">
            <p className="font-semibold">Import notes:</p>
            <ul className="mt-1 list-inside list-disc space-y-1 text-muted-foreground">
              <li>Only JSON files exported from nokanban.pro are supported</li>
              <li>A new board will be created with imported data</li>
              <li>Original IDs and timestamps will be regenerated</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={importing}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
