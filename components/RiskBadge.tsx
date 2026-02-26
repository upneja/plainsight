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
