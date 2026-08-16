import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const specialElite = localFont({
  src: [
    { path: '../assets/fonts/SpecialElite-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../assets/fonts/SpecialElite-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-special-elite',
})

const TITLE = 'Kokeliko Kaffebar'
const DESCRIPTION = 'Koselig kafé på Bærums Verk med god kaffe, smørbrød, salater, pizza, kaker og KokelikoBolla. Reserver bord her! Tilbyr også catering/lukket selskap.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  metadataBase: new URL('https://kokeliko.no'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://kokeliko.no',
    siteName: TITLE,
    type: 'website',
    locale: 'nb_NO',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="no" className={specialElite.variable}>
      <body className="min-h-dvh">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
