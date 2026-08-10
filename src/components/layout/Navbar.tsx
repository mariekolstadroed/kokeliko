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
    <header className="sticky top-0 z-50 px-6 md:px-10 lg:px-6 pt-5 pb-2">
      <nav className="flex items-center justify-between bg-6/70 backdrop-blur-sm rounded-full px-8 py-4 shadow-md shadow-2/30 max-w-7xl mx-auto">
        <Link href="/" onClick={() => setIsOpen(false)}>
          <div className="logo logo--dark" style={{ height: '2.25rem' }} role="img" aria-label="Kokeliko" />
        </Link>

        <div className="hidden lg:flex items-center gap-20 translate-y-0.5">
          {links.map(({ to, label }) => {
            const isActive = pathname === to || pathname.startsWith(to + '/')
            return (
              <Link
                key={label}
                href={to}
                className={`text-1 text-[20px] font-special-elite relative after:absolute after:bottom-1 after:left-0 after:h-[1.5px] after:w-full after:bg-1 after:origin-left ${isActive ? 'after:scale-x-100 after:transition-transform after:duration-500' : 'after:scale-x-0 hover:opacity-60'}`}
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
          {isOpen ? <IconX size={28} /> : <IconMenu2 size={28} />}
        </button>
      </nav>

      {isOpen && (
        <div className="lg:hidden absolute top-full left-6 right-6 md:left-10 md:right-10 mt-0 flex justify-end max-w-7xl mx-auto">
          <div className="bg-6/70 backdrop-blur-sm rounded-2xl shadow-md shadow-2/30 px-10 py-6 flex flex-col items-center gap-6">
            {links.map(({ to, label }) => {
              const isActive = pathname === to || pathname.startsWith(to + '/')
              return (
                <Link
                  key={label}
                  href={to}
                  onClick={() => setIsOpen(false)}
                  className={`text-1 text-2xl font-special-elite relative after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-full after:bg-1 after:origin-left ${isActive ? 'after:scale-x-100' : 'after:scale-x-0'}`}
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
