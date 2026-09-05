import type { Metadata, Viewport } from 'next'
import EventsGrid from './EventsGrid'

export const metadata: Metadata = {
  title: 'Arrangementer – Kokeliko Kaffebar',
  description: 'Se kommende arrangementer hos Kokeliko på Bærums Verk og meld deg på.',
  alternates: { canonical: '/arrangementer' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function Arrangementer() {
  return (
    <div className="bg-3 -mt-30 pt-30">
      <div className="min-h-[calc(100dvh-4.875rem)] md:min-h-[calc(100dvh-5.4375rem)] lg:min-h-[calc(100dvh-6rem)] max-w-6xl mx-auto px-6 pt-10 md:pt-12 lg:pt-14 pb-12">
        <div className="mb-8 md:mb-12 lg:mb-16 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-special-elite text-1 mb-3">Arrangementer</h1>
          <p className="text-2 text-base md:text-[17px] lg:text-lg mt-4 md:mt-6 lg:mt-8">Vi arrangerer diverse arrangementer her hos oss, som det går an å melde seg på! Ta med deg en venn og kom!</p>
        </div>
        <EventsGrid />
      </div>
    </div>
  )
}
