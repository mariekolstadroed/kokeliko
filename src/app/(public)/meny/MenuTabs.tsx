'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { IconX, IconPhotoOff } from '@tabler/icons-react'
import type { Category, MenuItem } from '@/types/index'

const HYPHENATE_MIN_LENGTH = 15

function Hyphenated({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\s+|\/|-)/).map((token, i) => {
        if (token === '/' || token === '-') {
          return <span key={i}>{token}<wbr /></span>
        }
        return token.length >= HYPHENATE_MIN_LENGTH
          ? <span key={i} className="hyphens-auto wrap-break-word">{token}</span>
          : token
      })}
    </>
  )
}

function ImageModal({ item, onClose }: { item: MenuItem; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 bg-1/70 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div
        className="relative bg-4 rounded-2xl p-2 md:p-3 lg:p-4 w-4/5 max-w-xs md:max-w-md lg:max-w-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative w-full aspect-square rounded-xl overflow-hidden">
          <Image src={item.image_url!} alt={item.name} fill sizes="(max-width: 768px) calc(100vw - 80px), (max-width: 1024px) 416px, 480px" className="object-cover" />
          <button
            onClick={onClose}
            className="absolute top-2 right-2 z-10 p-2 rounded-full bg-4/80 hover:bg-4 text-1 transition-colors"
          >
            <IconX strokeWidth={2.5} className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MenuTabs({
  categories,
  items,
}: {
  categories: Category[]
  items: MenuItem[]
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(() => categories[0]?.id ?? null)
  const [lightboxItem, setLightboxItem] = useState<MenuItem | null>(null)

  return (
    <>
      {lightboxItem && <ImageModal item={lightboxItem} onClose={() => setLightboxItem(null)} />}
      <div className="mt-10 w-full lg:w-fit lg:max-w-full lg:mx-auto bg-4 rounded-lg lg:rounded-xl p-1 overflow-x-auto scrollbar-none">
        <div className="flex gap-1 w-max lg:w-auto">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 pt-1.5 pb-1 text-base md:text-lg lg:text-[1.325rem] lg:px-5 lg:pt-2 lg:pb-1 whitespace-nowrap rounded-md lg:rounded-lg transition-colors font-special-elite cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-5 text-4 shadow-sm shadow-1/30'
                  : 'text-1 hover:opacity-70'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {categories.map(cat => {
        const catItems = items.filter(i => i.category_id === cat.id)
        const isActive = cat.id === activeCategory
        return (
          <div key={cat.id} className={isActive ? '' : 'hidden'}>
            {cat.description && (
              <p className="text-2 text-sm md:text-base lg:text-lg mt-4 whitespace-pre-line text-center">
                {cat.description}
              </p>
            )}
            <div className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                {catItems.length === 0 ? (
                  <p className="py-12 text-center text-5 font-semibold text-sm md:text-base lg:text-lg italic col-span-full">
                    Ingen elementer i denne kategorien
                  </p>
                ) : (
                  catItems.map(item => (
                    <div key={item.id} className="flex gap-4 md:gap-5 p-4 md:p-5 bg-4 rounded-2xl shadow-sm shadow-1/30">
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <div
                          className={`relative w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-xl overflow-hidden bg-2 flex items-center justify-center ${item.image_url ? 'cursor-pointer' : ''}`}
                          onClick={() => item.image_url && setLightboxItem(item)}
                        >
                          {item.image_url ? (
                            <Image src={item.image_url} alt={item.name} fill sizes="(max-width: 768px) 96px, (max-width: 1024px) 112px, 128px" loading="eager" className="object-cover" />
                          ) : (
                            <IconPhotoOff className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 text-3" strokeWidth={1.5} aria-hidden />
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col justify-center min-w-0">
                        <h3 className="font-semibold font-special-elite text-xl md:text-[22px] lg:text-2xl text-1 wrap-break-word"><Hyphenated text={item.name} /></h3>
                        {item.description && (
                          <p className="text-xs md:text-sm lg:text-base text-2 mt-1 wrap-break-word"><Hyphenated text={item.description} /></p>
                        )}
                        {item.allergens && (
                          <p className="text-[10px] md:text-xs lg:text-sm text-2/80 mt-1">Allergener: {item.allergens}</p>
                        )}
                        {item.price != null && (
                          <p className="font-bold text-sm md:text-base lg:text-lg text-5 mt-2">{item.price} kr</p>
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
