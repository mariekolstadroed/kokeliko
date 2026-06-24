import EventsGrid from './EventsGrid'

export default function Arrangementer() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="mb-12">
        <h1 className="text-4xl font-bold font-special-elite text-[#2E1608] mb-3">Arrangementer</h1>
        <p className="text-stone-500 text-lg">Vi arrangerer diverse arrangementer her hos oss, som det går an å melde seg på! Ta med deg en venn og kom!</p>
      </div>
      <EventsGrid />
    </div>
  )
}
