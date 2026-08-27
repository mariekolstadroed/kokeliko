'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toLocalISODate } from '@/lib/date'
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
    const [{ data: evts }, countsRes] = await Promise.all([
      supabase.from('events').select('*').eq('published', true).order('event_date'),
      fetch('/api/events/counts'),
    ])
    const today = toLocalISODate(new Date())
    const sorted = (evts ?? []).sort((a, b) => {
      const aPast = !!a.event_date && a.event_date < today
      const bPast = !!b.event_date && b.event_date < today
      if (aPast !== bPast) return aPast ? 1 : -1
      if (a.event_date === b.event_date) return 0
      if (!a.event_date) return 1
      if (!b.event_date) return -1
      return a.event_date.localeCompare(b.event_date)
    })
    setEvents(sorted)
    setCounts(countsRes.ok ? await countsRes.json() : {})
    setLoading(false)
  }

  if (loading) {
    return <div className="text-sm text-2 text-center py-16">Laster…</div>
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-16 text-5 font-semibold italic text-sm md:text-base lg:text-lg">
        Ingen kommende arrangementer
      </div>
    )
  }

  return (
    <>
      <div className={events.length === 1
        ? 'max-w-lg lg:max-w-2xl mx-auto'
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
