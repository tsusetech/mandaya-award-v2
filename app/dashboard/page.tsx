'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getProfile } from '@/lib/auth'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, FileText, Award, ArrowRight } from 'lucide-react'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
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
        <div className="p-8">Loading...</div>
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
              <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name || user?.username}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/admin/users')}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span>User Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">Manage users and their roles</p>
                  <Button className="mt-4 w-full" variant="outline">
                    Manage Users
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/admin/groups')}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    <span>Group Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">Manage assessment groups</p>
                  <Button className="mt-4 w-full" variant="outline">
                    Manage Groups
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      
      case 'JURY':
        return (
          <div className="p-6 space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">Jury Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name || user?.username}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/jury/review')}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-purple-600" />
                    <span>Review Submissions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">Review and score submissions</p>
                  <Button className="mt-4 w-full" variant="outline">
                    Start Reviewing
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
              <h1 className="text-2xl font-bold mb-2">Participant Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name || user?.username}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/peserta/groups')}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span>My Groups</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">View your assigned groups</p>
                  <Button className="mt-4 w-full" variant="outline">
                    View Groups
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/peserta/profile')}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-green-600" />
                    <span>Profile</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">Manage your profile</p>
                  <Button className="mt-4 w-full" variant="outline">
                    View Profile
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
