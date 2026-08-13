import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'

const specialElite = localFont({
  src: [
    { path: '../assets/fonts/SpecialElite-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../assets/fonts/SpecialElite-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-special-elite',
})

const TITLE = 'Kokeliko Kaffebar'
const DESCRIPTION = 'Koselig kafé på Bærums Verk med kjempegod kaffe, smørbrød, salater, pizza, kaker og KokelikoBolla. Bestill bord her! Vi tilbyr også catering og lukket selskap.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  metadataBase: new URL('https://kokeliko.no'),
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
      </body>
    </html>
  )
}
