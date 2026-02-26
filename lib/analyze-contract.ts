import Anthropic from '@anthropic-ai/sdk'
import { ANALYSIS_SYSTEM_PROMPT } from './prompts'
import type { ScanResult } from './types'

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
