import Image from 'next/image'
import Link from 'next/link'
import imgBord from '@/assets/booking/bord.jpg'
import imgCatering from '@/assets/booking/catering.jpg'
import imgSelskap from '@/assets/booking/selskap.jpg'

const cards = [
  { href: '/booking/bordreservasjon', title: 'Bordreservasjon', sub: 'Bord holdt av til deg i to timer', img: imgBord },
  { href: '/booking/catering', title: 'Catering', sub: 'Vi lager mat til ditt selskap', img: imgCatering },
  { href: '/booking/lukket-selskap', title: 'Lukket selskap', sub: 'Hele lokalet for deg selv', img: imgSelskap },
]

export default function Booking() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold font-special-elite text-[#2E1608] mb-4">Booking</h1>
      <p className="text-stone-600 leading-relaxed">
        Her kan du reservere bord hos oss. Vi har åpent for reservasjon alle dager utenom helger. Du kan booke
        bord innenfor vanlig åpningstid, eller onsdag- og torsdagskveld. Er dere over 10 stk så ønsker vi at dere
        forhåndsbestiller mat i skjemaet, så blir det lettest mulig for både oss og dere!
      </p>
      <p className="text-stone-600 leading-relaxed">
        Vi tilbyr også catering med eller uten levering til selskap, som er perfekt til konfirmasjon eller bursdag.
        Her er vi fleksible og kan få til det meste både på og utenfor menyen, men vi anbefaler spesielt tapas.
        Skriv inn i bookingen hvilke retter du ønsker, og eventuelle tilpasninger.
      </p>
      <p className="text-stone-600 leading-relaxed">
        Det er også mulig å ha lukket selskap her i lokalet med mat fra oss. Da skriver du også hva slags mat du ønsker,
        og så kommer vi sammen frem til hvordan vi arrangerer arrangementet på mail!
      </p>

      <div className="grid grid-cols-3 gap-6 mt-12">
        {cards.map(({ href, title, sub, img }) => (
          <Link
            key={href}
            href={href}
            className="relative rounded-3xl overflow-hidden aspect-square group"
          >
            <Image
              src={img}
              alt={title}
              fill
              sizes="33vw"
              placeholder="blur"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/50" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="text-white font-bold font-special-elite text-xl leading-snug">{title}</h3>
              <p className="text-white/75 text-sm mt-1">{sub}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
