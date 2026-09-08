import type { ReactNode } from 'react'
import type { Category, MenuItem } from '@/types/index'
import MenuTabs from './MenuTabs'

export default function MenuPageBody({
  title,
  categories,
  items,
  banner,
}: {
  title: string
  categories: Category[]
  items: MenuItem[]
  banner?: ReactNode
}) {
  return (
    <div className="bg-3 -mt-30 pt-30">
      <div className="min-h-[calc(100dvh-4.875rem)] md:min-h-[calc(100dvh-5.4375rem)] lg:min-h-[calc(100dvh-6rem)] max-w-6xl mx-auto px-6 pt-10 md:pt-12 lg:pt-14 pb-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-special-elite text-2 mb-3 text-center">{title}</h1>
        {banner}
        <MenuTabs categories={categories} items={items} />
      </div>
    </div>
  )
}
