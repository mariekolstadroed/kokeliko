import type { Metadata } from 'next'
import { supabaseServer as supabase } from '@/lib/supabase-server'
import type { Category, MenuItem } from '@/types/index'
import MenuTabs from './MenuTabs'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Meny – Kokeliko Kaffebar',
  description: 'Se hele menyen til Kokeliko: kaffe, smørbrød, salater, pizza, kaker og den populære KokelikoBolla.',
  alternates: { canonical: '/meny' },
}

async function fetchMenuData() {
  const [{ data: cats }, { data: its }] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
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

export default async function MenuPage() {
  const { categories, items } = await fetchMenuData()

  return (
    <div className="bg-3 -mt-30 pt-30">
      <div className="min-h-[calc(100dvh-4.875rem)] md:min-h-[calc(100dvh-5.4375rem)] lg:min-h-[calc(100dvh-6rem)] max-w-6xl mx-auto px-6 pt-10 md:pt-12 lg:pt-14 pb-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-special-elite text-2 mb-3 text-center">Meny</h1>
        <MenuTabs categories={categories} items={items} />
      </div>
    </div>
  )
}
