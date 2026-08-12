'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { IconMenu2, IconX } from '@tabler/icons-react'

const links = [
  { to: '/meny', label: 'Meny' },
  { to: '/booking', label: 'Booking' },
  { to: '/arrangementer', label: 'Arrangementer' },
  { to: '/om-oss', label: 'Om oss' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 px-6 md:px-10 lg:px-6 pt-3 pb-1.5 md:pt-4 md:pb-1.5 lg:pt-5 lg:pb-2">
      <nav className="flex items-center justify-between bg-6/70 backdrop-blur-sm rounded-full px-5 py-2.5 md:px-6 md:py-3 lg:px-8 lg:py-4 shadow-md shadow-2/30 max-w-7xl mx-auto">
        <Link href="/" onClick={() => setIsOpen(false)}>
          <div className="logo logo--dark h-7 md:h-8 lg:h-9" role="img" aria-label="Kokeliko" />
        </Link>

        <div className="hidden lg:flex items-center gap-20 translate-y-0.5">
          {links.map(({ to, label }) => {
            const isActive = pathname === to || pathname.startsWith(to + '/')
            return (
              <Link
                key={label}
                href={to}
                className={`text-1 text-[22px] font-special-elite relative after:absolute after:bottom-1 after:left-0 after:h-[1.5px] after:w-full after:bg-1 after:origin-left ${isActive ? 'after:scale-x-100 after:transition-transform after:duration-500' : 'after:scale-x-0 hover:opacity-60'}`}
              >
                {label}
              </Link>
            )
          })}
        </div>

        <button
          className="lg:hidden text-1 p-1"
          onClick={() => setIsOpen(o => !o)}
          aria-label={isOpen ? 'Lukk meny' : 'Åpne meny'}
        >
          {isOpen ? <IconX className="w-5 h-5 md:w-6 md:h-6" /> : <IconMenu2 className="w-5 h-5 md:w-6 md:h-6" />}
        </button>
      </nav>

      {isOpen && (
        <div className="lg:hidden absolute top-full left-6 right-6 md:left-10 md:right-10 mt-0 flex justify-end max-w-7xl mx-auto">
          <div className="bg-6/70 backdrop-blur-sm rounded-2xl shadow-md shadow-2/30 px-7 py-4 md:px-10 md:py-6 flex flex-col items-center gap-4 md:gap-6">
            {links.map(({ to, label }) => {
              const isActive = pathname === to || pathname.startsWith(to + '/')
              return (
                <Link
                  key={label}
                  href={to}
                  onClick={() => setIsOpen(false)}
                  className={`text-1 text-xl md:text-2xl font-special-elite relative after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-full after:bg-1 after:origin-left ${isActive ? 'after:scale-x-100' : 'after:scale-x-0'}`}
                >
                  {label}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </header>
  )
}
