'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { IconArrowLeft } from '@tabler/icons-react'
import cateringImg1 from '@/assets/booking/catering/catering1.jpg'
import cateringImg2 from '@/assets/booking/catering/catering2.jpg'
import { validateEmail, validatePhone, validateFutureDate } from '@/lib/validation'
import { useOpeningHours } from '@/hooks/useOpeningHours'

const inputClass = 'w-full h-11 px-3 py-2.5 border-[2px] border-4 rounded-lg text-sm text-1 bg-6 accent-1 focus:outline-none focus:border-5 transition-colors'
const inputErrorClass = 'w-full h-11 px-3 py-2.5 border-[2px] border-5 rounded-lg text-sm text-1 bg-6 accent-1 focus:outline-none focus:border-5 transition-colors'
const labelClass = 'block text-sm font-medium text-2 mb-1.5'

export default function Catering() {
  const [form, setForm] = useState({ navn: '', epost: '', type_arrangement: '', telefon: '', dato: '', antall: '', levering: 'Henting', adresse: '', tidspunkt: '', onsket_mat: '', annen_info: '', _hp: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error' | 'rate_limited'>('idle')
  const { forDate } = useOpeningHours()

  useEffect(() => {
    if (status === 'ok') window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [status])

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const dayHours = forDate(form.dato)
  const openTime = dayHours?.open_time?.slice(0, 5)
  const closeTime = dayHours?.close_time?.slice(0, 5)

  function validate() {
    const e: Record<string, string> = {}
    if (!form.navn.trim()) e.navn = 'Navn er påkrevd'
    const epost = validateEmail(form.epost)
    if (epost) e.epost = epost
    const telefon = validatePhone(form.telefon)
    if (telefon) e.telefon = telefon
    const dato = validateFutureDate(form.dato)
    if (dato) e.dato = dato
    if (!e.dato && dayHours?.closed) e.dato = 'Stengt denne dagen'
    if (!form.antall || Number(form.antall) < 1) e.antall = 'Antall må være større enn 0'
    if (form.levering === 'Levering' && !form.adresse) e.adresse = 'Leveringsadresse er påkrevd'
    if (!form.onsket_mat.trim()) e.onsket_mat = 'Ønsket mat er påkrevd'
    if (!form.tidspunkt) {
      e.tidspunkt = 'Tidspunkt er påkrevd'
    } else if (!e.dato && openTime && closeTime && (form.tidspunkt < openTime || form.tidspunkt > closeTime)) {
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
      if (res.status === 429) { setStatus('rate_limited'); return }
      setStatus(res.ok ? 'ok' : 'error')
    } catch {
      setStatus('error')
    }
  }

  const bgImages = (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 md:right-1/2">
        <Image src={cateringImg1} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" placeholder="blur" className="object-cover" />
      </div>
      <div className="absolute inset-y-0 left-1/2 right-0 max-md:hidden">
        <Image src={cateringImg2} alt="" fill sizes="50vw" placeholder="blur" className="object-cover" />
      </div>
      <div className="absolute inset-0 bg-1/40" />
    </div>
  )

  if (status === 'ok') {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-6 -mt-24 pt-24">
        {bgImages}
        <div className="relative bg-4/80 backdrop-blur-sm rounded-2xl p-10 text-center max-w-sm">
          <p className="text-2xl font-bold text-1 mb-3">Takk for din forespørsel!</p>
          <p className="text-2">Vi tar kontakt med deg så snart som mulig.</p>
        </div>
      </div>
    )
  }

  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]
  const f = (field: string) => errors[field] ? inputErrorClass : inputClass
  const err = (field: string) => errors[field]
    ? <p className="mt-1 text-xs text-5">{errors[field]}</p>
    : null

  return (
    <div className="relative min-h-screen flex max-md:items-start items-center justify-center px-6 pb-16 -mt-24 pt-24">
      {bgImages}

      <div className="relative w-full md:max-w-md lg:max-w-xl mt-10 md:mt-16">
        <Link href="/booking" className="mb-3 md:mb-0 md:absolute md:-left-12 md:top-2 inline-flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full bg-4/80 hover:bg-4 transition-colors">
          <IconArrowLeft size={18} className="text-2" />
        </Link>

        <div className="relative bg-4/80 backdrop-blur-sm rounded-2xl p-5 md:p-6 lg:p-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-special-elite text-1 mb-2 text-center">Catering</h1>
          <p className="text-2 leading-relaxed mb-8 text-center">
            Fyll ut skjemaet så setter vi sammen et tilbud til deg.
          </p>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }} aria-hidden="true">
              <input type="text" name="website" tabIndex={-1} autoComplete="off" value={form._hp} onChange={e => set('_hp', e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Dato *</label>
                <input className={f('dato') + ' appearance-none'} type="date" required min={minDate} value={form.dato} onChange={e => set('dato', e.target.value)} />
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
              <div className="flex gap-4 text-sm text-2">
                {['Henting', 'Levering'].map(opt => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="levering" value={opt} checked={form.levering === opt} onChange={() => set('levering', opt)} className="accent-1" />
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
                className={f('tidspunkt') + ' appearance-none'}
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
              <label className={labelClass}>Ønsket mat *</label>
              <textarea className={f('onsket_mat') + ' block resize-y min-h-20'} value={form.onsket_mat} onChange={e => set('onsket_mat', e.target.value)} />
              {err('onsket_mat')}
            </div>

            <div>
              <label className={labelClass}>Annen informasjon</label>
              <textarea className={inputClass + ' block resize-y min-h-20'} value={form.annen_info} onChange={e => set('annen_info', e.target.value)} />
            </div>

            {status === 'error' && (
              <p className="text-sm bg-4 text-5 border-[2px] border-5 rounded-lg px-3 py-2">Noe gikk galt. Prøv igjen eller kontakt oss direkte.</p>
            )}
            {status === 'rate_limited' && (
              <p className="text-sm bg-4 text-5 border-[2px] border-5 rounded-lg px-3 py-2">Du har sendt for mange forespørsler på kort tid. Vent litt og prøv igjen.</p>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="mt-2 px-6 py-3 bg-1 text-4 text-base font-special-elite rounded-lg shadow-sm shadow-1/30 hover:brightness-125 transition-colors disabled:opacity-50"
            >
              {status === 'sending' ? 'Sender…' : 'Send forespørsel'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
