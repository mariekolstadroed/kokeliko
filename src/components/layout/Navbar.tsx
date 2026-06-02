import { NavLink } from 'react-router-dom'
import logo from '../../assets/logo-svart.png'

const links = [
  { to: '/meny', label: 'Meny' },
  { to: '/arrangementer', label: 'Arrangementer' },
  { to: '/om-oss', label: 'Om oss' },
  { to: '/booking', label: 'Book bord' },
]

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 px-6 pt-4 pb-2 bg-[#f0e8d8]">
      <nav className="flex items-center justify-between bg-[#f7f1e6] rounded-full px-6 py-2.5 shadow-sm max-w-5xl mx-auto">
        <NavLink to="/">
          <img src={logo} alt="Kokeliko" className="h-9" />
        </NavLink>
        <div className="flex items-center gap-7">
          {links.map(({ to, label }) => (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) =>
                `text-[#3d1f08] text-sm transition-opacity ${isActive ? 'font-semibold' : 'font-medium hover:opacity-60'}`
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
