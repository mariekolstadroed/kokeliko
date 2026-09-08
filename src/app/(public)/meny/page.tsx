import type { Metadata } from 'next'
import Link from 'next/link'
import { IconArrowRight } from '@tabler/icons-react'
import { supabaseServer as supabase } from '@/lib/supabase-server'
import type { Category, MenuItem } from '@/types/index'
import MenuPageBody from './MenuPageBody'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Meny – Kokeliko Kaffebar',
  description: 'Se hele menyen til Kokeliko: kaffe, smørbrød, salater, pizza, kaker og den populære KokelikoBolla.',
  alternates: { canonical: '/meny' },
}

async function fetchMenuData() {
  const [{ data: cats }, { data: its }, { count: cateringCount }] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .eq('is_catering', false)
      .eq('published', true)
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('name'),
    supabase
      .from('menu_items')
      .select('*')
      .eq('available', true)
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('name'),
    supabase
      .from('categories')
      .select('id', { count: 'exact', head: true })
      .eq('is_catering', true)
      .eq('published', true),
  ])
  return {
    categories: (cats ?? []) as Category[],
    items: (its ?? []) as MenuItem[],
    hasCateringMenu: (cateringCount ?? 0) > 0,
  }
}

export default async function MenuPage() {
  const { categories, items, hasCateringMenu } = await fetchMenuData()

  return (
    <MenuPageBody
      title="Meny"
      categories={categories}
      items={items}
      banner={hasCateringMenu && (
        <div className="flex flex-wrap items-center justify-end gap-1 md:gap-2 mt-5 md:mt-4.5 lg:mt-6 -mb-7 md:-mb-6">
          <p className="hidden md:block text-sm text-2">Skal du bestille mat til catering eller lukket selskap?</p>
          <span className="inline-flex items-center gap-1 md:gap-2">
            <span className="hidden md:inline text-sm text-2">Gå til</span>
            <Link
              href="/meny/catering"
              className="shrink-0 inline-flex items-center gap-1 md:gap-1.5 px-2.5 py-1.25 md:px-3 md:py-1.5 bg-2 text-4 text-[11px] md:text-xs font-special-elite rounded-lg shadow-sm shadow-1/30 hover:brightness-125 transition-colors whitespace-nowrap"
            >
              Cateringmeny <IconArrowRight size={12} className="md:hidden" /><IconArrowRight size={14} className="hidden md:inline" />
            </Link>
          </span>
        </div>
      )}
    />
  )
}
