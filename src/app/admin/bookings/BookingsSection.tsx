'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toLocalISODate } from '@/lib/date'
import type { Booking } from '@/types'
import BookingModal from './BookingModal'
import { IconPlus, IconCheck, IconBan, IconRotateClockwise, IconArrowBackUp, IconEdit, IconTrash, IconEye, IconEyeOff, IconCalendar, IconClock, IconUsers, IconPhone, IconMail } from '@tabler/icons-react'

const TYPE_LABELS: Record<Booking['type'], string> = {
  bordreservasjon: 'Bordreservasjon',
  catering: 'Catering',
  lukket_selskap: 'Lukket selskap',
}

const TYPE_COLORS: Record<Booking['type'], string> = {
  bordreservasjon: 'bg-pink-100 text-pink-700',
  catering: 'bg-green-100 text-green-700',
  lukket_selskap: 'bg-blue-100 text-blue-700',
}

const STATUS_LABELS: Record<Booking['status'], string> = {
  ikke_bekreftet: 'Ikke bekreftet',
  bekreftet: 'Bekreftet',
  avbestilt: 'Avbestilt',
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('nb-NO', { day: 'numeric', month: 'long' })
}

function formatTime(t: string) {
  return t.slice(0, 5)
}

export default function BookingsSection() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Booking['status']>('ikke_bekreftet')
  const [modal, setModal] = useState<{ open: boolean; booking?: Booking }>({ open: false })
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const { data } = await supabase.from('bookings').select('*').order('date').order('start_time')
    setBookings(data ?? [])
    setLoading(false)
  }

  async function setStatus(id: string, status: Booking['status'], visible_on_ipad?: boolean) {
    const patch = visible_on_ipad === undefined ? { status } : { status, visible_on_ipad }
    setBookings(prev => prev.map(b => b.id === id ? { ...b, ...patch } : b))
    await supabase.from('bookings').update(patch).eq('id', id)
  }

  async function deleteBooking(id: string): Promise<boolean> {
    const { error } = await supabase.from('bookings').delete().eq('id', id)
    if (error) {
      console.error('Supabase error (delete booking):', error)
      setDeleteError('Kunne ikke slette bookingen. Prøv igjen.')
      return false
    }
    setBookings(prev => prev.filter(b => b.id !== id))
    return true
  }

  const counts = {
    ikke_bekreftet: bookings.filter(b => b.status === 'ikke_bekreftet').length,
    bekreftet: bookings.filter(b => b.status === 'bekreftet').length,
    avbestilt: bookings.filter(b => b.status === 'avbestilt').length,
  }

  const filtered = bookings.filter(b => b.status === filter)
  const today = toLocalISODate(new Date())
  const upcoming = filtered.filter(b => b.date >= today)
  const past = filtered.filter(b => b.date < today)

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="text-sm text-stone-400 text-center py-8">Laster…</div>
      </div>
    )
  }

  function renderBooking(b: Booking) {
    return (
      <div key={b.id} className={`border rounded-xl shadow-sm p-3.5 flex flex-col gap-2 ${confirmDeleteId === b.id ? 'bg-red-50 border-red-200' : 'bg-white border-stone-200'}`}>
        {confirmDeleteId === b.id ? (
          <div className="flex flex-col items-center justify-center gap-4 py-6">
            <p className="text-[13px] text-stone-700 text-center">Slette <span className="font-bold">{b.name}</span>?</p>
            {deleteError && <p className="text-[12px] text-red-600 text-center">{deleteError}</p>}
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setConfirmDeleteId(null); setDeleteError('') }}
                className="px-2.5 py-1 text-[11px] font-medium rounded-md border border-red-200 bg-white text-stone-600 hover:bg-red-100 transition-colors"
              >
                Avbryt
              </button>
              <button
                onClick={async () => { setDeleteError(''); const ok = await deleteBooking(b.id); if (ok) setConfirmDeleteId(null) }}
                className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Slett
              </button>
            </div>
          </div>
        ) : (
          <>
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-semibold text-stone-800">{b.name}</span>
          <div className="flex items-center gap-1.5">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${b.visible_on_ipad ? 'bg-stone-100 text-stone-600' : 'bg-stone-300 text-stone-700'}`}>
              {b.visible_on_ipad ? <IconEye size={11} /> : <IconEyeOff size={11} />}
              {b.visible_on_ipad ? 'Synlig på iPad' : 'Skjult på iPad'}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${TYPE_COLORS[b.type]}`}>
              {TYPE_LABELS[b.type]}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-stone-500">
          <span className="flex items-center gap-1"><IconCalendar size={12} /> {formatDate(b.date)}</span>
          <span className="flex items-center gap-1">
            <IconClock size={12} /> {formatTime(b.start_time)}{b.end_time ? ` – ${formatTime(b.end_time)}` : ''}
          </span>
          {b.party_size != null && <span className="flex items-center gap-1"><IconUsers size={12} /> {b.party_size} pers.</span>}
          {b.phone && <span className="flex items-center gap-1"><IconPhone size={12} /> {b.phone}</span>}
          {b.email && <span className="flex items-center gap-1"><IconMail size={12} /> {b.email}</span>}
        </div>
        {(b.requested_food || b.message || b.event_type || b.delivery_method || b.address) && (
          <div className="text-[12.5px] text-stone-600 border-t border-stone-100 pt-2 flex flex-col gap-2">
            {b.event_type && <div><span className="font-semibold">Type:</span> {b.event_type}</div>}
            {b.delivery_method && <div>{b.delivery_method}{b.address ? ` – ${b.address}` : ''}</div>}
            {b.requested_food && <div className="whitespace-pre-line"><span className="font-semibold">Ønsket mat:</span><br />{b.requested_food}</div>}
            {b.message && <div className="whitespace-pre-line"><span className="font-semibold">Melding:</span><br />{b.message}</div>}
          </div>
        )}
        <div className="flex items-center gap-1.5 pt-1">
          <button
            onClick={() => setModal({ open: true, booking: b })}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[13px] font-medium rounded-md border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <IconEdit size={13} /> Rediger
          </button>
          {b.status === 'ikke_bekreftet' && (
            <button
              onClick={() => setStatus(b.id, 'bekreftet', true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[13px] font-medium rounded-md border border-green-200 bg-white text-green-600 hover:bg-green-50 transition-colors"
            >
              <IconCheck size={13} /> Godkjenn
            </button>
          )}
          {b.status === 'bekreftet' && (
            <button
              onClick={() => setStatus(b.id, 'ikke_bekreftet', true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[13px] font-medium rounded-md border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 transition-colors"
            >
              <IconArrowBackUp size={13} /> Sett til ikke bekreftet
            </button>
          )}
          {b.status !== 'avbestilt' && (
            <button
              onClick={() => setStatus(b.id, 'avbestilt', false)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[13px] font-medium rounded-md border border-stone-200 bg-white text-red-500 hover:bg-red-50 transition-colors"
            >
              <IconBan size={13} /> Avbestill
            </button>
          )}
          {b.status === 'avbestilt' && (
            <button
              onClick={() => setStatus(b.id, 'bekreftet', true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[13px] font-medium rounded-md border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 transition-colors"
            >
              <IconRotateClockwise size={13} /> Gjenopprett
            </button>
          )}
          <button
            onClick={() => setConfirmDeleteId(b.id)}
            className="inline-flex items-center p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-colors ml-auto"
          >
            <IconTrash size={13} />
          </button>
        </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          {(['ikke_bekreftet', 'bekreftet', 'avbestilt'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-2.5 py-1.5 text-[13px] font-medium rounded-md border transition-colors ${
                filter === s ? 'bg-pink-500 border-pink-500 text-white' : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
              }`}
            >
              {STATUS_LABELS[s]} ({counts[s]})
            </button>
          ))}
        </div>
        <button
          onClick={() => setModal({ open: true })}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-md bg-pink-500 border border-pink-500 text-white hover:bg-pink-600 transition-colors"
        >
          <IconPlus size={14} /> Legg til booking
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-8 text-sm text-stone-400 text-center italic">
          Ingen bookinger her
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {upcoming.map(b => renderBooking(b))}
          {past.length > 0 && (
            <div className="flex items-center gap-3 mt-8 pb-1">
              <div className="flex-1 h-px bg-stone-300" />
              <span className="text-[14px] font-semibold text-stone-500 uppercase tracking-wide">Har vært</span>
              <div className="flex-1 h-px bg-stone-300" />
            </div>
          )}
          {past.map(b => renderBooking(b))}
        </div>
      )}

      {modal.open && (
        <BookingModal booking={modal.booking} onClose={() => setModal({ open: false })} onSaved={fetchAll} />
      )}
    </div>
  )
}
