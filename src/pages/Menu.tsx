import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Category, MenuItem } from '../types'
import menuImg1 from '../assets/menu/menu1.png'
import menuImg2 from '../assets/menu/menu2.png'
import menuImg3 from '../assets/menu/menu3.png'
import menuImg4 from '../assets/menu/menu4.png'
import menuImg5 from '../assets/menu/menu5.png'

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
    <div className="relative">
      {/* Sirkel ved kategorivalg */}
      <div className="absolute left-8 top-36 w-[10rem] h-[10rem] rounded-full overflow-hidden pointer-events-none -translate-x-1/2">
        <img src={menuImg5} alt="" className="w-full h-full object-cover scale-[1.2]" />
        <div className="absolute inset-0 bg-[#faf7f2]/30" />
      </div>
      {/* Venstre sirkel */}
      <div className="absolute left-4 bottom-32 w-[15rem] h-[15rem] rounded-full overflow-hidden pointer-events-none -translate-x-1/2">
        <img src={menuImg4} alt="" className="w-full h-full object-cover scale-[1.2]" />
        <div className="absolute inset-0 bg-[#faf7f2]/30" />
      </div>
      {/* Minste høyre sirkel */}
      <div className="absolute right-8 top-12 w-[10rem] h-[10rem] rounded-full overflow-hidden pointer-events-none translate-x-1/2">
        <img src={menuImg3} alt="" className="w-full h-full object-cover scale-[1.5]" />
        <div className="absolute inset-0 bg-[#faf7f2]/30" />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 relative">
        {/* Høyre sirkler */}
        <div className="absolute -right-24 top-56 w-[30rem] h-[30rem] rounded-full overflow-hidden z-0 pointer-events-none">
          <img src={menuImg1} alt="" className="w-full h-full object-cover scale-[1.2]" />
          <div className="absolute inset-0 bg-[#faf7f2]/30" />
        </div>
        <div className="absolute -right-12 top-[50rem] w-[15rem] h-[15rem] rounded-full overflow-hidden z-0 pointer-events-none">
          <img src={menuImg2} alt="" className="w-full h-full object-cover scale-[1.7]" />
          <div className="absolute inset-0 bg-[#faf7f2]/30" />
        </div>

      <div className="relative z-10">
      <h1 className="text-4xl font-bold font-special-elite text-[#2E1608] mb-1">Meny</h1>

      {loading ? (
        <div className="mt-16 text-center text-stone-400 text-sm">Laster…</div>
      ) : (
        <>
          {/* Category tabs */}
          <div className="inline-flex gap-1 mt-10 overflow-x-auto bg-[#FBAF75] rounded-xl px-1 py-1">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2 text-xl whitespace-nowrap rounded-lg transition-colors font-special-elite ${
                  activeCategory === cat.id
                    ? 'bg-[#715055] font-semibold text-white'
                    : 'font-medium text-[#FAF7F2] hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Category description */}
          {categories.find(c => c.id === activeCategory)?.description && (
            <p className="text-stone-600 leading-relaxed mt-4 whitespace-pre-line pr-[24rem]">
              {categories.find(c => c.id === activeCategory)!.description}
            </p>
          )}

          {/* Items */}
          <div className="mt-4">
            <div className="flex flex-col gap-3">
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
                    <h3 className="font-semibold font-special-elite text-xl text-[#2E1608]">{item.name}</h3>
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
          </div>
        </>
      )}

      </div>
      </div>
    </div>
  )
}
