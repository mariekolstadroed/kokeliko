import type { Metadata } from 'next'
import Link from 'next/link'
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react'
import { supabaseServer as supabase } from '@/lib/supabase-server'
import type { Category, MenuItem } from '@/types/index'
import MenuPageBody from '../MenuPageBody'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Cateringmeny – Kokeliko Kaffebar',
  description: 'Se cateringmenyen til Kokeliko for bestilling av catering og lukket selskap.',
  alternates: { canonical: '/meny/catering' },
}

async function fetchCateringMenuData() {
  const [{ data: cats }, { data: its }] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .eq('is_catering', true)
      .eq('published', true)
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('name'),
    supabase
      .from('menu_items')
      .select('*')
      .eq('available', true)
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('name'),
  ])
  return {
    categories: (cats ?? []) as Category[],
    items: (its ?? []) as MenuItem[],
  }
}

export default async function CateringMenuPage() {
  const { categories, items } = await fetchCateringMenuData()

  return (
    <MenuPageBody
      title="Cateringmeny"
      categories={categories}
      items={items}
      banner={
        <div className="flex flex-wrap items-center justify-between gap-1.5 md:gap-3 mt-5 md:mt-4.5 lg:mt-6 -mb-7 md:-mb-6">
          <Link
            href="/meny"
            className="shrink-0 inline-flex items-center gap-1 md:gap-1.5 px-2.5 py-1.25 md:px-3 md:py-1.5 bg-2 text-4 text-[11px] md:text-xs font-special-elite rounded-lg shadow-sm shadow-1/30 hover:brightness-125 transition-colors whitespace-nowrap"
          >
            <IconArrowLeft size={12} className="md:hidden" /><IconArrowLeft size={14} className="hidden md:inline" /> Vanlig meny
          </Link>
          <div className="flex flex-wrap items-center gap-1 md:gap-2">
            <p className="hidden md:block text-sm text-2">Ønsker du å bestille catering? Gå til</p>
            <Link
              href="/booking/catering"
              className="shrink-0 inline-flex items-center gap-1 md:gap-1.5 px-2.5 py-1.25 md:px-3 md:py-1.5 bg-2 text-4 text-[11px] md:text-xs font-special-elite rounded-lg shadow-sm shadow-1/30 hover:brightness-125 transition-colors whitespace-nowrap"
            >
              Bestillingsskjema <IconArrowRight size={12} className="md:hidden" /><IconArrowRight size={14} className="hidden md:inline" />
            </Link>
          </div>
        </div>
      }
    />
  )
}
