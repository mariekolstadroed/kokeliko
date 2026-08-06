'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import kveld1 from '@/assets/kveld/kveld1.jpg'
import kveld2 from '@/assets/kveld/kveld2.jpg'
import kveld3 from '@/assets/kveld/kveld3.jpg'
import kunst1 from '@/assets/kveld/kunst1.jpg'
import kunst2 from '@/assets/kveld/kunst2.jpg'

const kveldImages = [kveld1, kveld2, kveld3]

export default function KveldSection() {
  const [kveldIdx, setKveldIdx] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setKveldIdx(i => (i + 1) % kveldImages.length), 3000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="bg-5">
      <div className="max-w-6xl mx-auto px-6 md:px-10 lg:px-6 w-full grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center pt-12 pb-16 md:py-16 lg:py-24">
        <div className="max-md:text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-special-elite text-3 leading-tight mb-6">
            Onsdag- og<br />torsdagskvelder<br />hos oss!
          </h2>
          <p className="text-4 leading-relaxed text-base lg:text-lg mb-10">
            Kom og nyt en koselig kveld med pizza, vin og gode venner. Vi har nemlig kveldsåpent
            helt til kl. 23 på onsdager og torsdager. Reserver bord til deg og din gjeng nå!
          </p>
          <Link
            href="/booking/bordreservasjon"
            className="inline-block px-6 pt-2 pb-1 lg:px-8 lg:pt-3 lg:pb-2 bg-1 text-4 text-base lg:text-lg font-special-elite rounded-full hover:brightness-125 transition-all"
          >
            Reserver bord
          </Link>
        </div>
        <div className="relative px-8 py-12 lg:px-16 lg:py-20">
          <div className="absolute max-md:-top-4 -top-6 max-md:right-0 -right-2 md:-top-2 md:right-0 lg:-top-10 lg:-right-10 w-32 h-32 lg:w-56 lg:h-56 rounded-full overflow-hidden z-20 opacity-80">
            <Image src={kunst2} alt="" fill sizes="224px" className="object-cover" />
          </div>
          <div className="absolute -bottom-4 lg:-bottom-10 left-1/2 -translate-x-1/2 w-32 h-32 lg:w-56 lg:h-56 rounded-full overflow-hidden z-0 opacity-80">
            <Image src={kunst1} alt="" fill sizes="224px" className="object-cover" />
          </div>
          <div className="relative z-10 aspect-square md:aspect-3/4 overflow-hidden rounded-3xl">
            {kveldImages.map((src, i) => (
              <div
                key={i}
                className="absolute inset-0 transition-opacity duration-500"
                style={{ opacity: i === kveldIdx ? 1 : 0 }}
              >
                <Image src={src} alt="" fill sizes="(max-width: 1024px) 80vw, 40vw" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
