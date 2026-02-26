import { NextRequest, NextResponse } from 'next/server'
import { getScan } from '@/lib/scan-store'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const scan = getScan(id)
  if (!scan) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(scan)
}
