import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

function ErrorFallback({ error }: { error?: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
        <p className="text-neutral-400 mb-8">{error?.message || 'An unexpected error occurred'}</p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-neutral-200 text-neutral-950 rounded-lg hover:bg-white transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  )
}

export class GlobalError extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />
    }

    return this.props.children
  }
}
