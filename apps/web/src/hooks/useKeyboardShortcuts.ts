import { useEffect } from 'react'

interface KeyboardShortcutsOptions {
  onCreateTask?: () => void
  onShare?: () => void
}

export function useKeyboardShortcuts({ onCreateTask, onShare }: KeyboardShortcutsOptions) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Shift + A: Create task
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault()
        onCreateTask?.()
      }

      // Cmd/Ctrl + Shift + S: Share
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault()
        onShare?.()
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onCreateTask, onShare])
}
