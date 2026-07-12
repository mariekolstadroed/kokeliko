'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { SpecialHoursGroup } from '@/types'
import { IconX, IconPlus, IconTrash } from '@tabler/icons-react'

type Props = {
  group?: SpecialHoursGroup
  onClose: () => void
  onSaved: () => void
}

type DateRow = {
  id?: string
  date: string
  description: string
  open_time: string
  close_time: string
  closed: boolean
}

const THEMES = [
  '#50c05a', '#3ab5a8', '#4a90d9', '#7b6ad9',
  '#d54587', '#e8799a', '#d94a4a', '#d2704c',
  '#e7b81e', '#735932',
]

const inputClass = 'px-2 py-1.5 border border-stone-200 rounded-md text-sm text-stone-800 bg-white focus:outline-none focus:border-pink-400 transition-colors font-[inherit]'
const labelClass = 'block text-[12.5px] font-semibold text-stone-700 mb-1'

function newRow(): DateRow {
  return { date: '', description: '', open_time: '08:00', close_time: '16:00', closed: false }
}

export default function GroupModal({ group, onClose, onSaved }: Props) {
  const [title, setTitle] = useState(group?.title ?? '')
  const [theme, setTheme] = useState(group?.theme ?? THEMES[0])
  const [dates, setDates] = useState<DateRow[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!group) return
    supabase.from('special_hours').select('*').eq('group_id', group.id).order('date')
      .then(({ data }) => {
        setDates((data ?? []).map(h => ({
          id: h.id,
          date: h.date ?? '',
          description: h.description ?? '',
          open_time: h.open_time?.slice(0, 5) ?? '08:00',
          close_time: h.close_time?.slice(0, 5) ?? '16:00',
          closed: h.closed,
        })))
      })
  }, [group])

  function updateRow(i: number, changes: Partial<DateRow>) {
    setDates(prev => prev.map((r, idx) => idx === i ? { ...r, ...changes } : r))
  }

  async function handleSave() {
    if (!title.trim()) return
    const invalid = dates.some(d => !d.date && !d.description.trim())
    if (invalid) {
      setError('Alle rader må ha enten en dato eller en beskrivelse.')
      return
    }
    setError(null)
    setSaving(true)

    let groupId = group?.id

    if (group) {
      await supabase.from('special_hours_groups').update({ title: title.trim(), theme }).eq('id', group.id)
      await supabase.from('special_hours').delete().eq('group_id', group.id)
    } else {
      const { data } = await supabase
        .from('special_hours_groups')
        .insert({ title: title.trim(), theme, published: false })
        .select()
        .single()
      groupId = data?.id
    }

    const validDates = dates.filter(d => d.date || d.description.trim())
    if (groupId && validDates.length > 0) {
      await supabase.from('special_hours').insert(
        validDates.map(d => ({
          group_id: groupId,
          date: d.date || null,
          description: d.description || null,
          open_time: d.closed ? null : d.open_time,
          close_time: d.closed ? null : d.close_time,
          closed: d.closed,
        }))
      )
    }

    setSaving(false)
    onSaved()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-6"
    >
      <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl flex flex-col max-h-[85vh]">

        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 shrink-0">
          <div className="text-[15px] font-semibold text-stone-800">
            {group ? 'Rediger periode' : 'Ny periode'}
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-stone-100 text-stone-400 transition-colors">
            <IconX size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          <div>
            <label className={labelClass}>Tittel *</label>
            <input
              className={inputClass + ' w-full'}
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="f.eks. Åpningstider i påsken"
            />
          </div>

          <div>
            <label className={labelClass}>Tema</label>
            <div className="flex gap-3 mt-1">
              {THEMES.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setTheme(color)}
                  className="appearance-none w-3.5 h-3.5 rounded-full shrink-0 cursor-pointer p-0 border-0 transition-transform"
                  style={{
                    background: color,
                    transform: theme === color ? 'scale(1.1)' : 'scale(1)',
                    boxShadow: theme === color ? `0 0 0 2px white, 0 0 0 3.5px ${color}` : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={labelClass + ' mb-0'}>Datoer</label>
              <button
                onClick={() => setDates(prev => [...prev, newRow()])}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-pink-500 border border-pink-500 text-white hover:bg-pink-600 transition-colors"
              >
                <IconPlus size={11} /> Legg til dato
              </button>
            </div>

            {dates.length === 0 ? (
              <div className="text-[13px] text-stone-400 italic py-1">Ingen datoer ennå</div>
            ) : (
              <div className="flex flex-col gap-2">
                {dates.map((row, i) => (
                  <div key={i} className="p-3 bg-stone-50 rounded-lg border border-stone-200 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={row.date}
                        onChange={e => updateRow(i, { date: e.target.value })}
                        className={inputClass}
                      />
                      <input
                        value={row.description}
                        onChange={e => updateRow(i, { description: e.target.value })}
                        placeholder="eks. skjærtorsdag, mandag - fredag"
                        className={inputClass + ' flex-1' + (!row.date && !row.description.trim() ? ' border-red-300' : '')}
                      />
                      <button
                        onClick={() => setDates(prev => prev.filter((_, idx) => idx !== i))}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors shrink-0"
                      >
                        <IconTrash size={13} />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-[13px] text-stone-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={row.closed}
                          onChange={e => updateRow(i, { closed: e.target.checked })}
                        />
                        Stengt
                      </label>
                      {!row.closed && (
                        <>
                          <input
                            type="time"
                            value={row.open_time}
                            onChange={e => updateRow(i, { open_time: e.target.value })}
                            className={inputClass}
                          />
                          <span className="text-stone-400 text-sm">–</span>
                          <input
                            type="time"
                            value={row.close_time}
                            onChange={e => updateRow(i, { close_time: e.target.value })}
                            className={inputClass}
                          />
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-stone-200 shrink-0 flex-wrap">
          {error && <p className="w-full text-xs text-red-500 mb-1">{error}</p>}
          <button
            onClick={onClose}
            className="inline-flex items-center px-3 py-1.5 text-[13px] font-medium rounded-md border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 transition-colors"
          >
            Avbryt
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="inline-flex items-center px-3 py-1.5 text-[13px] font-medium rounded-md bg-pink-500 border border-pink-500 text-white hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Lagrer…' : group ? 'Lagre' : 'Opprett'}
          </button>
        </div>

      </div>
    </div>
  )
}
