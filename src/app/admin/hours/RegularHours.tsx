'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { OpeningHour } from '@/types'
import { IconEdit, IconCheck, IconX } from '@tabler/icons-react'

const DAY_NAMES = ['', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag']

type DraftRow = {
  id?: string
  day: number
  open_time: string
  close_time: string
  closed: boolean
}

function buildDraft(hours: OpeningHour[]): DraftRow[] {
  return Array.from({ length: 7 }, (_, i) => {
    const day = i + 1
    const h = hours.find(h => h.day === day)
    return {
      id: h?.id,
      day,
      open_time: h?.open_time?.slice(0, 5) ?? '08:00',
      close_time: h?.close_time?.slice(0, 5) ?? '16:00',
      closed: h?.closed ?? false,
    }
  })
}

export default function RegularHours() {
  const [hours, setHours] = useState<OpeningHour[]>([])
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<DraftRow[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchHours() }, [])

  async function fetchHours() {
    const { data } = await supabase.from('opening_hours').select('*').order('day')
    const fetched = data ?? []
    setHours(fetched)
    setDraft(buildDraft(fetched))
  }

  function startEdit() {
    setDraft(buildDraft(hours))
    setEditing(true)
  }

  function updateRow(day: number, changes: Partial<DraftRow>) {
    setDraft(prev => prev.map(r => r.day === day ? { ...r, ...changes } : r))
  }

  async function handleSave() {
    setSaving(true)
    await Promise.all(draft.map(row => {
      const payload = {
        day: row.day,
        open_time: row.closed ? null : row.open_time,
        close_time: row.closed ? null : row.close_time,
        closed: row.closed,
      }
      if (row.id) {
        return supabase.from('opening_hours').update(payload).eq('id', row.id)
      }
      return supabase.from('opening_hours').insert(payload)
    }))
    setSaving(false)
    setEditing(false)
    fetchHours()
  }

  return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-[18px] py-3.5 border-b border-stone-200">
        <div className="text-[15px] font-semibold text-stone-800">Faste åpningstider</div>
        {editing ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setEditing(false)}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 transition-colors"
            >
              <IconX size={12} /> Avbryt
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-pink-500 border border-pink-500 text-white hover:bg-pink-600 transition-colors disabled:opacity-50"
            >
              <IconCheck size={12} /> {saving ? 'Lagrer…' : 'Lagre'}
            </button>
          </div>
        ) : (
          <button
            onClick={startEdit}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <IconEdit size={12} /> Rediger
          </button>
        )}
      </div>

      {editing ? (
        draft.map(row => (
          <div key={row.day} className="flex items-center gap-3 px-[18px] py-2.5 border-b border-stone-200 last:border-b-0 text-sm">
            <div className="w-24 font-medium text-stone-800">{DAY_NAMES[row.day]}</div>
            <label className="flex items-center gap-1.5 text-stone-600 cursor-pointer">
              <input
                type="checkbox"
                checked={row.closed}
                onChange={e => updateRow(row.day, { closed: e.target.checked })}
              />
              Stengt
            </label>
            {!row.closed && (
              <>
                <input
                  type="time"
                  value={row.open_time}
                  onChange={e => updateRow(row.day, { open_time: e.target.value })}
                  className="px-2 py-1 border border-stone-200 rounded-md text-sm focus:outline-none focus:border-pink-400"
                />
                <span className="text-stone-400">–</span>
                <input
                  type="time"
                  value={row.close_time}
                  onChange={e => updateRow(row.day, { close_time: e.target.value })}
                  className="px-2 py-1 border border-stone-200 rounded-md text-sm focus:outline-none focus:border-pink-400"
                />
              </>
            )}
          </div>
        ))
      ) : (
        Array.from({ length: 7 }, (_, i) => {
          const day = i + 1
          const h = hours.find(h => h.day === day)
          return (
            <div key={day} className="flex items-center px-[18px] py-2.5 border-b border-stone-200 last:border-b-0 text-sm">
              <div className="w-28 shrink-0 font-medium text-stone-800">{DAY_NAMES[day]}</div>
              {!h || h.closed ? (
                <span className="text-stone-400">Stengt</span>
              ) : (
                <span className="font-medium text-stone-800">
                  {h.open_time?.slice(0, 5)} – {h.close_time?.slice(0, 5)}
                </span>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
