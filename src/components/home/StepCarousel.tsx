'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import type { GalleryItem } from '@/types/index'

const ITEM_W = 348
const ITEM_GAP = 20

export default function StepCarousel({ items }: { items: GalleryItem[] }) {
  const [step, setStep] = useState(0)
  const [noTransition, setNoTransition] = useState(false)

  const shouldLoop = items.length > 3

  useEffect(() => {
    if (!shouldLoop) return
    const id = setInterval(() => setStep(s => s + 1), 3000)
    return () => clearInterval(id)
  }, [shouldLoop])

  useEffect(() => {
    if (step < items.length) return
    const id = setTimeout(() => {
      setNoTransition(true)
      setStep(0)
    }, 650)
    return () => clearTimeout(id)
  }, [step, items.length])

  useEffect(() => {
    if (!noTransition) return
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setNoTransition(false)))
    return () => cancelAnimationFrame(id)
  }, [noTransition])

  return (
    <div className="overflow-hidden">
      <div
        className="flex"
        style={{
          gap: ITEM_GAP,
          transform: `translateX(-${step * (ITEM_W + ITEM_GAP)}px)`,
          transition: noTransition ? 'none' : 'transform 0.6s ease',
        }}
      >
        {(shouldLoop ? [...items, ...items] : items).map((item, i) => (
          <div key={i} className="shrink-0 w-[348px]">
            <div className="relative w-[348px] h-[348px] rounded-2xl overflow-hidden bg-stone-100">
              {item.image_url && (
                <Image src={item.image_url} alt={item.title ?? ''} fill sizes="348px" className="object-cover" priority={i === 0} />
              )}
            </div>
            {item.title && (
              <p className="mt-3 text-stone-700 text-base font-medium">{item.title}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
