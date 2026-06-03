import { NavLink } from 'react-router-dom'
import logo from '../../assets/logo-svart.png'

const links = [
  { to: '/meny', label: 'Meny' },
  { to: '/booking', label: 'Booking' },
  { to: '/arrangementer', label: 'Arrangementer' },
  { to: '/om-oss', label: 'Om oss' },
]

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 px-6 pt-5 pb-2">
      <nav className="flex items-center justify-between bg-[#faf7f2]/80 backdrop-blur-sm rounded-full px-8 py-4 shadow-sm max-w-7xl mx-auto">
        <NavLink to="/">
          <img src={logo} alt="Kokeliko" className="h-9" />
        </NavLink>
        <div className="flex items-center gap-20">
          {links.map(({ to, label }) => (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) =>
                `text-[#3d1f08] text-base transition-opacity ${isActive ? 'font-semibold' : 'font-medium hover:opacity-60'}`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  )
}
