'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAutoGrowTextarea } from '@/hooks/useAutoGrowTextarea'
import type { Category } from '@/types'
import { IconX } from '@tabler/icons-react'

type Props = {
  category?: Category
  onClose: () => void
  onSaved: () => void
}

const inputClass = 'w-full px-2.5 py-2 border border-stone-200 rounded-md text-sm text-stone-800 bg-white focus:outline-none focus:border-admin-accent-light transition-colors font-[inherit]'
const labelClass = 'block text-[12.5px] font-semibold text-stone-700 mb-1'

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function CategoryModal({ category, onClose, onSaved }: Props) {
  const [name, setName] = useState(category?.name ?? '')
  const [description, setDescription] = useState(category?.description ?? '')
  const [saving, setSaving] = useState(false)
  const descriptionRef = useAutoGrowTextarea(description)

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    const base = { name: name.trim(), slug: toSlug(name), description: description.trim() || null }
    if (category) {
      await supabase.from('categories').update(base).eq('id', category.id)
    } else {
      await supabase.from('categories').insert(base)
    }
    setSaving(false)
    onSaved()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-6"
    >
      <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
          <div className="text-[15px] font-semibold text-stone-800">
            {category ? 'Rediger kategori' : 'Ny kategori'}
          </div>
          <button onClick={onClose} disabled={saving} className="p-1 rounded-md hover:bg-stone-100 text-stone-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            <IconX size={16} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div>
            <label className={labelClass}>Navn *</label>
            <input className={inputClass} value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Beskrivelse</label>
            <textarea
              ref={descriptionRef}
              className={inputClass + ' block resize-none overflow-hidden min-h-17'}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Vises på menysiden under kategorinavnet"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-stone-200">
          <button
            onClick={onClose}
            disabled={saving}
            className="inline-flex items-center px-3 py-1.5 text-[13px] font-medium rounded-md border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Avbryt
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="inline-flex items-center px-3 py-1.5 text-[13px] font-medium rounded-md bg-admin-accent border border-admin-accent text-white hover:bg-admin-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Lagrer…' : category ? 'Lagre' : 'Opprett'}
          </button>
        </div>
      </div>
    </div>
  )
}
