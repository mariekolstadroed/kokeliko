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

const inputClass = 'w-full px-3 py-2.5 border-[2px] border-4 rounded-lg text-sm text-1 bg-6 accent-1 focus:outline-none focus:border-5 transition-colors'
const inputErrorClass = 'w-full px-3 py-2.5 border-[2px] border-5 rounded-lg text-sm text-1 bg-6 accent-1 focus:outline-none focus:border-5 transition-colors'
const labelClass = 'block text-sm font-medium text-2 mb-1.5'

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('nb-NO', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
}

export default function RegistrationModal({ event, onClose, onRegistered }: Props) {
  const [form, setForm] = useState({ navn: '', epost: '', telefon: '', _hp: '' })
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
    if (event.event_date && event.event_date < new Date().toISOString().slice(0, 10)) { setStatus('error'); return }
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
        _hp: form._hp,
        navn: form.navn.trim(),
        epost: form.epost.trim().toLowerCase(),
        event_title: event.title,
        event_date: event.event_date ?? '',
        event_start_time: event.event_start_time ?? '',
        event_end_time: event.event_end_time ?? '',
        cancellation_token: token,
      }),
    })

    setStatus('ok')
    onRegistered()
  }

  const f = (field: string) => errors[field] ? inputErrorClass : inputClass
  const err = (field: string) => errors[field]
    ? <p className="mt-1 text-xs text-5">{errors[field]}</p>
    : null

  return (
    <div
      className="fixed inset-0 bg-1/40 flex items-center justify-center z-50 p-6"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-4/80 backdrop-blur-sm rounded-2xl w-full max-w-md shadow-2xl shadow-1/30 flex flex-col max-h-[90vh]">

        <div className="flex items-start justify-between px-6 py-5 border-b border-3 shrink-0">
          <div>
            <div className="text-2xl font-bold font-special-elite text-1">{event.title}</div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-2 mt-1">
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
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-3 text-2 transition-colors mt-0.5 shrink-0"
          >
            <IconX size={18} />
          </button>
        </div>

        {status === 'ok' ? (
          <div className="p-8 text-center">
            <p className="text-lg font-bold text-1 mb-2">Påmelding bekreftet!</p>
            <p className="text-2 text-sm">Du vil motta en bekreftelse på e-post med mulighet for avmelding.</p>
            <button
              onClick={onClose}
              className="mt-6 px-5 py-2 text-base font-special-elite rounded-lg border border-3 text-2 hover:bg-3 transition-colors"
            >
              Lukk
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="p-6 flex flex-col gap-4 overflow-y-auto">
            <div style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }} aria-hidden="true">
              <input type="text" name="website" tabIndex={-1} autoComplete="off" value={form._hp} onChange={e => set('_hp', e.target.value)} />
            </div>
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
              <p className="text-sm bg-4 text-5 border-[2px] border-5 rounded-lg px-3 py-2">
                Denne e-postadressen er allerede påmeldt dette arrangementet.
              </p>
            )}
            {status === 'error' && (
              <p className="text-sm bg-4 text-5 border-[2px] border-5 rounded-lg px-3 py-2">Noe gikk galt. Prøv igjen eller kontakt oss direkte.</p>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="mt-1 px-6 py-3 bg-1 text-4 text-base font-special-elite rounded-lg shadow-sm shadow-1/30 hover:brightness-125 transition-colors disabled:opacity-50"
            >
              {status === 'sending' ? 'Sender…' : 'Meld deg på'}
            </button>
          </form>
        )}

      </div>
    </div>
  )
}
