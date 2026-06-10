import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../../assets/logo-svart.png'
import { supabase } from '../../lib/supabase'
import MenuSection from './menu/MenuSection'
import HoursSection from './hours/HoursSection'
import EventsSection from './events/EventsSection'
import GallerySection from './gallery/GallerySection'
import { IconLogout, IconToolsKitchen2, IconClock, IconCalendarEvent, IconPhoto } from '@tabler/icons-react'

type Tab = 'menu' | 'hours' | 'events' | 'gallery'

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'menu', label: 'Meny', icon: <IconToolsKitchen2 size={15} /> },
  { id: 'hours', label: 'Åpningstider', icon: <IconClock size={15} /> },
  { id: 'events', label: 'Arrangementer', icon: <IconCalendarEvent size={15} /> },
  { id: 'gallery', label: 'Galleri', icon: <IconPhoto size={15} /> },
]

export default function Dashboard() {
  const [tab, setTab] = useState<Tab>('menu')
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-12">
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 h-14 bg-white border-b border-stone-200">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Kokeliko" className="h-8" />
          <span className="text-[25px] text-stone-400">admin</span>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-md border border-stone-200 text-stone-500 hover:bg-stone-50 hover:text-stone-700 transition-colors"
        >
          <IconLogout size={14} aria-hidden /> Logg ut
        </button>
      </header>

      <div className="flex px-6 bg-white border-b border-stone-200">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id
                ? 'text-stone-800 border-pink-500'
                : 'text-stone-400 border-transparent hover:text-stone-600'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'menu' && <MenuSection />}
      {tab === 'hours' && <HoursSection />}
      {tab === 'events' && <EventsSection />}
      {tab === 'gallery' && <GallerySection />}
    </div>
  )
}
