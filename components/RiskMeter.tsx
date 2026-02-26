export function RiskMeter({ score }: { score: number }) {
  const color = score < 34 ? 'text-risk-green' : score < 67 ? 'text-risk-yellow' : 'text-risk-red'
  const trackColor = score < 34 ? 'bg-risk-green' : score < 67 ? 'bg-risk-yellow' : 'bg-risk-red'
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-text-muted">
        <span>Low Risk</span><span>High Risk</span>
      </div>
      <div className="w-full bg-border rounded-full h-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${trackColor}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className={`text-right text-sm font-bold ${color}`}>{score}/100</p>
    </div>
  )
}
