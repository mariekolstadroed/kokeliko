'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Event } from '@/types'
import { IconX, IconCalendar, IconClock } from '@tabler/icons-react'
import { validateEmail, validatePhone } from '@/lib/validation'

type Props = {
  event: Event
  onClose: () => void
  onRegistered: () => void
}

const inputClass = 'w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm text-stone-800 bg-white focus:outline-none focus:border-stone-400 transition-colors'
const inputErrorClass = 'w-full px-3 py-2.5 border border-red-300 rounded-lg text-sm text-stone-800 bg-white focus:outline-none focus:border-red-400 transition-colors'
const labelClass = 'block text-sm font-medium text-stone-700 mb-1.5'

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('nb-NO', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
}

export default function RegistrationModal({ event, onClose, onRegistered }: Props) {
  const [form, setForm] = useState({ navn: '', epost: '', telefon: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'duplicate' | 'error'>('idle')

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
    if (status === 'duplicate' || status === 'error') setStatus('idle')
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.navn.trim()) e.navn = 'Navn er påkrevd'
    const epostErr = validateEmail(form.epost)
    if (epostErr) e.epost = epostErr
    if (form.telefon) {
      const telefonErr = validatePhone(form.telefon)
      if (telefonErr) e.telefon = telefonErr
    }
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (event.event_date < new Date().toISOString().slice(0, 10)) { setStatus('error'); return }
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setStatus('sending')

    const token = crypto.randomUUID()

    const { error } = await supabase
      .from('event_registration')
      .insert({
        event_id: event.id,
        name: form.navn.trim(),
        email: form.epost.trim().toLowerCase(),
        phone: form.telefon.trim() || null,
        cancellation_token: token,
      })

    if (error?.code === '23505') { setStatus('duplicate'); return }
    if (error) { setStatus('error'); return }

    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'event_registration',
        navn: form.navn.trim(),
        epost: form.epost.trim().toLowerCase(),
        event_title: event.title,
        event_date: event.event_date,
        event_start_time: event.event_start_time,
        event_end_time: event.event_end_time ?? '',
        cancellation_token: token,
      }),
    })

    setStatus('ok')
    onRegistered()
  }

  const f = (field: string) => errors[field] ? inputErrorClass : inputClass
  const err = (field: string) => errors[field]
    ? <p className="mt-1 text-xs text-red-500">{errors[field]}</p>
    : null

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">

        <div className="flex items-start justify-between px-6 py-5 border-b border-stone-200 shrink-0">
          <div>
            <div className="text-2xl font-bold font-special-elite text-[#2E1608]">{event.title}</div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-stone-400 mt-1">
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
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-stone-100 text-stone-400 transition-colors mt-0.5 shrink-0"
          >
            <IconX size={18} />
          </button>
        </div>

        {status === 'ok' ? (
          <div className="p-8 text-center">
            <p className="text-lg font-bold text-stone-900 mb-2">Påmelding bekreftet!</p>
            <p className="text-stone-500 text-sm">Du vil motta en bekreftelse på e-post med mulighet for avmelding.</p>
            <button
              onClick={onClose}
              className="mt-6 px-5 py-2 text-sm font-medium rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors"
            >
              Lukk
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto">
            <div>
              <label className={labelClass}>Navn *</label>
              <input className={f('navn')} value={form.navn} onChange={e => set('navn', e.target.value)} />
              {err('navn')}
            </div>
            <div>
              <label className={labelClass}>E-post *</label>
              <input className={f('epost')} type="email" value={form.epost} onChange={e => set('epost', e.target.value)} />
              {err('epost')}
            </div>
            <div>
              <label className={labelClass}>Telefon</label>
              <input className={f('telefon')} type="tel" value={form.telefon} onChange={e => set('telefon', e.target.value)} />
              {err('telefon')}
            </div>

            {status === 'duplicate' && (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Denne e-postadressen er allerede påmeldt dette arrangementet.
              </p>
            )}
            {status === 'error' && (
              <p className="text-sm text-red-500">Noe gikk galt. Prøv igjen eller kontakt oss direkte.</p>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="mt-1 px-6 py-3 bg-[#3d1f08] text-white text-sm font-medium rounded-lg hover:bg-[#2e1608] transition-colors disabled:opacity-50"
            >
              {status === 'sending' ? 'Sender…' : 'Meld deg på'}
            </button>
          </form>
        )}

      </div>
    </div>
  )
}
