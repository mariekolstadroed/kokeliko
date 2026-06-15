'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import logo from '@/assets/logo-svart.png'

const links = [
  { to: '/meny', label: 'Meny' },
  { to: '/booking', label: 'Booking' },
  { to: '/arrangementer', label: 'Arrangementer' },
  { to: '/om-oss', label: 'Om oss' },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 px-6 pt-5 pb-2">
      <nav className="flex items-center justify-between bg-[#faf7f2]/80 backdrop-blur-sm rounded-full px-8 py-4 shadow-sm max-w-7xl mx-auto">
        <Link href="/">
          <Image src={logo} alt="Kokeliko" style={{ height: '2.25rem', width: 'auto' }} priority />
        </Link>
        <div className="flex items-center gap-20">
          {links.map(({ to, label }) => {
            const isActive = pathname === to || pathname.startsWith(to + '/')
            return (
              <Link
                key={label}
                href={to}
                className={`text-[#3d1f08] text-[20px] font-special-elite relative after:absolute after:bottom-1 after:left-0 after:h-[1.5px] after:w-full after:bg-[#3d1f08] after:origin-left ${isActive ? 'after:scale-x-100 after:transition-transform after:duration-500' : 'after:scale-x-0 hover:opacity-60'}`}
              >
                {label}
              </Link>
            )
          })}
        </div>
      </nav>
    </header>
  )
}
