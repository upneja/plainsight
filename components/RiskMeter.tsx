export function RiskMeter({ score }: { score: number }) {
  const s = Math.min(100, Math.max(0, score))
  const color = s < 34 ? 'text-risk-green' : s < 67 ? 'text-risk-yellow' : 'text-risk-red'
  const trackColor = s < 34 ? 'bg-risk-green' : s < 67 ? 'bg-risk-yellow' : 'bg-risk-red'
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-text-muted">
        <span>Low Risk</span><span>High Risk</span>
      </div>
      <div className="w-full bg-border rounded-full h-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${trackColor}`}
          style={{ width: `${s}%` }}
        />
      </div>
      <p className={`text-right text-sm font-bold ${color}`}>{s}/100</p>
    </div>
  )
}
