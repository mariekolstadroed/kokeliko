import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { OpeningHour, SpecialHoursGroup, SpecialHour } from '../types'

const DAY_NAMES = ['', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag']

function formatTime(t: string | null) {
  if (!t) return ''
  return t.slice(0, 5)
}

function formatDate(d: string) {
  const date = new Date(d)
  return date.toLocaleDateString('nb-NO', { day: 'numeric', month: 'long' })
}

type SpecialGroupWithHours = SpecialHoursGroup & { hours: SpecialHour[] }

export default function Home() {
  const [regularHours, setRegularHours] = useState<OpeningHour[]>([])
  const [specialGroups, setSpecialGroups] = useState<SpecialGroupWithHours[]>([])

  useEffect(() => {
    async function fetchData() {
      const [{ data: regular }, { data: groups }, { data: special }] = await Promise.all([
        supabase.from('opening_hours').select('*').order('day'),
        supabase.from('special_hours_groups').select('*').eq('published', true),
        supabase.from('special_hours').select('*').order('date'),
      ])

      setRegularHours(regular ?? [])

      const grouped = (groups ?? []).map(g => ({
        ...g,
        hours: (special ?? []).filter(s => s.group_id === g.id),
      }))
      setSpecialGroups(grouped)
    }
    fetchData()
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-6">

      {/* Hero */}
      <div className="h-[70vh] rounded-3xl bg-stone-200 mt-6 mb-16" />

      {/* Opening hours */}
      <div className="grid grid-cols-2 gap-8 mb-16">

        {/* Regular hours */}
        <div>
          <h2 className="text-xl font-bold text-stone-900 mb-5">Åpningstider</h2>
          <div className="flex flex-col gap-2">
            {regularHours.map(h => (
              <div key={h.id} className="flex justify-between text-sm">
                <span className="text-stone-700 font-medium">{DAY_NAMES[h.day]}</span>
                <span className="text-stone-500">
                  {h.closed ? 'Stengt' : `${formatTime(h.open_time)} – ${formatTime(h.close_time)}`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Special hours */}
        {specialGroups.length > 0 && (
          <div className="flex flex-col gap-4">
            {specialGroups.map(group => (
              <div
                key={group.id}
                className="border-2 rounded-2xl p-5"
                style={{ borderColor: group.theme ?? '#e2d9cc' }}
              >
                <h3 className="font-bold text-stone-900 mb-3">{group.title}</h3>
                <div className="flex flex-col gap-2">
                  {group.hours.map(h => (
                    <div key={h.id} className="flex justify-between text-sm">
                      <span className="text-stone-700 font-medium">
                        {h.description ?? formatDate(h.date)}
                      </span>
                      <span className="text-stone-500">
                        {h.closed ? 'Stengt' : `${formatTime(h.open_time)} – ${formatTime(h.close_time)}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  )
}
