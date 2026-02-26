'use client'
import { TimelineEvent, TimelineEventType } from '@/lib/types'

const typeConfig: Record<TimelineEventType, { icon: string; color: string }> = {
  start: { icon: '🟢', color: 'border-risk-green' },
  end: { icon: '🔴', color: 'border-risk-red' },
  payment: { icon: '💳', color: 'border-risk-yellow' },
  renewal: { icon: '🔄', color: 'border-accent' },
  deadline: { icon: '⏰', color: 'border-risk-red' },
  other: { icon: '📌', color: 'border-border' },
}

function generateICS(event: TimelineEvent): string {
  const dtstart = event.date ? event.date.replace(/-/g, '') : ''
  const uid = `plainsight-${event.id}@plainsight.app`
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PlainSight//EN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `SUMMARY:${event.label}`,
    dtstart ? `DTSTART;VALUE=DATE:${dtstart}` : '',
    dtstart ? `DTEND;VALUE=DATE:${dtstart}` : '',
    `DESCRIPTION:${event.notes ?? ''}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n')
}

function downloadICS(event: TimelineEvent) {
  const blob = new Blob([generateICS(event)], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${event.label.replace(/\s+/g, '-')}.ics`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function EventNode({ event }: { event: TimelineEvent }) {
  const { icon, color } = typeConfig[event.type]
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-full border-2 ${color} bg-bg-document flex items-center justify-center text-base shrink-0`}>
          {icon}
        </div>
        <div className="w-0.5 bg-border flex-1 mt-1" />
      </div>
      <div className="pb-8 flex-1">
        <div className="bg-bg-document border border-border rounded-xl p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-medium text-sm">{event.label}</h4>
            {event.date && (
              <button
                onClick={() => downloadICS(event)}
                className="text-xs text-accent hover:underline whitespace-nowrap shrink-0"
              >
                + Calendar
              </button>
            )}
          </div>
          <p className="text-xs text-text-muted mb-2">
            {event.date
              ? new Date(event.date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })
              : event.relative}
          </p>
          {event.notes && <p className="text-xs text-text-secondary">{event.notes}</p>}
        </div>
      </div>
    </div>
  )
}

export function TimelineTab({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="max-w-3xl text-center py-16">
        <div className="text-4xl mb-4">📅</div>
        <p className="font-semibold text-lg mb-2">No specific dates found</p>
        <p className="text-text-secondary text-sm">
          No specific dates were detected in this contract. Consider requesting a clear timeline from the other party.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="mt-4">
        {events.map(event => <EventNode key={event.id} event={event} />)}
      </div>
    </div>
  )
}
