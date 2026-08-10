'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Event, EventRegistration } from '@/types'
import { IconX, IconCalendar, IconClock, IconTrash } from '@tabler/icons-react'

type Props = {
  event: Event
  onClose: () => void
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('nb-NO', { day: 'numeric', month: 'long' })
}

export default function RegistrationsModal({ event, onClose }: Props) {
  const [registrations, setRegistrations] = useState<EventRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [confirmAll, setConfirmAll] = useState(false)

  useEffect(() => { fetchRegistrations() }, [event.id])

  async function fetchRegistrations() {
    const { data } = await supabase
      .from('event_registration')
      .select('*')
      .eq('event_id', event.id)
      .order('name')
    setRegistrations(data ?? [])
    setLoading(false)
  }

  async function deleteRegistration(id: string) {
    const reg = registrations.find(r => r.id === id)
    await supabase.from('event_registration').delete().eq('id', id)
    setRegistrations(prev => prev.filter(r => r.id !== id))
    if (reg) {
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'event_cancellation',
          navn: reg.name,
          epost: reg.email,
          event_title: event.title,
          event_date: event.event_date,
          event_start_time: event.event_start_time,
          event_end_time: event.event_end_time ?? '',
        }),
      }).catch(() => {})
    }
  }

  async function deleteAllRegistrations() {
    await supabase.from('event_registration').delete().eq('event_id', event.id)
    setRegistrations([])
    setConfirmAll(false)
  }

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-6"
    >
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[85vh]">

        <div className="flex items-start justify-between px-6 py-5 border-b border-stone-200 shrink-0">
          <div>
            <div className="text-[16px] font-semibold text-stone-800">
              Påmeldte — {event.title}
            </div>
            <div className="flex items-center gap-3 text-[13px] text-stone-400 mt-1">
              {event.event_date && event.event_start_time ? (
                <>
                  <span className="flex items-center gap-1">
                    <IconCalendar size={13} /> {formatDate(event.event_date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <IconClock size={13} />
                    {event.event_start_time.slice(0, 5)}
                    {event.event_end_time ? ` – ${event.event_end_time.slice(0, 5)}` : ''}
                  </span>
                </>
              ) : (
                <span className="flex items-center gap-1 italic">
                  <IconCalendar size={13} /> Dato og tid kommer
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-stone-100 text-stone-400 transition-colors mt-0.5">
            <IconX size={16} />
          </button>
        </div>

        <div className={`px-6 py-3 border-b border-stone-200 shrink-0 ${confirmAll && registrations.length > 0 ? 'bg-red-50' : ''}`}>
          {confirmAll && registrations.length > 0 ? (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[13px] text-stone-700">Fjerne alle {registrations.length} påmeldinger? Dette kan ikke angres.</p>
                <p className="text-[12px] text-stone-500 mt-0.5">Ingen får varsel om dette. Bruk «Oppdatering til påmeldte» → «Avlys» hvis du vil varsle.</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setConfirmAll(false)}
                  className="px-2.5 py-1 text-[12px] font-medium rounded-md border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  Avbryt
                </button>
                <button
                  onClick={deleteAllRegistrations}
                  className="px-2.5 py-1 text-[12px] font-medium rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  Fjern alle
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-[13px] text-stone-700">Antall påmeldte: {registrations.length}{event.max_capacity ? ` / ${event.max_capacity}` : ''}</span>
              </span>
              {registrations.length > 0 && (
                <button
                  onClick={() => { setConfirmAll(true); setConfirmId(null) }}
                  className="shrink-0 px-2.5 py-1 text-[12px] font-medium rounded-md border border-red-200 bg-white text-red-500 hover:bg-red-50 transition-colors whitespace-nowrap"
                >
                  Fjern alle
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="p-6 text-sm text-stone-400 text-center">Laster…</div>
          ) : registrations.length === 0 ? (
            <div className="p-6 text-sm text-stone-400 text-center italic">Ingen påmeldte ennå</div>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="text-left px-6 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-stone-400 border-b border-stone-200 min-w-32">Navn</th>
                  <th className="text-left px-6 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-stone-400 border-b border-stone-200 min-w-48">E-post</th>
                  <th className="text-left px-6 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-stone-400 border-b border-stone-200 min-w-28">Telefon</th>
                  <th className="sticky right-0 bg-white px-3 py-2.5 border-b border-l border-stone-200 w-11"></th>
                </tr>
              </thead>
              <tbody>
                {registrations.map(reg => (
                  <tr key={reg.id} className={`border-b border-stone-200 last:border-b-0 ${confirmId === reg.id ? 'bg-red-50' : ''}`}>
                    {confirmId === reg.id ? (
                      <td colSpan={4} className="px-6 py-2.25">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[13px] text-stone-700">Avmelde <span className="font-bold">{reg.name}</span>?</p>
                            <p className="text-[12px] text-stone-500 mt-0.5">Bekreftelse sendes til kunden på e-post.</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => setConfirmId(null)}
                              className="px-2.5 py-1 text-[12px] font-medium rounded-md border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
                            >
                              Avbryt
                            </button>
                            <button
                              onClick={() => { deleteRegistration(reg.id); setConfirmId(null) }}
                              className="px-2.5 py-1 text-[12px] font-medium rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
                            >
                              Avmeld
                            </button>
                          </div>
                        </div>
                      </td>
                    ) : (
                      <>
                        <td className="px-6 py-3 text-stone-800 font-medium truncate">{reg.name}</td>
                        <td className="px-6 py-3 text-stone-500 truncate">{reg.email}</td>
                        <td className="px-6 py-3 text-stone-500 truncate">{reg.phone ?? '—'}</td>
                        <td className="sticky right-0 bg-white px-3 py-3 border-l border-stone-200">
                          <button
                            onClick={() => { setConfirmId(reg.id); setConfirmAll(false) }}
                            className="p-1 rounded-md text-red-400 hover:bg-red-50 transition-colors"
                            title="Meld av"
                          >
                            <IconTrash size={13} />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex justify-end px-6 py-4 border-t border-stone-200 shrink-0">
          <button
            onClick={onClose}
            className="inline-flex items-center px-4 py-1.5 text-[13px] font-medium rounded-md border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 transition-colors"
          >
            Lukk
          </button>
        </div>

      </div>
    </div>
  )
}
