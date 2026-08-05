'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { GalleryItem } from '@/types'
import GalleryItemModal from './GalleryItemModal'
import { IconPlus, IconEdit, IconTrash, IconChevronUp, IconChevronDown, IconEye, IconEyeOff } from '@tabler/icons-react'

const SECTIONS: { id: 'bestselgere' | 'nyheter'; label: string }[] = [
  { id: 'bestselgere', label: 'Våre bestselgere' },
  { id: 'nyheter', label: 'Nyheter i hyllene' },
]

export default function GallerySection() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ open: boolean; item?: GalleryItem; section?: 'bestselgere' | 'nyheter' }>({ open: false })
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const initialLoad = useRef(true)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    if (initialLoad.current) setLoading(true)
    const { data } = await supabase.from('gallery_items').select('*').order('sort_order', { ascending: true, nullsFirst: false })
    setItems(data ?? [])
    setLoading(false)
    initialLoad.current = false
  }

  function sortedBySection(section: 'bestselgere' | 'nyheter') {
    return items.filter(i => i.section === section).sort((a, b) => {
      if (a.sort_order === null && b.sort_order === null) return 0
      if (a.sort_order === null) return 1
      if (b.sort_order === null) return -1
      return a.sort_order - b.sort_order
    })
  }

  async function moveItem(item: GalleryItem, direction: 'up' | 'down') {
    const list = sortedBySection(item.section)
    const idx = list.findIndex(i => i.id === item.id)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= list.length) return

    const normalized = list.map((i, pos) => ({ id: i.id, sort_order: pos }))
    const tmp = normalized[idx].sort_order
    normalized[idx].sort_order = normalized[swapIdx].sort_order
    normalized[swapIdx].sort_order = tmp

    setItems(prev => prev.map(i => {
      const n = normalized.find(n => n.id === i.id)
      return n ? { ...i, sort_order: n.sort_order } : i
    }))

    await Promise.all(normalized.map(({ id, sort_order }) =>
      supabase.from('gallery_items').update({ sort_order }).eq('id', id)
    ))
  }

  async function togglePublished(item: GalleryItem) {
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, published: !i.published } : i))
    await supabase.from('gallery_items').update({ published: !item.published }).eq('id', item.id)
  }

  async function deleteItem(id: string) {
    setItems(prev => prev.filter(i => i.id !== id))
    await supabase.from('gallery_items').delete().eq('id', id)
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="text-sm text-stone-400 text-center py-8">Laster…</div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-6 flex flex-col gap-8">
      {SECTIONS.map(section => {
        const sectionItems = sortedBySection(section.id)
        return (
          <div key={section.id}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-stone-800">{section.label}</h2>
              <button
                onClick={() => setModal({ open: true, section: section.id })}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-pink-500 border border-pink-500 text-white hover:bg-pink-600 transition-colors"
              >
                <IconPlus size={12} aria-hidden /> Legg til
              </button>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
              {sectionItems.length === 0 ? (
                <div className="px-5 py-8 text-sm text-stone-400 italic text-center">
                  Ingen bilder ennå
                </div>
              ) : sectionItems.map((item, idx) => (
                <div key={item.id} className={`flex items-center gap-4 px-4 py-4 border-b border-stone-100 last:border-b-0 ${confirmId === item.id ? 'bg-red-50' : ''}`}>
                  {confirmId === item.id ? (
                    <div className="flex flex-col items-center justify-center gap-3 w-full min-h-20">
                      <p className="text-[13px] text-stone-700 text-center">Slette <span className="font-bold">{item.title ?? 'dette bildet'}</span>?</p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setConfirmId(null)}
                          className="px-2.5 py-1 text-[12px] font-medium rounded-md border border-red-200 bg-white text-stone-600 hover:bg-red-100 transition-colors"
                        >
                          Avbryt
                        </button>
                        <button
                          onClick={() => { deleteItem(item.id); setConfirmId(null) }}
                          className="px-2.5 py-1 text-[12px] font-medium rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
                        >
                          Slett
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col shrink-0">
                        <button
                          onClick={() => moveItem(item, 'up')}
                          disabled={idx === 0}
                          className="p-0.5 rounded text-stone-400 hover:text-stone-700 disabled:opacity-20 transition-colors"
                        >
                          <IconChevronUp size={13} />
                        </button>
                        <button
                          onClick={() => moveItem(item, 'down')}
                          disabled={idx === sectionItems.length - 1}
                          className="p-0.5 rounded text-stone-400 hover:text-stone-700 disabled:opacity-20 transition-colors"
                        >
                          <IconChevronDown size={13} />
                        </button>
                      </div>

                      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-stone-100">
                        {item.image_url && (
                          <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-[13.5px] text-stone-800 truncate">{item.title ?? <span className="text-stone-400 italic">Ingen tekst</span>}</p>
                        <span className={`inline-block mt-1 px-1.5 py-0.5 rounded-full text-[11px] font-semibold ${item.published ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
                          {item.published ? 'Publisert' : 'Skjult'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => togglePublished(item)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 transition-colors text-[12px] font-medium"
                        >
                          {item.published ? <><IconEyeOff size={13} /><span className="hidden md:inline"> Skjul</span></> : <><IconEye size={13} /><span className="hidden md:inline"> Publiser</span></>}
                        </button>
                        <button
                          onClick={() => setModal({ open: true, item, section: item.section })}
                          className="p-1.5 rounded-md border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 transition-colors"
                        >
                          <IconEdit size={13} />
                        </button>
                        <button
                          onClick={() => setConfirmId(item.id)}
                          className="p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <IconTrash size={13} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {modal.open && modal.section && (
        <GalleryItemModal
          item={modal.item}
          section={modal.section}
          onClose={() => setModal({ open: false })}
          onSaved={fetchAll}
        />
      )}
    </div>
  )
}
