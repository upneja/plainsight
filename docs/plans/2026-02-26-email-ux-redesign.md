# Email Draft + UX Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a one-click email draft feature and overhaul the scan results page from a tabbed layout to a single-scroll, action-first design with per-clause checkboxes.

**Architecture:** Three tasks: (1) new `/api/email` endpoint calling Claude with selected clause/ghost data, (2) `EmailModal` component for the generated draft, (3) full rewrite of `ScanPageClient.tsx` eliminating tabs in favor of a single scrollable page with sections, per-item checkboxes, and a sticky "Draft Email" action bar. The three now-orphaned tab files (OverviewTab, ClausesTab, GhostTab) get deleted; `TimelineTab.tsx` is kept.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind v4 (`@theme` in `app/globals.css` — no `tailwind.config.ts`), Anthropic SDK (`@anthropic-ai/sdk`), model `claude-sonnet-4-5-20250929`

---

### Task 1: Email API Endpoint

**Files:**
- Create: `app/api/email/route.ts`

**Context:** Pattern-match the existing `app/api/scan/route.ts` for Anthropic client setup. The endpoint receives full clause/ghost objects (not IDs) so it doesn't need to look up the scan store. `maxDuration = 30` keeps it within Vercel limits.

**Step 1: Create `app/api/email/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { ClauseAnalysis, GhostClause } from '@/lib/types'

const client = new Anthropic()

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { selectedClauses, selectedGhosts, scan } = body as {
      selectedClauses: ClauseAnalysis[]
      selectedGhosts: GhostClause[]
      scan: {
        contract_type: string
        detected_party_side: string
        jurisdiction: string
      }
    }

    if (!selectedClauses?.length && !selectedGhosts?.length) {
      return NextResponse.json({ error: 'NO_ITEMS_SELECTED' }, { status: 400 })
    }

    const clauseLines = selectedClauses.map((c, i) =>
      `${i + 1}. [${c.category.replace(/_/g, ' ')}]\n   Plain English: ${c.plain_english}\n   Concern: ${c.concern ?? 'N/A'}\n   Suggested language: ${c.negotiation_ammo ?? 'N/A'}`
    ).join('\n\n')

    const ghostLines = selectedGhosts.map((g, i) =>
      `${i + 1}. Missing: ${g.title}\n   Why it matters: ${g.why_it_matters}\n   Standard version: ${g.standard_version}`
    ).join('\n\n')

    const prompt = `You are helping a ${scan.detected_party_side} write a professional negotiation email about their ${scan.contract_type} contract${scan.jurisdiction !== 'Not specified' ? ` in ${scan.jurisdiction}` : ''}.

${clauseLines ? `CLAUSES TO ADDRESS:\n${clauseLines}` : ''}${ghostLines ? `\n\nMISSING PROTECTIONS TO REQUEST:\n${ghostLines}` : ''}

