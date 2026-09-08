'use client'

import { useState } from 'react'
import { toLocalISODate } from '@/lib/date'
import { useAutoGrowTextarea } from '@/hooks/useAutoGrowTextarea'
import type { Event } from '@/types'
import { IconX, IconClockHour4, IconInfoCircle, IconBan } from '@tabler/icons-react'

type Props = {
  event: Event
  registrationCount: number
  onClose: () => void
  onSent: () => void
}

type Kind = 'reschedule' | 'info' | 'cancel'

const inputClass = 'w-full px-2.5 py-2 border border-stone-200 rounded-md text-sm text-stone-800 bg-white focus:outline-none focus:border-admin-accent-light transition-colors font-[inherit]'
const labelClass = 'block text-[12.5px] font-semibold text-stone-700 mb-1'

const kindOptions: { id: Kind; label: string; icon: React.ReactNode; description: string }[] = [
  { id: 'reschedule', label: 'Ny tid', icon: <IconClockHour4 size={16} />, description: 'Endrer dato/tid på arrangementet og varsler alle påmeldte.' },
  { id: 'info', label: 'Ny info', icon: <IconInfoCircle size={16} />, description: 'Sender mer informasjon til alle påmeldte.' },
  { id: 'cancel', label: 'Avlys', icon: <IconBan size={16} />, description: 'Skjuler arrangementet fra nettsiden og varsler alle påmeldte.' },
]

export default function UpdateAttendeesModal({ event, registrationCount, onClose, onSent }: Props) {
  const [kind, setKind] = useState<Kind | null>(null)
  const [message, setMessage] = useState('')
  const [newDate, setNewDate] = useState(event.event_date ?? '')
  const [newStartTime, setNewStartTime] = useState(event.event_start_time?.slice(0, 5) ?? '')
  const [newEndTime, setNewEndTime] = useState(event.event_end_time?.slice(0, 5) ?? '')
  const [status, setStatus] = useState<'idle' | 'sending' | 'error' | 'sent'>('idle')
  const [sentCount, setSentCount] = useState(0)
  const messageRef = useAutoGrowTextarea(message)

  const today = toLocalISODate(new Date())
  const dateInPast = kind === 'reschedule' && !!newDate && newDate < today
  const endBeforeStart = kind === 'reschedule' && !!newEndTime && newEndTime <= newStartTime

  const canSubmit = kind !== null && message.trim().length > 0
    && (kind !== 'reschedule' || (newDate && newStartTime && !dateInPast && !endBeforeStart))

  async function handleSubmit() {
    if (!canSubmit) return
    setStatus('sending')
    try {
      const res = await fetch('/api/events/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: event.id,
          kind,
          message: message.trim(),
          ...(kind === 'reschedule' ? {
            new_date: newDate,
            new_start_time: newStartTime,
            new_end_time: newEndTime || null,
          } : {}),
        }),
      })
      if (!res.ok) { setStatus('error'); return }
      const data = await res.json() as { count: number }
      onSent()
      setSentCount(data.count)
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl flex flex-col max-h-[85vh]">

        {status === 'sent' ? (
          <div className="p-8 text-center flex flex-col items-center gap-4">
            <p className="text-[14px] text-stone-700">
              {sentCount > 0
                ? `Sendt til ${sentCount} påmeldt${sentCount === 1 ? '' : 'e'}.`
                : 'Ingen påmeldte å varsle, men endringen er lagret.'}
            </p>
            <button
              onClick={onClose}
              className="inline-flex items-center px-4 py-1.5 text-[13px] font-medium rounded-md border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 transition-colors"
            >
              Lukk
            </button>
          </div>
        ) : (
        <>
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 shrink-0">
          <div>
            <div className="text-[15px] font-semibold text-stone-800">Oppdatering til påmeldte</div>
            <div className="text-[12px] text-stone-400 mt-0.5">{event.title} · {registrationCount} påmeldt{registrationCount === 1 ? '' : 'e'}</div>
          </div>
          <button onClick={onClose} disabled={status === 'sending'} className="p-1 rounded-md hover:bg-stone-100 text-stone-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            <IconX size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-2">
            {kindOptions.map(opt => {
              const disabled = opt.id === 'info' && registrationCount === 0
              return (
                <button
                  key={opt.id}
                  onClick={() => !disabled && setKind(opt.id)}
                  disabled={disabled}
                  title={disabled ? 'Ingen påmeldte å sende info til' : undefined}
                  className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-lg border text-[12.5px] font-medium transition-colors ${
                    disabled
                      ? 'border-stone-100 text-stone-300 cursor-not-allowed'
                      : kind === opt.id
                        ? 'border-admin-accent bg-admin-accent-lighter text-admin-accent-dark'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              )
            })}
          </div>

          {kind && (
            <p className="text-[12.5px] text-stone-500 -mt-1">{kindOptions.find(o => o.id === kind)?.description}</p>
          )}

          {kind === 'reschedule' && (
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className={labelClass}>Ny dato *</label>
                  <input
                    type="date"
                    className={inputClass + (dateInPast ? ' border-red-400' : '')}
                    value={newDate}
                    min={today}
                    onChange={e => setNewDate(e.target.value)}
                  />
                  {dateInPast && <p className="text-[11.5px] text-red-500 mt-1">Datoen har allerede vært</p>}
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className={labelClass}>Ny starttid *</label>
                  <input type="time" className={inputClass} value={newStartTime} onChange={e => setNewStartTime(e.target.value)} />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>Ny sluttid</label>
                  <input
                    type="time"
                    className={inputClass + (endBeforeStart ? ' border-red-400' : '')}
                    value={newEndTime}
                    onChange={e => setNewEndTime(e.target.value)}
                  />
                  {endBeforeStart && <p className="text-[11.5px] text-red-500 mt-1">Må være etter starttid</p>}
                </div>
              </div>
            </div>
          )}

          {kind && (
            <div>
              <label className={labelClass}>
                {kind === 'cancel' ? 'Begrunnelse *' : 'Melding *'}
              </label>
              <textarea
                ref={messageRef}
                className={inputClass + ' resize-none overflow-hidden min-h-24'}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={
                  kind === 'reschedule' ? 'F.eks. årsak til endringen…'
                  : kind === 'cancel' ? 'F.eks. årsak til avlysningen…'
                  : 'Informasjonen som skal sendes…'
                }
              />
            </div>
          )}

          {status === 'error' && (
            <p className="text-[12.5px] text-red-500">Noe gikk galt under utsendelsen. Prøv igjen.</p>
          )}
        </div>

        <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-stone-200 shrink-0">
          <button onClick={onClose} disabled={status === 'sending'} className="inline-flex items-center px-3 py-1.5 text-[13px] font-medium rounded-md border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Avbryt
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || status === 'sending'}
            className="inline-flex items-center px-3 py-1.5 text-[13px] font-medium rounded-md bg-admin-accent border border-admin-accent text-white hover:bg-admin-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'sending' ? 'Sender…' : 'Send'}
          </button>
        </div>
        </>
        )}

      </div>
    </div>
  )
}
