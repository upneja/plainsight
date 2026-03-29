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

    if (!scan || typeof scan !== 'object') {
      return NextResponse.json({ error: 'INVALID_REQUEST' }, { status: 400 })
    }
    if (!Array.isArray(selectedClauses) || !Array.isArray(selectedGhosts)) {
      return NextResponse.json({ error: 'INVALID_REQUEST' }, { status: 400 })
    }

    if (!selectedClauses?.length && !selectedGhosts?.length) {
      return NextResponse.json({ error: 'NO_ITEMS_SELECTED' }, { status: 400 })
    }

    const clausesToUse = selectedClauses.slice(0, 20)
    const ghostsToUse = selectedGhosts.slice(0, 20)

    const clauseLines = clausesToUse.map((c, i) =>
      `${i + 1}. [${c.category.replace(/_/g, ' ')}]\n   Plain English: \`${c.plain_english}\`\n   Concern: \`${c.concern ?? 'N/A'}\`\n   Suggested language: \`${c.negotiation_ammo ?? 'N/A'}\``
    ).join('\n\n')

    const ghostLines = ghostsToUse.map((g, i) =>
      `${i + 1}. Missing: \`${g.title}\`\n   Why it matters: \`${g.why_it_matters}\`\n   Standard version: \`${g.standard_version}\``
    ).join('\n\n')

    const prompt = `You are helping a ${scan.detected_party_side} write a professional negotiation email about their ${scan.contract_type} contract${scan.jurisdiction !== 'Not specified' ? ` in \`${scan.jurisdiction}\`` : ''}.

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
    if (!content || content.type !== 'text') {
      return NextResponse.json({ error: 'GENERATION_FAILED' }, { status: 500 })
    }

    return NextResponse.json({ email: content.text })
  } catch (err) {
    console.error('Email generation error:', err)
    return NextResponse.json({ error: 'GENERATION_FAILED' }, { status: 500 })
  }
}
