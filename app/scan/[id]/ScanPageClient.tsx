'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ScanResult } from '@/lib/types'
import { GradeBadge } from '@/components/GradeBadge'
import { LegalDisclaimer } from '@/components/LegalDisclaimer'

// Placeholder imports — these will be implemented in Tasks 11-14
import { OverviewTab } from './tabs/OverviewTab'
import { ClausesTab } from './tabs/ClausesTab'
import { GhostTab } from './tabs/GhostTab'
import { TimelineTab } from './tabs/TimelineTab'

type Tab = 'overview' | 'clauses' | 'ghosts' | 'timeline'

export function ScanPageClient({ scan }: { scan: ScanResult }) {
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const redCount = scan.clauses.filter(c => c.risk_level === 'red').length
  const yellowCount = scan.clauses.filter(c => c.risk_level === 'yellow').length
  const greenCount = scan.clauses.filter(c => c.risk_level === 'green').length

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Sticky top bar */}
      <header className="sticky top-0 z-50 bg-bg-primary/95 backdrop-blur border-b border-border px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="font-serif font-bold text-lg text-text-primary shrink-0">PlainSight</Link>
            <span className="text-text-muted shrink-0">/</span>
            <span className="text-sm text-text-secondary truncate">{scan.file_name}</span>
            <span className="px-2 py-0.5 bg-accent-light text-accent text-xs rounded-full font-medium capitalize shrink-0">
              {scan.contract_type === 'tos' ? 'Terms of Service' : scan.contract_type}
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <GradeBadge grade={scan.overall_grade} size="sm" />
              <span className="text-sm text-text-secondary hidden sm:inline">Grade {scan.overall_grade}</span>
            </div>
            {scan.jurisdiction !== 'Not specified' && (
              <span className="text-xs px-2 py-1 bg-bg-secondary border border-border rounded-full text-text-secondary hidden md:inline">
                {scan.jurisdiction}
              </span>
            )}
            <span className="text-xs px-2 py-1 bg-bg-secondary border border-border rounded-full text-text-secondary capitalize hidden md:inline">
              You are: {scan.detected_party_side}
            </span>
            <Link
              href={`/scan/${scan.id}/share`}
              className="text-xs px-3 py-1.5 bg-accent text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Share
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Risk quick stats */}
        <div className="flex items-center gap-4 mb-6 text-sm flex-wrap">
          <span className="flex items-center gap-1.5 text-risk-red">
            <span className="w-2 h-2 rounded-full bg-risk-red inline-block" />
            {redCount} high risk
          </span>
          <span className="flex items-center gap-1.5 text-risk-yellow">
            <span className="w-2 h-2 rounded-full bg-risk-yellow inline-block" />
            {yellowCount} medium risk
          </span>
          <span className="flex items-center gap-1.5 text-risk-green">
            <span className="w-2 h-2 rounded-full bg-risk-green inline-block" />
            {greenCount} low risk
          </span>
          {scan.ghost_clauses.length > 0 && (
            <span className="flex items-center gap-1.5 text-ghost">
              <span>👻</span>
              {scan.ghost_clauses.length} missing clause{scan.ghost_clauses.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Tab navigation */}
        <div className="border-b border-border mb-6">
          <nav className="flex gap-1 md:gap-6 -mb-px overflow-x-auto">
            {([
              { id: 'overview' as const, label: 'Overview' },
              { id: 'clauses' as const, label: `Clauses (${scan.clauses.length})` },
              { id: 'ghosts' as const, label: `👻 Missing (${scan.ghost_clauses.length})` },
              { id: 'timeline' as const, label: `📅 Timeline (${scan.timeline_events.length})` },
            ]).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-2 md:px-0 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-accent text-accent'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        <div>
          {activeTab === 'overview' && <OverviewTab scan={scan} />}
          {activeTab === 'clauses' && <ClausesTab clauses={scan.clauses} />}
          {activeTab === 'ghosts' && <GhostTab ghosts={scan.ghost_clauses} />}
          {activeTab === 'timeline' && <TimelineTab events={scan.timeline_events} />}
        </div>

        <LegalDisclaimer />
      </div>
    </div>
  )
}
