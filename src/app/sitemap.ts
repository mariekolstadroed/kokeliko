import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/email'

const ROUTES = [
  '',
  '/meny',
  '/arrangementer',
  '/om-oss',
  '/booking',
  '/booking/bordreservasjon',
  '/booking/catering',
  '/booking/lukket-selskap',
]

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map(route => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
  }))
}
