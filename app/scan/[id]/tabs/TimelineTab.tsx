import { TimelineEvent } from '@/lib/types'
export function TimelineTab({ events }: { events: TimelineEvent[] }) {
  return <div className="text-text-muted p-8 text-center">Timeline ({events.length}) coming soon...</div>
}
