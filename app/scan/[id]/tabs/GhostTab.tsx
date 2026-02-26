import { GhostClause } from '@/lib/types'
export function GhostTab({ ghosts }: { ghosts: GhostClause[] }) {
  return <div className="text-text-muted p-8 text-center">Ghost clauses ({ghosts.length}) coming soon...</div>
}
