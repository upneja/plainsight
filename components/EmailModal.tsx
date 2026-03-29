'use client'
import { useState, useEffect } from 'react'
import type { ClauseAnalysis, GhostClause, ScanResult } from '@/lib/types'
import { CopyButton } from '@/components/CopyButton'

type Props = {
  selectedClauses: ClauseAnalysis[]
  selectedGhosts: GhostClause[]
  scan: ScanResult
  onClose: () => void
}

export function EmailModal({ selectedClauses, selectedGhosts, scan, onClose }: Props) {
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading')
  const [email, setEmail] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const totalSelected = selectedClauses.length + selectedGhosts.length

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    setEmail('')

    async function generate() {
      try {
        const res = await fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            selectedClauses,
            selectedGhosts,
            scan: {
              contract_type: scan.contract_type,
              detected_party_side: scan.detected_party_side,
              jurisdiction: scan.jurisdiction,
            },
          }),
        })
        if (!res.ok) throw new Error('Failed')
        const data = await res.json()
        const text = data?.email
        if (typeof text !== 'string' || !text) throw new Error('Empty response')
        if (!cancelled) {
          setEmail(text)
          setStatus('done')
        }
      } catch {
        if (!cancelled) setStatus('error')
      }
    }

    generate()
    return () => { cancelled = true }
  }, [retryCount, selectedClauses, selectedGhosts, scan.contract_type, scan.detected_party_side, scan.jurisdiction])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdrop}
    >
      <div
        className="bg-bg-document border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="email-modal-title"
        tabIndex={-1}
        autoFocus
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 id="email-modal-title" className="font-semibold text-text-primary">✉ Negotiation Email Draft</h2>
            <p className="text-xs text-text-muted mt-0.5">
              {totalSelected} issue{totalSelected !== 1 ? 's' : ''} addressed
            </p>
          </div>
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-bg-secondary text-text-muted hover:text-text-primary transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="text-4xl animate-pulse">✉</div>
              <p className="text-text-secondary text-sm">Drafting your negotiation email...</p>
              <p className="text-text-muted text-xs">This takes about 5 seconds</p>
            </div>
          )}
          {status === 'error' && (
            <div className="text-center py-16">
              <p className="text-risk-red text-sm mb-3">Something went wrong generating the email.</p>
              <button
                type="button"
                aria-label="Retry generating email"
                onClick={() => setRetryCount(c => c + 1)}
                className="text-xs text-accent hover:underline"
              >
                Try again
              </button>
            </div>
          )}
          {status === 'done' && (
            <pre className="font-sans text-sm text-text-primary whitespace-pre-wrap leading-relaxed">
              {email}
            </pre>
          )}
        </div>

        {/* Footer */}
        {status === 'done' && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-bg-secondary rounded-b-2xl">
            <p className="text-xs text-text-muted">Review and personalize before sending</p>
            <CopyButton text={email} />
          </div>
        )}
      </div>
    </div>
  )
}
