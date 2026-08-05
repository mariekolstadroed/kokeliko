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
      <div className="mt-10 w-full lg:w-fit lg:mx-auto bg-[#FBAF75] rounded-lg lg:rounded-xl p-1 overflow-x-auto scrollbar-none">
        <div className="flex gap-1 w-max lg:w-auto">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 pt-1.5 pb-1 text-base md:text-lg lg:text-[1.325rem] lg:px-5 lg:pt-2 lg:pb-1 whitespace-nowrap rounded-md lg:rounded-lg transition-colors font-special-elite cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#715055] font-semibold text-white'
                  : 'font-medium text-[#FAF7F2] hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Category description + items — alle kategorier rendres, kun aktiv vises */}
      {categories.map(cat => {
        const catItems = items.filter(i => i.category_id === cat.id)
        const isActive = cat.id === activeCategory
        return (
          <div key={cat.id} className={isActive ? '' : 'hidden'}>
            {cat.description && (
              <p className="text-stone-500 text-sm md:text-base lg:text-lg mt-4 whitespace-pre-line text-center">
                {cat.description}
              </p>
            )}
            <div className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                {catItems.length === 0 ? (
                  <p className="py-12 text-center text-stone-400 text-sm italic col-span-full">
                    Ingen elementer i denne kategorien
                  </p>
                ) : (
                  catItems.map(item => (
                    <div key={item.id} className="flex gap-4 md:gap-5 p-4 md:p-5 bg-white rounded-2xl">
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className="relative w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-xl overflow-hidden bg-stone-100">
                          {item.image_url && (
                            <Image src={item.image_url} alt={item.name} fill sizes="(max-width: 768px) 96px, (max-width: 1024px) 112px, 128px" loading="eager" className="object-cover" />
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col justify-center">
                        <h3 className="font-semibold font-special-elite text-xl md:text-[22px] lg:text-2xl text-[#2E1608]">{item.name}</h3>
                        {item.description && (
                          <p className="text-xs md:text-sm lg:text-base text-stone-600 mt-1">{item.description}</p>
                        )}
                        {item.allergens && (
                          <p className="text-[10px] md:text-xs lg:text-sm text-stone-400 mt-1">Allergener: {item.allergens}</p>
                        )}
                        {item.price != null && (
                          <p className="font-semibold text-sm md:text-[15px] lg:text-base text-pink-500 mt-2">{item.price} kr</p>
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
