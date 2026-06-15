import Image from 'next/image'
import { supabaseServer as supabase } from '@/lib/supabase-server'
import type { GalleryItem, OpeningHour, SpecialHour, SpecialHoursGroup } from '@/types/index'
import StepCarousel from '@/components/home/StepCarousel'
import KveldSection from '@/components/home/KveldSection'
import logoHvit from '@/assets/logo-hvit.png'
import kakaoImg from '@/assets/home/kakao.jpg'
import marsipanImg from '@/assets/home/marsipanboller.jpg'
import utendorsImg from '@/assets/home/utendors.jpg'

const DAY_NAMES = ['', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag']

function formatTime(t: string | null) {
  if (!t) return ''
  return t.slice(0, 5)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('nb-NO', { day: 'numeric', month: 'long' })
}

type SpecialGroupWithHours = SpecialHoursGroup & { hours: SpecialHour[] }

async function fetchHomeData() {
  const [{ data: regular }, { data: groups }, { data: special }, { data: galleryData }] =
    await Promise.all([
      supabase.from('opening_hours').select('*').order('day'),
      supabase.from('special_hours_groups').select('*').eq('published', true),
      supabase.from('special_hours').select('*').order('date'),
      supabase
        .from('gallery_items')
        .select('*')
        .eq('published', true)
        .order('sort_order', { ascending: true, nullsFirst: false }),
    ])
  return {
    regularHours: (regular ?? []) as OpeningHour[],
    gallery: (galleryData ?? []) as GalleryItem[],
    specialGroups: ((groups ?? []) as SpecialHoursGroup[]).map(g => ({
      ...g,
      hours: ((special ?? []) as SpecialHour[]).filter(s => s.group_id === g.id),
    })) as SpecialGroupWithHours[],
  }
}

export default async function Home() {
  const { regularHours, specialGroups, gallery } = await fetchHomeData()

  return (
    <>
      {/* Hero-bakgrunn */}
      <div className="bg-[#75482e] -mt-[120px] pt-[120px]">
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
            <image href={kakaoImg.src} x="145" y="190" width="620" height="620" clipPath="url(#leftBlobClip)" />
          </svg>
          {/* Mørkt filter */}
          <div className="absolute inset-0 -top-[120px] bg-black/20 z-[5]" />
          {/* Logo */}
          <div className="absolute inset-0 flex flex-col items-center justify-start pt-40 z-10 drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
            <Image src={logoHvit} alt="Kokeliko" style={{ width: '65vw', height: 'auto' }} />
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
            <image href={marsipanImg.src} x="100" y="150" width="650" height="650" clipPath="url(#rightBlobClip)" />
          </svg>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">

        {/* Opening hours */}
        <div className="flex justify-center gap-80 mb-24">

          {/* Regular hours */}
          <div>
            <h2 className="text-3xl font-bold font-special-elite text-[#2E1608] mb-7">Åpningstider</h2>
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
                  <h3 className="text-lg font-bold font-special-elite text-[#2E1608] mb-4">{group.title}</h3>
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
          <div className="mb-24">
            <h2 className="text-3xl font-bold font-special-elite text-[#2E1608] mb-8">Våre bestselgere</h2>
            <StepCarousel items={gallery.filter(i => i.section === 'bestselgere')} />
          </div>
        )}

      </div>

      {/* Onsdag og torsdagkvelder — full bredde */}
      <KveldSection />

      <div className="max-w-6xl mx-auto px-6">

        {/* Nyheter i hyllene */}
        {gallery.filter(i => i.section === 'nyheter').length > 0 && (
          <div className="mt-24 mb-24">
            <h2 className="text-3xl font-bold font-special-elite text-[#2E1608] mb-8">Nyheter i hyllene</h2>
            <StepCarousel items={gallery.filter(i => i.section === 'nyheter')} />
          </div>
        )}

      </div>

      {/* Kaffen vår */}
      <div className="max-w-6xl mx-auto px-6 mt-24 mb-24">
        <div className="grid grid-cols-2 gap-12 items-start">
          <div className="bg-stone-200 rounded-2xl aspect-[3/4] w-full" />
          <div>
            <h2 className="text-3xl font-bold font-special-elite text-[#2E1608] mb-6">Kaffen vår</h2>
            <p className="text-stone-600 leading-relaxed text-lg mb-6">
              Hos oss bruker vi de beste kaffebønnene fra Solberg Hansen! Espressoen vår heter Half & Half,
              som er en blanding mellom en lysbrent og mørkbrent espresso. Dette gir en perfekt balanse mellom
              både fruktighet fra den lysbrente og kraftighet fra den mørkbrente. Resultatet blir en rund og
              fyldig espresso, med smak av sjokolade, nøtter, mørke bær, perfekt til både latte og americano.
            </p>
            <p className="text-stone-600 leading-relaxed text-lg">
              Bønnene vi bruker til filterkaffen heter Barriero, som er en kaffebønnegård i Brasil.
              Der tørker de bønnene med fruktkjøttet på, noe som bidrar til en spesiell sødme og fyldighet,
              og helt særegne smaker av sjokolade, nøtter og rosin. Vi får stadig skryt for filterkaffen vår,
              og det er takket være disse bønnene.
            </p>
          </div>
        </div>
      </div>

      {/* Finn oss */}
      <div className="max-w-6xl mx-auto px-6 mt-24 mb-24">
        <h2 className="text-3xl font-bold font-special-elite text-[#2E1608] mb-8">Finn oss</h2>
        <div className="grid grid-cols-2 gap-6">
          <iframe
            src="https://maps.google.com/maps?q=Kokeliko Kaffebar,+Bærum&output=embed"
            className="w-full h-96 rounded-2xl border-0"
            loading="lazy"
            title="Kokeliko kart"
          />
          <div className="relative w-full h-96 rounded-2xl overflow-hidden">
            <Image src={utendorsImg} alt="Utenfor Kokeliko" fill sizes="50vw" className="object-cover" />
          </div>
        </div>
      </div>
    </>
  )
}
