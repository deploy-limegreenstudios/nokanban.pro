import { useContext } from 'react'
import { ThemeContext } from '../components/common/Theme'

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function useTheme(): any {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }

  return context
}
