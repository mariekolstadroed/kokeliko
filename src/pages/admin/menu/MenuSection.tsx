import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import type { Category, MenuItem } from '../../../types'
import MenuItemModal from './MenuItemModal'
import CategoryModal from './CategoryModal'
import { IconCategory, IconPlus, IconEdit, IconTrash, IconChevronUp, IconChevronDown } from '@tabler/icons-react'

export default function MenuSection() {
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [itemModal, setItemModal] = useState<{ open: boolean; item?: MenuItem; categoryId?: string }>({ open: false })
  const [categoryModal, setCategoryModal] = useState<{ open: boolean; category?: Category }>({ open: false })

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const [{ data: cats }, { data: its }] = await Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase.from('menu_items').select('*').order('sort_order', { ascending: true, nullsFirst: false }).order('name'),
    ])
    setCategories(cats ?? [])
    setItems(its ?? [])
    setLoading(false)
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

  async function moveItem(item: MenuItem, direction: 'up' | 'down') {
    const catItems = sortedCatItems(item.category_id)
    const idx = catItems.findIndex(i => i.id === item.id)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= catItems.length) return

    const current = { ...catItems[idx], sort_order: catItems[idx].sort_order ?? idx }
    const other = { ...catItems[swapIdx], sort_order: catItems[swapIdx].sort_order ?? swapIdx }

    const newCurrentOrder = other.sort_order
    const newOtherOrder = current.sort_order

    setItems(prev => prev.map(i => {
      if (i.id === current.id) return { ...i, sort_order: newCurrentOrder }
      if (i.id === other.id) return { ...i, sort_order: newOtherOrder }
      return i
    }))

    await Promise.all([
      supabase.from('menu_items').update({ sort_order: newCurrentOrder }).eq('id', current.id),
      supabase.from('menu_items').update({ sort_order: newOtherOrder }).eq('id', other.id),
    ])
  }

  async function toggleAvailable(item: MenuItem) {
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, available: !i.available } : i))
    await supabase.from('menu_items').update({ available: !item.available }).eq('id', item.id)
  }

  async function deleteItem(id: string) {
    if (!confirm('Slette dette elementet?')) return
    setItems(prev => prev.filter(i => i.id !== id))
    await supabase.from('menu_items').delete().eq('id', id)
  }

  async function deleteCategory(id: string) {
    if (!confirm('Slette denne kategorien? Alle menyelementer i kategorien slettes også.')) return
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
      ) : categories.map(cat => {
        const catItems = sortedCatItems(cat.id)
        return (
          <div key={cat.id} className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-[18px] py-3.5 border-b border-stone-200">
              <div className="text-[15px] font-semibold text-stone-800">{cat.name}</div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCategoryModal({ open: true, category: cat })}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  <IconEdit size={12} aria-hidden /> Rediger kategori
                </button>
                <button
                  onClick={() => setItemModal({ open: true, categoryId: cat.id })}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-pink-500 border border-pink-500 text-white hover:bg-pink-600 transition-colors"
                >
                  <IconPlus size={12} aria-hidden /> Legg til
                </button>
                <button
                  onClick={() => deleteCategory(cat.id)}
                  className="inline-flex items-center p-1 text-xs rounded-md text-red-500 hover:bg-red-50 transition-colors"
                >
                  <IconTrash size={13} aria-hidden />
                </button>
              </div>
            </div>
            <table className="w-full border-collapse text-[13.5px]">
              <thead>
                <tr>
                  {['Navn', 'Pris', 'Synlig', ''].map(h => (
                    <th key={h} className="text-left px-[18px] py-2 text-[11px] font-semibold uppercase tracking-wider text-stone-400 bg-stone-50 border-b border-stone-200">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {catItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-[18px] py-6 text-sm text-stone-400 italic">
                      Ingen elementer ennå
                    </td>
                  </tr>
                ) : catItems.map((item, idx) => (
                  <tr key={item.id} className="border-b border-stone-200 last:border-b-0">
                    <td className="px-[18px] py-2.5 text-stone-800">{item.name}</td>
                    <td className="px-[18px] py-2.5 text-stone-800">{item.price} kr</td>
                    <td className="px-[18px] py-2.5">
                      <button
                        onClick={() => toggleAvailable(item)}
                        aria-label={item.available ? 'Skjul fra meny' : 'Vis på meny'}
                        className={`relative w-9 h-5 rounded-full transition-colors ${item.available ? 'bg-green-500' : 'bg-stone-300'}`}
                      >
                        <span className={`absolute top-[3px] w-3.5 h-3.5 bg-white rounded-full transition-all ${item.available ? 'right-[3px]' : 'left-[3px]'}`} />
                      </button>
                    </td>
                    <td className="px-[18px] py-2.5">
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
                          onClick={() => deleteItem(item.id)}
                          className="inline-flex items-center p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <IconTrash size={13} aria-hidden />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
