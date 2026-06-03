import { Link } from 'react-router-dom'
import imgBord from '../assets/booking/bord.png'
import imgCatering from '../assets/booking/catering.png'
import imgSelskap from '../assets/booking/selskap.png'

const cards = [
  { to: '/booking/bord-dagtid', title: 'Bordreservasjon', sub: 'Mandag – fredag', img: imgBord },
  { to: '/booking/catering', title: 'Catering', sub: 'Med eller uten levering', img: imgCatering },
  { to: '/booking/lukket-selskap', title: 'Lukket selskap', sub: 'Lei hele lokalet', img: imgSelskap },
]

export default function Booking() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-stone-900 mb-4">Booking</h1>
      <p className="text-stone-600 leading-relaxed">
        Her kan du reservere bord hos oss. Vi har åpent for reservasjon alle dager utenom helger. Du kan booke
        bord innenfor vanlig åpningstid, eller onsdag- og torsdagskveld. Vi tilbyr også catering med eller uten
        levering til selskap, som er perfekt til konfirmasjon eller bursdag. Det er også mulig å ha lukket selskap
        her i lokalet med mat fra oss.
      </p>

      <div className="grid grid-cols-3 gap-6 mt-12">
        {cards.map(({ to, title, sub, img }) => (
          <Link
            key={to}
            to={to}
            className="relative rounded-3xl overflow-hidden aspect-square group"
          >
            <img src={img} alt={title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="text-white font-bold text-xl leading-snug">{title}</h3>
              <p className="text-white/75 text-sm mt-1">{sub}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
