'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import type { Event } from '@/types'
import EventModal from './EventModal'
import RegistrationsModal from './RegistrationsModal'
import UpdateAttendeesModal from './UpdateAttendeesModal'
import {
  IconPlus, IconCalendar, IconClock, IconUsers,
  IconEdit, IconTrash, IconEye, IconEyeOff, IconPhotoOff, IconMail,
} from '@tabler/icons-react'

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('nb-NO', { day: 'numeric', month: 'long' })
}

function formatTime(t: string) {
  return t.slice(0, 5)
}

const today = new Date().toISOString().slice(0, 10)

export default function EventsSection() {
  const [events, setEvents] = useState<Event[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [eventModal, setEventModal] = useState<{ open: boolean; event?: Event }>({ open: false })
  const [registrationsEvent, setRegistrationsEvent] = useState<Event | null>(null)
  const [updateEvent, setUpdateEvent] = useState<Event | null>(null)
  const [confirmEventId, setConfirmEventId] = useState<string | null>(null)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const [{ data: evts }, { data: regs }] = await Promise.all([
      supabase.from('events').select('*').order('event_date'),
      supabase.from('event_registration').select('event_id'),
    ])
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
    const c: Record<string, number> = {}
    ;(regs ?? []).forEach(r => { c[r.event_id] = (c[r.event_id] ?? 0) + 1 })
    setCounts(c)
    setLoading(false)
  }

  async function togglePublished(event: Event) {
    setEvents(prev => prev.map(e => e.id === event.id ? { ...e, published: !e.published } : e))
    await supabase.from('events').update({ published: !event.published }).eq('id', event.id)
  }

  async function deleteEvent(id: string) {
    setEvents(prev => prev.filter(e => e.id !== id))
    await supabase.from('events').delete().eq('id', id)
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="text-sm text-stone-400 text-center py-8">Laster…</div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="text-[13px] text-stone-400">{events.length} arrangementer</div>
        <button
          onClick={() => setEventModal({ open: true })}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-md bg-pink-500 border border-pink-500 text-white hover:bg-pink-600 transition-colors"
        >
          <IconPlus size={14} /> Nytt arrangement
        </button>
      </div>

      {events.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-8 text-sm text-stone-400 text-center italic">
          Ingen arrangementer ennå
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map(event => {
            const isPast = !!event.event_date && event.event_date < today
            return (
            <div key={event.id} className={`border rounded-xl overflow-hidden shadow-sm flex flex-col ${confirmEventId === event.id ? 'bg-red-50 border-red-200' : 'bg-white border-stone-200'}`}>

              {confirmEventId === event.id ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 aspect-4/3">
                  <p className="text-[13px] text-stone-700 text-center">Slette <span className="font-bold">{event.title}</span>?</p>
                  {(counts[event.id] ?? 0) > 0 && (
                    <p className="text-[12px] text-red-600 text-center -mt-2">
                      {counts[event.id]} påmeldt{counts[event.id] === 1 ? '' : 'e'} varsles ikke om slettingen.
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setConfirmEventId(null)}
                      className="px-2.5 py-1 text-[11px] font-medium rounded-md border border-red-200 bg-white text-stone-600 hover:bg-red-100 transition-colors"
                    >
                      Avbryt
                    </button>
                    <button
                      onClick={() => { deleteEvent(event.id); setConfirmEventId(null) }}
                      className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                      Slett
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="relative aspect-video bg-stone-100 overflow-hidden">
                    {event.image_url ? (
                      <Image unoptimized src={event.image_url} alt={event.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300">
                        <IconPhotoOff size={28} />
                      </div>
                    )}
                    {isPast && <div className="absolute inset-0 bg-white/50" />}
                    <span className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${event.published ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
                      {event.published ? 'Publisert' : 'Utkast'}
                    </span>
                    {isPast && (
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-stone-600/70 text-white">
                        Arrangementet har vært
                      </span>
                    )}
                  </div>

                  <div className="p-3.5 flex flex-col gap-2 flex-1">
                    <div className={isPast ? 'opacity-60' : ''}>
                      <div className="text-[14px] font-semibold text-stone-800 leading-snug">{event.title}</div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-stone-500 mt-1">
                        {event.event_date && event.event_start_time ? (
                          <>
                            <span className="flex items-center gap-1">
                              <IconCalendar size={12} /> {formatDate(event.event_date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <IconClock size={12} />
                              {formatTime(event.event_start_time)}
                              {event.event_end_time ? ` – ${formatTime(event.event_end_time)}` : ''}
                            </span>
                          </>
                        ) : (
                          <span className="flex items-center gap-1 italic">
                            <IconCalendar size={12} /> Dato og tid kommer
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setRegistrationsEvent(event)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[13px] font-medium rounded-md border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 transition-colors"
                      >
                        <IconUsers size={13} /> Se påmeldte
                      </button>
                      <button
                        onClick={() => setUpdateEvent(event)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[13px] font-medium rounded-md border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 transition-colors"
                      >
                        <IconMail size={13} /> Oppdatering til påmeldte
                      </button>
                    </div>

                    <div className="border-t border-stone-200 pt-2.5 mt-auto flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-[12px] text-stone-700 shrink-0">
                        <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                        Antall påmeldte: {counts[event.id] ?? 0}{event.max_capacity ? ` / ${event.max_capacity}` : ''}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => togglePublished(event)}
                          className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md border transition-colors ${isPast && event.published ? 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100' : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'}`}
                        >
                          {event.published ? <><IconEyeOff size={13} /> Skjul</> : <><IconEye size={13} /> Publiser</>}
                        </button>
                        <button
                          onClick={() => setEventModal({ open: true, event })}
                          className="inline-flex items-center p-1 rounded-md border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 transition-colors"
                        >
                          <IconEdit size={13} />
                        </button>
                        <button
                          onClick={() => setConfirmEventId(event.id)}
                          className="inline-flex items-center p-1 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <IconTrash size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

            </div>
          )})}
        </div>
      )}

      {eventModal.open && (
        <EventModal
          event={eventModal.event}
          registrationCount={eventModal.event ? (counts[eventModal.event.id] ?? 0) : 0}
          onClose={() => setEventModal({ open: false })}
          onSaved={fetchAll}
        />
      )}

      {registrationsEvent && (
        <RegistrationsModal
          event={registrationsEvent}
          onClose={() => setRegistrationsEvent(null)}
          onCountChange={(eventId, count) => setCounts(prev => ({ ...prev, [eventId]: count }))}
        />
      )}

      {updateEvent && (
        <UpdateAttendeesModal
          event={updateEvent}
          registrationCount={counts[updateEvent.id] ?? 0}
          onClose={() => setUpdateEvent(null)}
          onSent={fetchAll}
        />
      )}
    </div>
  )
}
