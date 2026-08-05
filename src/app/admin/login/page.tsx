'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import bakgrunn from '@/assets/events/bakgrunn.jpg'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Feil e-post eller passord')
    } else {
      router.push('/admin')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <Image src={bakgrunn} alt="" fill className="object-cover" priority />
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 w-full max-w-sm">
      <div className="bg-white/70 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin</h1>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="E-post"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="bg-white border border-stone-200 px-3 py-3 rounded-lg text-base focus:outline-none focus:border-stone-400 transition-colors"
            autoCapitalize="none"
            autoCorrect="off"
          />
          <input
            type="password"
            placeholder="Passord"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="bg-white border border-stone-200 px-3 py-3 rounded-lg text-base focus:outline-none focus:border-stone-400 transition-colors"
            autoCapitalize="none"
            autoCorrect="off"
          />
          <button type="submit" className="bg-[#2e1608] text-white py-3 rounded-lg font-bold text-base mt-1">
            Logg inn
          </button>
        </form>
      </div>
      </div>
    </div>
  )
}
