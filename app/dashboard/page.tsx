'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getProfile } from '@/lib/auth'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, FileText, Award } from 'lucide-react'

interface User {
  name?: string
  username?: string
  userRoles?: Array<{
    role?: {
      name: string
    }
  }>
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile()
        console.log('Fetched user profile:', data)
        setUser(data)
      } catch (err) {
        console.error('Failed to fetch profile', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="p-8">Memuat...</div>
      </AuthenticatedLayout>
    )
  }

  const roleName = user?.userRoles?.[0]?.role?.name || 'Unknown'

  const getRoleBasedContent = () => {
    switch (roleName) {
      case 'ADMIN':
      case 'SUPERADMIN':
        return (
          <div className="p-6 space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">Beranda Admin</h1>
              <p className="text-gray-600">Selamat datang kembali, {user?.name || user?.username}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/admin/users')}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span>Manajemen Pengguna</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">Kelola pengguna dan peran mereka</p>
                  <Button className="mt-4 w-full" variant="outline">
                    Kelola Pengguna
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/admin/groups')}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    <span>Manajemen Kelompok</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">Kelola kelompok penilaian</p>
                  <Button className="mt-4 w-full" variant="outline">
                    Kelola Kelompok
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      
      case 'JURI':
        return (
          <div className="p-6 space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">Beranda Juri</h1>
              <p className="text-gray-600">Selamat datang kembali, {user?.name || user?.username}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/jury/review')}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-purple-600" />
                    <span>Tinjau Pengajuan</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">Tinjau dan nilai pengajuan</p>
                  <Button className="mt-4 w-full" variant="outline">
                    Mulai Meninjau
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      
      case 'PESERTA':
      default:
        return (
          <div className="p-6 space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">Beranda Peserta</h1>
              <p className="text-gray-600">Selamat datang kembali, {user?.name || user?.username}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/peserta/groups')}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span>Kelompok Saya</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">Lihat kelompok yang ditugaskan</p>
                  <Button className="mt-4 w-full" variant="outline">
                    Lihat Kelompok
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/peserta/profile')}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-green-600" />
                    <span>Profil</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">Kelola profil Anda</p>
                  <Button className="mt-4 w-full" variant="outline">
                    Lihat Profil
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )
    }
  }

  return (
    <AuthenticatedLayout>
      {getRoleBasedContent()}
    </AuthenticatedLayout>
  )
}
