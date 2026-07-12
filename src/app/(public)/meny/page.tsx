import Image from 'next/image'
import { supabaseServer as supabase } from '@/lib/supabase-server'
import type { Category, MenuItem } from '@/types/index'
import MenuTabs from './MenuTabs'
import menuImg1 from '@/assets/menu/menu1.jpg'
import menuImg2 from '@/assets/menu/menu2.jpg'
import menuImg3 from '@/assets/menu/menu3.jpg'
import menuImg4 from '@/assets/menu/menu4.jpg'
import menuImg5 from '@/assets/menu/menu5.jpg'

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
    <div className="relative">
      {/* Sirkel ved kategorivalg */}
      <div className="absolute left-8 top-36 w-40 h-40 rounded-full overflow-hidden pointer-events-none -translate-x-1/2">
        <Image src={menuImg5} alt="" fill sizes="160px" placeholder="blur" className="object-cover scale-[1.2]" />
        <div className="absolute inset-0 bg-[#faf7f2]/30" />
      </div>
      {/* Venstre sirkel */}
      <div className="absolute left-4 bottom-32 w-60 h-60 rounded-full overflow-hidden pointer-events-none -translate-x-1/2">
        <Image src={menuImg4} alt="" fill sizes="240px" placeholder="blur" className="object-cover scale-[1.2]" />
        <div className="absolute inset-0 bg-[#faf7f2]/30" />
      </div>
      {/* Minste høyre sirkel */}
      <div className="absolute right-8 top-12 w-40 h-40 rounded-full overflow-hidden pointer-events-none translate-x-1/2">
        <Image src={menuImg3} alt="" fill sizes="160px" placeholder="blur" className="object-cover scale-[1.5]" />
        <div className="absolute inset-0 bg-[#faf7f2]/30" />
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-14 pb-12 relative">
        {/* Høyre sirkler */}
        <div className="absolute -right-24 top-56 w-120 h-120 rounded-full overflow-hidden z-0 pointer-events-none">
          <Image src={menuImg1} alt="" fill sizes="480px" priority placeholder="blur" className="object-cover scale-[1.2]" />
          <div className="absolute inset-0 bg-[#faf7f2]/30" />
        </div>
        <div className="absolute -right-12 top-200 w-60 h-60 rounded-full overflow-hidden z-0 pointer-events-none">
          <Image src={menuImg2} alt="" fill sizes="240px" placeholder="blur" className="object-cover scale-[1.7]" />
          <div className="absolute inset-0 bg-[#faf7f2]/30" />
        </div>

        <div className="relative z-10">
          <h1 className="text-5xl font-bold font-special-elite text-[#2E1608] mb-3 text-center">Meny</h1>
          <MenuTabs categories={categories} items={items} />
        </div>
      </div>
    </div>
  )
}
