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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'UNSUPPORTED_FORMAT'
      if (message === 'PDF_UNREADABLE' || message === 'UNSUPPORTED_FORMAT') {
        return NextResponse.json({ error: message }, { status: 422 })
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
