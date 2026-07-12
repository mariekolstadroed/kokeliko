import { IconCalendar, IconClock, IconUsers } from '@tabler/icons-react'
import type { Event } from '@/types'

type Props = {
  event: Event
  registrationCount: number
  onRegister: () => void
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('nb-NO', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
}

export default function EventCard({ event, registrationCount, onRegister }: Props) {
  const isFull = event.max_capacity !== null && registrationCount >= event.max_capacity
  const isPast = event.event_date < new Date().toISOString().slice(0, 10)

  return (
    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
      <div className="relative h-56 bg-stone-100 overflow-hidden">
        {event.image_url ? (
          <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300 text-sm italic">
            Ingen bilde
          </div>
        )}
        {isPast && <div className="absolute inset-0 bg-white/50" />}
        {isPast && (
          <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[12px] font-semibold bg-stone-600/70 text-white">
            Arrangementet har vært
          </span>
        )}
      </div>

      <div className={`p-6 flex flex-col gap-3 flex-1${isPast ? ' opacity-70' : ''}`}>
        <h2 className="text-2xl font-bold font-special-elite text-[#2E1608] leading-snug">
          {event.title}
        </h2>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-stone-500">
          <span className="flex items-center gap-1.5">
            <IconCalendar size={15} />
            {formatDate(event.event_date)}
          </span>
          <span className="flex items-center gap-1.5">
            <IconClock size={15} />
            {event.event_start_time.slice(0, 5)}
            {event.event_end_time ? ` – ${event.event_end_time.slice(0, 5)}` : ''}
          </span>
          {event.max_capacity && (
            <span className="flex items-center gap-1.5">
              <IconUsers size={15} />
              {registrationCount} / {event.max_capacity}
            </span>
          )}
        </div>

        {event.description && (
          <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">
            {event.description}
          </p>
        )}

        <div className="mt-auto pt-4">
          {isPast ? (
            <span className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-stone-400 border border-stone-200 rounded-lg">
              Arrangementet har vært
            </span>
          ) : isFull ? (
            <span className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-stone-400 border border-stone-200 rounded-lg">
              Fulltegnet
            </span>
          ) : (
            <button
              onClick={onRegister}
              className="px-5 py-2.5 bg-[#3d1f08] text-white text-sm font-medium rounded-lg hover:bg-[#2e1608] transition-colors"
            >
              Meld deg på
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
