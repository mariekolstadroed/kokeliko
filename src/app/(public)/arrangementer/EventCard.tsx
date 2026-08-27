import Image from 'next/image'
import { IconCalendar, IconClock, IconUsers, IconPhotoOff } from '@tabler/icons-react'
import { toLocalISODate } from '@/lib/date'
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
  const isPast = !!event.event_date && event.event_date < toLocalISODate(new Date())

  return (
    <div className="bg-4 border border-3 rounded-2xl overflow-hidden shadow-sm shadow-1/30 flex flex-col">
      <div className="relative h-56 overflow-hidden bg-2">
        {event.image_url ? (
          <Image unoptimized src={event.image_url} alt={event.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-2">
            <IconPhotoOff className="w-14 h-14 text-3" strokeWidth={1.5} aria-hidden />
          </div>
        )}
        {event.image_url && <div className="absolute inset-0 bg-1/20" />}
        {isPast && <div className="absolute inset-0 bg-4/50" />}
        {isPast && (
          <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[12px] font-semibold bg-1/70 text-4">
            Arrangementet har vært
          </span>
        )}
      </div>

      <div className={`p-6 flex flex-col gap-3 flex-1${isPast ? ' opacity-70' : ''}`}>
        <h2 className="text-2xl font-bold font-special-elite text-1 leading-snug">
          {event.title}
        </h2>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-m font-medium text-5">
          {event.event_date && event.event_start_time ? (
            <>
              <span className="flex items-center gap-1.5">
                <IconCalendar size={15} />
                {formatDate(event.event_date)}
              </span>
              <span className="flex items-center gap-1.5">
                <IconClock size={15} />
                {event.event_start_time.slice(0, 5)}
                {event.event_end_time ? ` – ${event.event_end_time.slice(0, 5)}` : ''}
              </span>
            </>
          ) : (
            <span className="flex items-center gap-1.5 italic">
              <IconCalendar size={15} />
              Dato og tid kommer
            </span>
          )}
          {event.max_capacity ? (
            <span className="flex items-center gap-1.5">
              <IconUsers size={15} />
              {registrationCount} / {event.max_capacity}
            </span>
          ) : registrationCount > 0 && (
            <span className="flex items-center gap-1.5">
              <IconUsers size={15} />
              {registrationCount} påmeldt
            </span>
          )}
        </div>

        {event.description && (
          <p className="text-2 text-sm leading-relaxed whitespace-pre-line">
            {event.description}
          </p>
        )}

        <div className="mt-auto pt-4">
          {isPast ? (
            <span className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-2 border border-3 rounded-lg">
              Arrangementet har vært
            </span>
          ) : isFull ? (
            <span className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-2 border border-3 rounded-lg">
              Fulltegnet
            </span>
          ) : (
            <button
              onClick={onRegister}
              className="px-5 py-2.5 bg-1 text-4 text-base font-special-elite rounded-lg shadow-sm shadow-1/30 hover:brightness-125 transition-colors"
            >
              Meld deg på
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
