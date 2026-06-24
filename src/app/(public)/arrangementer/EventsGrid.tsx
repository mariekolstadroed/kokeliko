'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Event } from '@/types'
import EventCard from './EventCard'
import RegistrationModal from './RegistrationModal'

export default function EventsGrid() {
  const [events, setEvents] = useState<Event[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const [{ data: evts }, { data: regs }] = await Promise.all([
      supabase.from('events').select('*').eq('published', true).order('event_date'),
      supabase.from('event_registration').select('event_id'),
    ])
    setEvents(evts ?? [])
    const c: Record<string, number> = {}
    ;(regs ?? []).forEach(r => { c[r.event_id] = (c[r.event_id] ?? 0) + 1 })
    setCounts(c)
    setLoading(false)
  }

  if (loading) {
    return <div className="text-sm text-stone-400 text-center py-16">Laster…</div>
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-16 text-stone-400 italic text-sm">
        Ingen kommende arrangementer
      </div>
    )
  }

  return (
    <>
      <div className={events.length === 1
        ? 'max-w-2xl'
        : 'grid grid-cols-1 md:grid-cols-2 gap-8 items-start'
      }>
        {events.map(event => (
          <EventCard
            key={event.id}
            event={event}
            registrationCount={counts[event.id] ?? 0}
            onRegister={() => setSelectedEvent(event)}
          />
        ))}
      </div>

      {selectedEvent && (
        <RegistrationModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onRegistered={fetchAll}
        />
      )}
    </>
  )
}
