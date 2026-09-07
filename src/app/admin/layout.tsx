import type { Viewport } from 'next'
import AdminAuthGuard from './AdminAuthGuard'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-root">
      <AdminAuthGuard>{children}</AdminAuthGuard>
    </div>
  )
}
