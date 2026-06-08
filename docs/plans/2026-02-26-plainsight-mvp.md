# PlainSight MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a web app that lets anyone upload a contract and instantly get plain English translation, risk scoring, ghost clause detection, and a shareable summary card.

**Architecture:** Next.js 14 App Router with TypeScript. PDF text is extracted server-side, sent to Claude API for structured JSON analysis, stored in-memory for MVP (no DB yet), and rendered in a rich results page with 4 tabs.

**Tech Stack:** Next.js 14+, TypeScript, Tailwind CSS, Framer Motion, Anthropic SDK, pdf-parse, @vercel/og

---

## Task 1: Bootstrap Next.js Project

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`, `.env.local`

**Step 1: Initialize project**

```bash
cd /Users/upneja/Projects/plainsight
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --yes
```

Expected: Project files created in current directory.

**Step 2: Install dependencies**

```bash
npm install @anthropic-ai/sdk pdf-parse framer-motion
npm install --save-dev @types/pdf-parse
```

**Step 3: Create `.env.local`**

```env
Set `ANTHROPIC_API_KEY` in `.env.local` for local Claude API access.
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Step 4: Verify dev server starts**

```bash
npm run dev
```

Expected: Server running at http://localhost:3000 showing default Next.js page.

**Step 5: Commit**

```bash
git init
git add .
git commit -m "feat: initialize Next.js project with TypeScript and Tailwind"
```

---

## Task 2: Design System — Global CSS & Typography

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`
- Create: `app/fonts.ts`

**Step 1: Update `app/globals.css` with design tokens**

Replace the entire file with:

```css
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg-primary: #FAFAF9;
  --bg-secondary: #F5F4F0;
  --bg-document: #FFFFFF;
  --text-primary: #1C1917;
  --text-secondary: #57534E;
  --text-muted: #A8A29E;
  --border: #E7E5E4;

  --risk-green: #16A34A;
  --risk-green-bg: #F0FDF4;
  --risk-yellow: #CA8A04;
  --risk-yellow-bg: #FEFCE8;
  --risk-red: #DC2626;
  --risk-red-bg: #FEF2F2;

  --grade-a: #16A34A;
  --grade-b: #0D9488;
  --grade-c: #CA8A04;
  --grade-d: #EA580C;
  --grade-f: #DC2626;

  --accent: #2563EB;
  --accent-light: #EFF6FF;

  --ghost: #7C3AED;
  --ghost-bg: #F5F3FF;
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'DM Sans', sans-serif;
}

.font-serif { font-family: 'Fraunces', serif; }
.font-mono { font-family: 'JetBrains Mono', monospace; }
```

**Step 2: Update `tailwind.config.ts` to extend with custom colors**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'risk-green': '#16A34A',
        'risk-green-bg': '#F0FDF4',
        'risk-yellow': '#CA8A04',
        'risk-yellow-bg': '#FEFCE8',
        'risk-red': '#DC2626',
        'risk-red-bg': '#FEF2F2',
        'grade-a': '#16A34A',
        'grade-b': '#0D9488',
        'grade-c': '#CA8A04',
        'grade-d': '#EA580C',
        'grade-f': '#DC2626',
        'ghost': '#7C3AED',
        'ghost-bg': '#F5F3FF',
        'accent': '#2563EB',
        'accent-light': '#EFF6FF',
        'bg-primary': '#FAFAF9',
        'bg-secondary': '#F5F4F0',
        'text-primary': '#1C1917',
        'text-secondary': '#57534E',
        'text-muted': '#A8A29E',
        border: '#E7E5E4',
      },
      fontFamily: {
        serif: ['Fraunces', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
```

**Step 3: Update `app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PlainSight — See what you\'re really signing',
  description: 'Upload any contract. Get instant plain English translation, risk scoring, and what\'s missing — in seconds.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg-primary text-text-primary antialiased">
        {children}
      </body>
    </html>
  )
}
```

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add design system tokens and typography"
```

---

## Task 3: TypeScript Type Definitions

**Files:**
- Create: `lib/types.ts`

**Step 1: Create `lib/types.ts`**

```typescript
export type RiskLevel = 'green' | 'yellow' | 'red';
export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';
export type ContractType = 'lease' | 'employment' | 'nda' | 'freelancer' | 'tos' | 'other';
export type PartyRole = 'tenant' | 'employee' | 'recipient' | 'contractor' | 'user' | 'other';
export type TimelineEventType = 'start' | 'end' | 'payment' | 'renewal' | 'deadline' | 'other';
export type GhostSeverity = 'high' | 'medium' | 'low';

export type ClauseAnalysis = {
  id: string;
  original_text: string;
  plain_english: string;
  risk_level: RiskLevel;
  risk_score: number;
  category: string;
  benchmark_note: string | null;
  concern: string | null;
  negotiation_ammo: string | null;
};

export type GhostClause = {
  id: string;
  title: string;
  description: string;
  why_it_matters: string;
  standard_version: string;
  severity: GhostSeverity;
  category: string;
};

export type TimelineEvent = {
  id: string;
  date: string | null;
  relative: string | null;
  label: string;
  type: TimelineEventType;
  notes: string | null;
};

export type ScanResult = {
  id: string;
  file_name: string;
  contract_type: ContractType;
  detected_party_side: PartyRole;
  jurisdiction: string;
  overall_grade: Grade;
  overall_risk_score: number;
  tldr_summary: string;
  top_concerns: string[];
  clauses: ClauseAnalysis[];
  ghost_clauses: GhostClause[];
  timeline_events: TimelineEvent[];
  created_at: string;
};
```

**Step 2: Commit**

```bash
git add lib/types.ts
git commit -m "feat: add TypeScript type definitions"
```

---

## Task 4: Sample Demo Data

**Files:**
- Create: `lib/demo-data.ts`

**Step 1: Create `lib/demo-data.ts` with a realistic NYC apartment lease analysis**

```typescript
import { ScanResult } from './types';

