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
          <Link
            href="/booking/bordreservasjon"
            className="inline-block px-8 py-4 bg-white text-[#3d1f08] text-sm font-semibold rounded-full hover:bg-[#f0e8d8] transition-colors"
          >
            Reserver bord
          </Link>
        </div>
        <div className="relative px-16 py-20">
          <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full overflow-hidden z-20">
            <Image src={kunst2} alt="" fill sizes="224px"className="object-cover" />
          </div>
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full overflow-hidden z-0">
            <Image src={kunst1} alt="" fill sizes="224px"className="object-cover" />
          </div>
          <div className="relative z-10 aspect-[3/4] overflow-hidden">
            {kveldImages.map((src, i) => (
              <div
                key={i}
                className="absolute inset-0 transition-opacity duration-500"
                style={{ opacity: i === kveldIdx ? 1 : 0 }}
              >
                <Image src={src} alt="" fill sizes="40vw"className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
