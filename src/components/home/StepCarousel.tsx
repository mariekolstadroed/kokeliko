'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type { GalleryItem } from '@/types/index'

const ITEM_GAP = 20

export default function StepCarousel({ items }: { items: GalleryItem[] }) {
  const [step, setStep] = useState(0)
  const [noTransition, setNoTransition] = useState(false)
  const [fadeIdx, setFadeIdx] = useState(0)
  const [itemW, setItemW] = useState(348)
  const containerRef = useRef<HTMLDivElement>(null)

  const shouldLoop = items.length > 3

  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return
      const w = containerRef.current.offsetWidth
      const count = window.innerWidth >= 1024 ? 3 : 2
      setItemW((w - (count - 1) * ITEM_GAP) / count)
    }
    const ro = new ResizeObserver(update)
    if (containerRef.current) ro.observe(containerRef.current)
    update()
    return () => ro.disconnect()
  }, [])

  // Desktop: sliding
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

  // Mobile: fade
  useEffect(() => {
    const id = setInterval(() => setFadeIdx(i => (i + 1) % items.length), 3000)
    return () => clearInterval(id)
  }, [items.length])

  if (items.length === 0) return null

  return (
    <>
      {/* Mobil: fade */}
      <div className="md:hidden">
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-stone-100">
          {items.map((item, i) => (
            <div
              key={i}
              className="absolute inset-0 transition-opacity duration-500"
              style={{ opacity: i === fadeIdx ? 1 : 0 }}
            >
              {item.image_url && (
                <Image src={item.image_url} alt={item.title ?? ''} fill sizes="calc(100vw - 48px)" className="object-cover" priority={i === 0} />
              )}
            </div>
          ))}
        </div>
        {items[fadeIdx]?.title && (
          <p className="mt-3 text-stone-700 text-lg font-medium text-center">{items[fadeIdx].title}</p>
        )}
      </div>

      {/* iPad + desktop: sliding */}
      <div ref={containerRef} className="hidden md:block overflow-hidden">
        <div
          className="flex"
          style={{
            gap: ITEM_GAP,
            transform: `translateX(-${step * (itemW + ITEM_GAP)}px)`,
            transition: noTransition ? 'none' : 'transform 0.6s ease',
          }}
        >
          {(shouldLoop ? [...items, ...items] : items).map((item, i) => (
            <div key={i} className="shrink-0" style={{ width: itemW }}>
              <div className="relative rounded-2xl overflow-hidden bg-stone-100" style={{ width: itemW, height: itemW }}>
                {item.image_url && (
                  <Image src={item.image_url} alt={item.title ?? ''} fill sizes="(max-width: 1024px) 50vw, 33vw" className="object-cover" priority={i === 0} />
                )}
              </div>
              {item.title && (
                <p className="mt-3 text-stone-700 text-lg font-medium text-center">{item.title}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
