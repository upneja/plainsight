'use client'
import { useState } from 'react'
import { ClauseAnalysis } from '@/lib/types'
import { RiskBadge } from '@/components/RiskBadge'
import { CopyButton } from '@/components/CopyButton'

function ClauseCard({ clause }: { clause: ClauseAnalysis }) {
  const [open, setOpen] = useState(false)

  const bgColor =
    clause.risk_level === 'red'
      ? 'border-risk-red/30 bg-risk-red-bg/30'
      : clause.risk_level === 'yellow'
      ? 'border-risk-yellow/30 bg-risk-yellow-bg/30'
      : 'border-border bg-bg-document'

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${bgColor}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left p-4 flex items-center gap-3"
      >
        <RiskBadge level={clause.risk_level} showLabel={false} />
        <span className="text-xs text-text-muted uppercase tracking-wide bg-bg-secondary px-2 py-0.5 rounded-full shrink-0">
          {clause.category.replace(/_/g, ' ')}
        </span>
        <span className="text-sm text-text-primary flex-1 truncate">{clause.plain_english}</span>
        <span className="text-text-muted text-xs shrink-0">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-border/50 pt-4">
          {/* Original text */}
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Original Language</p>
            <pre className="font-mono text-xs text-text-secondary bg-bg-secondary rounded-lg p-4 whitespace-pre-wrap leading-relaxed">
              {clause.original_text}
            </pre>
          </div>

          {/* Plain English */}
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Plain English</p>
            <p className="text-sm text-text-primary leading-relaxed">{clause.plain_english}</p>
          </div>

          {/* Risk */}
          <div className="flex items-center gap-3">
            <RiskBadge level={clause.risk_level} />
            <span className="text-xs text-text-muted">Risk score: {clause.risk_score}/100</span>
          </div>

          {/* Benchmark */}
          {clause.benchmark_note && (
            <div className="bg-accent-light border border-accent/20 rounded-lg p-3">
              <p className="text-xs font-semibold text-accent mb-1">📊 Benchmark</p>
              <p className="text-xs text-text-secondary">{clause.benchmark_note}</p>
            </div>
          )}

          {/* Concern */}
          {clause.concern && (
            <div className={`rounded-lg p-3 ${
              clause.risk_level === 'red'
                ? 'bg-risk-red-bg border border-risk-red/20'
                : 'bg-risk-yellow-bg border border-risk-yellow/20'
            }`}>
              <p className={`text-xs font-semibold mb-1 ${
                clause.risk_level === 'red' ? 'text-risk-red' : 'text-risk-yellow'
              }`}>
                ⚠ Watch out
              </p>
              <p className="text-xs text-text-secondary">{clause.concern}</p>
            </div>
          )}

          {/* Negotiation ammo */}
          {clause.negotiation_ammo && (
            <div className="bg-bg-secondary border border-border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-text-secondary">💬 Pushback Message</p>
                <CopyButton text={clause.negotiation_ammo} />
              </div>
              <p className="text-xs text-text-secondary italic leading-relaxed">{clause.negotiation_ammo}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

type Filter = 'all' | 'red' | 'yellow_red'

export function ClausesTab({ clauses }: { clauses: ClauseAnalysis[] }) {
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = clauses.filter(c => {
    if (filter === 'red') return c.risk_level === 'red'
    if (filter === 'yellow_red') return c.risk_level !== 'green'
    return true
  })

  const filters: { id: Filter; label: string }[] = [
    { id: 'all', label: `All (${clauses.length})` },
    { id: 'yellow_red', label: `⚠ Yellow + Red (${clauses.filter(c => c.risk_level !== 'green').length})` },
    { id: 'red', label: `🔴 Red only (${clauses.filter(c => c.risk_level === 'red').length})` },
  ]

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              filter === f.id
                ? 'bg-text-primary text-white border-text-primary'
                : 'bg-bg-secondary border-border text-text-secondary hover:border-text-primary'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(clause => (
          <ClauseCard key={clause.id} clause={clause} />
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-text-muted py-8">No clauses match this filter.</p>
        )}
      </div>
    </div>
  )
}
