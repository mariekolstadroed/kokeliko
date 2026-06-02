export type Category = {
  id: string
  name: string
  slug: string
}

export type MenuItem = {
  id: string
  name: string
  description: string | null
  price: number
  category_id: string
  image_url: string | null
  available: boolean
  allergens: string | null
}