export const DEMO_SCAN: ScanResult = {
  id: 'demo',
  file_name: 'Sample NYC Apartment Lease.pdf',
  contract_type: 'lease',
  detected_party_side: 'tenant',
  jurisdiction: 'New York',
  overall_grade: 'C',
  overall_risk_score: 58,
  tldr_summary: 'This is a standard NYC residential lease with several tenant-unfavorable clauses. The landlord retains broad entry rights without specifying adequate notice, and the auto-renewal clause gives you a very short window to avoid being locked into another year. The security deposit terms are acceptable but the late fee structure is aggressive.',
  top_concerns: [
    'Landlord may enter with only 24 hours notice for non-emergency inspections — consider negotiating for 48-hour written notice',
    'Auto-renewal kicks in if you don\'t give 60-day notice — most leases require only 30 days',
    'Late fee of 8% kicks in after just 3 days — unusually aggressive'
  ],
  clauses: [
    {
      id: 'clause-001',
      original_text: 'Tenant shall pay as rent the sum of $3,200 per month, due on the first day of each calendar month. A late charge of 8% of the monthly rent shall be assessed for any payment received after the 3rd day of the month.',
      plain_english: 'Your rent is $3,200/month due on the 1st. If you pay after the 3rd, you owe an extra $256 in late fees.',
      risk_level: 'yellow',
      risk_score: 52,
      category: 'payment',
      benchmark_note: 'The 3-day grace period is shorter than the 5-day grace period common in most NYC leases. The 8% late fee is at the high end — most agreements charge 5%.',
      concern: 'The combination of a short grace period and high late fee percentage is aggressive.',
      negotiation_ammo: 'I\'d like to request a 5-day grace period before late fees apply, and a 5% late fee rate rather than 8%. Both are more typical for residential leases in New York. Would you be open to those adjustments?'
    },
    {
      id: 'clause-002',
      original_text: 'Landlord or Landlord\'s agents may enter the premises at any reasonable time upon 24 hours notice to Tenant for the purpose of inspection, repairs, or showing the apartment to prospective tenants or buyers.',
      plain_english: 'Your landlord can come into your apartment with just 24 hours notice to inspect, make repairs, or show it to other people.',
      risk_level: 'yellow',
      risk_score: 45,
      category: 'entry_rights',
      benchmark_note: 'NY Real Property Law requires "reasonable notice" which courts typically interpret as 24 hours. This clause meets the minimum but does not specify that notice must be in writing.',
      concern: 'Without a written notice requirement, verbal notice 24 hours before entry is technically compliant. Consider requesting written (email/text) notice.',
      negotiation_ammo: 'Could we add language specifying that entry notice must be given in writing (email or text) at least 24 hours in advance? This just makes sure there\'s a clear record for both of us.'
    },
    {
      id: 'clause-003',
      original_text: 'The security deposit of $6,400 (equal to two months\' rent) shall be held by Landlord in a separate interest-bearing account. The deposit shall be returned within 14 days of the termination of tenancy, less any deductions for damages beyond normal wear and tear.',
      plain_english: 'You\'ll pay a $6,400 security deposit (2 months rent) held in a separate account. You get it back within 14 days of moving out, minus any legitimate damages.',
      risk_level: 'green',
      risk_score: 18,
      category: 'security_deposit',
      benchmark_note: 'Two months\' rent is the maximum allowed in New York. The 14-day return window matches NY law. The "normal wear and tear" exclusion is standard and protective for tenants.',
      concern: null,
      negotiation_ammo: null
    },
    {
      id: 'clause-004',
      original_text: 'This Lease shall automatically renew for successive one-year terms unless Tenant provides written notice of intent not to renew at least sixty (60) days prior to the expiration of the current term.',
      plain_english: 'Your lease automatically renews for another year unless you give 60 days written notice before it ends. Miss that window and you\'re locked in for another year.',
      risk_level: 'red',
      risk_score: 72,
      category: 'renewal',
      benchmark_note: 'Most NYC leases require 30 days notice to prevent auto-renewal. A 60-day requirement gives you less flexibility and is longer than average.',
      concern: 'If your lease ends June 30, you must notify by April 30 — that\'s a long lead time that\'s easy to miss.',
      negotiation_ammo: 'The 60-day notice requirement for non-renewal is longer than what I see in most NYC residential leases. Would you consider reducing it to 30 days? That\'s the standard I\'ve seen elsewhere.'
    },
    {
      id: 'clause-005',
      original_text: 'Tenant shall not sublet the premises or any portion thereof without the prior written consent of Landlord, which consent may be withheld in Landlord\'s sole and absolute discretion.',
      plain_english: 'You cannot sublet your apartment without the landlord\'s written permission, and they can say no for any reason.',
      risk_level: 'red',
      risk_score: 68,
      category: 'other',
      benchmark_note: 'New York Real Property Law §226-b gives tenants in buildings with 4+ units the right to sublet with landlord approval — and the landlord cannot unreasonably withhold consent. This clause\'s "sole and absolute discretion" language may conflict with that right.',
      concern: 'This clause overstates landlord rights in NYC. Worth knowing your statutory rights here.',
      negotiation_ammo: 'For NYC buildings with 4 or more units, I understand NY RPL 226-b gives tenants the right to sublet with landlord approval, where approval cannot be unreasonably withheld. Could we update the language to reflect that standard?'
    },
    {
      id: 'clause-006',
      original_text: 'Tenant is responsible for all utilities including electricity, gas, and internet service. Landlord provides water and heat.',
      plain_english: 'You pay for electric, gas, and internet. Landlord covers water and heat.',
      risk_level: 'green',
      risk_score: 12,
      category: 'other',
      benchmark_note: null,
      concern: null,
      negotiation_ammo: null
    },
    {
      id: 'clause-007',
      original_text: 'Any dispute arising under this Lease shall be resolved by binding arbitration administered by the American Arbitration Association. Tenant waives the right to a jury trial and the right to participate in any class action.',
      plain_english: 'If you have a dispute with your landlord, you must go to arbitration — not court. You also give up your right to join a class action lawsuit.',
      risk_level: 'red',
      risk_score: 78,
      category: 'dispute_resolution',
      benchmark_note: 'Mandatory arbitration clauses are uncommon in residential leases and are heavily landlord-favorable. Class action waivers are particularly aggressive in residential leases.',
      concern: 'Arbitration favors repeat players (landlords) over one-time participants (tenants). You lose your right to pursue claims collectively with other tenants.',
      negotiation_ammo: 'Mandatory arbitration and class action waivers are unusual in residential leases — I haven\'t seen these terms in other NYC apartments I\'ve looked at. I\'d prefer standard court jurisdiction for dispute resolution. Is this something we could modify?'
    }
  ],
  ghost_clauses: [
    {
      id: 'ghost-001',
      title: 'Early Termination Clause',
      description: 'This lease contains no provision for early termination. If you need to break the lease, there is no defined process or fee structure.',
      why_it_matters: 'Without an early termination clause, breaking the lease could expose you to liability for the full remaining rent for the rest of the lease term. You have no defined exit path.',
      standard_version: 'Most leases include an early termination option allowing tenants to exit with 30-60 days notice and payment of 1-2 months\' rent as a termination fee.',
      severity: 'high',
      category: 'termination'
    },
    {
      id: 'ghost-002',
      title: 'Pet Policy',
      description: 'The lease makes no mention of pets — whether they are allowed, prohibited, or subject to additional deposits.',
      why_it_matters: 'Without a written pet policy, a verbal agreement to allow pets has no legal standing. A future landlord or property manager could use the lease\'s silence to prohibit pets or charge undisclosed fees.',
      standard_version: 'Standard leases specify whether pets are permitted, any pet deposit or monthly pet fee, weight/breed restrictions, and that service/emotional support animals are exempt.',
      severity: 'medium',
      category: 'other'
    },
    {
      id: 'ghost-003',
      title: 'Rent Increase Cap / Renewal Terms',
      description: 'The auto-renewal clause does not specify what the rent will be upon renewal. The landlord could increase rent significantly and this would be your new rate for another full year.',
      why_it_matters: 'Without rent increase limits or advance notice requirements tied to renewal, you could receive a renewal notice at a substantially higher rate with very little time to decide whether to stay or leave.',
      standard_version: 'Well-drafted leases specify maximum rent increase percentages for renewals, or require 60-90 days advance notice of any rent change before the renewal window closes.',
      severity: 'high',
      category: 'renewal'
    },
    {
      id: 'ghost-004',
      title: 'Maintenance Responsibility Breakdown',
      description: 'The lease does not specify who is responsible for various types of maintenance and repairs beyond the general "landlord maintains the premises" language.',
      why_it_matters: 'Ambiguous maintenance responsibility leads to disputes. Without clarity on appliance repairs, HVAC maintenance, pest control, and minor repairs, you may end up paying for things the landlord should cover.',
      standard_version: 'Standard leases detail which repairs are tenant responsibility (e.g., replacing light bulbs, minor plumbing clogs) vs. landlord responsibility (structural repairs, appliance failures, heating systems).',
      severity: 'medium',
      category: 'maintenance'
    }
  ],
  timeline_events: [
    {
      id: 'timeline-001',
      date: '2026-03-01',
      relative: null,
      label: 'Lease Start Date',
      type: 'start',
      notes: 'First day of tenancy. Keys exchanged, move-in permitted.'
    },
    {
      id: 'timeline-002',
      date: '2026-03-01',
      relative: null,
      label: 'First Rent Payment Due',
      type: 'payment',
      notes: '$3,200 due. Late fee of $256 applies after March 3rd.'
    },
    {
      id: 'timeline-003',
      date: null,
      relative: 'Monthly on the 1st',
      label: 'Monthly Rent Due',
      type: 'payment',
      notes: '$3,200/month. 3-day grace period before 8% late fee applies.'
    },
    {
      id: 'timeline-004',
      date: '2027-05-01',
      relative: null,
      label: 'Non-Renewal Notice Deadline',
      type: 'deadline',
      notes: 'Must give written notice by this date to avoid auto-renewal. 60 days before lease end (June 30, 2027).'
    },
    {
      id: 'timeline-005',
      date: '2027-06-30',
      relative: null,
      label: 'Lease End Date',
      type: 'end',
      notes: 'Lease expires. Auto-renews for 1 year if no notice given by May 1, 2027.'
    }
  ],
  created_at: new Date().toISOString()
};
```

**Step 2: Commit**

```bash
git add lib/demo-data.ts
git commit -m "feat: add demo scan data for NYC apartment lease"
```

---

## Task 5: Core Reusable Components

**Files:**
- Create: `components/RiskBadge.tsx`
- Create: `components/GradeBadge.tsx`
- Create: `components/CopyButton.tsx`
- Create: `components/LegalDisclaimer.tsx`

**Step 1: Create `components/RiskBadge.tsx`**

```tsx
'use client'
import { RiskLevel } from '@/lib/types'

