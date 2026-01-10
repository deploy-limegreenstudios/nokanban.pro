import type { ReactNode } from 'react'
import type { IconType } from 'react-icons'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  loading?: boolean
  disabled?: boolean
  icon?: IconType
  variant?: 'primary' | 'secondary'
  className?: string
}

export function Button({
  children,
  loading = false,
  disabled = false,
  icon: Icon,
  variant = 'primary',
  type = 'button',
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses =
    'px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 justify-center'

  const variantClasses =
    variant === 'primary'
      ? 'bg-neutral-200 hover:bg-white text-neutral-950 disabled:bg-neutral-100 disabled:text-neutral-400 dark:bg-neutral-200 dark:hover:bg-white dark:text-neutral-950'
      : 'bg-neutral-900 hover:bg-neutral-950 text-neutral-100 disabled:bg-neutral-800 disabled:text-neutral-500 dark:bg-neutral-900 dark:hover:bg-neutral-950 dark:text-neutral-100'

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {loading ? <AiOutlineLoading3Quarters className="animate-spin" /> : Icon ? <Icon /> : null}
      {children}
    </button>
  )
}
