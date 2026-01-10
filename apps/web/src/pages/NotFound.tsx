import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 text-neutral-950 dark:text-neutral-100">404</h1>
        <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-8">Page not found</p>
        <Link
          to="/"
          className="px-6 py-3 bg-neutral-200 dark:bg-neutral-800 hover:bg-white dark:hover:bg-neutral-950 rounded-lg inline-block text-neutral-950 dark:text-neutral-100 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
