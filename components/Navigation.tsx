'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, User, Users, FileText, Bell, Settings, Award, Home } from 'lucide-react'
import { logoutUser, getProfile } from '@/lib/auth'
import { toast } from 'sonner'

interface User {
  name?: string
  username?: string
  userRoles?: Array<{
    role?: {
      name: string
    }
  }>
}

interface NavigationProps {
  className?: string
}

export default function Navigation({ className = '' }: NavigationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getProfile()
        setUser(profile)
      } catch (err) {
        console.error('Failed to fetch profile', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleLogout = async () => {
    try {
      await logoutUser()
      toast.success('Logged out successfully')
      router.push('/login')
    } catch (err) {
      toast.error('Failed to logout')
    }
  }

  if (loading) {
    return null
  }

  const role = user?.userRoles?.[0]?.role?.name || 'PESERTA'

  const getNavigationItems = () => {
    switch (role) {
      case 'ADMIN':
        return [
          { href: '/admin', label: 'Dashboard', icon: Home },
          { href: '/admin/users', label: 'Users', icon: Users },
          { href: '/admin/groups', label: 'Groups', icon: FileText },
        ]
      case 'SUPERADMIN':
        return [
          { href: '/admin', label: 'Admin Dashboard', icon: Home },
          { href: '/admin/users', label: 'Users', icon: Users },
          { href: '/admin/groups', label: 'Groups', icon: FileText },
          { href: '/admin/submissions', label: 'Submissions', icon: FileText },
          { href: '/admin/scoring-settings', label: 'Scoring Settings', icon: Settings },
        ]
      case 'JURI':
        return [
          { href: '/jury', label: 'Dashboard', icon: Home },
          { href: '/jury/review', label: 'Reviews', icon: Award },
        ]
      case 'PESERTA':
      default:
        return [
          { href: '/peserta', label: 'Dashboard', icon: Home },
          { href: '/peserta/groups', label: 'My Groups', icon: FileText },
          { href: '/peserta/submissions', label: 'My Submissions', icon: FileText },
        ]
    }
  }

  const navigationItems = getNavigationItems()

  return (
    <nav className={`bg-white shadow-sm border-b ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            {/* Logo/Brand */}
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">Mandaya Award</h1>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex space-x-4">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Button
                    key={item.href}
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => router.push(item.href)}
                    className="flex items-center space-x-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                )
              })}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              Welcome, {user?.name || user?.username}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}


