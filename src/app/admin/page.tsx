'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import MenuSection from './menu/MenuSection'
import HoursSection from './hours/HoursSection'
import EventsSection from './events/EventsSection'
import GallerySection from './gallery/GallerySection'
import BookingsSection from './bookings/BookingsSection'
import { IconLogout, IconToolsKitchen2, IconClock, IconCalendarEvent, IconPhoto, IconCalendarCheck } from '@tabler/icons-react'

type Tab = 'menu' | 'hours' | 'events' | 'gallery' | 'bookings'

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'menu', label: 'Meny', icon: <IconToolsKitchen2 size={15} /> },
  { id: 'hours', label: 'Åpningstider', icon: <IconClock size={15} /> },
  { id: 'bookings', label: 'Bookinger', icon: <IconCalendarCheck size={15} /> },
  { id: 'events', label: 'Arrangementer', icon: <IconCalendarEvent size={15} /> },
  { id: 'gallery', label: 'Galleri', icon: <IconPhoto size={15} /> },
]

function Dashboard() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tab = (searchParams.get('tab') as Tab) ?? 'menu'
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null))
  }, [])

  function setTab(t: Tab) {
    router.replace(`/admin?tab=${t}`)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-12">
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 h-14 bg-white border-b border-stone-200">
        <button onClick={() => { setTab('menu'); window.scrollTo({ top: 0 }) }} className="flex items-center gap-2 cursor-pointer">
          <div className="logo logo--dark" style={{ height: '32px' }} role="img" aria-label="Kokeliko" />
          <span className="text-[25px] text-stone-400">admin</span>
        </button>
        <div className="flex items-center gap-2">
          {userEmail && (
            <span
              className="hidden sm:inline text-[11px] text-stone-400 no-detect"
              data-local={userEmail.split('@')[0]}
              data-domain={userEmail.split('@')[1]}
            />
          )}
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-md border border-stone-200 text-stone-500 hover:bg-stone-50 hover:text-stone-700 transition-colors"
          >
            <IconLogout size={14} aria-hidden /> Logg ut
          </button>
        </div>
      </header>

      <div className="flex px-6 bg-white border-b border-stone-200 overflow-x-auto overflow-y-hidden touch-pan-x scrollbar-none">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 md:px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
              tab === t.id
                ? 'text-stone-800 border-admin-accent'
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
      {tab === 'bookings' && <BookingsSection />}
    </div>
  )
}

export default function AdminPage() {
  return (
    <Suspense>
      <Dashboard />
    </Suspense>
  )
}
