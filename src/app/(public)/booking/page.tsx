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
    <div className="bg-2 -mt-30 pt-30">
      <div className="min-h-[calc(100dvh-4.5rem)] md:min-h-[calc(100dvh-6rem)] max-w-6xl mx-auto px-6 md:px-10 lg:px-6 pt-10 md:pt-12 lg:pt-14 pb-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-special-elite text-4 mb-3 text-center">Booking</h1>
        <div className="text-center flex flex-col gap-3 mt-4 md:mt-6 lg:mt-8">
          <p className="text-3 text-base md:text-[17px] lg:text-lg">
            Reserver bord hos oss! Vi tar imot bordreservasjoner i vanlig åpningstid på hverdager, samt torsdag kveld.
            Grupper over 10 bes forhåndsbestille mat i skjemaet.<br />
            Vi tilbyr catering til konfirmasjon med f.eks. tapas, bursdag og andre selskap. Skriv ønskede retter og eventuelle
            tilpasninger i bookingen.<br />
            I tillegg kan du leie lokalet til lukket selskap med mat fra oss. Skriv ønsket mat i bookingen, så avtaler vi
            resten av arrangementet på mail.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 md:mt-12 lg:mt-16 px-10 md:px-10 lg:px-0">
          {cards.map(({ href, title, sub, img }, i) => (
            <Link
              key={href}
              href={href}
              className={`relative rounded-3xl overflow-hidden shadow-md shadow-1/30 group max-w-sm mx-auto w-full md:max-w-none
                ${i === 0
                  ? 'aspect-square md:col-span-2 md:aspect-3/1 lg:col-span-1 lg:aspect-square'
                  : 'aspect-square'
                }`}
            >
              <Image
                src={img}
                alt={title}
                fill
                sizes={i === 0
                  ? '(max-width: 768px) 80vw, (max-width: 1024px) 100vw, 33vw'
                  : '(max-width: 768px) 80vw, (max-width: 1024px) 50vw, 33vw'
                }
                placeholder="blur"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-1/60 mix-blend-multiply" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <h3 className="text-4 font-semibold font-special-elite text-2xl md:text-3xl leading-snug">{title}</h3>
                <p className="text-4 text-sm md:text-base mt-1">{sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
