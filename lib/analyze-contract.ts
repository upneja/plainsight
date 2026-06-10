import Anthropic from '@anthropic-ai/sdk'
import { ANALYSIS_SYSTEM_PROMPT } from './prompts'
import type { ScanResult } from './types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

function assertValidScanPayload(obj: unknown): void {
  if (!obj || typeof obj !== 'object') {
    throw Object.assign(new Error('ANALYSIS_INVALID_RESPONSE'), { nonRetryable: true })
  }
  const o = obj as Record<string, unknown>
  if (!Array.isArray(o.clauses) || !Array.isArray(o.ghost_clauses) || !Array.isArray(o.timeline_events)) {
    throw Object.assign(new Error('ANALYSIS_INVALID_RESPONSE'), { nonRetryable: true })
  }
  if (!['A', 'B', 'C', 'D', 'F'].includes(o.overall_grade as string)) {
    throw Object.assign(new Error('ANALYSIS_INVALID_RESPONSE'), { nonRetryable: true })
  }
}

export async function analyzeContract(contractText: string, fileName: string): Promise<ScanResult> {
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

      const block = response.content[0]
      if (block.type !== 'text') {
        throw Object.assign(new Error('ANALYSIS_INVALID_RESPONSE'), { nonRetryable: true })
      }

      // The model reliably wraps its JSON in markdown fences despite the
      // prompt asking for raw JSON — strip them before parsing.
      const raw = block.text.trim()
      const fenced = raw.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/)
      let parsed: unknown
      try {
        parsed = JSON.parse(fenced ? fenced[1] : raw)
      } catch {
        throw Object.assign(new Error('ANALYSIS_INVALID_RESPONSE'), { nonRetryable: true })
      }

      assertValidScanPayload(parsed)

      return {
        id: crypto.randomUUID(),
        file_name: fileName,
        created_at: new Date().toISOString(),
        ...(parsed as object),
      } as ScanResult
    } catch (err) {
      const error = err as Error & { nonRetryable?: boolean }
      if (error.nonRetryable) throw error
      lastError = error
      if (attempt < 2) {
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000))
      }
    }
  }

  throw lastError ?? new Error('Analysis failed')
}