const config = {
  green: { bg: 'bg-risk-green-bg', text: 'text-risk-green', dot: 'bg-risk-green', label: 'Low Risk' },
  yellow: { bg: 'bg-risk-yellow-bg', text: 'text-risk-yellow', dot: 'bg-risk-yellow', label: 'Medium Risk' },
  red: { bg: 'bg-risk-red-bg', text: 'text-risk-red', dot: 'bg-risk-red', label: 'High Risk' },
}

export function RiskBadge({ level, showLabel = true }: { level: RiskLevel; showLabel?: boolean }) {
  const c = config[level]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {showLabel && c.label}
    </span>
  )
}
```

**Step 2: Create `components/GradeBadge.tsx`**

```tsx
import { Grade } from '@/lib/types'

const colors: Record<Grade, string> = {
  A: 'bg-grade-a text-white',
  B: 'bg-grade-b text-white',
  C: 'bg-grade-c text-white',
  D: 'bg-grade-d text-white',
  F: 'bg-grade-f text-white',
}

export function GradeBadge({ grade, size = 'md' }: { grade: Grade; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-sm' : size === 'lg' ? 'w-20 h-20 text-4xl' : 'w-12 h-12 text-xl'
  return (
    <div className={`${sizeClass} ${colors[grade]} rounded-full flex items-center justify-center font-serif font-bold`}>
      {grade}
    </div>
  )
}
```

**Step 3: Create `components/CopyButton.tsx`**

```tsx
'use client'
import { useState } from 'react'

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
```

**Step 4: Create `components/LegalDisclaimer.tsx`**

```tsx
export function LegalDisclaimer() {
  return (
    <div className="text-xs text-text-muted border-t border-border pt-4 mt-8">
      <strong className="text-text-secondary">Legal Notice:</strong> PlainSight provides general legal information for educational purposes only. It is not a law firm, does not provide legal advice, and is not a substitute for the advice of an attorney. Analysis may contain errors or omissions. Always consult a licensed attorney for advice specific to your situation.
    </div>
  )
}
```

**Step 5: Commit**

```bash
git add components/
git commit -m "feat: add core reusable components (RiskBadge, GradeBadge, CopyButton, LegalDisclaimer)"
```

---

## Task 6: PDF Text Extraction

**Files:**
- Create: `lib/extract-text.ts`

**Step 1: Create `lib/extract-text.ts`**

```typescript
export async function extractText(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === 'application/pdf') {
    const pdf = (await import('pdf-parse')).default
    const data = await pdf(buffer)
    if (!data.text || data.text.trim().length < 100) {
      throw new Error('PDF_UNREADABLE')
    }
    return data.text
  }

  if (mimeType === 'text/plain') {
    return buffer.toString('utf-8')
  }

  throw new Error('UNSUPPORTED_FORMAT')
}
```

**Step 2: Commit**

```bash
git add lib/extract-text.ts
git commit -m "feat: add PDF text extraction utility"
```

---

## Task 7: Claude API Integration

**Files:**
- Create: `lib/analyze-contract.ts`
- Create: `lib/prompts.ts`

**Step 1: Create `lib/prompts.ts`** with the system prompt (copy verbatim from PRD section 4.1)

```typescript
export const ANALYSIS_SYSTEM_PROMPT = `You are PlainSight, a contract analysis engine. You translate legal documents into plain English and assess risk for the person receiving/signing the contract (not the drafter).

You provide LEGAL INFORMATION, never LEGAL ADVICE. You never say "you should" or "you must" or "we recommend." Instead, you say "this means," "this is unusual because," "most similar contracts include."

TASK: Analyze the following contract and return a JSON object with this exact structure:

{
  "contract_type": "lease" | "employment" | "nda" | "freelancer" | "tos" | "other",
  "detected_party_side": "tenant" | "employee" | "recipient" | "contractor" | "user" | "other",
  "jurisdiction": "State name or 'Not specified'",
  "overall_grade": "A" | "B" | "C" | "D" | "F",
  "overall_risk_score": 0-100,
  "tldr_summary": "2-3 sentence plain English summary of what this contract does and the key things to be aware of",
  "top_concerns": ["concern 1", "concern 2", "concern 3"],
  "clauses": [
    {
      "id": "clause-001",
      "original_text": "exact text from document",
      "plain_english": "what this actually means in simple terms",
      "risk_level": "green" | "yellow" | "red",
      "risk_score": 0-100,
      "category": "category from the predefined list",
      "benchmark_note": "how this compares to similar contracts (null if nothing notable)",
      "concern": "what to watch out for (null if none)",
      "negotiation_ammo": "a polite but firm message to push back on this clause (null if not needed)"
    }
  ],
  "ghost_clauses": [
    {
      "id": "ghost-001",
      "title": "Missing clause title",
      "description": "What's missing",
      "why_it_matters": "Why this matters for the signer",
      "standard_version": "What a standard version of this clause typically says",
      "severity": "high" | "medium" | "low",
      "category": "category"
    }
  ],
  "timeline_events": [
    {
      "id": "timeline-001",
      "date": "ISO date or null",
      "relative": "relative timeframe or null",
      "label": "Event description",
      "type": "start" | "end" | "payment" | "renewal" | "deadline" | "other",
      "notes": "additional context or null"
    }
  ]
}

GRADING RUBRIC:
- A: Very fair contract. Standard or better-than-standard terms. Few or no missing clauses.
- B: Generally fair with minor issues. 1-2 yellow flags.
- C: Mixed. Some concerning clauses or notable gaps. Needs careful review.
- D: Significantly one-sided. Multiple red flags or critical missing clauses.
- F: Predatory or severely one-sided. Major red flags throughout.

RISK SCORING:
- Green (0-33): Standard clause, nothing unusual
- Yellow (34-66): Somewhat unusual, worth understanding fully before signing
- Red (67-100): Significantly outside the norm, potentially harmful to the signer

GHOST CLAUSE DETECTION — Check for these common missing elements based on contract type:

For LEASES: entry/access notice, maintenance responsibilities, subletting policy, pet policy, guest policy, noise/quiet hours, early termination process, security deposit return timeline, rent increase caps/notice, parking/storage, utilities breakdown, mold/pest responsibility, lease renewal terms, dispute resolution.

For EMPLOYMENT: termination notice period, severance terms, IP ownership boundaries, non-compete geographic/temporal limits, remote work policy, bonus/equity vesting on termination, expense reimbursement, dispute resolution, whistleblower protection, non-disparagement scope.

For NDAs: mutual vs unilateral obligations, definition of confidential information boundaries, exclusions for publicly available info, term/expiration, return/destruction of materials, permitted disclosures (legal proceedings), remedies scope.

For FREELANCER: payment terms/timeline, kill fee, revision limits, IP ownership transfer timing, indemnification scope, termination notice, late payment penalties, scope of work boundaries, confidentiality scope.

BENCHMARKING — Use your knowledge of standard contract terms to note when clauses fall outside typical ranges. Flag: non-compete > 1 year, security deposit > 2 months rent, payment terms > net 60, auto-renewal without 30+ day cancellation window, unilateral modification rights, mandatory arbitration with class action waiver, IP assignment beyond scope of work.

NEGOTIATION AMMO — Generate polite, professional pushback messages. Reference what's "standard" or "typical." Frame as questions or requests, not demands. Example: "I noticed the lease doesn't specify a notice period for property access. Would you be open to adding a 24-hour written notice requirement? This is standard in most residential leases in [state]."

Return ONLY the JSON object, no markdown formatting, no code blocks.`
```

**Step 2: Create `lib/analyze-contract.ts`**

```typescript
import Anthropic from '@anthropic-ai/sdk'
import { ANALYSIS_SYSTEM_PROMPT } from './prompts'
import { ScanResult } from './types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function analyzeContract(contractText: string, fileName: string): Promise<ScanResult> {
  // Truncate very long documents
  const truncated = contractText.length > 200000
    ? contractText.slice(0, 200000) + '\n\n[Document truncated for analysis]'
    : contractText

  let lastError: Error | null = null

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 8000,
        system: ANALYSIS_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: `Analyze this contract:\n\n${truncated}` }],
      })

      const text = response.content[0].type === 'text' ? response.content[0].text : ''
      const parsed = JSON.parse(text)

      return {
        id: crypto.randomUUID(),
        file_name: fileName,
        created_at: new Date().toISOString(),
        ...parsed,
      } as ScanResult
    } catch (err) {
      lastError = err as Error
      if (attempt < 2) {
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000))
      }
    }
  }

  throw lastError ?? new Error('Analysis failed')
}
```

**Step 3: Commit**

```bash
git add lib/
git commit -m "feat: add Claude API integration for contract analysis"
```

---

## Task 8: Scan API Route + In-Memory Store

**Files:**
- Create: `lib/scan-store.ts`
- Create: `app/api/scan/route.ts`

**Step 1: Create `lib/scan-store.ts`** (simple in-memory store for MVP)

```typescript
import { ScanResult } from './types'

