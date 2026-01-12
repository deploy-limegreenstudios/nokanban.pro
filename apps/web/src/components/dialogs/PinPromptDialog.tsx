import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Label } from '@/components/ui/label'
import * as React from 'react'

interface PinPromptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (pin: string) => void
  error?: string
  mode?: 'create' | 'enter'
}

export function PinPromptDialog({
  open,
  onOpenChange,
  onSubmit,
  error,
  mode = 'enter',
}: PinPromptDialogProps) {
  const [pin, setPin] = React.useState('')
  const id = React.useId()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (pin.length === 4 && /^\d{4}$/.test(pin)) {
      onSubmit(pin)
      setPin('')
    }
  }

  // Auto-focus first digit when dialog opens
  React.useEffect(() => {
    if (open) {
      // Small delay to ensure dialog is fully rendered
      const timer = setTimeout(() => {
        // Try to find the actual input element inside the OTP component
        const otpContainer = document.querySelector(`#${id}`)
        if (otpContainer) {
          const firstInput = otpContainer.querySelector('input') as HTMLInputElement
          if (firstInput) {
            firstInput.focus()
          }
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [open, id])

  // Auto-submit when all 4 digits are entered
  React.useEffect(() => {
    if (pin.length === 4 && /^\d{4}$/.test(pin)) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        onSubmit(pin)
        setPin('')
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [pin, onSubmit])

  const title = mode === 'create' ? 'Create PIN' : 'Enter PIN'
  const description =
    mode === 'create'
      ? 'Create a 4-digit PIN to protect your shared board.'
      : 'Enter the 4-digit PIN to edit this board.'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Label htmlFor={id}>PIN</Label>
              <div className="flex justify-center">
                <InputOTP
                  id={id}
                  maxLength={4}
                  value={pin}
                  onChange={(value) => setPin(value.replace(/\D/g, ''))}
                  pattern="[0-9]*"
                  inputMode="numeric"
                >
                  <InputOTPGroup className="gap-3">
                    <InputOTPSlot
                      index={0}
                      className="h-14 w-14 rounded-lg border-2 border-input text-lg font-semibold"
                    />
                    <InputOTPSlot
                      index={1}
                      className="h-14 w-14 rounded-lg border-2 border-input text-lg font-semibold"
                    />
                    <InputOTPSlot
                      index={2}
                      className="h-14 w-14 rounded-lg border-2 border-input text-lg font-semibold"
                    />
                    <InputOTPSlot
                      index={3}
                      className="h-14 w-14 rounded-lg border-2 border-input text-lg font-semibold"
                    />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
            </div>

            <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
              <p>The PIN is required to make any changes to the board.</p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pin.length !== 4}>
              Unlock
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
