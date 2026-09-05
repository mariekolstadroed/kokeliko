'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Category, MenuItem } from '@/types'
import MenuItemModal from './MenuItemModal'
import CategoryModal from './CategoryModal'
import { IconCategory, IconPlus, IconEdit, IconTrash, IconChevronUp, IconChevronDown } from '@tabler/icons-react'

export default function MenuSection() {
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [itemModal, setItemModal] = useState<{ open: boolean; item?: MenuItem; categoryId?: string }>({ open: false })
  const [categoryModal, setCategoryModal] = useState<{ open: boolean; category?: Category }>({ open: false })
  const [confirmItemId, setConfirmItemId] = useState<string | null>(null)
  const [confirmCatId, setConfirmCatId] = useState<string | null>(null)
  const initialLoad = useRef(true)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    if (initialLoad.current) setLoading(true)
    const [{ data: cats }, { data: its }] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order', { ascending: true, nullsFirst: false }).order('name'),
      supabase.from('menu_items').select('*').order('sort_order', { ascending: true, nullsFirst: false }).order('name'),
    ])
    setCategories(cats ?? [])
    setItems(its ?? [])
    setLoading(false)
    initialLoad.current = false
  }

  function sortedCatItems(categoryId: string) {
    return items
      .filter(i => i.category_id === categoryId)
      .sort((a, b) => {
        if (a.sort_order === null && b.sort_order === null) return a.name.localeCompare(b.name)
        if (a.sort_order === null) return 1
        if (b.sort_order === null) return -1
        return a.sort_order - b.sort_order
      })
  }

  function sortedCategories() {
    return [...categories].sort((a, b) => {
      if (a.sort_order === null && b.sort_order === null) return a.name.localeCompare(b.name)
      if (a.sort_order === null) return 1
      if (b.sort_order === null) return -1
      return a.sort_order - b.sort_order
    })
  }

  async function moveCategory(cat: Category, direction: 'up' | 'down') {
    const sorted = sortedCategories()
    const idx = sorted.findIndex(c => c.id === cat.id)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sorted.length) return

    const normalized = sorted.map((c, i) => ({ id: c.id, sort_order: i }))
    const tmp = normalized[idx].sort_order
    normalized[idx].sort_order = normalized[swapIdx].sort_order
    normalized[swapIdx].sort_order = tmp

    setCategories(prev => prev.map(c => {
      const n = normalized.find(n => n.id === c.id)
      return n ? { ...c, sort_order: n.sort_order } : c
    }))

    await Promise.all(
      normalized.map(({ id, sort_order }) =>
        supabase.from('categories').update({ sort_order }).eq('id', id)
      )
    )
  }

  async function moveItem(item: MenuItem, direction: 'up' | 'down') {
    const catItems = sortedCatItems(item.category_id)
    const idx = catItems.findIndex(i => i.id === item.id)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= catItems.length) return

    const normalized = catItems.map((i, pos) => ({ id: i.id, sort_order: pos }))
    const tmp = normalized[idx].sort_order
    normalized[idx].sort_order = normalized[swapIdx].sort_order
    normalized[swapIdx].sort_order = tmp

    setItems(prev => prev.map(i => {
      const n = normalized.find(n => n.id === i.id)
      return n ? { ...i, sort_order: n.sort_order } : i
    }))

    await Promise.all(
      normalized.map(({ id, sort_order }) =>
        supabase.from('menu_items').update({ sort_order }).eq('id', id)
      )
    )
  }

  async function toggleAvailable(item: MenuItem) {
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, available: !i.available } : i))
    await supabase.from('menu_items').update({ available: !item.available }).eq('id', item.id)
  }

  async function deleteItem(id: string) {
    setItems(prev => prev.filter(i => i.id !== id))
    await supabase.from('menu_items').delete().eq('id', id)
  }

  async function deleteCategory(id: string) {
    setCategories(prev => prev.filter(c => c.id !== id))
    setItems(prev => prev.filter(i => i.category_id !== id))
    await supabase.from('categories').delete().eq('id', id)
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="text-sm text-stone-400 text-center py-8">Laster…</div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="text-[13px] text-stone-400">
          {categories.length} kategorier · {items.length} elementer
        </div>
        <button
          onClick={() => setCategoryModal({ open: true })}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-md border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 transition-colors"
        >
          <IconCategory size={14} aria-hidden /> Ny kategori
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-8 text-sm text-stone-400 text-center italic">
          Ingen kategorier ennå. Legg til en kategori for å komme i gang.
        </div>
      ) : sortedCategories().map((cat, catIdx) => {
        const catItems = sortedCatItems(cat.id)
        const totalCats = categories.length
        return (
          <div key={cat.id} className={`border rounded-xl overflow-hidden shadow-sm ${confirmCatId === cat.id ? 'bg-red-50 border-red-200' : 'bg-white border-stone-200'}`}>
            {confirmCatId === cat.id ? (
              <div className="flex flex-col items-center justify-center gap-4 py-10">
                <p className="text-[13px] text-stone-700 text-center">
                  Slette <span className="font-bold">{cat.name}</span>?<br />
                  <span className="text-stone-400 text-[12px]">Alle menyelementer i kategorien slettes også.</span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setConfirmCatId(null)}
                    className="px-2.5 py-1 text-[12px] font-medium rounded-md border border-red-200 bg-white text-stone-600 hover:bg-red-100 transition-colors"
                  >
                    Avbryt
                  </button>
                  <button
                    onClick={() => { deleteCategory(cat.id); setConfirmCatId(null) }}
                    className="px-2.5 py-1 text-[12px] font-medium rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
                  >
                    Slett
                  </button>
                </div>
              </div>
            ) : <>
            <div className="flex items-center justify-between px-4.5 py-3.5 border-b border-stone-200">
              <div className="flex items-center gap-1">
                <div className="flex flex-col mr-1">
                  <button
                    onClick={() => moveCategory(cat, 'up')}
                    disabled={catIdx === 0}
                    className="inline-flex items-center p-0.5 rounded text-stone-400 hover:text-stone-700 disabled:opacity-20 transition-colors"
                  >
                    <IconChevronUp size={13} aria-hidden />
                  </button>
                  <button
                    onClick={() => moveCategory(cat, 'down')}
                    disabled={catIdx === totalCats - 1}
                    className="inline-flex items-center p-0.5 rounded text-stone-400 hover:text-stone-700 disabled:opacity-20 transition-colors"
                  >
                    <IconChevronDown size={13} aria-hidden />
                  </button>
                </div>
                <div className="text-[15px] font-semibold text-stone-800">{cat.name}</div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCategoryModal({ open: true, category: cat })}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  <IconEdit size={12} aria-hidden /> <span className="hidden md:inline">Rediger kategori</span>
                </button>
                <button
                  onClick={() => setItemModal({ open: true, categoryId: cat.id })}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-admin-accent border border-admin-accent text-white hover:bg-admin-accent-hover transition-colors"
                >
                  <IconPlus size={12} aria-hidden /> <span className="hidden md:inline">Legg til</span>
                </button>
                <button
                  onClick={() => setConfirmCatId(cat.id)}
                  className="inline-flex items-center p-1 text-xs rounded-md text-red-500 hover:bg-red-50 transition-colors"
                >
                  <IconTrash size={13} aria-hidden />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full table-fixed border-collapse text-[13.5px]">
              <colgroup>
                <col />
                <col className="w-16 md:w-28" />
                <col className="w-10 md:w-24" />
                <col className="w-24" />
              </colgroup>
              <thead>
                <tr>
                  {['Navn', 'Pris', 'Synlig', ''].map(h => (
                    <th key={h} className="text-left px-4.5 py-2 text-[11px] font-semibold uppercase tracking-wider text-stone-400 bg-stone-50 border-b border-stone-200">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {catItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4.5 py-6 text-sm text-stone-400 italic">
                      Ingen elementer ennå
                    </td>
                  </tr>
                ) : catItems.map((item, idx) => (
                  <tr key={item.id} className={`border-b border-stone-200 last:border-b-0 ${confirmItemId === item.id ? 'bg-red-50' : ''}`}>
                    {confirmItemId === item.id ? (
                      <td colSpan={4} className="px-4.5 py-3.5">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[13px] text-stone-700">Slette <span className="font-bold">{item.name}</span>?</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => setConfirmItemId(null)}
                              className="px-2.5 py-1 text-[12px] font-medium rounded-md border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
                            >
                              Avbryt
                            </button>
                            <button
                              onClick={() => { deleteItem(item.id); setConfirmItemId(null) }}
                              className="px-2.5 py-1 text-[12px] font-medium rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
                            >
                              Slett
                            </button>
                          </div>
                        </div>
                      </td>
                    ) : (
                      <>
                        <td className="px-4.5 py-2.5 text-stone-800 max-md:break-all">{item.name}</td>
                        <td className="max-md:pl-0 max-md:pr-1 px-4.5 py-2.5 text-stone-800">{item.price != null ? `${item.price} kr` : '—'}</td>
                        <td className="max-md:pl-0 max-md:pr-1 px-4.5 py-2.5">
                          <button
                            onClick={() => toggleAvailable(item)}
                            aria-label={item.available ? 'Skjul fra meny' : 'Vis på meny'}
                            className={`relative w-7 h-4 md:w-9 md:h-5 rounded-full transition-colors ${item.available ? 'bg-green-500' : 'bg-stone-300'}`}
                          >
                            <span className={`absolute w-3 h-3 md:w-3.5 md:h-3.5 bg-white rounded-full transition-all top-0.5 md:top-0.75 ${item.available ? 'right-0.5 md:right-0.75' : 'left-0.5 md:left-0.75'}`} />
                          </button>
                        </td>
                        <td className="max-md:px-1.5 px-4.5 py-2.5">
                          <div className="flex items-center gap-1 justify-end">
                            <div className="flex flex-col">
                              <button
                                onClick={() => moveItem(item, 'up')}
                                disabled={idx === 0}
                                className="inline-flex items-center p-0.5 rounded text-stone-400 hover:text-stone-700 disabled:opacity-20 transition-colors"
                              >
                                <IconChevronUp size={13} aria-hidden />
                              </button>
                              <button
                                onClick={() => moveItem(item, 'down')}
                                disabled={idx === catItems.length - 1}
                                className="inline-flex items-center p-0.5 rounded text-stone-400 hover:text-stone-700 disabled:opacity-20 transition-colors"
                              >
                                <IconChevronDown size={13} aria-hidden />
                              </button>
                            </div>
                            <button
                              onClick={() => setItemModal({ open: true, item })}
                              className="inline-flex items-center p-1.5 rounded-md border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 transition-colors"
                            >
                              <IconEdit size={13} aria-hidden />
                            </button>
                            <button
                              onClick={() => setConfirmItemId(item.id)}
                              className="inline-flex items-center p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <IconTrash size={13} aria-hidden />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            </>}
          </div>
        )
      })}

      {itemModal.open && (
        <MenuItemModal
          item={itemModal.item}
          categories={categories}
          defaultCategoryId={itemModal.categoryId}
          onClose={() => setItemModal({ open: false })}
          onSaved={fetchAll}
        />
      )}

      {categoryModal.open && (
        <CategoryModal
          category={categoryModal.category}
          onClose={() => setCategoryModal({ open: false })}
          onSaved={fetchAll}
        />
      )}
    </div>
  )
}
