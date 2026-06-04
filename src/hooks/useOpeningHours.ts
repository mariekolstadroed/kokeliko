import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { OpeningHour } from '../types'

export function useOpeningHours() {
  const [hours, setHours] = useState<OpeningHour[]>([])

  useEffect(() => {
    supabase.from('opening_hours').select('*').order('day').then(({ data }) => {
      setHours(data ?? [])
    })
  }, [])

  function forDate(date: string): OpeningHour | null {
    if (!date || !hours.length) return null
    const [y, m, d] = date.split('-').map(Number)
    const jsDay = new Date(y, m - 1, d).getDay()
    const dbDay = ((jsDay + 6) % 7) + 1
    return hours.find(h => h.day === dbDay) ?? null
  }

  return { forDate }
}
