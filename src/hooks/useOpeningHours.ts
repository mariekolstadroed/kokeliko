import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { OpeningHour } from '../types'

async function fetchOpeningHours(): Promise<OpeningHour[]> {
  const { data } = await supabase.from('opening_hours').select('*').order('day')
  return data ?? []
}

export function useOpeningHours() {
  const { data: hours = [] } = useQuery({
    queryKey: ['opening_hours'],
    queryFn: fetchOpeningHours,
  })

  function forDate(date: string): OpeningHour | null {
    if (!date || !hours.length) return null
    const [y, m, d] = date.split('-').map(Number)
    const jsDay = new Date(y, m - 1, d).getDay()
    const dbDay = ((jsDay + 6) % 7) + 1
    return hours.find(h => h.day === dbDay) ?? null
  }

  return { hours, forDate }
}
