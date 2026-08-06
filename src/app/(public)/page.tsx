import Image from 'next/image'
import { supabaseServer as supabase } from '@/lib/supabase-server'
import type { GalleryItem, OpeningHour, SpecialHour, SpecialHoursGroup } from '@/types/index'
import StepCarousel from '@/components/home/StepCarousel'
import KveldSection from '@/components/home/KveldSection'
import kakaoImg from '@/assets/home/kakao.jpg'
import marsipanImg from '@/assets/home/marsipanboller.jpg'
import elvegangenImg from '@/assets/home/elvegangen.jpg'
import kokelikoSirkel from '@/assets/home/kokeliko-sirkel.png'
import elinPaKaffeImg from '@/assets/kaffen/elin-pa-kaffe.jpg'
import barrieroImg from '@/assets/kaffen/barriero.png'
import halfAndHalfImg from '@/assets/kaffen/half-and-half.png'
import gavekortImg from '@/assets/home/gavekort.jpg'
import gaveposerImg from '@/assets/home/gaveposer.jpg'

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
      supabase.from('special_hours').select('*').order('date', { nullsFirst: false }),
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
      <div className="bg-1 -mt-30 pt-30 overflow-hidden">
        {/* Hero — fyller nøyaktig resten av viewport etter navbar */}
        <div className="relative h-[calc(100dvh-4.5rem)] md:h-[calc(100dvh-6rem)]">

          {/* === MOBIL (max-md): kakao øverst, marsipan nederst === */}
          <div className="md:hidden">
            <svg viewBox="0 60 1000 940" style={{ position: 'absolute', top: '-40%', left: 'calc(-0.35 * min(250vw, calc(119dvh - 4.5rem)))', width: 'min(250vw, calc(119dvh - 4.5rem))', height: 'min(250vw, calc(119dvh - 4.5rem))', transform: 'rotate(40deg)' }}>
              <defs>
                <clipPath id="blobM1">
                  <path d="M 500 200 C 550 160, 600 180, 620 240 C 640 300, 630 320, 600 330 C 570 340, 560 350, 580 360 C 620 380, 680 410, 700 450 C 720 490, 710 520, 680 530 C 650 540, 640 550, 660 570 C 680 590, 660 630, 630 660 C 600 690, 570 700, 550 680 C 530 660, 520 650, 500 670 C 480 690, 460 700, 430 680 C 400 660, 370 630, 350 590 C 330 550, 340 530, 370 520 C 400 510, 410 500, 390 480 C 370 460, 340 430, 320 390 C 300 350, 310 330, 340 320 C 370 310, 380 300, 360 290 C 340 280, 320 260, 340 240 C 360 220, 400 210, 440 220 C 480 230, 490 240, 470 250 C 450 260, 440 270, 460 280 C 480 290, 490 260, 500 230 Z" transform="rotate(-90 500 500)" />
                </clipPath>
              </defs>
              <image href={kakaoImg.src} x="145" y="190" width="620" height="620" clipPath="url(#blobM1)" />
              <rect x="0" y="0" width="1000" height="1000" clipPath="url(#blobM1)" fill="rgba(0,0,0,0.2)" />
            </svg>
            <svg viewBox="0 50 1000 950" style={{ position: 'absolute', bottom: '-32%', right: 'calc(-0.33 * min(250vw, calc(119dvh - 4.5rem)))', width: 'min(250vw, calc(119dvh - 4.5rem))', height: 'min(250vw, calc(119dvh - 4.5rem))', transform: 'rotate(25deg)' }}>
              <defs>
                <clipPath id="blobM2">
                  <path d="M 500 200 C 550 160, 600 180, 620 240 C 640 300, 630 320, 600 330 C 570 340, 560 350, 580 360 C 620 380, 680 410, 700 450 C 720 490, 710 520, 680 530 C 650 540, 640 550, 660 570 C 680 590, 660 630, 630 660 C 600 690, 570 700, 550 680 C 530 660, 520 650, 500 670 C 480 690, 460 700, 430 680 C 400 660, 370 630, 350 590 C 330 550, 340 530, 370 520 C 400 510, 410 500, 390 480 C 370 460, 340 430, 320 390 C 300 350, 310 330, 340 320 C 370 310, 380 300, 360 290 C 340 280, 320 260, 340 240 C 360 220, 400 210, 440 220 C 480 230, 490 240, 470 250 C 450 260, 440 270, 460 280 C 480 290, 490 260, 500 230 Z" transform="rotate(90 500 500)" />
                </clipPath>
              </defs>
              <image href={marsipanImg.src} x="100" y="150" width="650" height="650" clipPath="url(#blobM2)" />
              <rect x="0" y="0" width="1000" height="1000" clipPath="url(#blobM2)" fill="rgba(0,0,0,0.2)" />
            </svg>
          </div>

          {/* === IPAD (md til lg): kakao øvre venstre, marsipan nedre høyre === */}
          <div className="hidden md:block lg:hidden">
            <svg viewBox="0 60 1000 940" style={{ position: 'absolute', top: '-60%', left: 'calc(-0.298 * min(195vw, max(95vw, calc(161dvh - 9.7rem))))', width: 'min(195vw, max(95vw, calc(161dvh - 9.7rem)))', height: 'min(195vw, max(95vw, calc(161dvh - 9.7rem)))', transform: 'rotate(20deg)' }}>
              <defs>
                <clipPath id="blobT1">
                  <path d="M 500 200 C 550 160, 600 180, 620 240 C 640 300, 630 320, 600 330 C 570 340, 560 350, 580 360 C 620 380, 680 410, 700 450 C 720 490, 710 520, 680 530 C 650 540, 640 550, 660 570 C 680 590, 660 630, 630 660 C 600 690, 570 700, 550 680 C 530 660, 520 650, 500 670 C 480 690, 460 700, 430 680 C 400 660, 370 630, 350 590 C 330 550, 340 530, 370 520 C 400 510, 410 500, 390 480 C 370 460, 340 430, 320 390 C 300 350, 310 330, 340 320 C 370 310, 380 300, 360 290 C 340 280, 320 260, 340 240 C 360 220, 400 210, 440 220 C 480 230, 490 240, 470 250 C 450 260, 440 270, 460 280 C 480 290, 490 260, 500 230 Z" transform="rotate(-90 500 500)" />
                </clipPath>
              </defs>
              <image href={kakaoImg.src} x="145" y="190" width="620" height="620" clipPath="url(#blobT1)" />
              <rect x="0" y="0" width="1000" height="1000" clipPath="url(#blobT1)" fill="rgba(0,0,0,0.2)" />
            </svg>
            <svg viewBox="0 50 1000 950" style={{ position: 'absolute', bottom: '-60%', right: 'calc(-0.298 * min(195vw, max(95vw, calc(161dvh - 9.7rem))))', width: 'min(195vw, max(95vw, calc(161dvh - 9.7rem)))', height: 'min(195vw, max(95vw, calc(161dvh - 9.7rem)))', transform: 'rotate(20deg)' }}>
              <defs>
                <clipPath id="blobT2">
                  <path d="M 500 200 C 550 160, 600 180, 620 240 C 640 300, 630 320, 600 330 C 570 340, 560 350, 580 360 C 620 380, 680 410, 700 450 C 720 490, 710 520, 680 530 C 650 540, 640 550, 660 570 C 680 590, 660 630, 630 660 C 600 690, 570 700, 550 680 C 530 660, 520 650, 500 670 C 480 690, 460 700, 430 680 C 400 660, 370 630, 350 590 C 330 550, 340 530, 370 520 C 400 510, 410 500, 390 480 C 370 460, 340 430, 320 390 C 300 350, 310 330, 340 320 C 370 310, 380 300, 360 290 C 340 280, 320 260, 340 240 C 360 220, 400 210, 440 220 C 480 230, 490 240, 470 250 C 450 260, 440 270, 460 280 C 480 290, 490 260, 500 230 Z" transform="rotate(90 500 500)" />
                </clipPath>
              </defs>
              <image href={marsipanImg.src} x="100" y="150" width="650" height="650" clipPath="url(#blobT2)" />
              <rect x="0" y="0" width="1000" height="1000" clipPath="url(#blobT2)" fill="rgba(0,0,0,0.2)" />
            </svg>
          </div>

          {/* === DESKTOP (lg+): venstre / høyre === */}
          <div className="hidden lg:block">
            <svg viewBox="0 60 1000 940" style={{ position: 'absolute', top: 'calc(54% - 60vw)', left: '-40%', width: '120vw', height: '120vw', transform: 'rotate(20deg)' }}>
              <defs>
                <clipPath id="leftBlobClip">
                  <path d="M 500 200 C 550 160, 600 180, 620 240 C 640 300, 630 320, 600 330 C 570 340, 560 350, 580 360 C 620 380, 680 410, 700 450 C 720 490, 710 520, 680 530 C 650 540, 640 550, 660 570 C 680 590, 660 630, 630 660 C 600 690, 570 700, 550 680 C 530 660, 520 650, 500 670 C 480 690, 460 700, 430 680 C 400 660, 370 630, 350 590 C 330 550, 340 530, 370 520 C 400 510, 410 500, 390 480 C 370 460, 340 430, 320 390 C 300 350, 310 330, 340 320 C 370 310, 380 300, 360 290 C 340 280, 320 260, 340 240 C 360 220, 400 210, 440 220 C 480 230, 490 240, 470 250 C 450 260, 440 270, 460 280 C 480 290, 490 260, 500 230 Z" transform="rotate(-90 500 500)" />
                </clipPath>
              </defs>
              <image href={kakaoImg.src} x="145" y="190" width="620" height="620" clipPath="url(#leftBlobClip)" />
              <rect x="0" y="0" width="1000" height="1000" clipPath="url(#leftBlobClip)" fill="rgba(0,0,0,0.2)" />
            </svg>
            <svg viewBox="0 50 1000 950" style={{ position: 'absolute', top: 'calc(41% - 65vw)', right: '-45%', width: '130vw', height: '130vw', transform: 'rotate(-20deg)' }}>
              <defs>
                <clipPath id="rightBlobClip">
                  <path d="M 500 200 C 550 160, 600 180, 620 240 C 640 300, 630 320, 600 330 C 570 340, 560 350, 580 360 C 620 380, 680 410, 700 450 C 720 490, 710 520, 680 530 C 650 540, 640 550, 660 570 C 680 590, 660 630, 630 660 C 600 690, 570 700, 550 680 C 530 660, 520 650, 500 670 C 480 690, 460 700, 430 680 C 400 660, 370 630, 350 590 C 330 550, 340 530, 370 520 C 400 510, 410 500, 390 480 C 370 460, 340 430, 320 390 C 300 350, 310 330, 340 320 C 370 310, 380 300, 360 290 C 340 280, 320 260, 340 240 C 360 220, 400 210, 440 220 C 480 230, 490 240, 470 250 C 450 260, 440 270, 460 280 C 480 290, 490 260, 500 230 Z" transform="rotate(90 500 500)" />
                </clipPath>
              </defs>
              <image href={marsipanImg.src} x="100" y="150" width="650" height="650" clipPath="url(#rightBlobClip)" />
              <rect x="0" y="0" width="1000" height="1000" clipPath="url(#rightBlobClip)" fill="rgba(0,0,0,0.2)" />
            </svg>
          </div>

          {/* Logo — alltid vertikalt sentrert */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
            <div className="logo w-[90vw] md:w-[78vw] lg:w-[65vw]" role="img" aria-label="Kokeliko" />
            <p className="font-special-elite text-4 text-3xl md:text-5xl lg:text-6xl tracking-[0.3em] mt-3 md:mt-4">KAFFEBAR</p>
            <p className="font-special-elite text-4 text-base md:text-xl lg:text-2xl tracking-[0.2em] mt-1 md:mt-2">På Bærums Verk</p>
          </div>
        </div>
      </div>

      <div className="bg-4">
      <div className="max-w-6xl mx-auto px-6 md:px-10 lg:px-6 py-12 md:py-16">

        {/* Opening hours */}
        <div className="grid grid-cols-1 md:grid-cols-[auto_auto] md:justify-center lg:grid-cols-[1fr_auto] items-center gap-10 md:gap-16 lg:gap-16">

          {/* Regular hours */}
          <div className="lg:pl-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-special-elite text-5 mb-6 lg:mb-8 max-lg:text-center">Åpningstider</h2>
            <div className="max-lg:w-fit max-lg:mx-auto flex flex-col gap-4 lg:gap-5">
              {regularHours.map(h => (
                <div key={h.id} className="flex gap-8 lg:gap-10 text-base lg:text-xl">
                  <span className="text-2 font-medium w-28 lg:w-32 shrink-0">{DAY_NAMES[h.day]}</span>
                  <span className="text-2">
                    {h.closed ? 'Stengt' : `${formatTime(h.open_time)} – ${formatTime(h.close_time)}`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Special hours */}
          {specialGroups.length > 0 ? (
            <div className="flex flex-col gap-3 lg:gap-4 max-lg:w-fit max-lg:mx-auto lg:max-w-115 lg:pr-20">
              {specialGroups.map(group => (
                <div
                  key={group.id}
                  className="border-[2px] lg:border-[4px] rounded-2xl p-4 lg:p-6 backdrop-blur-sm shadow-lg"
                  style={{ borderColor: group.theme ?? '#D9C0A0', backgroundColor: `${group.theme ?? '#D9C0A0'}33` }}
                >
                  <h3 className="text-base lg:text-lg font-bold font-special-elite text-5 mb-2 lg:mb-4">{group.title}</h3>
                  <div className="flex flex-col gap-2 lg:gap-3">
                    {group.hours.map(h => (
                      <div key={h.id} className="flex gap-4 lg:gap-8 text-sm lg:text-base">
                        <span className="text-2 font-medium w-28 lg:w-36 shrink-0">
                          {h.description ?? (h.date ? formatDate(h.date) : '')}
                        </span>
                        <span className="text-2">
                          {h.closed ? 'Stengt' : `${formatTime(h.open_time)} – ${formatTime(h.close_time)}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="hidden md:block lg:pr-20">
              <div className="w-60 lg:w-100">
                <Image src={kokelikoSirkel} alt="" className="w-full h-auto" priority />
              </div>
            </div>
          )}

        </div>

      </div>
      </div>

      {/* Våre bestselgere */}
      {gallery.filter(i => i.section === 'bestselgere').length > 0 && (
        <div className="bg-2">
          <div className="max-w-6xl mx-auto px-6 md:px-10 lg:px-6 py-12 md:py-16 lg:py-24">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-special-elite text-4 mb-6 md:mb-8 text-center">Våre bestselgere</h2>
            <StepCarousel items={gallery.filter(i => i.section === 'bestselgere')} titleColorClass="text-4/90" containerBgClass="bg-2" />
          </div>
        </div>
      )}

      {/* Onsdag og torsdagkvelder — full bredde */}
      <KveldSection />

      {/* Kaffen vår */}
      <div className="relative">
        <Image src={elinPaKaffeImg} alt="" fill className="object-cover" />
        <div className="absolute inset-0 bg-1/70" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 lg:px-6 py-12 md:py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-16">
            {/* Overlapping circles */}
            <div className="order-2 lg:order-1 relative h-72 w-72 lg:h-120 lg:w-120 mx-auto shrink-0">
              <div className="absolute top-0 left-0 w-44 h-44 lg:w-75 lg:h-75 rounded-full overflow-hidden bg-3/80 shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
                <Image src={barrieroImg} alt="Barriero" fill sizes="(max-width: 1024px) 176px, 300px" className="object-contain p-6" />
              </div>
              <div className="absolute bottom-0 right-0 w-44 h-44 lg:w-75 lg:h-75 rounded-full overflow-hidden bg-3/80 shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
                <Image src={halfAndHalfImg} alt="Half & Half" fill sizes="(max-width: 1024px) 176px, 300px" className="object-contain p-6" />
              </div>
            </div>
            {/* Text */}
            <div className="order-1 lg:order-2 max-lg:text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-special-elite text-4 mb-6">Kaffen vår</h2>
              <p className="text-4/90 leading-relaxed text-base lg:text-lg mb-6">
                Hos oss bruker vi de beste kaffebønnene fra Solberg Hansen! Espressoen vår heter Half & Half,
                som er en blanding mellom en lysbrent og mørkbrent espresso. Dette gir en perfekt balanse mellom
                både fruktighet fra den lysbrente og kraftighet fra den mørkbrente. Resultatet blir en rund og
                fyldig espresso, med smak av sjokolade, nøtter, mørke bær, perfekt til både latte og americano.
              </p>
              <p className="text-4/90 leading-relaxed text-base lg:text-lg">
                Bønnene vi bruker til filterkaffen heter Barriero, som er en kaffebønnegård i Brasil.
                Der tørker de bønnene med fruktkjøttet på, noe som bidrar til en spesiell sødme og fyldighet,
                og helt særegne smaker av sjokolade, nøtter og rosin. Vi får stadig skryt for filterkaffen vår,
                og det er takket være disse bønnene.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Nyheter i hyllene */}
      {gallery.filter(i => i.section === 'nyheter').length > 0 && (
        <div className="bg-4">
          <div className="max-w-6xl mx-auto px-6 md:px-10 lg:px-6 py-12 md:py-16 lg:py-24">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-special-elite text-5 mb-6 md:mb-8 text-center">Nyheter i hyllene</h2>
            <StepCarousel items={gallery.filter(i => i.section === 'nyheter')} />
          </div>
        </div>
      )}

      {/* Gaver */}
      <div className="bg-3">
        <div className="max-w-6xl mx-auto px-6 md:px-10 lg:px-6 py-12 md:py-16 lg:py-24">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-special-elite text-1 mb-4 text-center">Gaver</h2>
          <p className="text-2 text-base lg:text-lg leading-relaxed mb-6 text-center">
            Vi kan lage personlige gaveposer med ting og tang fra hyllene, eller gavekort med ønsket beløp. Her er det bare å komme med ønsker.
            Dette er veldig populært som sommergave/julegave til lærere eller ansatte i bedrift. Send oss en mail,
            så fikser vi det du ønsker!
          </p>
          <div className="flex justify-center">
          <a
            href="mailto:elin@kokeliko.no"
            className="inline-block mb-12 px-6 pt-2 pb-1 lg:px-8 lg:pt-3 lg:pb-2 bg-5 text-4 font-special-elite text-base lg:text-lg rounded-full shadow-sm hover:brightness-95 transition-all"
          >
            Send oss dine ønsker
          </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <div className="relative rounded-2xl aspect-4/3 w-full overflow-hidden">
              <Image src={gavekortImg} alt="Gavekort" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            </div>
            <div className="relative rounded-2xl aspect-4/3 w-full overflow-hidden">
              <Image src={gaveposerImg} alt="Gaveposer" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            </div>
          </div>
        </div>
      </div>

      {/* Finn oss */}
      <div className="relative">
        <Image src={elvegangenImg} alt="" fill sizes="100vw" className="object-cover object-[center_20%]" loading="eager" />
        <div className="absolute inset-0 bg-1/70" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 lg:px-6 py-12 md:py-16 lg:py-25">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-10 md:gap-16">
            <div className="max-md:text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-special-elite text-4 mb-6">Finn oss</h2>
              <p className="text-4/90 leading-relaxed text-base lg:text-lg mb-4">
                Du finner oss i Elvegangen 9 på Bærums Verk, rett ovenfor Baker Hansen og ved siden av våre gode naboer
                i Verket Blomster.
              </p>
              <p className="text-4/90 leading-relaxed text-base lg:text-lg">
                Vi holder til i et koselig lokale med god plass både inne i varmen, og ute i solveggen,
                med utsikt til elva!
              </p>
            </div>
            <div className="w-72 h-72 lg:w-100 lg:h-100 rounded-full overflow-hidden shadow-2xl mx-auto">
              <iframe
                src="https://maps.google.com/maps?q=Kokeliko Kaffebar,+Bærum&output=embed"
                className="w-full h-full border-0"
                loading="lazy"
                title="Kokeliko kart"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
