'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

type Stage = 'idle' | 'extracting' | 'analyzing' | 'checking' | 'building' | 'error'

const STAGE_MESSAGES: Record<Stage, string> = {
  idle: '',
  extracting: 'Extracting text from document...',
  analyzing: 'Analyzing clauses...',
  checking: 'Checking for missing protections...',
  building: 'Building your report...',
  error: '',
}

const ERROR_MESSAGES: Record<string, string> = {
  FILE_TOO_LARGE: 'This file is too large. Please upload a file under 10MB.',
  PDF_UNREADABLE: "We couldn't read this PDF. It may be a scanned image without text. Try a text-based PDF or .txt file.",
  UNSUPPORTED_FORMAT: 'Unsupported file type. Please upload a PDF or TXT file.',
  DOCUMENT_TOO_SHORT: "This document seems too short to be a contract. Please upload the full agreement.",
  ANALYSIS_FAILED: 'Our analysis engine is temporarily unavailable. Please try again in a few minutes.',
  DEFAULT: 'Something went wrong. Please try again.',
}

export function FileDropzone() {
  const router = useRouter()
  const [stage, setStage] = useState<Stage>('idle')
  const [errorCode, setErrorCode] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  const handleFile = useCallback(async (file: File) => {
    setErrorCode(null)

    const allowed = [
      'application/pdf',
      'text/plain',
    ]
    if (!allowed.includes(file.type)) {
      setErrorCode('UNSUPPORTED_FORMAT')
      setStage('error')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorCode('FILE_TOO_LARGE')
      setStage('error')
      return
    }

    setStage('extracting')
    await new Promise(r => setTimeout(r, 800))
    setStage('analyzing')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/scan', { method: 'POST', body: formData })
      let data: { id?: string; error?: string }
      try {
        data = await res.json()
      } catch {
        setErrorCode('DEFAULT')
        setStage('error')
        return
      }

      if (!res.ok) {
        setErrorCode(data.error ?? 'DEFAULT')
        setStage('error')
        return
      }

      setStage('checking')
      await new Promise(r => setTimeout(r, 500))
      setStage('building')
      await new Promise(r => setTimeout(r, 500))

      router.push(`/scan/${data.id}`)
    } catch {
      setErrorCode('DEFAULT')
      setStage('error')
    }
  }, [router])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const isLoading = stage !== 'idle' && stage !== 'error'

  return (
    <div className="w-full max-w-2xl mx-auto">
      <label
        onDrop={onDrop}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        className={[
          'block border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all',
          dragging ? 'border-accent bg-accent-light scale-[1.02]' : 'border-border bg-bg-secondary hover:border-accent hover:bg-accent-light',
          isLoading ? 'pointer-events-none' : '',
        ].join(' ')}
      >
        <input
          type="file"
          className="sr-only"
          accept=".pdf,.txt"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          disabled={isLoading}
        />

        {isLoading ? (
          <div className="space-y-4">
            <div className="text-4xl animate-pulse">📄</div>
            <p className="text-text-secondary font-medium">{STAGE_MESSAGES[stage]}</p>
            <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-700"
                style={{ width: stage === 'extracting' ? '25%' : stage === 'analyzing' ? '55%' : stage === 'checking' ? '80%' : '95%' }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-5xl">📋</div>
            <p className="text-xl font-medium text-text-primary">Drop your contract here</p>
            <p className="text-text-muted text-sm">PDF or TXT · Max 10MB</p>
            <span className="inline-block mt-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium">
              Browse files
            </span>
          </div>
        )}
      </label>

      {stage === 'error' && (
        <div className="mt-4 p-4 bg-risk-red-bg border border-risk-red/20 rounded-xl text-risk-red text-sm">
          {ERROR_MESSAGES[errorCode ?? 'DEFAULT'] ?? ERROR_MESSAGES.DEFAULT}
        </div>
      )}
    </div>
  )
}
