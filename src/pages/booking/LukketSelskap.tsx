import { useState } from 'react'
import { validateEmail, validatePhone, validateFutureDate, validateTimeRange } from '../../lib/validation'

const inputClass = 'w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm text-stone-800 bg-white focus:outline-none focus:border-stone-400 transition-colors'
const inputErrorClass = 'w-full px-3 py-2.5 border border-red-300 rounded-lg text-sm text-stone-800 bg-white focus:outline-none focus:border-red-400 transition-colors'
const labelClass = 'block text-sm font-medium text-stone-700 mb-1.5'

export default function LukketSelskap() {
  const [form, setForm] = useState({ navn: '', epost: '', type_arrangement: '', telefon: '', dato: '', fra_kl: '', til_kl: '', antall: '', onsket_mat: '', annen_info: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle')

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  function validate() {
    const e: Record<string, string> = {}
    const epost = validateEmail(form.epost)
    if (epost) e.epost = epost
    const telefon = validatePhone(form.telefon)
    if (telefon) e.telefon = telefon
    const dato = validateFutureDate(form.dato)
    if (dato) e.dato = dato
    if (!form.antall || Number(form.antall) < 1) e.antall = 'Antall må være større enn 0'
    const fra = validateTimeRange(form.fra_kl, '17:00', '23:59')
    if (fra) e.fra_kl = fra
    const til = validateTimeRange(form.til_kl, '17:00', '23:59')
    if (til) e.til_kl = til
    if (!e.fra_kl && !e.til_kl && form.fra_kl && form.til_kl && form.fra_kl >= form.til_kl)
      e.til_kl = 'Sluttidspunkt må være etter starttidspunkt'
    return e
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setStatus('sending')
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'lukket_selskap', ...form }),
      })
      setStatus(res.ok ? 'ok' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'ok') {
    return (
      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        <p className="text-2xl font-bold text-stone-900 mb-3">Takk for din forespørsel!</p>
        <p className="text-stone-500">Vi tar kontakt med deg så snart som mulig.</p>
      </div>
    )
  }

  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  const f = (field: string) => errors[field] ? inputErrorClass : inputClass
  const err = (field: string) => errors[field]
    ? <p className="mt-1 text-xs text-red-500">{errors[field]}</p>
    : null

  return (
    <div className="max-w-lg mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold font-special-elite text-stone-900 mb-2">Lukket selskap</h1>
      <p className="text-stone-600 leading-relaxed mb-10">
        Fyll ut skjemaet så hører du fra oss med mer informasjon.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Navn *</label>
            <input className={f('navn')} required value={form.navn} onChange={e => set('navn', e.target.value)} />
            {err('navn')}
          </div>
          <div>
            <label className={labelClass}>Telefon</label>
            <input className={f('telefon')} type="tel" value={form.telefon} onChange={e => set('telefon', e.target.value)} />
            {err('telefon')}
          </div>
        </div>

        <div>
          <label className={labelClass}>E-post *</label>
          <input className={f('epost')} type="email" required value={form.epost} onChange={e => set('epost', e.target.value)} />
          {err('epost')}
        </div>

        <div>
          <label className={labelClass}>Type arrangement</label>
          <input className={inputClass} value={form.type_arrangement} onChange={e => set('type_arrangement', e.target.value)} />
        </div>

        <div>
          <label className={labelClass}>Dato *</label>
          <input className={f('dato')} type="date" required min={minDate} value={form.dato} onChange={e => set('dato', e.target.value)} />
          {err('dato')}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Fra kl. *</label>
            <input className={f('fra_kl')} type="time" required min="17:00" max="23:59" value={form.fra_kl} onChange={e => set('fra_kl', e.target.value)} />
            {err('fra_kl')}
          </div>
          <div>
            <label className={labelClass}>Til kl. *</label>
            <input className={f('til_kl')} type="time" required min={form.fra_kl || '17:00'} max="23:59" value={form.til_kl} onChange={e => set('til_kl', e.target.value)} />
            {err('til_kl')}
          </div>
        </div>

        <div>
          <label className={labelClass}>Antall personer *</label>
          <input className={f('antall')} type="number" min="1" required value={form.antall} onChange={e => set('antall', e.target.value)} />
          {err('antall')}
        </div>

        <div>
          <label className={labelClass}>Ønsket mat</label>
          <textarea className={inputClass + ' block resize-y min-h-[80px]'} value={form.onsket_mat} onChange={e => set('onsket_mat', e.target.value)} />
        </div>

        <div>
          <label className={labelClass}>Annen informasjon</label>
          <textarea className={inputClass + ' block resize-y min-h-[80px]'} value={form.annen_info} onChange={e => set('annen_info', e.target.value)} />
        </div>

        {status === 'error' && (
          <p className="text-sm text-red-500">Noe gikk galt. Prøv igjen eller kontakt oss direkte.</p>
        )}

        <button
          type="submit"
          disabled={status === 'sending'}
          className="mt-2 px-6 py-3 bg-[#3d1f08] text-white text-sm font-medium rounded-lg hover:bg-[#2e1608] transition-colors disabled:opacity-50"
        >
          {status === 'sending' ? 'Sender…' : 'Send forespørsel'}
        </button>
      </form>
    </div>
  )
}
