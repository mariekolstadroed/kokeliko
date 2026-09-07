'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toLocalISODate } from '@/lib/date'
import type { Booking } from '@/types'
import { IconLogout, IconUsers, IconPhone, IconMail, IconChevronDown, IconChevronUp, IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'

const TYPE_LABELS: Record<Booking['type'], string> = {
  bordreservasjon: 'Bordreservasjon',
  catering: 'Catering',
  lukket_selskap: 'Lukket selskap',
}

const TYPE_COLORS: Record<Booking['type'], string> = {
  bordreservasjon: 'bg-pink-200/90 text-pink-800',
  catering: 'bg-green-200/90 text-green-800',
  lukket_selskap: 'bg-blue-200/90 text-blue-800',
}

const UNCONFIRMED_COLOR = 'bg-stone-300/90 text-1/90'

function bookingColor(b: Booking): string {
  return b.status === 'ikke_bekreftet' ? UNCONFIRMED_COLOR : TYPE_COLORS[b.type]
}

function bookingLabel(b: Booking): string {
  return TYPE_LABELS[b.type] + (b.status === 'ikke_bekreftet' ? ' - ikke bekreftet' : '')
}

const RELOAD_INTERVAL_MS = 10 * 60 * 1000

type View = 'dag' | 'uke' | 'maned'

function getWeekRange(base: Date) {
  const day = base.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day
  const monday = new Date(base)
  monday.setDate(base.getDate() + diffToMonday)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return { start: toLocalISODate(monday), end: toLocalISODate(sunday) }
}

function getMonthRange(base: Date) {
  const start = new Date(base.getFullYear(), base.getMonth(), 1)
  const end = new Date(base.getFullYear(), base.getMonth() + 1, 0)
  return { start: toLocalISODate(start), end: toLocalISODate(end) }
}

function getISOWeekNumber(base: Date): number {
  const d = new Date(Date.UTC(base.getFullYear(), base.getMonth(), base.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = Date.UTC(d.getUTCFullYear(), 0, 1)
  return Math.ceil(((d.getTime() - yearStart) / 86400000 + 1) / 7)
}

function getMonthCalendarDays(year: number, month: number): string[] {
  const firstWeekday = new Date(year, month, 1).getDay()
  const leadingEmpty = firstWeekday === 0 ? 6 : firstWeekday - 1
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const days: string[] = Array(leadingEmpty).fill('')
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(toLocalISODate(new Date(year, month, d)))
  }
  while (days.length % 7 !== 0) days.push('')
  return days
}

function formatDateLong(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long' })
}

function formatDateShort(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('nb-NO', { weekday: 'short', day: 'numeric', month: 'short' })
}

function formatTime(t: string) {
  return t.slice(0, 5)
}

function BookingRow({ b, expandable = false }: { b: Booking; expandable?: boolean }) {
  const [expanded, setExpanded] = useState(!expandable)

  return (
    <div className="bg-6/95 border border-1/15 rounded-xl shadow-sm p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xl font-semibold text-1">{formatTime(b.start_time)}{b.end_time ? ` – ${formatTime(b.end_time)}` : ''}</span>
        <span className={`px-2.5 py-1 rounded-full text-sm font-semibold ${bookingColor(b)}`}>
          {bookingLabel(b)}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-lg font-medium text-1/90">{b.name}</span>
        {b.party_size != null && (
          <span className="flex items-center gap-1.5 text-lg text-1/75">
            <IconUsers size={18} /> {b.party_size}
          </span>
        )}
      </div>
      {expanded && (
        <>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-1/60">
            {b.phone && <span className="flex items-center gap-1"><IconPhone size={14} /> {b.phone}</span>}
            {b.email && <span className="flex items-center gap-1"><IconMail size={14} /> {b.email}</span>}
          </div>
          {(b.requested_food || b.message || b.event_type || b.delivery_method) && (
            <div className="text-sm text-1/75 border-t border-1/8 pt-2 flex flex-col gap-2 whitespace-pre-line">
              {b.event_type && <div><span className="font-semibold">Type:</span> {b.event_type}</div>}
              {b.delivery_method && <div>{b.delivery_method}{b.address ? ` – ${b.address}` : ''}</div>}
              {b.requested_food && <div><span className="font-semibold">Ønsket mat:</span><br />{b.requested_food}</div>}
              {b.message && <div><span className="font-semibold">Melding:</span><br />{b.message}</div>}
            </div>
          )}
        </>
      )}
      {expandable && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center justify-center gap-1 pt-1 text-sm font-medium text-1/60 transition-colors"
        >
          {expanded ? 'Vis mindre' : 'Vis mer'} {expanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
        </button>
      )}
    </div>
  )
}

export default function BookingIpad() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<View>('dag')
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const router = useRouter()
  const fetchIdRef = useRef(0)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null))
  }, [])

  const now = new Date()
  const today = toLocalISODate(now)
  const [selectedDate, setSelectedDate] = useState(today)
  const selectedDateObj = new Date(selectedDate + 'T00:00:00')
  const { start: weekStart, end: weekEnd } = getWeekRange(selectedDateObj)
  const { start: monthStart, end: monthEnd } = getMonthRange(selectedDateObj)
  const monthCalendarDays = getMonthCalendarDays(selectedDateObj.getFullYear(), selectedDateObj.getMonth())
  const fetchStart = weekStart < monthStart ? weekStart : monthStart
  const fetchEnd = weekEnd > monthEnd ? weekEnd : monthEnd

  function setViewAndPersist(v: View) {
    setView(v)
    window.localStorage.setItem('bookingipad-view', v)
  }

  function goToDay(date: string) {
    setSelectedDate(date)
    setViewAndPersist('dag')
  }

  function goToPrevious() {
    const d = new Date(selectedDateObj)
    if (view === 'dag') d.setDate(d.getDate() - 1)
    else if (view === 'uke') d.setDate(d.getDate() - 7)
    else d.setMonth(d.getMonth() - 1, 1)
    setSelectedDate(toLocalISODate(d))
  }

  function goToNext() {
    const d = new Date(selectedDateObj)
    if (view === 'dag') d.setDate(d.getDate() + 1)
    else if (view === 'uke') d.setDate(d.getDate() + 7)
    else d.setMonth(d.getMonth() + 1, 1)
    setSelectedDate(toLocalISODate(d))
  }

  useEffect(() => {
    const stored = window.localStorage.getItem('bookingipad-view')
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored === 'dag' || stored === 'uke' || stored === 'maned') setView(stored)
  }, [])

  const fetchBookings = useCallback(async () => {
    const requestId = ++fetchIdRef.current
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('visible_on_ipad', true)
      .gte('date', fetchStart)
      .lte('date', fetchEnd)
      .order('date')
      .order('start_time')
    if (fetchIdRef.current !== requestId) return
    setBookings(data ?? [])
    setLoading(false)
  }, [fetchStart, fetchEnd])

  useEffect(() => { fetchBookings() }, [selectedDate, view, fetchBookings])

  useEffect(() => {
    const interval = setInterval(() => window.location.reload(), RELOAD_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') fetchBookings()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [fetchBookings])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/bookingipad/login')
  }

  const byDate: Record<string, Booking[]> = {}
  for (const b of bookings) {
    (byDate[b.date] ??= []).push(b)
  }

  const weekDays: string[] = []
  for (let d = new Date(weekStart + 'T00:00:00'); toLocalISODate(d) <= weekEnd; d.setDate(d.getDate() + 1)) {
    weekDays.push(toLocalISODate(d))
  }

  return (
    <div className="h-screen overflow-hidden bg-[linear-gradient(rgba(255,255,255,0.25),rgba(255,255,255,0.25)),url('/ipad-background.jpg')] bg-cover bg-center flex flex-col pb-[env(safe-area-inset-bottom)]">
      <header className="shrink-0 grid grid-cols-3 items-center px-6 h-[calc(4rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)]">
        <button onClick={() => goToDay(today)} className="flex items-center gap-2 justify-self-start cursor-pointer">
          <div className="logo logo--dark" style={{ height: '32px' }} role="img" aria-label="Kokeliko" />
          <span className="text-[25px] text-1/70">bookinger</span>
        </button>
        <div className="flex items-center gap-1.5 justify-self-center">
          {(['dag', 'uke', 'maned'] as const).map(v => (
            <button
              key={v}
              onClick={() => { setViewAndPersist(v); setSelectedDate(today) }}
              className={`px-4 py-2 text-base font-medium rounded-md border shadow-sm transition-colors ${
                view === v ? 'bg-2 [border:2px_solid_#5A3826] text-white' : 'border-1/15 bg-6 text-1/75'
              }`}
            >
              {v === 'dag' ? 'Dag' : v === 'uke' ? 'Uke' : 'Måned'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 justify-self-end">
          {userEmail && <span className="text-xs text-1/50">{userEmail.replace('@', '@​')}</span>}
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border border-1/15 bg-6/50 shadow-sm text-1/60 transition-colors"
          >
            <IconLogout size={16} aria-hidden /> Logg ut
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="h-full flex items-center justify-center text-1/45">Laster…</div>
        ) : view === 'dag' ? (
          <div className="h-full flex flex-col mx-auto max-w-2xl px-6 pt-6">
            <div className="relative flex items-center justify-center mb-4 shrink-0">
              <button
                type="button"
                onClick={goToPrevious}
                aria-label="Forrige"
                className="absolute left-0 w-8 h-8 flex items-center justify-center shrink-0 rounded-full bg-6 border border-1/15 shadow-sm active:bg-stone-100 transition-colors"
              >
                <IconChevronLeft size={16} className="text-1/75" />
              </button>
              <h1 className="text-2xl font-bold text-1 text-center">
                {selectedDate === today && 'I dag – '}
                <span className="capitalize">{formatDateLong(selectedDate)}</span>
              </h1>
              <button
                type="button"
                onClick={goToNext}
                aria-label="Neste"
                className="absolute right-0 w-8 h-8 flex items-center justify-center shrink-0 rounded-full bg-6 border border-1/15 shadow-sm active:bg-stone-100 transition-colors"
              >
                <IconChevronRight size={16} className="text-1/75" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
              {(byDate[selectedDate] ?? []).length === 0 ? (
                <div className="text-1/45 text-lg italic py-8 text-center">Ingen bookinger denne dagen</div>
              ) : (
                <div className="flex flex-col gap-3 pb-6">
                  {(byDate[selectedDate] ?? []).map(b => <BookingRow key={b.id} b={b} expandable />)}
                </div>
              )}
            </div>
          </div>
        ) : view === 'uke' ? (
          <div className="h-full flex items-center justify-center px-3 py-4 pb-16">
          <div className="flex flex-col w-full">
            <div className="relative flex items-center justify-center mb-4 shrink-0">
              <button
                type="button"
                onClick={goToPrevious}
                aria-label="Forrige"
                className="absolute left-0 w-8 h-8 flex items-center justify-center shrink-0 rounded-full bg-6 border border-1/15 shadow-sm active:bg-stone-100 transition-colors"
              >
                <IconChevronLeft size={16} className="text-1/75" />
              </button>
              <h1 className="text-2xl font-bold text-1 text-center">Uke {getISOWeekNumber(selectedDateObj)}</h1>
              <button
                type="button"
                onClick={goToNext}
                aria-label="Neste"
                className="absolute right-0 w-8 h-8 flex items-center justify-center shrink-0 rounded-full bg-6 border border-1/15 shadow-sm active:bg-stone-100 transition-colors"
              >
                <IconChevronRight size={16} className="text-1/75" />
              </button>
            </div>
            <div className="flex w-full border border-1/15 rounded-xl shadow-sm bg-6/95">
            {weekDays.map((d, i) => (
              <div key={d} className="flex flex-1 min-w-0">
                {i > 0 && <div className="w-px bg-1/15 my-4 shrink-0" />}
                <button
                  type="button"
                  onClick={() => goToDay(d)}
                  className={`flex-1 flex flex-col gap-2 px-1.5 py-4 h-122 min-w-0 overflow-hidden text-left rounded-xl transition-colors ${
                    d === today ? 'relative z-10 [border:2px_solid_#5A3826] active:bg-2/10' : 'active:bg-stone-100'
                  }`}
                >
                  <h2 className="text-lg font-bold text-1/90 capitalize text-center w-full">{formatDateShort(d)}</h2>
                  {(byDate[d] ?? []).length === 0 ? (
                    <div className="text-1/35 text-xs italic text-center">–</div>
                  ) : (
                    <>
                      {(byDate[d] ?? []).slice(0, 5).map(b => (
                        <div key={b.id} className={`rounded-lg px-2 py-2.5 text-sm min-w-0 w-full overflow-hidden ${bookingColor(b)}`}>
                          <div className="flex items-center justify-between gap-1 min-w-0">
                            <span className="font-semibold text-base">{formatTime(b.start_time)}</span>
                            {b.party_size != null && (
                              <span className="flex items-center gap-0.5 shrink-0 text-xs">
                                <IconUsers size={12} />{b.party_size}
                              </span>
                            )}
                          </div>
                          <div className="truncate min-w-0 text-sm mt-2">{b.name}</div>
                        </div>
                      ))}
                      {(byDate[d] ?? []).length > 5 && (
                        <div className="flex items-center justify-center gap-1 text-sm text-1/45">
                          <IconChevronDown size={14} /> {(byDate[d] ?? []).length - 5} flere
                        </div>
                      )}
                    </>
                  )}
                </button>
              </div>
            ))}
            </div>
          </div>
          </div>
        ) : (
          <div className="h-full flex flex-col w-full px-3 py-4">
            <div className="relative flex items-center justify-center mb-4 shrink-0">
              <button
                type="button"
                onClick={goToPrevious}
                aria-label="Forrige"
                className="absolute left-0 w-8 h-8 flex items-center justify-center shrink-0 rounded-full bg-6 border border-1/15 shadow-sm active:bg-stone-100 transition-colors"
              >
                <IconChevronLeft size={16} className="text-1/75" />
              </button>
              <h1 className="text-2xl font-bold text-1 text-center capitalize">
                {selectedDateObj.toLocaleDateString('nb-NO', { month: 'long', year: 'numeric' })}
              </h1>
              <button
                type="button"
                onClick={goToNext}
                aria-label="Neste"
                className="absolute right-0 w-8 h-8 flex items-center justify-center shrink-0 rounded-full bg-6 border border-1/15 shadow-sm active:bg-stone-100 transition-colors"
              >
                <IconChevronRight size={16} className="text-1/75" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-sm font-bold text-1/70 shrink-0">
              {['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'].map(label => <div key={label}>{label}</div>)}
            </div>
            <div className="flex-1 min-h-0 grid grid-cols-7 grid-rows-6 gap-2">
              {monthCalendarDays.map((d, i) => (
                d === '' ? (
                  <div key={`empty-${i}`} />
                ) : (
                  <button
                    key={d}
                    type="button"
                    onClick={() => goToDay(d)}
                    className={`flex flex-col gap-0.5 p-2 min-w-0 overflow-hidden text-left rounded-xl bg-6/95 transition-colors ${
                      d === today ? 'relative z-10 [border:2px_solid_#5A3826] shadow-sm' : 'border border-1/15 shadow-sm active:bg-stone-100'
                    }`}
                  >
                    <span className="text-sm font-semibold text-1/90">{Number(d.slice(-2))}</span>
                    <div className="flex flex-col gap-px min-w-0 w-full">
                      {(byDate[d] ?? []).slice(0, 3).map(b => (
                        <div key={b.id} className={`rounded px-1 py-px text-[10px] leading-tight min-w-0 w-full flex items-center gap-0.5 ${bookingColor(b)}`}>
                          <span className="truncate">{formatTime(b.start_time)}</span>
                          {b.party_size != null && (
                            <span className="flex items-center gap-0.5 shrink-0 ml-auto">
                              <IconUsers size={9} />{b.party_size}
                            </span>
                          )}
                        </div>
                      ))}
                      {(byDate[d] ?? []).length > 3 && (
                        <div className="flex items-center gap-0.5 text-[9px] leading-tight text-1/45 px-1">
                          <IconChevronDown size={9} /> {(byDate[d] ?? []).length - 3} flere
                        </div>
                      )}
                    </div>
                  </button>
                )
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
