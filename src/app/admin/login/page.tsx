'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { validateEmail } from '@/lib/validation'
import bakgrunn from '@/assets/events/bakgrunn.jpg'

const inputClass = 'w-full px-3 py-2.5 border-[2px] border-4 rounded-lg text-sm text-1 bg-6 accent-1 focus:outline-none focus:border-5 transition-colors'
const inputErrorClass = 'w-full px-3 py-2.5 border-[2px] border-5 rounded-lg text-sm text-1 bg-6 accent-1 focus:outline-none focus:border-5 transition-colors'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const epostErr = validateEmail(email)
    if (epostErr) { setEmailError(epostErr); return }
    setEmailError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Feil e-post eller passord')
    } else {
      router.push('/admin')
    }
  }

  return (
    <div className="login-scope min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <Image src={bakgrunn} alt="" fill className="object-cover" priority />
      <div className="absolute inset-0 bg-1/30" />
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 w-full max-w-sm">
      <div className="bg-4/70 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow w-full">
        <div className="logo logo--dark w-64 mx-auto mb-4" role="img" aria-label="Kokeliko" />
        <h1 className="text-3xl font-bold font-special-elite text-2 mb-6 text-center">Admin</h1>
        {error && <p className="bg-4 text-5 border-[2px] border-5 rounded-lg px-3 py-2 mb-4 text-sm">{error}</p>}
        <form onSubmit={handleLogin} noValidate className="flex flex-col gap-4">
          <div>
            <input
              type="email"
              placeholder="E-post"
              value={email}
              onChange={e => { setEmail(e.target.value); if (emailError) setEmailError('') }}
              className={emailError ? inputErrorClass : inputClass}
              autoCapitalize="none"
              autoCorrect="off"
            />
            {emailError && <p className="mt-1 text-xs text-5">{emailError}</p>}
          </div>
          <input
            type="password"
            placeholder="Passord"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={inputClass}
            autoCapitalize="none"
            autoCorrect="off"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-1 text-4 text-base font-special-elite rounded-lg shadow-sm shadow-1/30 hover:brightness-125 transition-colors mt-1"
          >
            Logg inn
          </button>
        </form>
      </div>
      </div>
    </div>
  )
}
