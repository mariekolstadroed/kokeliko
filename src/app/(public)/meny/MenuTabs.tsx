'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import type { Category, MenuItem } from '@/types/index'

export default function MenuTabs({
  categories,
  items,
}: {
  categories: Category[]
  items: MenuItem[]
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    if (categories.length > 0 && activeCategory === null) {
      setActiveCategory(categories[0].id)
    }
  }, [categories, activeCategory])

  return (
    <>
      {/* Category tabs */}
      <div className="flex gap-1 mt-10 overflow-x-auto bg-[#FBAF75] rounded-xl px-1 py-1">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-5 pt-2 pb-1 text-xl whitespace-nowrap rounded-lg transition-colors font-special-elite cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-[#715055] font-semibold text-white'
                : 'font-medium text-[#FAF7F2] hover:text-white'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Category description + items — alle kategorier rendres, kun aktiv vises */}
      {categories.map(cat => {
        const catItems = items.filter(i => i.category_id === cat.id)
        const isActive = cat.id === activeCategory
        return (
          <div key={cat.id} className={isActive ? '' : 'hidden'}>
            {cat.description && (
              <p className="text-stone-600 leading-relaxed mt-4 whitespace-pre-line pr-[24rem]">
                {cat.description}
              </p>
            )}
            <div className="mt-4">
              <div className="flex flex-col gap-3">
                {catItems.length === 0 ? (
                  <p className="py-12 text-center text-stone-400 text-sm italic">
                    Ingen elementer i denne kategorien
                  </p>
                ) : (
                  catItems.map(item => (
                    <div key={item.id} className="flex gap-6 p-5 bg-white rounded-2xl">
                      <div className="relative w-32 h-32 rounded-xl overflow-hidden shrink-0 bg-stone-100">
                        {item.image_url && (
                          <Image src={item.image_url} alt={item.name} fill sizes="128px" loading="eager" className="object-cover" />
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
                        {item.price != null && (
                          <p className="font-semibold text-base text-pink-500 mt-2">{item.price} kr</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}
