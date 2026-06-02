import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import type { Category, MenuItem } from '../../../types'
import MenuItemModal from './MenuItemModal'
import CategoryModal from './CategoryModal'
import { IconCategory, IconPlus, IconEdit, IconTrash } from '@tabler/icons-react'

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
      supabase.from('menu_items').select('*').order('name'),
    ])
    setCategories(cats ?? [])
    setItems(its ?? [])
    setLoading(false)
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
        <div className="flex gap-2">
          <button
            onClick={() => setCategoryModal({ open: true })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-md border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <IconCategory size={14} aria-hidden /> Ny kategori
          </button>
          <button
            onClick={() => setItemModal({ open: true })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-md bg-pink-500 border border-pink-500 text-white hover:bg-pink-600 transition-colors"
          >
            <IconPlus size={14} aria-hidden /> Nytt element
          </button>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-8 text-sm text-stone-400 text-center italic">
          Ingen kategorier ennå. Legg til en kategori for å komme i gang.
        </div>
      ) : categories.map(cat => {
        const catItems = items.filter(i => i.category_id === cat.id)
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
                ) : catItems.map(item => (
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
