import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center text-center px-6">
      <div>
        <p className="text-6xl mb-6">📋</p>
        <h1 className="font-serif text-3xl font-bold mb-4">Page not found</h1>
        <p className="text-text-secondary mb-8">That scan may have expired or doesn&apos;t exist.</p>
        <Link
          href="/"
          className="px-6 py-3 bg-accent text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          Back to PlainSight
        </Link>
      </div>
    </div>
  )
}
