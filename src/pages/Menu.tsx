import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Category, MenuItem } from '../types'

export default function Menu() {
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const [{ data: cats }, { data: its }] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order', { ascending: true, nullsFirst: false }).order('name'),
        supabase.from('menu_items').select('*').eq('available', true).order('sort_order', { ascending: true, nullsFirst: false }).order('name'),
      ])
      const fetchedCats = cats ?? []
      setCategories(fetchedCats)
      setItems(its ?? [])
      if (fetchedCats.length > 0) setActiveCategory(fetchedCats[0].id)
      setLoading(false)
    }
    fetchData()
  }, [])

  const visibleItems = items.filter(i => i.category_id === activeCategory)

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold font-special-elite text-stone-900 mb-1">Meny</h1>

      {loading ? (
        <div className="mt-16 text-center text-stone-400 text-sm">Laster…</div>
      ) : (
        <>
          {/* Category tabs */}
          <div className="flex gap-1 border-b border-stone-200 mt-10 overflow-x-auto">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 pb-4 text-base whitespace-nowrap border-b-2 -mb-px transition-colors ${
                  activeCategory === cat.id
                    ? 'border-stone-900 font-semibold text-stone-900'
                    : 'border-transparent font-medium text-stone-400 hover:text-stone-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Category description */}
          {categories.find(c => c.id === activeCategory)?.description && (
            <p className="text-stone-600 leading-relaxed mt-4 whitespace-pre-line">
              {categories.find(c => c.id === activeCategory)!.description}
            </p>
          )}

          {/* Items */}
          <div className="mt-4 flex flex-col gap-3">
            {visibleItems.length === 0 ? (
              <p className="py-12 text-center text-stone-400 text-sm italic">Ingen elementer i denne kategorien</p>
            ) : visibleItems.map(item => (
              <div key={item.id} className="flex gap-6 p-5 bg-white rounded-2xl">
                <div className="w-32 h-32 rounded-xl overflow-hidden shrink-0 bg-stone-100">
                  {item.image_url && (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="font-semibold font-special-elite text-lg text-stone-900">{item.name}</h3>
                  {item.description && (
                    <p className="text-sm text-stone-600 mt-1">{item.description}</p>
                  )}
                  {item.allergens && (
                    <p className="text-sm text-stone-400 mt-1">Allergener: {item.allergens}</p>
                  )}
                  {item.price != null && <p className="font-semibold text-base text-pink-500 mt-2">{item.price} kr</p>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
