'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getProfile } from '@/lib/auth'

export default function RequireAuth({
  children,
  allowedRoles = ['PESERTA', 'ADMIN', 'SUPERADMIN'],
}: {
  children: React.ReactNode
  allowedRoles?: string[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const profile = await getProfile()
        const role = profile.userRoles?.[0]?.role?.name || 'PESERTA'

        // SUPERADMIN should have access to all pages
        const effectiveAllowedRoles = allowedRoles.includes('SUPERADMIN') 
          ? allowedRoles 
          : [...allowedRoles, 'SUPERADMIN']

        if (!effectiveAllowedRoles.includes(role)) {
          router.push('/unauthorized')
        }
      } catch (err) {
        // Save current path and redirect to login
        localStorage.setItem('redirectAfterLogin', pathname)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, pathname, allowedRoles])

  if (loading) {
    return <div className="p-8 text-center">Checking access...</div>
  }

  return <>{children}</>
}
