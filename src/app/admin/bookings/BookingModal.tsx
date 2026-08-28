'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Booking } from '@/types'
import { IconX } from '@tabler/icons-react'

type Props = {
  booking?: Booking
  onClose: () => void
  onSaved: () => void
}

const inputClass = 'w-full px-2.5 py-2 border border-stone-200 rounded-md text-sm text-stone-800 bg-white focus:outline-none focus:border-pink-400 transition-colors font-[inherit]'
const labelClass = 'block text-[12.5px] font-semibold text-stone-700 mb-1'

export default function BookingModal({ booking, onClose, onSaved }: Props) {
  const [type, setType] = useState<Booking['type']>(booking?.type ?? 'bordreservasjon')
  const [name, setName] = useState(booking?.name ?? '')
  const [email, setEmail] = useState(booking?.email ?? '')
  const [phone, setPhone] = useState(booking?.phone ?? '')
  const [date, setDate] = useState(booking?.date ?? '')
  const [startTime, setStartTime] = useState(booking?.start_time?.slice(0, 5) ?? '')
  const [endTime, setEndTime] = useState(booking?.end_time?.slice(0, 5) ?? '')
  const [partySize, setPartySize] = useState(booking?.party_size?.toString() ?? '')
  const [requestedFood, setRequestedFood] = useState(booking?.requested_food ?? '')
  const [message, setMessage] = useState(booking?.message ?? '')
  const [eventType, setEventType] = useState(booking?.event_type ?? '')
  const [deliveryMethod, setDeliveryMethod] = useState(booking?.delivery_method ?? 'Henting')
  const [address, setAddress] = useState(booking?.address ?? '')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const valid = !!name.trim() && (!!email.trim() || !!phone.trim()) && !!date && !!startTime

  async function handleSave() {
    if (!valid) return
    setSaving(true)
    setSaveError('')
    const payload = {
      type,
      name: name.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      date,
      start_time: startTime,
      end_time: type === 'lukket_selskap' ? (endTime || null) : null,
      party_size: partySize.trim() ? Number(partySize) : null,
      requested_food: requestedFood.trim() || null,
      message: message.trim() || null,
      event_type: type === 'bordreservasjon' ? null : (eventType.trim() || null),
      delivery_method: type === 'catering' ? deliveryMethod : null,
      address: type === 'catering' && deliveryMethod === 'Levering' ? (address.trim() || null) : null,
    }
    const { error } = booking
      ? await supabase.from('bookings').update(payload).eq('id', booking.id)
      : await supabase.from('bookings').insert({ ...payload, status: 'bekreftet' })
    setSaving(false)
    if (error) {
      console.error('Supabase error (save booking):', error)
      setSaveError('Kunne ikke lagre bookingen. Prøv igjen.')
      return
    }
    onSaved()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl flex flex-col max-h-[85vh]">

        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 shrink-0">
          <div className="text-[15px] font-semibold text-stone-800">{booking ? 'Rediger booking' : 'Legg til booking'}</div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-stone-100 text-stone-400 transition-colors">
            <IconX size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3.5">
          <div>
            <label className={labelClass}>Type *</label>
            <select className={inputClass} value={type} onChange={e => setType(e.target.value as Booking['type'])}>
              <option value="bordreservasjon">Bordreservasjon</option>
              <option value="catering">Catering</option>
              <option value="lukket_selskap">Lukket selskap</option>
            </select>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className={`${labelClass} min-h-9 flex items-end`}>Navn *</label>
              <input className={inputClass} value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className={`${labelClass} min-h-9`}>Telefon (e-post eller telefon påkrevd)</label>
              <input className={inputClass} value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
          </div>

          <div>
            <label className={labelClass}>E-post (e-post eller telefon påkrevd)</label>
            <input type="email" className={inputClass} value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          {type !== 'bordreservasjon' && (
            <div>
              <label className={labelClass}>Type arrangement</label>
              <input className={inputClass} value={eventType} onChange={e => setEventType(e.target.value)} />
            </div>
          )}

          <div className="flex gap-3">
            <div className="flex-1">
              <label className={labelClass}>Dato *</label>
              <input type="date" className={inputClass} value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className={labelClass}>Antall personer</label>
              <input type="number" min="1" className={inputClass} value={partySize} onChange={e => setPartySize(e.target.value)} />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className={labelClass}>{type === 'lukket_selskap' ? 'Fra kl. *' : 'Klokkeslett *'}</label>
              <input type="time" className={inputClass} value={startTime} onChange={e => setStartTime(e.target.value)} />
            </div>
            {type === 'lukket_selskap' && (
              <div className="flex-1">
                <label className={labelClass}>Til kl.</label>
                <input type="time" className={inputClass} value={endTime} onChange={e => setEndTime(e.target.value)} />
              </div>
            )}
          </div>

          {type === 'catering' && (
            <>
              <div>
                <label className={labelClass}>Levering</label>
                <div className="flex gap-4 text-sm text-stone-700">
                  {['Henting', 'Levering'].map(opt => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={deliveryMethod === opt} onChange={() => setDeliveryMethod(opt)} />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
              {deliveryMethod === 'Levering' && (
                <div>
                  <label className={labelClass}>Adresse</label>
                  <input className={inputClass} value={address} onChange={e => setAddress(e.target.value)} />
                </div>
              )}
            </>
          )}

          <div>
            <label className={labelClass}>Ønsket mat</label>
            <textarea className={inputClass + ' resize-y min-h-16'} value={requestedFood} onChange={e => setRequestedFood(e.target.value)} />
          </div>

          <div>
            <label className={labelClass}>Melding</label>
            <textarea className={inputClass + ' resize-y min-h-16'} value={message} onChange={e => setMessage(e.target.value)} />
          </div>
        </div>

        {saveError && (
          <div className="mx-5 mb-2 px-3 py-2 bg-red-50 border border-red-200 rounded-md text-[12.5px] text-red-600">
            {saveError}
          </div>
        )}

        <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-stone-200 shrink-0">
          <button onClick={onClose} className="inline-flex items-center px-3 py-1.5 text-[13px] font-medium rounded-md border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 transition-colors">
            Avbryt
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !valid}
            className="inline-flex items-center px-3 py-1.5 text-[13px] font-medium rounded-md bg-pink-500 border border-pink-500 text-white hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Lagrer…' : booking ? 'Lagre' : 'Legg til'}
          </button>
        </div>
      </div>
    </div>
  )
}
