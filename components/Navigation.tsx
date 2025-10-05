'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, User, Users, FileText, Bell, Settings, Award, Home, Trophy, BookOpen, HelpCircle } from 'lucide-react'
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
      toast.success('Berhasil keluar')
      router.push('/login')
    } catch (err) {
      toast.error('Gagal keluar')
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
          { href: '/admin', label: 'Beranda', icon: Home },
          { href: '/admin/users', label: 'Pengguna', icon: Users },
          { href: '/admin/groups', label: 'Kelompok', icon: FileText },
          { href: '/admin/submissions', label: 'Pengajuan', icon: FileText },
          { href: '/admin/rankings', label: 'Peringkat', icon: Trophy },
        ]
      case 'SUPERADMIN':
        return [
          { href: '/admin', label: 'Beranda Admin', icon: Home },
          { href: '/admin/users', label: 'Pengguna', icon: Users },
          { href: '/admin/groups', label: 'Kelompok', icon: FileText },
          { href: '/admin/submissions', label: 'Pengajuan', icon: FileText },
          { href: '/admin/rankings', label: 'Peringkat', icon: Trophy },
          { href: '/admin/scoring-settings', label: 'Pengaturan Penilaian', icon: Settings },
        ]
      case 'JURI':
        return [
          { href: '/jury', label: 'Beranda', icon: Home },
          { href: '/jury/judgment', label: 'Penilaian', icon: Award },
          { href: '/jury/rankings', label: 'Peringkat Penghargaan', icon: Trophy },
        ]
      case 'PESERTA':
      default:
        return [
          { href: '/peserta', label: 'Beranda', icon: Home },
          { href: '/peserta/groups', label: 'Kelompok Saya', icon: FileText },
          { href: '/peserta/submissions', label: 'Pengajuan Saya', icon: FileText },
          { href: '/peserta/tutorial', label: 'Tutorial', icon: BookOpen },
          { href: '/peserta/faq', label: 'FAQ', icon: HelpCircle },
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
              <h1 className="text-xl font-bold text-gray-900">Mandaya Awards</h1>
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
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Keluar</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}


