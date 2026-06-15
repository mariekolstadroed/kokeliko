import type { Metadata } from 'next'
import { Special_Elite } from 'next/font/google'
import './globals.css'

const specialElite = Special_Elite({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-special-elite',
})

export const metadata: Metadata = {
  title: 'Kokeliko',
  description: 'Kokeliko kaffebar',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="no" className={specialElite.variable}>
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  )
}
