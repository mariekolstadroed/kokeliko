import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Booking – Kokeliko Kaffebar',
  description: 'Reserver bord, bestill catering eller lei hele lokalet til lukket selskap hos Kokeliko på Bærums Verk.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
