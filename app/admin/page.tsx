'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Shield, FileText, Calendar, Award, Activity, TrendingUp, UserCheck, Settings, BarChart3, Sparkles, Zap, Star, Crown } from 'lucide-react'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import { getProfile } from '@/lib/auth'
import api from '@/lib/api'
import Image from 'next/image'

interface AdminStats {
  totalUsers: number
  totalGroups: number
  activeUsers: number
  recentActivity: number
}

interface UserProfile {
  name: string
  email: string
}

interface User {
  id: number
  name: string
  email: string
  isActive?: boolean
}

export default function AdminPage() {
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalGroups: 0,
    activeUsers: 0,
    recentActivity: 0
  })
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, groupsRes, profile] = await Promise.all([
          api.get('/users'),
          api.get('/groups'),
          getProfile()
        ])

        const users = usersRes.data.users || []
        const groups = groupsRes.data.groups || []

        setStats({
          totalUsers: users.length,
          totalGroups: groups.length,
          activeUsers: users.filter((user: User) => user.isActive !== false).length,
          recentActivity: Math.floor(Math.random() * 50) + 10 // Placeholder
        })

        setUserProfile(profile)
      } catch (err) {
        console.error('Failed to fetch admin stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleLogout = async () => {
    // Logout is now handled by the Navigation component
    router.push('/login')
  }

  const navigateTo = (path: string) => {
    router.push(path)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="p-6 space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AuthenticatedLayout allowedRoles={['ADMIN', 'SUPERADMIN']}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-yellow-500/5 to-yellow-600/5 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-yellow-400/5 to-yellow-500/5 blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-gradient-to-r from-yellow-500/3 to-yellow-600/3 blur-2xl animate-pulse delay-500"></div>
        </div>

        {/* Header Section */}
        <div className="relative bg-gradient-to-r from-yellow-500/10 via-yellow-600/10 to-yellow-500/10 border-b border-yellow-200/50 dark:border-yellow-800/50 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-yellow-600/5"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'32\\' height=\\'32\\' viewBox=\\'0 0 32 32\\'><path fill=\\'%23FFD700\\' d=\\'M0 31h32v1H0zM31 0v32h1V0z\\'/></svg>')] opacity-5"></div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
                  <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-2xl border-2 border-yellow-400/50 transform hover:scale-105 transition-transform duration-300">
                    <Image
                      src="/logo.png"
                      alt="Mandaya Award Logo"
                      width={40}
                      height={40}
                      className="rounded-full drop-shadow-lg"
                    />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div>
                                     <div className="mb-2">
                     <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-400 bg-clip-text text-transparent">
                       Admin Dashboard
                     </h1>
                   </div>
                  <p className="text-gray-600 dark:text-gray-300 text-lg">
                    Welcome back, <span className="font-semibold text-gray-900 dark:text-white bg-gradient-to-r from-yellow-600 to-yellow-500 bg-clip-text text-transparent">{userProfile?.name || 'Administrator'}</span>
                  </p>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 px-4 py-2 rounded-full backdrop-blur-sm border border-yellow-200/50 dark:border-yellow-800/50">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">System Online</span>
                  <Zap className="h-4 w-4 text-yellow-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 group-hover:from-blue-200 dark:group-hover:from-blue-900/60 group-hover:to-blue-300 dark:group-hover:to-blue-800/60 transition-all duration-300 transform group-hover:scale-110">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{stats.totalUsers}</div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-500 animate-pulse" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">+12% from last month</p>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Groups</CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 group-hover:from-green-200 dark:group-hover:from-green-900/60 group-hover:to-green-300 dark:group-hover:to-green-800/60 transition-all duration-300 transform group-hover:scale-110">
                  <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{stats.totalGroups}</div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-500 animate-pulse" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">+8% from last month</p>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 group-hover:from-purple-200 dark:group-hover:from-purple-900/60 group-hover:to-purple-300 dark:group-hover:to-purple-800/60 transition-all duration-300 transform group-hover:scale-110">
                  <UserCheck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{stats.activeUsers}</div>
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Currently online</p>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Recent Activity</CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 group-hover:from-orange-200 dark:group-hover:from-orange-900/60 group-hover:to-orange-300 dark:group-hover:to-orange-800/60 transition-all duration-300 transform group-hover:scale-110">
                  <BarChart3 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{stats.recentActivity}</div>
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-yellow-500 animate-pulse" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">This week</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            <Card className="group cursor-pointer hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden" onClick={() => navigateTo('/admin/users')}>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="pb-4 relative z-10">
                <CardTitle className="flex items-center space-x-4 text-lg">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 group-hover:from-blue-200 dark:group-hover:from-blue-900/60 group-hover:to-blue-300 dark:group-hover:to-blue-800/60 transition-all duration-300 transform group-hover:scale-110">
                    <Users className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-gray-900 dark:text-white font-semibold">User Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 leading-relaxed">Manage users, roles, and permissions with comprehensive control and advanced features</p>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-105">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
              </CardContent>
            </Card>

            <Card className="group cursor-pointer hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden" onClick={() => navigateTo('/admin/groups')}>
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="pb-4 relative z-10">
                <CardTitle className="flex items-center space-x-4 text-lg">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 group-hover:from-green-200 dark:group-hover:from-green-900/60 group-hover:to-green-300 dark:group-hover:to-green-800/60 transition-all duration-300 transform group-hover:scale-110">
                    <Shield className="h-7 w-7 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-gray-900 dark:text-white font-semibold">Group Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 leading-relaxed">Create and manage user groups for organized collaboration and team coordination</p>
                <Button className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300 transform hover:scale-105">
                  <Shield className="h-4 w-4 mr-2" />
                  Manage Groups
                </Button>
              </CardContent>
            </Card>

            <Card className="group cursor-pointer hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden" onClick={() => navigateTo('/admin/submissions')}>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="pb-4 relative z-10">
                <CardTitle className="flex items-center space-x-4 text-lg">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 group-hover:from-orange-200 dark:group-hover:from-orange-900/60 group-hover:to-orange-300 dark:group-hover:to-orange-800/60 transition-all duration-300 transform group-hover:scale-110">
                    <FileText className="h-7 w-7 text-orange-600 dark:text-orange-400" />
                  </div>
                  <span className="text-gray-900 dark:text-white font-semibold">Assessment Submissions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 leading-relaxed">Review and manage assessment submissions from participants with detailed analytics</p>
                <Button className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300 transform hover:scale-105">
                  <FileText className="h-4 w-4 mr-2" />
                  Review Submissions
                </Button>
              </CardContent>
            </Card>

            <Card className="group cursor-pointer hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden" onClick={() => navigateTo('/admin/scoring-settings')}>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="pb-4 relative z-10">
                <CardTitle className="flex items-center space-x-4 text-lg">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 group-hover:from-purple-200 dark:group-hover:from-purple-900/60 group-hover:to-purple-300 dark:group-hover:to-purple-800/60 transition-all duration-300 transform group-hover:scale-110">
                    <Settings className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-gray-900 dark:text-white font-semibold">Scoring Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 leading-relaxed">Manage question categories and scoring criteria with advanced configuration options</p>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 transform hover:scale-105">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Scoring
                </Button>
              </CardContent>
            </Card>

            <Card className="group cursor-pointer hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden" onClick={() => navigateTo('/admin/rankings')}>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-yellow-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="pb-4 relative z-10">
                <CardTitle className="flex items-center space-x-4 text-lg">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/40 dark:to-yellow-800/40 group-hover:from-yellow-200 dark:group-hover:from-yellow-900/60 group-hover:to-yellow-300 dark:group-hover:to-yellow-800/60 transition-all duration-300 transform group-hover:scale-110">
                    <Award className="h-7 w-7 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <span className="text-gray-900 dark:text-white font-semibold">Award Rankings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 leading-relaxed">View current award rankings and standings with real-time updates and analytics</p>
                <Button className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white font-semibold shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 transition-all duration-300 transform hover:scale-105">
                  <Award className="h-4 w-4 mr-2" />
                  View Rankings
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 to-gray-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center space-x-4 text-xl">
                <div className="p-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 group-hover:from-gray-200 dark:group-hover:from-gray-600 group-hover:to-gray-300 dark:group-hover:to-gray-500 transition-all duration-300 transform group-hover:scale-110">
                  <Activity className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </div>
                <span className="text-gray-900 dark:text-white font-bold">Recent Activity</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">Live</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/20 dark:hover:to-blue-800/20 transition-all duration-300 transform hover:scale-[1.02]">
                  <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-pulse shadow-lg"></div>
                  <div className="flex-1">
                    <span className="text-gray-900 dark:text-white font-semibold">New user registered</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">John Doe joined the platform with admin privileges</p>
                  </div>
                  <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">2 minutes ago</span>
                </div>
                <div className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 dark:hover:from-green-900/20 dark:hover:to-green-800/20 transition-all duration-300 transform hover:scale-[1.02]">
                  <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-green-600 rounded-full animate-pulse shadow-lg"></div>
                  <div className="flex-1">
                    <span className="text-gray-900 dark:text-white font-semibold">Group updated</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">"Developers" group settings modified with new permissions</p>
                  </div>
                  <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">1 hour ago</span>
                </div>
                <div className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 dark:hover:from-purple-900/20 dark:hover:to-purple-800/20 transition-all duration-300 transform hover:scale-[1.02]">
                  <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full animate-pulse shadow-lg"></div>
                  <div className="flex-1">
                    <span className="text-gray-900 dark:text-white font-semibold">Permissions modified</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">User permissions updated for admin role with enhanced access</p>
                  </div>
                  <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">3 hours ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
