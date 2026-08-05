import { supabaseServer as supabase } from '@/lib/supabase-server'
import type { Category, MenuItem } from '@/types/index'
import MenuTabs from './MenuTabs'

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
    <div className="max-w-6xl mx-auto px-6 pt-10 md:pt-12 lg:pt-14 pb-12">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-special-elite text-[#2E1608] mb-3 text-center">Meny</h1>
      <MenuTabs categories={categories} items={items} />
    </div>
  )
}
