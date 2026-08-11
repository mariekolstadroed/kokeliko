'use client'

import { useState } from 'react'
import Link from 'next/link'

type Props = {
  token: string | null
}

export default function AvmeldForm({ token }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'started' | 'not_found' | 'error'>('idle')

  if (!token) {
    return (
      <div className="bg-4/70 backdrop-blur-sm rounded-2xl p-10 text-center w-full max-w-sm mx-auto">
        <p className="text-2">Ugyldig avmeldingslenke.</p>
      </div>
    )
  }

  async function handleCancel() {
    setStatus('loading')
    try {
      const res = await fetch(`/api/events/cancel?token=${token}`, { method: 'DELETE' })
      if (res.ok) { setStatus('ok'); return }
      const body = await res.json().catch(() => ({}))
      setStatus(body.reason === 'started' ? 'started' : body.reason === 'not_found' ? 'not_found' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="bg-4/70 backdrop-blur-sm rounded-2xl p-10 text-center w-full max-w-sm mx-auto">
      {status === 'ok' ? (
        <>
          <p className="text-2xl font-bold font-special-elite text-1 mb-3">Du er avmeldt</p>
          <p className="text-2 mb-8">Vi håper å se deg på et annet arrangement.</p>
          <Link href="/arrangementer" className="text-sm text-2 hover:opacity-70 underline">
            Se alle arrangementer
          </Link>
        </>
      ) : status === 'started' ? (
        <>
          <p className="text-2 font-medium mb-2">Arrangementet har allerede startet.</p>
          <p className="text-2 text-sm">Avmelding er ikke lenger mulig.</p>
        </>
      ) : status === 'not_found' ? (
        <>
          <p className="text-2 font-medium mb-2">Du er allerede avmeldt.</p>
          <p className="text-2 text-sm">Denne lenken er ikke lenger gyldig.</p>
        </>
      ) : status === 'error' ? (
        <>
          <p className="text-2 font-medium mb-2">Noe gikk galt.</p>
          <p className="text-2 text-sm">Prøv igjen, eller kontakt oss direkte.</p>
        </>
      ) : (
        <>
          <p className="text-2xl font-bold font-special-elite text-1 mb-3">Avmeld deg?</p>
          <p className="text-2 mb-8">Denne handlingen kan ikke angres.</p>
          <button
            onClick={handleCancel}
            disabled={status === 'loading'}
            className="px-6 py-2.5 bg-1 text-4 text-sm font-medium font-special-elite rounded-lg shadow-sm shadow-1/30 hover:brightness-125 transition-colors disabled:opacity-50"
          >
            {status === 'loading' ? 'Melder av…' : 'Bekreft avmelding'}
          </button>
        </>
      )}
    </div>
  )
}
