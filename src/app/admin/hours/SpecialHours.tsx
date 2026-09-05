'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { SpecialHoursGroup } from '@/types'
import GroupModal from './GroupModal'
import { IconPlus, IconEdit, IconTrash, IconEye, IconEyeOff } from '@tabler/icons-react'

export default function SpecialHours() {
  const [groups, setGroups] = useState<SpecialHoursGroup[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ open: boolean; group?: SpecialHoursGroup }>({ open: false })
  const [confirmId, setConfirmId] = useState<string | null>(null)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const [{ data: grps }, { data: hrs }] = await Promise.all([
      supabase.from('special_hours_groups').select('*').order('title'),
      supabase.from('special_hours').select('group_id'),
    ])
    setGroups(grps ?? [])
    const c: Record<string, number> = {}
    ;(hrs ?? []).forEach(h => { c[h.group_id] = (c[h.group_id] ?? 0) + 1 })
    setCounts(c)
    setLoading(false)
  }

  async function togglePublished(group: SpecialHoursGroup) {
    const publishing = !group.published
    if (publishing) {
      setGroups(prev => prev.map(g => ({ ...g, published: g.id === group.id })))
      await supabase.from('special_hours_groups').update({ published: false }).neq('id', group.id)
      await supabase.from('special_hours_groups').update({ published: true }).eq('id', group.id)
    } else {
      setGroups(prev => prev.map(g => g.id === group.id ? { ...g, published: false } : g))
      await supabase.from('special_hours_groups').update({ published: false }).eq('id', group.id)
    }
  }

  async function deleteGroup(id: string) {
    setGroups(prev => prev.filter(g => g.id !== id))
    await supabase.from('special_hours_groups').delete().eq('id', id)
  }

  return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4.5 py-3.5 border-b border-stone-200">
        <div className="text-[15px] font-semibold text-stone-800">Spesielle åpningstider</div>
        <button
          onClick={() => setModal({ open: true })}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-admin-accent border border-admin-accent text-white hover:bg-admin-accent-hover transition-colors"
        >
          <IconPlus size={12} /> Ny periode
        </button>
      </div>

      {loading ? (
        <div className="p-6 text-sm text-stone-400 text-center">Laster…</div>
      ) : groups.length === 0 ? (
        <div className="p-6 text-sm text-stone-400 text-center italic">Ingen spesielle perioder ennå</div>
      ) : groups.map(group => (
        <div
          key={group.id}
          className={`px-4.5 border-b border-stone-200 last:border-b-0 ${confirmId === group.id ? 'py-5.25 bg-red-50' : 'py-3.5'}`}
          style={{ borderLeft: `3px solid ${confirmId === group.id ? '#fca5a5' : (group.theme ?? '#e5e2db')}` }}
        >
          {confirmId === group.id ? (
            <div className="flex items-center justify-between gap-3">
              <span className="text-[13px] text-stone-700">Slette <span className="font-bold">{group.title}</span>?</span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setConfirmId(null)}
                  className="px-2.5 py-1 text-[12px] font-medium rounded-md border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  Avbryt
                </button>
                <button
                  onClick={() => { deleteGroup(group.id); setConfirmId(null) }}
                  className="px-2.5 py-1 text-[12px] font-medium rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  Slett
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-stone-800">{group.title}</div>
                <div className="flex items-center gap-2 mt-1">
                  {group.theme && (
                    <div className="w-3 h-3 rounded-full" style={{ background: group.theme }} />
                  )}
                  <span className="text-xs text-stone-400">
                    {counts[group.id] ?? 0} dager
                  </span>
                  <span className={`inline-block px-1.5 py-0.5 rounded-full text-[11px] font-semibold ${group.published ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
                    {group.published ? 'Publisert' : 'Utkast'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => togglePublished(group)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 transition-colors text-[12px] font-medium"
                >
                  {group.published ? <><IconEyeOff size={13} /><span className="hidden md:inline"> Skjul</span></> : <><IconEye size={13} /><span className="hidden md:inline"> Publiser</span></>}
                </button>
                <button
                  onClick={() => setModal({ open: true, group })}
                  className="inline-flex items-center p-1.5 rounded-md border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  <IconEdit size={13} />
                </button>
                <button
                  onClick={() => setConfirmId(group.id)}
                  className="inline-flex items-center p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                >
                  <IconTrash size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {modal.open && (
        <GroupModal
          group={modal.group}
          onClose={() => setModal({ open: false })}
          onSaved={fetchAll}
        />
      )}
    </div>
  )
}
