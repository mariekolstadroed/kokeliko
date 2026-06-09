import { useState } from 'react'
import { Link } from 'react-router-dom'
import { IconArrowLeft } from '@tabler/icons-react'
import resImg1 from '../../assets/booking/reservasjon/reservasjon1.jpg'
import resImg2 from '../../assets/booking/reservasjon/reservasjon2.jpg'
import { validateEmail, validatePhone, validateFutureDate } from '../../lib/validation'
import { useOpeningHours } from '../../hooks/useOpeningHours'

const inputClass = 'w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm text-stone-800 bg-white focus:outline-none focus:border-stone-400 transition-colors'
const inputErrorClass = 'w-full px-3 py-2.5 border border-red-300 rounded-lg text-sm text-stone-800 bg-white focus:outline-none focus:border-red-400 transition-colors'
const labelClass = 'block text-sm font-medium text-stone-700 mb-1.5'

export default function BordReservasjon() {
  const [form, setForm] = useState({ navn: '', epost: '', telefon: '', dato: '', klokkeslett: '', antall: '', onsket_mat: '', melding: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle')
  const { forDate } = useOpeningHours()

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const dayHours = forDate(form.dato)
  const openTime = dayHours?.open_time?.slice(0, 5)
  const closeTime = dayHours?.close_time?.slice(0, 5)

  function validate() {
    const e: Record<string, string> = {}
    const epost = validateEmail(form.epost)
    if (epost) e.epost = epost
    const telefon = validatePhone(form.telefon)
    if (telefon) e.telefon = telefon
    const dato = validateFutureDate(form.dato, true)
    if (dato) e.dato = dato
    if (!e.dato && dayHours?.closed) e.dato = 'Stengt denne dagen'
    if (!form.antall || Number(form.antall) < 1) e.antall = 'Antall må være større enn 0'
    if (Number(form.antall) >= 10 && !form.onsket_mat.trim()) e.onsket_mat = 'Ved bordbestilling for over 10 personer må mat forhåndsbestilles'
    if (!e.dato && openTime && closeTime && form.klokkeslett) {
      if (form.klokkeslett < openTime || form.klokkeslett > closeTime)
        e.klokkeslett = `Åpent ${openTime}–${closeTime}`
    }
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
        body: JSON.stringify({ type: 'bordreservasjon', ...form }),
      })
      setStatus(res.ok ? 'ok' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'ok') {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-6 py-20">
        <div className="absolute inset-0 flex">
          <img src={resImg1} alt="" className="w-1/2 h-full object-cover" />
          <img src={resImg2} alt="" className="w-1/2 h-full object-cover" />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-10 text-center max-w-sm">
          <p className="text-2xl font-bold text-stone-900 mb-3">Takk for din forespørsel!</p>
          <p className="text-stone-500">Vi tar kontakt med deg så snart som mulig.</p>
        </div>
      </div>
    )
  }

  const minDate = new Date().toISOString().split('T')[0]
  const f = (field: string) => errors[field] ? inputErrorClass : inputClass
  const err = (field: string) => errors[field]
    ? <p className="mt-1 text-xs text-red-500">{errors[field]}</p>
    : null

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 pb-16 -mt-24 pt-24">
      {/* Bakgrunnsbilder */}
      <div className="absolute inset-0 flex">
        <img src={resImg1} alt="" className="w-1/2 h-full object-cover" />
        <img src={resImg2} alt="" className="w-1/2 h-full object-cover" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Skjema-wrapper */}
      <div className="relative flex items-start gap-4 w-full max-w-xl mt-16">
        <Link to="/booking" className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/80 hover:bg-white transition-colors shrink-0">
          <IconArrowLeft size={18} className="text-stone-700" />
        </Link>

        {/* Skjema-container */}
        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 w-full">
        <h1 className="text-4xl font-bold font-special-elite text-stone-900 mb-2">Bordreservasjon</h1>
        <p className="text-stone-600 leading-relaxed mb-8">
          Fyll ut skjemaet så bekrefter vi reservasjonen din på e-post.
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Dato *</label>
            <input className={f('dato')} type="date" required min={minDate} value={form.dato} onChange={e => set('dato', e.target.value)} />
            {err('dato')}
          </div>
          <div>
            <label className={labelClass}>Klokkeslett *</label>
            <input
              className={f('klokkeslett')}
              type="time"
              required
              min={openTime}
              max={closeTime}
              value={form.klokkeslett}
              onChange={e => set('klokkeslett', e.target.value)}
            />
            {err('klokkeslett')}
          </div>
        </div>

        <div>
          <label className={labelClass}>Antall personer *</label>
          <input className={f('antall')} type="number" min="1" required value={form.antall} onChange={e => set('antall', e.target.value)} />
          {err('antall')}
        </div>

        {Number(form.antall) >= 10 && (
          <div>
            <label className={labelClass}>Ønsket mat *</label>
            <textarea className={f('onsket_mat') + ' block resize-y min-h-[80px]'} value={form.onsket_mat} onChange={e => set('onsket_mat', e.target.value)} />
            {err('onsket_mat')}
          </div>
        )}

        <div>
          <label className={labelClass}>Melding</label>
          <textarea className={inputClass + ' block resize-none min-h-[80px]'} value={form.melding} onChange={e => set('melding', e.target.value)} />
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
        </div>{/* slutt skjema-container */}
      </div>{/* slutt skjema-wrapper */}
    </div>
  )
}
