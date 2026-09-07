'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ALLOWED_ADMIN_EMAILS } from '@/lib/adminAuth'

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/login'
  const [checked, setChecked] = useState(isLoginPage)

  useEffect(() => {
    if (isLoginPage) return
    let cancelled = false
    supabase.auth.getUser().then(async ({ data }) => {
      const email = data.user?.email?.toLowerCase()
      if (!email || !ALLOWED_ADMIN_EMAILS.includes(email)) {
        await supabase.auth.signOut()
        router.replace(email ? '/admin/login?denied=1' : '/admin/login')
        return
      }
      if (!cancelled) setChecked(true)
    })
    return () => { cancelled = true }
  }, [isLoginPage, router])

  if (!isLoginPage && !checked) return null

  return <>{children}</>
}
