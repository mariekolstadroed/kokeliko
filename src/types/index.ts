export type OpeningHour = {
  id: string
  day: number
  open_time: string | null
  close_time: string | null
  closed: boolean
}

export type SpecialHoursGroup = {
  id: string
  title: string
  theme: string | null
  published: boolean
}

export type SpecialHour = {
  id: string
  group_id: string
  date: string | null
  description: string | null
  open_time: string | null
  close_time: string | null
  closed: boolean
}

export type Event = {
  id: string
  title: string
  description: string | null
  image_url: string | null
  event_date: string
  event_start_time: string
  event_end_time: string | null
  max_capacity: number | null
  published: boolean
}

export type EventRegistration = {
  id: string
  event_id: string
  name: string
  email: string
  phone: string | null
  cancellation_token: string
}

export type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  sort_order: number | null
}

export type GalleryItem = {
  id: string
  section: 'bestselgere' | 'nyheter'
  title: string | null
  image_url: string | null
  sort_order: number | null
  published: boolean
}

export type MenuItem = {
  id: string
  name: string
  description: string | null
  price: number | null
  category_id: string
  image_url: string | null
  available: boolean
  allergens: string | null
  sort_order: number | null
}
