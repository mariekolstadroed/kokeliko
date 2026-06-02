import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import type { Event, EventRegistration } from '../../../types'
import { IconX, IconCalendar, IconClock } from '@tabler/icons-react'

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

  useEffect(() => {
    supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', event.id)
      .order('name')
      .then(({ data }) => {
        setRegistrations(data ?? [])
        setLoading(false)
      })
  }, [event.id])

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-6"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl w-full max-w-xl shadow-2xl flex flex-col max-h-[85vh]">

        <div className="flex items-start justify-between px-6 py-5 border-b border-stone-200 shrink-0">
          <div>
            <div className="text-[16px] font-semibold text-stone-800">
              Påmeldte — {event.title}
            </div>
            <div className="flex items-center gap-3 text-[13px] text-stone-400 mt-1">
              <span className="flex items-center gap-1">
                <IconCalendar size={13} /> {formatDate(event.event_date)}
              </span>
              <span className="flex items-center gap-1">
                <IconClock size={13} />
                {event.event_start_time.slice(0, 5)}
                {event.event_end_time ? ` – ${event.event_end_time.slice(0, 5)}` : ''}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-stone-100 text-stone-400 transition-colors mt-0.5">
            <IconX size={16} />
          </button>
        </div>

        <div className="px-6 py-3 border-b border-stone-200 shrink-0 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-[13px] text-stone-700">{registrations.length} påmeldte</span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-sm text-stone-400 text-center">Laster…</div>
          ) : registrations.length === 0 ? (
            <div className="p-6 text-sm text-stone-400 text-center italic">Ingen påmeldte ennå</div>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  {['Navn', 'E-post', 'Telefon'].map(h => (
                    <th key={h} className="text-left px-6 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-stone-400 border-b border-stone-200">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {registrations.map(reg => (
                  <tr key={reg.id} className="border-b border-stone-200 last:border-b-0">
                    <td className="px-6 py-3 text-stone-800 font-medium">{reg.name}</td>
                    <td className="px-6 py-3 text-stone-500">{reg.email}</td>
                    <td className="px-6 py-3 text-stone-500">{reg.phone ?? '—'}</td>
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
