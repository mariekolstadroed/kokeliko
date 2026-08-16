import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Booking – Kokeliko Kaffebar',
  description: 'Reserver bord, bestill catering eller lei hele lokalet til lukket selskap hos Kokeliko på Bærums Verk.',
}

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
