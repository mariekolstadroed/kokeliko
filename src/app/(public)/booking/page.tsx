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
    <div className="max-w-6xl mx-auto px-6 pt-14 pb-12">
      <h1 className="text-5xl font-bold font-special-elite text-[#2E1608] mb-3 text-center">Booking</h1>
      <div className="text-center flex flex-col gap-3 mt-6">
        <p className="text-stone-500 text-lg">
          Reserver bord hos oss! Vi tar imot bordreservasjoner i vanlig åpningstid på hverdager, samt onsdag og torsdag kveld.
          Grupper over 10 bes forhåndsbestille mat i skjemaet.<br />
          Vi tilbyr catering til konfirmasjon med f.eks. tapas, bursdag og andre selskap. Skriv ønskede retter og eventuelle
          tilpasninger i bookingen.<br />
          I tillegg kan du leie lokalet til lukket selskap med mat fra oss. Skriv ønsket mat i bookingen, så avtaler vi
          resten av arrangementet på mail.
        </p>
      </div>

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
            <div className="absolute inset-0 bg-black/35" />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <h3 className="text-white font-bold font-special-elite text-3xl leading-snug">{title}</h3>
              <p className="text-white/75 text-base mt-1">{sub}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
