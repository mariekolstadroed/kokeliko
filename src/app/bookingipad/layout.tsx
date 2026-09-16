import type { Metadata, Viewport } from 'next'
import BookingIpadAuthGuard from './BookingIpadAuthGuard'

export const metadata: Metadata = {
  title: 'Bookinger',
  manifest: '/manifest-bookingipad.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Booking',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#5A3826',
}

export default function BookingIpadLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <BookingIpadAuthGuard>{children}</BookingIpadAuthGuard>
}