// In-memory store — resets on server restart. Fine for MVP.
const store = new Map<string, ScanResult>()

export function saveScan(scan: ScanResult): void {
  store.set(scan.id, scan)
}

export function getScan(id: string): ScanResult | null {
  if (id === 'demo') {
    const { DEMO_SCAN } = require('./demo-data')
    return DEMO_SCAN
  }
  return store.get(id) ?? null
}
```

**Step 2: Create `app/api/scan/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { extractText } from '@/lib/extract-text'
import { analyzeContract } from '@/lib/analyze-contract'
import { saveScan } from '@/lib/scan-store'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'FILE_TOO_LARGE' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    let text: string

    try {
      text = await extractText(buffer, file.type)
    } catch (err: any) {
      if (err.message === 'PDF_UNREADABLE') {
        return NextResponse.json({ error: 'PDF_UNREADABLE' }, { status: 422 })
      }
      if (err.message === 'UNSUPPORTED_FORMAT') {
        return NextResponse.json({ error: 'UNSUPPORTED_FORMAT' }, { status: 422 })
      }
      throw err
    }

    if (text.trim().split(/\s+/).length < 50) {
      return NextResponse.json({ error: 'DOCUMENT_TOO_SHORT' }, { status: 422 })
    }

    const scan = await analyzeContract(text, file.name)
    saveScan(scan)

    return NextResponse.json({ id: scan.id })
  } catch (err) {
    console.error('Scan error:', err)
    return NextResponse.json({ error: 'ANALYSIS_FAILED' }, { status: 500 })
  }
}
```

**Step 3: Create `app/api/scan/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getScan } from '@/lib/scan-store'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const scan = getScan(params.id)
  if (!scan) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(scan)
}
```

**Step 4: Commit**

```bash
git add app/api/ lib/scan-store.ts
git commit -m "feat: add scan API routes and in-memory store"
```

---

## Task 9: Landing Page

**Files:**
- Modify: `app/page.tsx`
- Create: `components/FileDropzone.tsx`

**Step 1: Create `components/FileDropzone.tsx`**

```tsx
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
  UNSUPPORTED_FORMAT: 'Unsupported file type. Please upload a PDF, DOC, DOCX, or TXT file.',
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

    const allowed = ['application/pdf', 'text/plain', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
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

    const res = await fetch('/api/scan', { method: 'POST', body: formData })
    const data = await res.json()

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
        className={`
          block border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
          ${dragging ? 'border-accent bg-accent-light scale-[1.02]' : 'border-border bg-bg-secondary hover:border-accent hover:bg-accent-light'}
          ${isLoading ? 'pointer-events-none' : ''}
        `}
      >
        <input
          type="file"
          className="sr-only"
          accept=".pdf,.txt,.doc,.docx"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          disabled={isLoading}
        />

        {isLoading ? (
          <div className="space-y-4">
            <div className="text-4xl animate-pulse">📄</div>
            <p className="text-text-secondary font-medium">{STAGE_MESSAGES[stage]}</p>
            <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-accent rounded-full animate-[loading_2s_ease-in-out_infinite]" style={{ width: '60%' }} />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-5xl">📋</div>
            <p className="text-xl font-medium text-text-primary">Drop your contract here</p>
            <p className="text-text-muted text-sm">PDF, DOC, DOCX, or TXT · Max 10MB</p>
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
```

**Step 2: Replace `app/page.tsx` with the landing page**

```tsx
import Link from 'next/link'
import { FileDropzone } from '@/components/FileDropzone'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <span className="font-serif text-xl font-bold text-text-primary">PlainSight</span>
        <div className="flex items-center gap-4 text-sm text-text-secondary">
          <Link href="/scan/demo" className="hover:text-text-primary transition-colors">Try Demo</Link>
          <Link href="/pricing" className="hover:text-text-primary transition-colors">Pricing</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="font-serif text-5xl md:text-6xl font-bold text-text-primary leading-tight mb-6">
          See what you're<br />
          <span className="italic">really</span> signing.
        </h1>
        <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-12">
          Drop any contract. Get instant plain English translation, risk scoring, and the stuff that's missing — in seconds.
        </p>

        <FileDropzone />

        <div className="mt-6 flex items-center justify-center gap-4 text-sm text-text-muted">
          <span>or</span>
          <Link href="/scan/demo" className="text-accent hover:underline font-medium">
            Try with a sample lease →
          </Link>
        </div>

        <p className="mt-8 text-xs text-text-muted">
          🔒 Your documents are encrypted and never shared. We provide information, not legal advice.
        </p>
      </section>

      {/* How it works */}
      <section className="bg-bg-secondary border-y border-border py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-serif text-3xl font-bold text-center mb-12">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Upload', desc: 'Drop any contract. Lease, employment offer, NDA, freelancer agreement.' },
              { step: '2', title: 'Scan', desc: 'Our AI reads every clause, translates it to plain English, and checks what\'s missing.' },
              { step: '3', title: 'Understand', desc: 'Get a risk grade, danger spots, and pushback language — all in seconds.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-accent text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">
                  {step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-text-secondary text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contract types */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <p className="text-center text-text-secondary mb-8">
          44 million renter households. 73 million freelancers. Zero affordable ways to understand what you're signing.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { emoji: '🏠', label: 'Apartment Lease' },
            { emoji: '💼', label: 'Job Offer' },
            { emoji: '🤫', label: 'NDA' },
            { emoji: '💻', label: 'Freelancer Contract' },
            { emoji: '📜', label: 'Terms of Service' },
          ].map(({ emoji, label }) => (
            <div key={label} className="bg-bg-secondary border border-border rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">{emoji}</div>
              <div className="text-xs text-text-secondary font-medium">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 text-center">
        <p className="text-xs text-text-muted max-w-2xl mx-auto">
          <strong className="text-text-secondary">Legal Disclaimer:</strong> PlainSight provides legal information for educational purposes. It is not a law firm and does not provide legal advice. Always consult a licensed attorney for legal advice specific to your situation.
        </p>
        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-text-muted">
          <a href="#" className="hover:text-text-secondary">Privacy</a>
          <a href="#" className="hover:text-text-secondary">Terms</a>
          <a href="#" className="hover:text-text-secondary">Contact</a>
        </div>
      </footer>
    </main>
  )
}
```

**Step 3: Commit**

```bash
git add app/page.tsx components/FileDropzone.tsx
git commit -m "feat: add landing page with file upload dropzone"
```

---

## Task 10: Scan Results Page — Layout & Sidebar

**Files:**
- Create: `app/scan/[id]/page.tsx`
- Create: `app/scan/[id]/ScanPageClient.tsx`

**Step 1: Create `app/scan/[id]/page.tsx`** (server component that fetches the scan)

```tsx
import { notFound } from 'next/navigation'
import { getScan } from '@/lib/scan-store'
import { ScanPageClient } from './ScanPageClient'

export default function ScanPage({ params }: { params: { id: string } }) {
  const scan = getScan(params.id)
  if (!scan) notFound()
  return <ScanPageClient scan={scan} />
}
```

**Step 2: Create `app/scan/[id]/ScanPageClient.tsx`** — the full results UI

```tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ScanResult } from '@/lib/types'
import { GradeBadge } from '@/components/GradeBadge'
import { RiskBadge } from '@/components/RiskBadge'
import { LegalDisclaimer } from '@/components/LegalDisclaimer'
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
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-bg-primary/95 backdrop-blur border-b border-border px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-serif font-bold text-lg text-text-primary">PlainSight</Link>
            <span className="text-text-muted">/</span>
            <span className="text-sm text-text-secondary truncate max-w-[200px]">{scan.file_name}</span>
            <span className="px-2 py-0.5 bg-accent-light text-accent text-xs rounded-full font-medium capitalize">
              {scan.contract_type === 'tos' ? 'Terms of Service' : scan.contract_type}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <GradeBadge grade={scan.overall_grade} size="sm" />
              <span className="text-sm text-text-secondary">Grade {scan.overall_grade}</span>
            </div>
            {scan.jurisdiction !== 'Not specified' && (
              <span className="text-xs px-2 py-1 bg-bg-secondary border border-border rounded-full text-text-secondary">
                {scan.jurisdiction}
              </span>
            )}
            <span className="text-xs px-2 py-1 bg-bg-secondary border border-border rounded-full text-text-secondary capitalize">
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

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Risk quick stats */}
        <div className="flex items-center gap-4 mb-6 text-sm">
          <span className="flex items-center gap-1.5 text-risk-red">
            <span className="w-2 h-2 rounded-full bg-risk-red" />
            {redCount} high risk
          </span>
          <span className="flex items-center gap-1.5 text-risk-yellow">
            <span className="w-2 h-2 rounded-full bg-risk-yellow" />
            {yellowCount} medium risk
          </span>
          <span className="flex items-center gap-1.5 text-risk-green">
            <span className="w-2 h-2 rounded-full bg-risk-green" />
            {greenCount} low risk
          </span>
          {scan.ghost_clauses.length > 0 && (
            <span className="flex items-center gap-1.5 text-ghost">
              <span>👻</span>
              {scan.ghost_clauses.length} missing clause{scan.ghost_clauses.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-border mb-6">
          <nav className="flex gap-6 -mb-px">
            {([
              { id: 'overview', label: 'Overview' },
              { id: 'clauses', label: `Clauses (${scan.clauses.length})` },
              { id: 'ghosts', label: `👻 Missing (${scan.ghost_clauses.length})` },
              { id: 'timeline', label: `📅 Timeline (${scan.timeline_events.length})` },
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`py-3 text-sm font-medium border-b-2 transition-colors ${
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
```

**Step 3: Create the tabs directory**

```bash
mkdir -p app/scan/\[id\]/tabs
```

**Step 4: Commit**

```bash
git add app/scan/
git commit -m "feat: add scan results page shell with sticky header and tabs"
```

---

## Task 11: Overview Tab

**Files:**
- Create: `app/scan/[id]/tabs/OverviewTab.tsx`
- Create: `components/RiskMeter.tsx`

**Step 1: Create `components/RiskMeter.tsx`**

```tsx
export function RiskMeter({ score }: { score: number }) {
  const color = score < 34 ? 'text-risk-green' : score < 67 ? 'text-risk-yellow' : 'text-risk-red'
  const trackColor = score < 34 ? 'bg-risk-green' : score < 67 ? 'bg-risk-yellow' : 'bg-risk-red'
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-text-muted">
        <span>Low Risk</span><span>High Risk</span>
      </div>
      <div className="w-full bg-border rounded-full h-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${trackColor}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className={`text-right text-sm font-bold ${color}`}>{score}/100</p>
    </div>
  )
}
```

**Step 2: Create `app/scan/[id]/tabs/OverviewTab.tsx`**

```tsx
import Link from 'next/link'
import { ScanResult } from '@/lib/types'
import { GradeBadge } from '@/components/GradeBadge'
import { RiskBadge } from '@/components/RiskBadge'
import { RiskMeter } from '@/components/RiskMeter'

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
              {scan.contract_type === 'tos' ? 'Terms of Service' : scan.contract_type} · {scan.jurisdiction}
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
              <span className="text-risk-red font-bold text-sm mt-0.5">{i + 1}</span>
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
            {green > 0 && <div className="bg-risk-green" style={{ width: `${(green/total)*100}%` }} />}
            {yellow > 0 && <div className="bg-risk-yellow" style={{ width: `${(yellow/total)*100}%` }} />}
            {red > 0 && <div className="bg-risk-red" style={{ width: `${(red/total)*100}%` }} />}
          </div>
          <div className="flex gap-6 text-sm">
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-risk-green" />{green} low risk</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-risk-yellow" />{yellow} medium</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-risk-red" />{red} high risk</span>
          </div>
        </div>
      </div>

      {/* Ghost clauses summary */}
      {scan.ghost_clauses.length > 0 && (
        <div className="bg-ghost-bg border border-ghost/20 rounded-xl p-6">
          <h3 className="font-semibold text-ghost mb-2">👻 {scan.ghost_clauses.length} Missing Clause{scan.ghost_clauses.length !== 1 ? 's' : ''}</h3>
          <div className="space-y-1">
            {scan.ghost_clauses.map(g => (
              <div key={g.id} className="flex items-center gap-2 text-sm text-text-secondary">
                <span className={`w-1.5 h-1.5 rounded-full ${g.severity === 'high' ? 'bg-risk-red' : g.severity === 'medium' ? 'bg-risk-yellow' : 'bg-text-muted'}`} />
                {g.title}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add app/scan/\[id\]/tabs/OverviewTab.tsx components/RiskMeter.tsx
git commit -m "feat: add overview tab with TL;DR card, risk distribution, and ghost summary"
```

---

## Task 12: Clauses Tab

**Files:**
- Create: `app/scan/[id]/tabs/ClausesTab.tsx`

**Step 1: Create `app/scan/[id]/tabs/ClausesTab.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { ClauseAnalysis, RiskLevel } from '@/lib/types'
import { RiskBadge } from '@/components/RiskBadge'
import { CopyButton } from '@/components/CopyButton'

function ClauseCard({ clause }: { clause: ClauseAnalysis }) {
  const [open, setOpen] = useState(false)

  const bgColor = clause.risk_level === 'red' ? 'border-risk-red/30 bg-risk-red-bg/30' :
    clause.risk_level === 'yellow' ? 'border-risk-yellow/30 bg-risk-yellow-bg/30' :
    'border-border bg-bg-document'

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${bgColor}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left p-4 flex items-center gap-3"
      >
        <RiskBadge level={clause.risk_level} showLabel={false} />
        <span className="text-xs text-text-muted uppercase tracking-wide bg-bg-secondary px-2 py-0.5 rounded-full">
          {clause.category.replace(/_/g, ' ')}
        </span>
        <span className="text-sm text-text-primary flex-1 truncate">{clause.plain_english}</span>
        <span className="text-text-muted text-xs">{open ? '▲' : '▼'}</span>
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

          {/* Risk score */}
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
            <div className={`rounded-lg p-3 ${clause.risk_level === 'red' ? 'bg-risk-red-bg border border-risk-red/20' : 'bg-risk-yellow-bg border border-risk-yellow/20'}`}>
              <p className={`text-xs font-semibold mb-1 ${clause.risk_level === 'red' ? 'text-risk-red' : 'text-risk-yellow'}`}>
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

export function ClausesTab({ clauses }: { clauses: ClauseAnalysis[] }) {
  const [filter, setFilter] = useState<'all' | 'red' | 'yellow_red'>('all')

  const filtered = clauses.filter(c => {
    if (filter === 'red') return c.risk_level === 'red'
    if (filter === 'yellow_red') return c.risk_level !== 'green'
    return true
  })

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-2 mb-6">
        {([
          { id: 'all', label: `All (${clauses.length})` },
          { id: 'yellow_red', label: `⚠ Yellow + Red (${clauses.filter(c => c.risk_level !== 'green').length})` },
          { id: 'red', label: `🔴 Red only (${clauses.filter(c => c.risk_level === 'red').length})` },
        ] as const).map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              filter === f.id ? 'bg-text-primary text-white border-text-primary' : 'bg-bg-secondary border-border text-text-secondary hover:border-text-primary'
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
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add app/scan/\[id\]/tabs/ClausesTab.tsx
git commit -m "feat: add clause-by-clause tab with expandable cards and filters"
```

---

## Task 13: Ghost Clauses Tab

**Files:**
- Create: `app/scan/[id]/tabs/GhostTab.tsx`

**Step 1: Create `app/scan/[id]/tabs/GhostTab.tsx`**

```tsx
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
        <span className={`text-xs px-2 py-1 rounded-full border font-medium ${s.color}`}>
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
        <p className="text-text-secondary text-sm">This contract appears to cover the standard provisions for its type.</p>
      </div>
    )
  }

  const sorted = [...ghosts].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 }
    return order[a.severity] - order[b.severity]
  })

  return (
    <div className="max-w-3xl space-y-4">
      <p className="text-sm text-text-secondary mb-6">
        These are protections or terms that are commonly found in {' '}
        this type of contract but are absent here.
      </p>
      {sorted.map(ghost => <GhostCard key={ghost.id} ghost={ghost} />)}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add app/scan/\[id\]/tabs/GhostTab.tsx
git commit -m "feat: add ghost clauses tab"
```

---

## Task 14: Timeline Tab

**Files:**
- Create: `app/scan/[id]/tabs/TimelineTab.tsx`

**Step 1: Create `app/scan/[id]/tabs/TimelineTab.tsx`**

```tsx
import { TimelineEvent, TimelineEventType } from '@/lib/types'

const typeConfig: Record<TimelineEventType, { icon: string; color: string }> = {
  start: { icon: '🟢', color: 'border-risk-green' },
  end: { icon: '🔴', color: 'border-risk-red' },
  payment: { icon: '💳', color: 'border-risk-yellow' },
  renewal: { icon: '🔄', color: 'border-accent' },
  deadline: { icon: '⏰', color: 'border-risk-red' },
  other: { icon: '📌', color: 'border-border' },
}

function generateICS(event: TimelineEvent): string {
  const dtstart = event.date ? event.date.replace(/-/g, '') : ''
  const uid = `plainsight-${event.id}@plainsight.app`
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PlainSight//EN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `SUMMARY:${event.label}`,
    dtstart ? `DTSTART:${dtstart}` : '',
    `DESCRIPTION:${event.notes ?? ''}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n')
}

function downloadICS(event: TimelineEvent) {
  const blob = new Blob([generateICS(event)], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${event.label.replace(/\s+/g, '-')}.ics`
  a.click()
  URL.revokeObjectURL(url)
}

function EventNode({ event }: { event: TimelineEvent }) {
  const { icon, color } = typeConfig[event.type]
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-full border-2 ${color} bg-bg-document flex items-center justify-center text-base`}>
          {icon}
        </div>
        <div className="w-0.5 bg-border flex-1 mt-1" />
      </div>
      <div className="pb-8 flex-1">
        <div className="bg-bg-document border border-border rounded-xl p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-medium text-sm">{event.label}</h4>
            {event.date && (
              <button
                onClick={() => downloadICS(event)}
                className="text-xs text-accent hover:underline whitespace-nowrap"
              >
                + Calendar
              </button>
            )}
          </div>
          <p className="text-xs text-text-muted mb-2">
            {event.date
              ? new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
              : event.relative}
          </p>
          {event.notes && <p className="text-xs text-text-secondary">{event.notes}</p>}
        </div>
      </div>
    </div>
  )
}

export function TimelineTab({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="max-w-3xl text-center py-16">
        <div className="text-4xl mb-4">📅</div>
        <p className="font-semibold text-lg mb-2">No specific dates found</p>
        <p className="text-text-secondary text-sm">
          No specific dates were detected in this contract. Consider requesting a clear timeline from the other party.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="mt-4">
        {events.map(event => <EventNode key={event.id} event={event} />)}
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add app/scan/\[id\]/tabs/TimelineTab.tsx
git commit -m "feat: add timeline tab with calendar export"
```

---

## Task 15: Shareable TL;DR Page + OpenGraph Image

**Files:**
- Create: `app/scan/[id]/share/page.tsx`
- Create: `app/scan/[id]/share/opengraph-image.tsx`

**Step 1: Create `app/scan/[id]/share/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getScan } from '@/lib/scan-store'
import { GradeBadge } from '@/components/GradeBadge'
import { RiskBadge } from '@/components/RiskBadge'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const scan = getScan(params.id)
  if (!scan) return {}
  return {
    title: `My ${scan.contract_type} contract: Grade ${scan.overall_grade} | PlainSight`,
    description: scan.tldr_summary,
    openGraph: {
      title: `My ${scan.contract_type} got a Grade ${scan.overall_grade} on PlainSight`,
      description: scan.tldr_summary,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `My ${scan.contract_type} got a Grade ${scan.overall_grade} on PlainSight`,
      description: scan.tldr_summary,
    },
  }
}

export default function SharePage({ params }: { params: { id: string } }) {
  const scan = getScan(params.id)
  if (!scan) notFound()

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-6">
      <div className="max-w-lg w-full bg-bg-document border border-border rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-border flex items-center justify-between">
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Contract Grade</p>
            <p className="font-serif text-xl font-bold capitalize">
              {scan.contract_type === 'tos' ? 'Terms of Service' : scan.contract_type}
            </p>
          </div>
          <GradeBadge grade={scan.overall_grade} size="lg" />
        </div>

        {/* Summary */}
        <div className="p-8 border-b border-border">
          <p className="text-text-secondary text-sm leading-relaxed">{scan.tldr_summary}</p>
        </div>

        {/* Top concerns */}
        <div className="p-8 border-b border-border space-y-3">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Top Concerns</p>
          {scan.top_concerns.map((c, i) => (
            <div key={i} className="flex gap-3 text-sm">
              <span className="text-risk-red font-bold">{i + 1}</span>
              <span className="text-text-secondary">{c}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="p-8 bg-bg-secondary text-center">
          <p className="text-sm text-text-secondary mb-4">Scan your own contract in seconds</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-accent text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Try PlainSight →
          </Link>
        </div>
      </div>

      <p className="mt-6 text-xs text-text-muted text-center max-w-sm">
        PlainSight provides general legal information for educational purposes only. Not legal advice.
      </p>
    </div>
  )
}
```

**Step 2: Create `app/scan/[id]/share/opengraph-image.tsx`**

```tsx
import { ImageResponse } from 'next/og'
import { getScan } from '@/lib/scan-store'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const gradeColors: Record<string, string> = {
  A: '#16A34A', B: '#0D9488', C: '#CA8A04', D: '#EA580C', F: '#DC2626',
}

export default function OGImage({ params }: { params: { id: string } }) {
  const scan = getScan(params.id)
  if (!scan) return new ImageResponse(<div>Not found</div>)

  const gradeColor = gradeColors[scan.overall_grade] ?? '#57534E'

  return new ImageResponse(
    <div
      style={{
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        backgroundColor: '#FAFAF9', padding: 80, fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
        <div>
          <div style={{ fontSize: 20, color: '#A8A29E', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 2 }}>
            Contract Grade
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#1C1917' }}>
            {scan.contract_type === 'tos' ? 'Terms of Service' : scan.contract_type}
          </div>
        </div>
        <div style={{
          width: 160, height: 160, borderRadius: '50%', backgroundColor: gradeColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 80, fontWeight: 700, color: 'white',
        }}>
          {scan.overall_grade}
        </div>
      </div>
      <div style={{ fontSize: 22, color: '#57534E', lineHeight: 1.5, marginBottom: 40 }}>
        {scan.tldr_summary}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: '#2563EB' }}>
        PlainSight — See what you're really signing.
      </div>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add app/scan/\[id\]/share/
git commit -m "feat: add shareable TL;DR page with OG image generation"
```

---

## Task 16: Pricing Page & Not-Found Page

**Files:**
- Create: `app/pricing/page.tsx`
- Create: `app/not-found.tsx`

**Step 1: Create `app/pricing/page.tsx`**

```tsx
import Link from 'next/link'

const plans = [
  {
    name: 'Free', price: '$0', period: '/month',
    features: ['1 scan per month', 'Plain English translation', 'Risk scoring', 'TL;DR card'],
    notIncluded: ['Ghost Clause detection', 'Benchmark comparisons', 'Negotiation ammo', 'Calendar export'],
    cta: 'Get Started', href: '/', highlight: false,
  },
  {
    name: 'Pro', price: '$9.99', period: '/month',
    features: ['Unlimited scans', 'Plain English translation', 'Risk scoring', 'TL;DR card', 'Ghost Clause detection', 'Benchmark comparisons', 'Negotiation ammo', 'Calendar export', 'Full scan history'],
    notIncluded: [],
    cta: 'Start Pro', href: '/', highlight: true,
  },
  {
    name: 'Per Scan', price: '$4.99', period: '/scan',
    features: ['Pay as you go', 'Plain English translation', 'Risk scoring', 'TL;DR card', 'Ghost Clause detection', 'Benchmark comparisons', 'Negotiation ammo', 'Calendar export'],
    notIncluded: [],
    cta: 'Buy a Scan', href: '/', highlight: false,
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <nav className="border-b border-border px-6 py-4">
        <Link href="/" className="font-serif text-xl font-bold">PlainSight</Link>
      </nav>
      <main className="max-w-5xl mx-auto px-6 py-20">
        <h1 className="font-serif text-4xl font-bold text-center mb-4">Simple, transparent pricing</h1>
        <p className="text-text-secondary text-center mb-16">Start free. No credit card required.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div key={plan.name} className={`rounded-2xl border p-8 ${plan.highlight ? 'border-accent bg-accent-light ring-2 ring-accent' : 'border-border bg-bg-document'}`}>
              <h2 className="font-serif text-2xl font-bold mb-1">{plan.name}</h2>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-text-muted text-sm">{plan.period}</span>
              </div>
              <ul className="space-y-2 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <span className="text-risk-green">✓</span>{f}
                  </li>
                ))}
                {plan.notIncluded.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-text-muted">
                    <span>✕</span>{f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`block text-center py-3 rounded-xl font-medium transition-colors ${plan.highlight ? 'bg-accent text-white hover:bg-blue-700' : 'bg-bg-secondary border border-border hover:bg-border'}`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
```

**Step 2: Create `app/not-found.tsx`**

```tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center text-center px-6">
      <div>
        <p className="text-6xl mb-6">📋</p>
        <h1 className="font-serif text-3xl font-bold mb-4">Page not found</h1>
        <p className="text-text-secondary mb-8">That scan may have expired or doesn't exist.</p>
        <Link href="/" className="px-6 py-3 bg-accent text-white rounded-xl hover:bg-blue-700 transition-colors">
          Back to PlainSight
        </Link>
      </div>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add app/pricing/ app/not-found.tsx
git commit -m "feat: add pricing page and 404 page"
```

---

## Task 17: Final Polish — next.config, PDF parse fix, and verify

**Files:**
- Modify: `next.config.ts`

**Step 1: Update `next.config.ts`** to allow pdf-parse to work in Next.js (it uses Node APIs)

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdf-parse'],
}

export default nextConfig
```

**Step 2: Run dev server and verify all routes work**

```bash
npm run dev
```

Check:
- `http://localhost:3000` — landing page loads
- `http://localhost:3000/scan/demo` — demo scan loads with all 4 tabs
- `http://localhost:3000/scan/demo/share` — shareable page loads
- `http://localhost:3000/pricing` — pricing page loads

**Step 3: Run build to check for TypeScript errors**

```bash
npm run build
```

Fix any TypeScript or build errors before proceeding.

**Step 4: Final commit**

```bash
git add .
git commit -m "feat: complete PlainSight MVP — contract analysis web app"
```

---

## Summary of What Gets Built

| Route | Description |
|-------|-------------|
| `/` | Landing page with drag-and-drop upload |
| `/scan/demo` | Pre-loaded NYC apartment lease demo |
| `/scan/[id]` | Full results: Overview, Clauses, Ghost, Timeline tabs |
| `/scan/[id]/share` | Public TL;DR card with OG image |
| `/pricing` | Pricing tiers |

**Core features:**
- PDF text extraction via `pdf-parse`
- Claude API analysis → structured JSON
- Risk color system (green/yellow/red) throughout
- Ghost clause detection tab
- Timeline with .ics export
- Shareable OG page

**MVP deliberately excludes:** Supabase auth, Stripe, scan history, .docx support (v1.1 items per PRD)
