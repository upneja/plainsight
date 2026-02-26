import { notFound } from 'next/navigation'
import { getScan } from '@/lib/scan-store'
import { ScanPageClient } from './ScanPageClient'

export default async function ScanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const scan = getScan(id)
  if (!scan) notFound()
  return <ScanPageClient scan={scan} />
}