Write a single professional email that:
- Opens with a brief, friendly intro referencing reviewing the contract
- Addresses each issue clearly and concisely (be direct, don't repeat every detail)
- Frames each request as a polite question or suggestion, not a demand
- Groups related issues where possible
- Closes professionally
- Is 200-400 words total
- Does NOT include a subject line

Return ONLY the email body text, starting from the salutation (e.g. "Hi [Name],").`

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'GENERATION_FAILED' }, { status: 500 })
    }

    return NextResponse.json({ email: content.text })
  } catch (err) {
    console.error('Email generation error:', err)
    return NextResponse.json({ error: 'GENERATION_FAILED' }, { status: 500 })
  }
}
```

**Step 2: Verify no type errors**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Manual smoke test**

With `npm run dev` running, test with curl:
```bash
curl -s -X POST http://localhost:3000/api/email \
  -H "Content-Type: application/json" \
  -d '{"selectedClauses":[{"id":"c1","category":"entry_access","plain_english":"Landlord can enter any time without notice","concern":"No notice requirement","negotiation_ammo":"Would you add a 24-hour notice requirement?","original_text":"Landlord may enter at any time.","risk_level":"red","risk_score":85,"benchmark_note":null}],"selectedGhosts":[],"scan":{"contract_type":"lease","detected_party_side":"tenant","jurisdiction":"California"}}' | python3 -m json.tool
```
Expected: JSON with `{ "email": "Hi [Name],\n..." }` containing a real draft

---

### Task 2: EmailModal Component

**Files:**
- Create: `components/EmailModal.tsx`

**Context:** `CopyButton` is at `components/CopyButton.tsx` — import and reuse it. The modal fetches on mount and handles loading/error/done states. A `retryCount` state lets the user retry without reopening the modal.

**Step 1: Create `components/EmailModal.tsx`**

```typescript
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
        if (!cancelled) {
          setEmail(data.email)
          setStatus('done')
        }
      } catch {
        if (!cancelled) setStatus('error')
      }
    }

    generate()
    return () => { cancelled = true }
  }, [retryCount]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdrop}
    >
      <div className="bg-bg-document border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="font-semibold text-text-primary">✉ Negotiation Email Draft</h2>
            <p className="text-xs text-text-muted mt-0.5">
              {totalSelected} issue{totalSelected !== 1 ? 's' : ''} addressed
            </p>
          </div>
          <button
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
```

**Step 2: Verify no type errors**

Run: `npx tsc --noEmit`
Expected: No errors

---

### Task 3: Rewrite ScanPageClient — Single Scroll + Checkboxes + Sticky Bar

**Files:**
- Modify: `app/scan/[id]/ScanPageClient.tsx` (full replacement)
- Delete: `app/scan/[id]/tabs/OverviewTab.tsx`
- Delete: `app/scan/[id]/tabs/ClausesTab.tsx`
- Delete: `app/scan/[id]/tabs/GhostTab.tsx`
- Keep: `app/scan/[id]/tabs/TimelineTab.tsx` (still imported and used)

**Context:**
- Tailwind v4 — all color tokens defined in `app/globals.css` `@theme` block. Use classes like `text-risk-red`, `bg-ghost-bg`, `border-ghost/40`, `bg-accent-light`, etc.
- `GradeBadge` sizes: `sm | md | lg`. Use `lg` in hero.
- `RiskMeter` takes `score: number` (0–100).
- `TimelineTab` takes `{ events: TimelineEvent[] }`.
- The `pb-32` on the content container ensures content isn't hidden under the sticky bar.

**Step 1: Delete the three obsolete tab files**

```bash
rm app/scan/[id]/tabs/OverviewTab.tsx
rm app/scan/[id]/tabs/ClausesTab.tsx
rm app/scan/[id]/tabs/GhostTab.tsx
```

**Step 2: Replace `app/scan/[id]/ScanPageClient.tsx` entirely**

```typescript
'use client'
import { useState, useCallback } from 'react'
import Link from 'next/link'
import type { ScanResult, ClauseAnalysis, GhostClause, GhostSeverity } from '@/lib/types'
import { GradeBadge } from '@/components/GradeBadge'
import { RiskMeter } from '@/components/RiskMeter'
import { RiskBadge } from '@/components/RiskBadge'
import { CopyButton } from '@/components/CopyButton'
import { LegalDisclaimer } from '@/components/LegalDisclaimer'
import { EmailModal } from '@/components/EmailModal'
import { TimelineTab } from './tabs/TimelineTab'

const CONTRACT_LABELS: Record<string, string> = {
  lease: 'Lease',
  employment: 'Employment',
  nda: 'NDA',
  freelancer: 'Freelancer',
  tos: 'Terms of Service',
  other: 'Contract',
}

function ClauseCard({ clause, selected, onToggle }: {
  clause: ClauseAnalysis
  selected: boolean
  onToggle: () => void
}) {
  const [open, setOpen] = useState(false)

  const borderColor =
    clause.risk_level === 'red' ? 'border-risk-red/40' :
    clause.risk_level === 'yellow' ? 'border-risk-yellow/40' :
    'border-border'

  const bgColor =
    clause.risk_level === 'red' ? 'bg-risk-red-bg/20' :
    clause.risk_level === 'yellow' ? 'bg-risk-yellow-bg/20' :
    'bg-bg-document'

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${borderColor} ${bgColor} ${selected ? 'ring-2 ring-accent ring-offset-1' : ''}`}>
      <div className="flex items-center gap-3 p-4">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="w-4 h-4 rounded border-border accent-accent shrink-0 cursor-pointer"
          aria-label={`Select: ${clause.plain_english}`}
        />
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-3 flex-1 text-left min-w-0"
        >
          <RiskBadge level={clause.risk_level} showLabel={false} />
          <span className="text-xs text-text-muted uppercase tracking-wide bg-bg-secondary px-2 py-0.5 rounded-full shrink-0">
            {clause.category.replace(/_/g, ' ')}
          </span>
          <span className="text-sm text-text-primary flex-1 truncate">{clause.plain_english}</span>
          <span className="text-text-muted text-xs shrink-0">{open ? '▲' : '▼'}</span>
        </button>
      </div>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-border/50 pt-4">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Original Language</p>
            <pre className="font-mono text-xs text-text-secondary bg-bg-secondary rounded-lg p-4 whitespace-pre-wrap leading-relaxed">
              {clause.original_text}
            </pre>
          </div>
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Plain English</p>
            <p className="text-sm text-text-primary leading-relaxed">{clause.plain_english}</p>
          </div>
          <div className="flex items-center gap-3">
            <RiskBadge level={clause.risk_level} />
            <span className="text-xs text-text-muted">
              Risk score: {Math.min(100, Math.max(0, clause.risk_score))}/100
            </span>
          </div>
          {clause.benchmark_note && (
            <div className="bg-accent-light border border-accent/20 rounded-lg p-3">
              <p className="text-xs font-semibold text-accent mb-1">📊 Benchmark</p>
              <p className="text-xs text-text-secondary">{clause.benchmark_note}</p>
            </div>
          )}
          {clause.concern && (
            <div className={`rounded-lg p-3 ${
              clause.risk_level === 'red' ? 'bg-risk-red-bg border border-risk-red/20' :
              clause.risk_level === 'yellow' ? 'bg-risk-yellow-bg border border-risk-yellow/20' :
              'bg-bg-secondary border border-border'
            }`}>
              <p className={`text-xs font-semibold mb-1 ${
                clause.risk_level === 'red' ? 'text-risk-red' :
                clause.risk_level === 'yellow' ? 'text-risk-yellow' :
                'text-text-secondary'
              }`}>
                ⚠ Watch out
              </p>
              <p className="text-xs text-text-secondary">{clause.concern}</p>
            </div>
          )}
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

