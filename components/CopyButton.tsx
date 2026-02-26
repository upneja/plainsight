'use client'
import { useState } from 'react'

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard access denied or unavailable
    }
  }

  return (
    <button
      onClick={copy}
      className="text-xs px-3 py-1.5 rounded border border-border bg-bg-secondary hover:bg-border transition-colors text-text-secondary"
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  )
}
