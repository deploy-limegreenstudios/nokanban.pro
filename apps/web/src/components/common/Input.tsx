import type { ChangeEvent, FocusEvent } from 'react'

interface InputProps {
  label?: string
  error?: string
  name: string
  type?: string
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={props.name}
          className="text-sm font-medium text-neutral-950 dark:text-neutral-100"
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={props.name}
        className={`
          px-3 py-2 rounded-lg border
          bg-neutral-100 dark:bg-neutral-900
          border-neutral-200 dark:border-neutral-800
          text-neutral-950 dark:text-neutral-100
          placeholder:text-neutral-500 dark:placeholder:text-neutral-500
          focus:outline-none focus:ring-2 focus:ring-neutral-950 dark:focus:ring-neutral-100
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  )
}
