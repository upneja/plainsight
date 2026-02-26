import { GhostClause, GhostSeverity } from '@/lib/types'

const severityConfig: Record<GhostSeverity, { label: string; color: string }> = {
  high: { label: 'High Priority', color: 'text-risk-red bg-risk-red-bg border-risk-red/20' },
  medium: { label: 'Medium Priority', color: 'text-risk-yellow bg-risk-yellow-bg border-risk-yellow/20' },
  low: { label: 'Low Priority', color: 'text-text-secondary bg-bg-secondary border-border' },
}

function GhostCard({ ghost }: { ghost: GhostClause }) {
  const s = severityConfig[ghost.severity]
  return (
    <div className="border border-dashed border-ghost/40 bg-ghost-bg rounded-xl p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="font-semibold text-ghost">👻 {ghost.title}</h4>
          <span className="text-xs text-text-muted capitalize">{ghost.category.replace(/_/g, ' ')}</span>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full border font-medium shrink-0 ${s.color}`}>
          {s.label}
        </span>
      </div>

      <p className="text-sm text-text-secondary">{ghost.description}</p>

      <div className="bg-white/60 rounded-lg p-4">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Why it matters</p>
        <p className="text-sm text-text-primary">{ghost.why_it_matters}</p>
      </div>

      <div className="border-l-2 border-ghost/30 pl-4">
        <p className="text-xs font-semibold text-ghost uppercase tracking-wide mb-1">Standard version</p>
        <p className="text-xs text-text-secondary italic">{ghost.standard_version}</p>
      </div>
    </div>
  )
}

export function GhostTab({ ghosts }: { ghosts: GhostClause[] }) {
  if (ghosts.length === 0) {
    return (
      <div className="max-w-3xl text-center py-16">
        <div className="text-4xl mb-4">✅</div>
        <p className="font-semibold text-lg mb-2">No missing clauses detected</p>
        <p className="text-text-secondary text-sm">
          This contract appears to cover the standard provisions for its type.
        </p>
      </div>
    )
  }

  const sorted = [...ghosts].sort((a, b) => {
    const order: Record<GhostSeverity, number> = { high: 0, medium: 1, low: 2 }
    return order[a.severity] - order[b.severity]
  })

  return (
    <div className="max-w-3xl space-y-4">
      <p className="text-sm text-text-secondary mb-6">
        These are protections or terms commonly found in this type of contract that are absent here.
      </p>
      {sorted.map(ghost => <GhostCard key={ghost.id} ghost={ghost} />)}
    </div>
  )
}
