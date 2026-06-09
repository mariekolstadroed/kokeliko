import { useState } from 'react'
import { Link } from 'react-router-dom'
import { IconArrowLeft } from '@tabler/icons-react'
import cateringImg1 from '../../assets/booking/catering/catering1.png'
import cateringImg2 from '../../assets/booking/catering/catering2.png'
import { validateEmail, validatePhone, validateFutureDate } from '../../lib/validation'
import { useOpeningHours } from '../../hooks/useOpeningHours'

const inputClass = 'w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm text-stone-800 bg-white focus:outline-none focus:border-stone-400 transition-colors'
const inputErrorClass = 'w-full px-3 py-2.5 border border-red-300 rounded-lg text-sm text-stone-800 bg-white focus:outline-none focus:border-red-400 transition-colors'
const labelClass = 'block text-sm font-medium text-stone-700 mb-1.5'

export default function Catering() {
  const [form, setForm] = useState({ navn: '', epost: '', type_arrangement: '', telefon: '', dato: '', antall: '', levering: 'Henting', adresse: '', tidspunkt: '', onsket_mat: '', annen_info: '' })
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
    const dato = validateFutureDate(form.dato)
    if (dato) e.dato = dato
    if (!e.dato && dayHours?.closed) e.dato = 'Stengt denne dagen'
    if (!form.antall || Number(form.antall) < 1) e.antall = 'Antall må være større enn 0'
    if (form.levering === 'Levering' && !form.adresse) e.adresse = 'Leveringsadresse er påkrevd'
    if (!e.dato && openTime && closeTime && form.tidspunkt) {
      if (form.tidspunkt < openTime || form.tidspunkt > closeTime)
        e.tidspunkt = `Åpent ${openTime}–${closeTime}`
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
        body: JSON.stringify({ type: 'catering', ...form }),
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
          <img src={cateringImg1} alt="" className="w-1/2 h-full object-cover" />
          <img src={cateringImg2} alt="" className="w-1/2 h-full object-cover" />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-10 text-center max-w-sm">
          <p className="text-2xl font-bold text-stone-900 mb-3">Takk for din forespørsel!</p>
          <p className="text-stone-500">Vi tar kontakt med deg så snart som mulig.</p>
        </div>
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
    <div className="relative min-h-screen flex items-center justify-center px-6 pb-16 -mt-24 pt-24">
      {/* Bakgrunnsbilder */}
      <div className="absolute inset-0 flex">
        <img src={cateringImg1} alt="" className="w-1/2 h-full object-cover" />
        <img src={cateringImg2} alt="" className="w-1/2 h-full object-cover" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Skjema-wrapper */}
      <div className="relative flex items-start gap-4 w-full max-w-xl mt-16">
        <Link to="/booking" className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/80 hover:bg-white transition-colors shrink-0">
          <IconArrowLeft size={18} className="text-stone-700" />
        </Link>

        {/* Skjema-container */}
        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 w-full">
        <h1 className="text-4xl font-bold font-special-elite text-[#2E1608] mb-2">Catering</h1>
        <p className="text-stone-600 leading-relaxed mb-8">
          Fyll ut skjemaet så setter vi sammen et tilbud til deg.
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Dato *</label>
            <input className={f('dato')} type="date" required min={minDate} value={form.dato} onChange={e => set('dato', e.target.value)} />
            {err('dato')}
          </div>
          <div>
            <label className={labelClass}>Antall personer *</label>
            <input className={f('antall')} type="number" min="1" required value={form.antall} onChange={e => set('antall', e.target.value)} />
            {err('antall')}
          </div>
        </div>

        <div>
          <label className={labelClass}>Levering</label>
          <div className="flex gap-4 text-sm text-stone-700">
            {['Henting', 'Levering'].map(opt => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="levering" value={opt} checked={form.levering === opt} onChange={() => set('levering', opt)} />
                {opt}
              </label>
            ))}
          </div>
        </div>

        {form.levering === 'Levering' && (
          <div>
            <label className={labelClass}>Leveringsadresse *</label>
            <input className={f('adresse')} required value={form.adresse} onChange={e => set('adresse', e.target.value)} />
            {err('adresse')}
          </div>
        )}

        <div>
          <label className={labelClass}>Henting/leveringstidspunkt *</label>
          <input
            className={f('tidspunkt')}
            type="time"
            required
            min={openTime}
            max={closeTime}
            value={form.tidspunkt}
            onChange={e => set('tidspunkt', e.target.value)}
          />
          {err('tidspunkt')}
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
        </div>{/* slutt skjema-container */}
      </div>{/* slutt skjema-wrapper */}
    </div>
  )
}