function GhostCard({ ghost, selected, onToggle }: {
  ghost: GhostClause
  selected: boolean
  onToggle: () => void
}) {
  const severityConfig: Record<GhostSeverity, { label: string; color: string }> = {
    high: { label: 'High Priority', color: 'text-risk-red bg-risk-red-bg border-risk-red/20' },
    medium: { label: 'Medium Priority', color: 'text-risk-yellow bg-risk-yellow-bg border-risk-yellow/20' },
    low: { label: 'Low Priority', color: 'text-text-secondary bg-bg-secondary border-border' },
  }
  const s = severityConfig[ghost.severity]

  return (
    <div className={`border border-dashed border-ghost/40 bg-ghost-bg rounded-xl p-6 space-y-4 ${selected ? 'ring-2 ring-accent ring-offset-1' : ''}`}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="w-4 h-4 mt-0.5 rounded border-border accent-accent shrink-0 cursor-pointer"
          aria-label={`Select missing clause: ${ghost.title}`}
        />
        <div className="flex-1 flex items-start justify-between gap-4">
          <div>
            <h4 className="font-semibold text-ghost">👻 {ghost.title}</h4>
            <span className="text-xs text-text-muted capitalize">{ghost.category.replace(/_/g, ' ')}</span>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full border font-medium shrink-0 ${s.color}`}>
            {s.label}
          </span>
        </div>
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

function Section({ title, count, colorClass, children, defaultOpen = true }: {
  title: string
  count: number
  colorClass: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-t border-border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4"
      >
        <div className="flex items-center gap-3">
          <h2 className={`font-semibold text-lg ${colorClass}`}>{title}</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-bg-secondary border border-border text-text-muted font-medium">
            {count}
          </span>
        </div>
        <span className="text-text-muted text-sm">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="space-y-3 pb-8">{children}</div>}
    </div>
  )
}

export function ScanPageClient({ scan }: { scan: ScanResult }) {
  const [selectedClauses, setSelectedClauses] = useState<Set<string>>(new Set())
  const [selectedGhosts, setSelectedGhosts] = useState<Set<string>>(new Set())
  const [showEmail, setShowEmail] = useState(false)
  const [timelineOpen, setTimelineOpen] = useState(false)

  const toggleClause = useCallback((id: string) => {
    setSelectedClauses(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const toggleGhost = useCallback((id: string) => {
    setSelectedGhosts(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const totalSelected = selectedClauses.size + selectedGhosts.size
  const redClauses = scan.clauses.filter(c => c.risk_level === 'red')
  const yellowClauses = scan.clauses.filter(c => c.risk_level === 'yellow')
  const greenClauses = scan.clauses.filter(c => c.risk_level === 'green')
  const sortedGhosts = [...scan.ghost_clauses].sort((a, b) => {
    const order: Record<GhostSeverity, number> = { high: 0, medium: 1, low: 2 }
    return order[a.severity] - order[b.severity]
  })

  const selectedClauseData = scan.clauses.filter(c => selectedClauses.has(c.id))
  const selectedGhostData = scan.ghost_clauses.filter(g => selectedGhosts.has(g.id))

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Sticky nav */}
      <header className="sticky top-0 z-50 bg-bg-primary/95 backdrop-blur border-b border-border px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="font-serif font-bold text-lg text-text-primary shrink-0">
              PlainSight
            </Link>
            <span className="text-text-muted">/</span>
            <span className="text-sm text-text-secondary truncate">{scan.file_name}</span>
            <span className="px-2 py-0.5 bg-accent-light text-accent text-xs rounded-full font-medium shrink-0">
              {CONTRACT_LABELS[scan.contract_type] ?? scan.contract_type}
            </span>
          </div>
          <Link
            href={`/scan/${scan.id}/share`}
            className="text-xs px-3 py-1.5 bg-accent text-white rounded-lg hover:bg-blue-700 transition-colors shrink-0"
          >
            Share
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 pb-32">
        {/* Hero card */}
        <div className="bg-bg-document border border-border rounded-2xl p-8 mb-8 shadow-sm">
          <div className="flex items-start gap-6 mb-6">
            <GradeBadge grade={scan.overall_grade} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-serif text-2xl font-bold">Grade {scan.overall_grade}</span>
                <span className="text-text-muted">·</span>
                <span className="text-text-secondary capitalize">
                  {CONTRACT_LABELS[scan.contract_type] ?? scan.contract_type}
                </span>
                {scan.jurisdiction !== 'Not specified' && (
                  <span className="text-xs px-2 py-0.5 bg-bg-secondary border border-border rounded-full text-text-secondary">
                    {scan.jurisdiction}
                  </span>
                )}
              </div>
              <p className="text-sm text-text-muted capitalize">You are: {scan.detected_party_side}</p>
            </div>
          </div>

          <p className="text-text-secondary leading-relaxed mb-6">{scan.tldr_summary}</p>

          <div className="mb-6">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Overall Risk</p>
            <RiskMeter score={scan.overall_risk_score} />
          </div>

          <div className="flex items-center gap-5 pt-4 border-t border-border text-sm flex-wrap">
            {redClauses.length > 0 && (
              <span className="flex items-center gap-1.5 text-risk-red font-medium">
                <span className="w-2 h-2 rounded-full bg-risk-red inline-block" />
                {redClauses.length} high risk
              </span>
            )}
            {yellowClauses.length > 0 && (
              <span className="flex items-center gap-1.5 text-risk-yellow font-medium">
                <span className="w-2 h-2 rounded-full bg-risk-yellow inline-block" />
                {yellowClauses.length} medium risk
              </span>
            )}
            {sortedGhosts.length > 0 && (
              <span className="flex items-center gap-1.5 text-ghost font-medium">
                👻 {sortedGhosts.length} missing clause{sortedGhosts.length !== 1 ? 's' : ''}
              </span>
            )}
            {greenClauses.length > 0 && (
              <span className="flex items-center gap-1.5 text-risk-green font-medium">
                <span className="w-2 h-2 rounded-full bg-risk-green inline-block" />
                {greenClauses.length} looks good
              </span>
            )}
          </div>
        </div>

        {/* Top concerns */}
        {scan.top_concerns.length > 0 && (
          <div className="mb-8">
            <h2 className="font-semibold text-lg mb-4">Top Concerns</h2>
            <div className="space-y-3">
              {scan.top_concerns.map((concern, i) => (
                <div key={i} className="flex gap-3 bg-risk-red-bg border border-risk-red/20 rounded-xl p-4">
                  <span className="text-risk-red font-bold text-sm mt-0.5 shrink-0">{i + 1}</span>
                  <p className="text-sm text-text-primary">{concern}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selection hint */}
        <div className="mb-8 flex items-center gap-2 text-xs text-accent bg-accent-light border border-accent/20 rounded-lg px-4 py-3">
          <span className="shrink-0">☑</span>
          <span>
            Check boxes next to issues you want to push back on, then tap{' '}
            <strong>Draft Email</strong> at the bottom.
          </span>
        </div>

        {/* Red clauses */}
        {redClauses.length > 0 && (
          <Section title="🔴 High Risk" count={redClauses.length} colorClass="text-risk-red" defaultOpen>
            {redClauses.map(c => (
              <ClauseCard key={c.id} clause={c} selected={selectedClauses.has(c.id)} onToggle={() => toggleClause(c.id)} />
            ))}
          </Section>
        )}

        {/* Yellow clauses */}
        {yellowClauses.length > 0 && (
          <Section title="⚠ Worth Watching" count={yellowClauses.length} colorClass="text-risk-yellow" defaultOpen>
            {yellowClauses.map(c => (
              <ClauseCard key={c.id} clause={c} selected={selectedClauses.has(c.id)} onToggle={() => toggleClause(c.id)} />
            ))}
          </Section>
        )}

        {/* Ghost clauses */}
        {sortedGhosts.length > 0 && (
          <Section title="👻 Missing Protections" count={sortedGhosts.length} colorClass="text-ghost" defaultOpen>
            <p className="text-sm text-text-secondary mb-2">
              These protections are commonly found in this type of contract but are absent here.
            </p>
            {sortedGhosts.map(g => (
              <GhostCard key={g.id} ghost={g} selected={selectedGhosts.has(g.id)} onToggle={() => toggleGhost(g.id)} />
            ))}
          </Section>
        )}

        {/* Green clauses */}
        {greenClauses.length > 0 && (
          <Section title="✅ Looks Good" count={greenClauses.length} colorClass="text-risk-green" defaultOpen={false}>
            {greenClauses.map(c => (
              <ClauseCard key={c.id} clause={c} selected={selectedClauses.has(c.id)} onToggle={() => toggleClause(c.id)} />
            ))}
          </Section>
        )}

        {/* Timeline */}
        {scan.timeline_events.length > 0 && (
          <div className="border-t border-border">
            <button
              onClick={() => setTimelineOpen(!timelineOpen)}
              className="w-full flex items-center justify-between py-4"
            >
              <h2 className="font-semibold text-lg text-text-primary">
                📅 Timeline ({scan.timeline_events.length})
              </h2>
              <span className="text-text-muted text-sm">{timelineOpen ? '▲' : '▼'}</span>
            </button>
            {timelineOpen && <TimelineTab events={scan.timeline_events} />}
          </div>
        )}

        <LegalDisclaimer />
      </div>

      {/* Sticky selection bar — slides up when items are selected */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${totalSelected > 0 ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="bg-bg-document border-t border-border shadow-2xl px-4 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-text-primary text-sm">
                {totalSelected} issue{totalSelected !== 1 ? 's' : ''} selected
              </p>
              <p className="text-xs text-text-secondary">Ready to draft your negotiation email</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setSelectedClauses(new Set()); setSelectedGhosts(new Set()) }}
                className="text-xs text-text-muted hover:text-text-primary transition-colors"
              >
                Clear all
              </button>
              <button
                onClick={() => setShowEmail(true)}
                className="px-5 py-2.5 bg-accent text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors"
              >
                ✉ Draft Email
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Email modal */}
      {showEmail && (
        <EmailModal
          selectedClauses={selectedClauseData}
          selectedGhosts={selectedGhostData}
          scan={scan}
          onClose={() => setShowEmail(false)}
        />
      )}
    </div>
  )
}
```

**Step 3: Verify the build**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 4: Manual end-to-end test**

1. Navigate to `http://localhost:3000/scan/demo`
2. Verify: single scroll page, no tabs, sections visible (🔴 High Risk, ⚠ Worth Watching, 👻 Missing Protections, ✅ Looks Good)
3. Check a box → sticky bar slides up from bottom with count
4. Check another box → count increments
5. Click "Clear all" → bar slides down
6. Re-check boxes → click "✉ Draft Email"
7. Modal appears with loading animation
8. ~5 seconds later: email text appears
9. Copy button works
10. Clicking outside modal closes it
11. Click "▼" on any section → it collapses; "▲" expands it
12. Timeline section expands on click
