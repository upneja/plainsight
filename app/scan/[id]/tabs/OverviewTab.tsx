import Link from 'next/link'
import { ScanResult } from '@/lib/types'
import { GradeBadge } from '@/components/GradeBadge'
import { RiskMeter } from '@/components/RiskMeter'

const CONTRACT_LABELS: Record<string, string> = {
  lease: 'Lease',
  employment: 'Employment',
  nda: 'NDA',
  freelancer: 'Freelancer',
  tos: 'Terms of Service',
  other: 'Contract',
}

export function OverviewTab({ scan }: { scan: ScanResult }) {
  const total = scan.clauses.length
  const red = scan.clauses.filter(c => c.risk_level === 'red').length
  const yellow = scan.clauses.filter(c => c.risk_level === 'yellow').length
  const green = scan.clauses.filter(c => c.risk_level === 'green').length

  return (
    <div className="max-w-3xl space-y-8">
      {/* TL;DR Card */}
      <div className="bg-bg-document border border-border rounded-2xl p-8 shadow-sm">
        <div className="flex items-start justify-between gap-6 mb-6">
          <div>
            <h2 className="font-serif text-2xl font-bold mb-1">Summary</h2>
            <p className="text-text-secondary text-sm capitalize">
              {CONTRACT_LABELS[scan.contract_type] ?? scan.contract_type} · {scan.jurisdiction}
            </p>
          </div>
          <GradeBadge grade={scan.overall_grade} size="lg" />
        </div>

        <p className="text-text-secondary leading-relaxed mb-6">{scan.tldr_summary}</p>

        <div className="mb-6">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Overall Risk</p>
          <RiskMeter score={scan.overall_risk_score} />
        </div>

        <Link
          href={`/scan/${scan.id}/share`}
          className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
        >
          Share this summary →
        </Link>
      </div>

      {/* Top concerns */}
      <div>
        <h3 className="font-semibold text-lg mb-4">Top Concerns</h3>
        <div className="space-y-3">
          {scan.top_concerns.map((concern, i) => (
            <div key={i} className="flex gap-3 bg-risk-red-bg border border-risk-red/20 rounded-xl p-4">
              <span className="text-risk-red font-bold text-sm mt-0.5 shrink-0">{i + 1}</span>
              <p className="text-sm text-text-primary">{concern}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Risk distribution */}
      <div>
        <h3 className="font-semibold text-lg mb-4">Risk Distribution</h3>
        <div className="bg-bg-document border border-border rounded-xl p-6">
          <div className="flex rounded-full overflow-hidden h-4 mb-4">
            {green > 0 && <div className="bg-risk-green" style={{ width: `${(green / total) * 100}%` }} />}
            {yellow > 0 && <div className="bg-risk-yellow" style={{ width: `${(yellow / total) * 100}%` }} />}
            {red > 0 && <div className="bg-risk-red" style={{ width: `${(red / total) * 100}%` }} />}
          </div>
          <div className="flex gap-6 text-sm">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-risk-green inline-block" />{green} low risk
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-risk-yellow inline-block" />{yellow} medium
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-risk-red inline-block" />{red} high risk
            </span>
          </div>
        </div>
      </div>

      {/* Ghost clauses summary */}
      {scan.ghost_clauses.length > 0 && (
        <div className="bg-ghost-bg border border-ghost/20 rounded-xl p-6">
          <h3 className="font-semibold text-ghost mb-2">
            👻 {scan.ghost_clauses.length} Missing Clause{scan.ghost_clauses.length !== 1 ? 's' : ''}
          </h3>
          <div className="space-y-1">
            {scan.ghost_clauses.map(g => (
              <div key={g.id} className="flex items-center gap-2 text-sm text-text-secondary">
                <span className={`w-1.5 h-1.5 rounded-full inline-block ${
                  g.severity === 'high' ? 'bg-risk-red' : g.severity === 'medium' ? 'bg-risk-yellow' : 'bg-text-muted'
                }`} />
                {g.title}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
