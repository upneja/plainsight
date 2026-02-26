import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getScan } from '@/lib/scan-store'
import { GradeBadge } from '@/components/GradeBadge'
import type { Metadata } from 'next'

const CONTRACT_LABELS: Record<string, string> = {
  lease: 'Lease',
  employment: 'Employment',
  nda: 'NDA',
  freelancer: 'Freelancer',
  tos: 'Terms of Service',
  other: 'Contract',
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const scan = getScan(id)
  if (!scan) return {}
  const contractLabel = CONTRACT_LABELS[scan.contract_type] ?? scan.contract_type
  return {
    title: `My ${contractLabel} contract: Grade ${scan.overall_grade} | PlainSight`,
    description: scan.tldr_summary,
    openGraph: {
      title: `My ${contractLabel} got a Grade ${scan.overall_grade} on PlainSight`,
      description: scan.tldr_summary,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `My ${contractLabel} got a Grade ${scan.overall_grade} on PlainSight`,
      description: scan.tldr_summary,
    },
  }
}

export default async function SharePage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const scan = getScan(id)
  if (!scan) return notFound()

  const contractLabel = CONTRACT_LABELS[scan.contract_type] ?? scan.contract_type

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-6">
      <div className="max-w-lg w-full bg-bg-document border border-border rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-border flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Contract Grade</p>
            <p className="font-serif text-xl font-bold capitalize">{contractLabel}</p>
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
              <span className="text-risk-red font-bold shrink-0">{i + 1}</span>
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
