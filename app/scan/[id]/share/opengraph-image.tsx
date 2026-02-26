import { ImageResponse } from 'next/og'
import { getScan } from '@/lib/scan-store'

export const runtime = 'nodejs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const gradeColors: Record<string, string> = {
  A: '#16A34A',
  B: '#0D9488',
  C: '#CA8A04',
  D: '#EA580C',
  F: '#DC2626',
}

export default async function OGImage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const scan = getScan(id)
  if (!scan) {
    return new ImageResponse(
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFAF9' }}>
        <div style={{ fontSize: 32, color: '#57534E' }}>Not found</div>
      </div>,
      { width: 1200, height: 630 }
    )
  }

  const gradeColor = gradeColors[scan.overall_grade] ?? '#57534E'
  const contractLabel = scan.contract_type === 'tos' ? 'Terms of Service' : scan.contract_type

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: '#FAFAF9',
        padding: 80,
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 20, color: '#A8A29E', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 2 }}>
            Contract Grade
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#1C1917' }}>
            {contractLabel}
          </div>
        </div>
        <div
          style={{
            width: 160,
            height: 160,
            borderRadius: '50%',
            backgroundColor: gradeColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 80,
            fontWeight: 700,
            color: 'white',
          }}
        >
          {scan.overall_grade}
        </div>
      </div>
      <div style={{ fontSize: 22, color: '#57534E', lineHeight: 1.5, marginBottom: 40 }}>
        {scan.tldr_summary.length > 200 ? scan.tldr_summary.slice(0, 200) + '...' : scan.tldr_summary}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: '#2563EB' }}>
        PlainSight — See what you're really signing.
      </div>
    </div>,
    { width: 1200, height: 630 }
  )
}
