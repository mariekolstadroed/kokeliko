import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { GalleryItem, OpeningHour, SpecialHoursGroup, SpecialHour } from '../types'
import logoHvit from '../assets/logo-hvit.png'
import kakaoImg from '../assets/home/kakao.jpg'
import marsipanImg from '../assets/home/marsipanboller.png'
import kveld1 from '../assets/kveld/kveld1.jpg'
import kveld2 from '../assets/kveld/kveld2.jpg'
import kveld3 from '../assets/kveld/kveld3.jpg'
import kunst1 from '../assets/kveld/kunst1.jpg'
import kunst2 from '../assets/kveld/kunst2.jpg'

const kveldImages = [kveld1, kveld2, kveld3]

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
  const [kveldIdx, setKveldIdx] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setKveldIdx(i => (i + 1) % kveldImages.length), 3000)
    return () => clearInterval(id)
  }, [])

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
    <>
    {/* Hero-bakgrunn */}
    <div className="bg-[#75482e] -mt-24 pt-24">
    {/* Hero */}
    <div className="relative mb-16" style={{ height: '50vw' }}>
      {/* Venstre blob — kakao */}
      <svg
        viewBox="0 60 1000 940"
        style={{ position: 'absolute', top: '-62%', left: '-40%', width: '120vw', height: '120vw', transform: 'rotate(20deg)' }}
      >
        <defs>
          <clipPath id="leftBlobClip">
            <path
              d="M 500 200 C 550 160, 600 180, 620 240 C 640 300, 630 320, 600 330 C 570 340, 560 350, 580 360 C 620 380, 680 410, 700 450 C 720 490, 710 520, 680 530 C 650 540, 640 550, 660 570 C 680 590, 660 630, 630 660 C 600 690, 570 700, 550 680 C 530 660, 520 650, 500 670 C 480 690, 460 700, 430 680 C 400 660, 370 630, 350 590 C 330 550, 340 530, 370 520 C 400 510, 410 500, 390 480 C 370 460, 340 430, 320 390 C 300 350, 310 330, 340 320 C 370 310, 380 300, 360 290 C 340 280, 320 260, 340 240 C 360 220, 400 210, 440 220 C 480 230, 490 240, 470 250 C 450 260, 440 270, 460 280 C 480 290, 490 260, 500 230 Z"
              transform="rotate(-90 500 500)"
            />
          </clipPath>
        </defs>
        <image href={kakaoImg} x="145" y="190" width="620" height="620" clipPath="url(#leftBlobClip)" />
      </svg>
      {/* Mørkt filter */}
      <div className="absolute inset-0 -top-24 bg-black/20 z-[5]" />
      {/* Logo */}
      <div className="absolute inset-0 flex flex-col items-center justify-start pt-40 z-10 drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
        <img src={logoHvit} alt="Kokeliko" className="w-[65vw]" />
        <p className="font-special-elite text-white text-6xl tracking-[0.3em] mt-4">KAFFEBAR</p>
        <p className="font-special-elite text-white text-2xl tracking-[0.2em] mt-2">På Bærums verk</p>
      </div>
      {/* Høyre blob — marsipanboller */}
      <svg
        viewBox="0 50 1000 950"
        style={{ position: 'absolute', top: '-82%', right: '-45%', width: '130vw', height: '130vw', transform: 'rotate(-20deg)' }}
      >
        <defs>
          <clipPath id="rightBlobClip">
            <path
              d="M 500 200 C 550 160, 600 180, 620 240 C 640 300, 630 320, 600 330 C 570 340, 560 350, 580 360 C 620 380, 680 410, 700 450 C 720 490, 710 520, 680 530 C 650 540, 640 550, 660 570 C 680 590, 660 630, 630 660 C 600 690, 570 700, 550 680 C 530 660, 520 650, 500 670 C 480 690, 460 700, 430 680 C 400 660, 370 630, 350 590 C 330 550, 340 530, 370 520 C 400 510, 410 500, 390 480 C 370 460, 340 430, 320 390 C 300 350, 310 330, 340 320 C 370 310, 380 300, 360 290 C 340 280, 320 260, 340 240 C 360 220, 400 210, 440 220 C 480 230, 490 240, 470 250 C 450 260, 440 270, 460 280 C 480 290, 490 260, 500 230 Z"
              transform="rotate(90 500 500)"
            />
          </clipPath>
        </defs>
        <image href={marsipanImg} x="100" y="150" width="650" height="650" clipPath="url(#rightBlobClip)" />
      </svg>
    </div>
    </div>

    <div className="max-w-6xl mx-auto px-6">

      {/* Opening hours */}
      <div className="flex justify-center gap-80 mb-16">

        {/* Regular hours */}
        <div>
          <h2 className="text-3xl font-bold font-special-elite text-stone-900 mb-7">Åpningstider</h2>
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
                <h3 className="text-lg font-bold font-special-elite text-stone-900 mb-4">{group.title}</h3>
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

      {/* Våre bestselgere */}
      {gallery.filter(i => i.section === 'bestselgere').length > 0 && (
        <div className="mb-16">
          <h2 className="text-3xl font-bold font-special-elite text-stone-900 mb-8">Våre bestselgere</h2>
          <StepCarousel items={gallery.filter(i => i.section === 'bestselgere')} />
        </div>
      )}

    </div>

    {/* Onsdag og torsdagkvelder — full bredde */}
    <div className="min-h-screen bg-[#543a3e] flex items-center">
      <div className="max-w-6xl mx-auto px-6 w-full grid grid-cols-2 gap-16 items-center py-24">
        <div>
          <h2 className="text-5xl font-bold font-special-elite text-[#FBAF75] leading-tight mb-6">
            Onsdag- og<br />torsdagskvelder<br />hos oss!
          </h2>
          <p className="text-[#f0e8d8]/80 leading-relaxed text-lg mb-10">
            Kom og nyt en koselig kveld med pizza, vin og gode venner. Vi har nemlig kveldsåpent
            helt til kl. 23 på onsdager og torsdager. Reserver bord til deg og din gjeng nå!
          </p>
          <a
            href="/booking/bordreservasjon"
            className="inline-block px-8 py-4 bg-white text-[#3d1f08] text-sm font-semibold rounded-full hover:bg-[#f0e8d8] transition-colors"
          >
            Reserver bord
          </a>
        </div>
        <div className="relative px-16 py-20">
          <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full overflow-hidden z-20">
            <img src={kunst2} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full overflow-hidden z-0">
            <img src={kunst1} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-10 aspect-[3/4] overflow-hidden">
            {kveldImages.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
                style={{ opacity: i === kveldIdx ? 1 : 0 }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>

    <div className="max-w-6xl mx-auto px-6">

      {/* Nyheter i hyllene */}
      {gallery.filter(i => i.section === 'nyheter').length > 0 && (
        <div className="mt-16 mb-16">
          <h2 className="text-3xl font-bold font-special-elite text-stone-900 mb-8">Nyheter i hyllene</h2>
          <StepCarousel items={gallery.filter(i => i.section === 'nyheter')} />
        </div>
      )}

    </div>
    </>
  )
}
