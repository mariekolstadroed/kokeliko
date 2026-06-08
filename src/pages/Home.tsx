import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { GalleryItem, OpeningHour, SpecialHoursGroup, SpecialHour } from '../types'

const DAY_NAMES = ['', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag']

function formatTime(t: string | null) {
  if (!t) return ''
  return t.slice(0, 5)
}

function formatDate(d: string) {
  const date = new Date(d)
  return date.toLocaleDateString('nb-NO', { day: 'numeric', month: 'long' })
}

type SpecialGroupWithHours = SpecialHoursGroup & { hours: SpecialHour[] }

const ITEM_W = 256
const ITEM_GAP = 20

function StepCarousel({ items }: { items: GalleryItem[] }) {
  const [step, setStep] = useState(0)
  const [noTransition, setNoTransition] = useState(false)

  const shouldLoop = items.length > 4

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
          <div key={i} className="shrink-0 w-64">
            <div className="w-64 h-64 rounded-2xl overflow-hidden bg-stone-100">
              {item.image_url && (
                <img src={item.image_url} alt={item.title ?? ''} className="w-full h-full object-cover" />
              )}
            </div>
            {item.title && (
              <p className="mt-3 text-stone-700 text-sm font-medium">{item.title}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  const [regularHours, setRegularHours] = useState<OpeningHour[]>([])
  const [specialGroups, setSpecialGroups] = useState<SpecialGroupWithHours[]>([])
  const [gallery, setGallery] = useState<GalleryItem[]>([])

  useEffect(() => {
    async function fetchData() {
      const [{ data: regular }, { data: groups }, { data: special }, { data: galleryData }] = await Promise.all([
        supabase.from('opening_hours').select('*').order('day'),
        supabase.from('special_hours_groups').select('*').eq('published', true),
        supabase.from('special_hours').select('*').order('date'),
        supabase.from('gallery_items').select('*').eq('published', true).order('sort_order', { ascending: true, nullsFirst: false }),
      ])

      setRegularHours(regular ?? [])
      setGallery(galleryData ?? [])

      const grouped = (groups ?? []).map(g => ({
        ...g,
        hours: (special ?? []).filter(s => s.group_id === g.id),
      }))
      setSpecialGroups(grouped)
    }
    fetchData()
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-6">

      {/* Hero */}
      <div className="h-[70vh] rounded-3xl bg-stone-200 mt-6 mb-16" />

      {/* Opening hours */}
      <div className="flex justify-center gap-80 mb-16">

        {/* Regular hours */}
        <div>
          <h2 className="text-3xl font-bold text-stone-900 mb-7">Åpningstider</h2>
          <div className="flex flex-col gap-4">
            {regularHours.map(h => (
              <div key={h.id} className="flex gap-10 text-lg">
                <span className="text-stone-700 font-medium w-28 shrink-0">{DAY_NAMES[h.day]}</span>
                <span className="text-stone-500">
                  {h.closed ? 'Stengt' : `${formatTime(h.open_time)} – ${formatTime(h.close_time)}`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Special hours */}
        {specialGroups.length > 0 && (
          <div className="flex flex-col gap-4">
            {specialGroups.map(group => (
              <div
                key={group.id}
                className="border-4 rounded-2xl p-6 bg-white"
                style={{ borderColor: group.theme ?? '#e2d9cc' }}
              >
                <h3 className="text-lg font-bold text-stone-900 mb-4">{group.title}</h3>
                <div className="flex flex-col gap-3">
                  {group.hours.map(h => (
                    <div key={h.id} className="flex gap-8 text-base">
                      <span className="text-stone-700 font-medium w-36 shrink-0">
                        {h.description ?? formatDate(h.date)}
                      </span>
                      <span className="text-stone-500">
                        {h.closed ? 'Stengt' : `${formatTime(h.open_time)} – ${formatTime(h.close_time)}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Gallery carousels */}
      {(['bestselgere', 'nyheter'] as const).map(section => {
        const sectionItems = gallery.filter(i => i.section === section)
        if (sectionItems.length === 0) return null
        return (
          <div key={section} className="mb-16">
            <h2 className="text-3xl font-bold text-stone-900 mb-8">
              {section === 'bestselgere' ? 'Våre bestselgere' : 'Nyheter i hyllene'}
            </h2>
            <StepCarousel items={sectionItems} />
          </div>
        )
      })}

    </div>
  )
}
