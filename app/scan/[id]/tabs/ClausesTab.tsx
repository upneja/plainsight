import { ClauseAnalysis } from '@/lib/types'
export function ClausesTab({ clauses }: { clauses: ClauseAnalysis[] }) {
  return <div className="text-text-muted p-8 text-center">Clauses ({clauses.length}) coming soon...</div>
}
