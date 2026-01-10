import { cn } from '@/lib/utils'
import * as React from 'react'

interface PopoverContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const PopoverContext = React.createContext<PopoverContextValue | undefined>(undefined)

function usePopover() {
  const context = React.useContext(PopoverContext)
  if (!context) {
    throw new Error('Popover components must be used within PopoverRoot')
  }
  return context
}

export function PopoverRoot({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)

  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </PopoverContext.Provider>
  )
}

export function PopoverTrigger({ children }: { children: React.ReactNode }) {
  const { open, setOpen } = usePopover()

  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className="inline-flex items-center justify-center"
    >
      {children}
    </button>
  )
}

export function PopoverContent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const { open, setOpen } = usePopover()
  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return

    function handleClickOutside(event: MouseEvent) {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, setOpen])

  if (!open) return null

  return (
    <div
      ref={contentRef}
      className={cn(
        'absolute right-0 top-full mt-2 z-50',
        'bg-neutral-800 rounded-lg shadow-lg border border-neutral-700',
        'min-w-[200px] p-2',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function PopoverHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 py-2 font-semibold text-sm text-white border-b border-neutral-700 mb-1">
      {children}
    </div>
  )
}

export function PopoverBody({
  children,
  className,
}: { children: React.ReactNode; className?: string }) {
  return <div className={cn('p-1', className)}>{children}</div>
}

export function PopoverButton({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick?: () => void
}) {
  const { setOpen } = usePopover()

  const handleClick = () => {
    onClick?.()
    setOpen(false)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white rounded-md hover:bg-neutral-700 transition-colors text-left"
    >
      {children}
    </button>
  )
}

export function PopoverCloseButton() {
  const { setOpen } = usePopover()

  return (
    <button
      type="button"
      onClick={() => setOpen(false)}
      className="rounded bg-neutral-700 px-3 py-1.5 text-sm text-white hover:bg-neutral-600 transition-colors"
    >
      Close
    </button>
  )
}

export function PopoverFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end gap-2 p-2 border-t border-neutral-700 mt-2">{children}</div>
  )
}

// Form-specific components (optional, for future use)
export function PopoverForm({
  children,
  onSubmit,
}: {
  children: React.ReactNode
  onSubmit: (value: string) => void
}) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const value = formData.get('input') as string
    onSubmit(value)
  }

  return <form onSubmit={handleSubmit}>{children}</form>
}

export function PopoverLabel({ children }: { children: React.ReactNode }) {
  return <label className="block px-3 py-2 text-sm font-medium text-white">{children}</label>
}

export function PopoverTextarea() {
  return (
    <textarea
      name="input"
      className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
      rows={4}
    />
  )
}

export function PopoverSubmitButton() {
  return (
    <button
      type="submit"
      className="rounded bg-orange-500 px-3 py-1.5 text-sm text-white hover:bg-orange-600 transition-colors"
    >
      Submit
    </button>
  )
}
