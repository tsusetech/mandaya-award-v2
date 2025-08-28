'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  Users, 
  Shield, 
  Activity, 
  Upload, 
  BarChart3,
  Crown,
  Star,
  Sparkles,
  Zap
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useLocale } from 'next-intl'

interface DashboardStats {
  totalUsers: number
  totalGroups: number
  totalSubmissions: number
  pendingReviews: number
}

export default function AdminDashboardPage() {
  const t = useTranslations('dashboard')
  const locale = useLocale()
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalGroups: 0,
    totalSubmissions: 0,
    pendingReviews: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading stats
    const timer = setTimeout(() => {
      setStats({
        totalUsers: 1250,
        totalGroups: 89,
        totalSubmissions: 456,
        pendingReviews: 23
      })
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <AuthenticatedLayout allowedRoles={['ADMIN', 'SUPERADMIN']}>
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
      </AuthenticatedLayout>
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
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'32\\' height=\\'32\\' viewBox=\\'0 0 32 32\\'><path fill=\\'%23EAB308\\' d=\\'M0 31h32v1H0zM31 0v32h1V0z\\'/></svg>')] opacity-5"></div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg border-2 border-yellow-400/50 relative">
                    <Crown className="h-10 w-10 text-white" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-400 bg-clip-text text-transparent">
                      {t('title')}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      {t('subtitle')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 px-4 py-2 rounded-full backdrop-blur-sm border border-yellow-200/50 dark:border-yellow-800/50">
                  <Zap className="h-4 w-4 text-green-500" />
                  <span className="font-medium">{t('systemOnline')}</span>
                </div>
                <LanguageSwitcher currentLocale={locale as any} />
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('totalUsers')}</CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 group-hover:from-blue-200 dark:group-hover:from-blue-900/60 group-hover:to-blue-300 dark:group-hover:to-blue-800/60 transition-all duration-300 transform group-hover:scale-110">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{stats.totalUsers.toLocaleString()}</div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-500 animate-pulse" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Active users</p>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('totalGroups')}</CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 group-hover:from-green-200 dark:group-hover:from-green-900/60 group-hover:to-green-300 dark:group-hover:to-green-800/60 transition-all duration-300 transform group-hover:scale-110">
                  <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{stats.totalGroups}</div>
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-green-500 animate-pulse" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Registered groups</p>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('totalSubmissions')}</CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 group-hover:from-purple-200 dark:group-hover:from-purple-900/60 group-hover:to-purple-300 dark:group-hover:to-purple-800/60 transition-all duration-300 transform group-hover:scale-110">
                  <Upload className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{stats.totalSubmissions}</div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-purple-500 animate-pulse" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total submissions</p>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('pendingReviews')}</CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 group-hover:from-orange-200 dark:group-hover:from-orange-900/60 group-hover:to-orange-300 dark:group-hover:to-orange-800/60 transition-all duration-300 transform group-hover:scale-110">
                  <Activity className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{stats.pendingReviews}</div>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-orange-500 animate-pulse" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Awaiting review</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 group-hover:from-blue-200 dark:group-hover:from-blue-900/60 group-hover:to-blue-300 dark:group-hover:to-blue-800/60 transition-all duration-300 transform group-hover:scale-110">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">{t('viewUsers')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Manage system users, roles, and permissions with comprehensive user management tools.
                </p>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 transform hover:scale-105">
                  <Users className="h-4 w-4 mr-2" />
                  {t('viewUsers')}
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 group-hover:from-green-200 dark:group-hover:from-green-900/60 group-hover:to-green-300 dark:group-hover:to-green-800/60 transition-all duration-300 transform group-hover:scale-110">
                    <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">{t('manageGroups')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Organize participants into groups and manage categories for the award system.
                </p>
                <Button className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-200 transform hover:scale-105">
                  <Shield className="h-4 w-4 mr-2" />
                  {t('manageGroups')}
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 group-hover:from-purple-200 dark:group-hover:from-purple-900/60 group-hover:to-purple-300 dark:group-hover:to-purple-800/60 transition-all duration-300 transform group-hover:scale-110">
                    <Upload className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">{t('reviewSubmissions')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Review and evaluate submitted applications with comprehensive assessment tools.
                </p>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-200 transform hover:scale-105">
                  <Upload className="h-4 w-4 mr-2" />
                  {t('reviewSubmissions')}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 to-gray-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900/40 dark:to-gray-800/40 group-hover:from-gray-200 dark:group-hover:from-gray-900/60 group-hover:to-gray-300 dark:group-hover:to-gray-800/60 transition-all duration-300 transform group-hover:scale-110">
                    <Activity className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">{t('recentActivity')}</CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">{t('live')}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-4">
                {[
                  { action: 'New submission received', time: '2 minutes ago', type: 'submission' },
                  { action: 'User registration completed', time: '5 minutes ago', type: 'user' },
                  { action: 'Group assessment updated', time: '10 minutes ago', type: 'group' },
                  { action: 'Review process completed', time: '15 minutes ago', type: 'review' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-700/50 dark:hover:to-gray-600/50 transition-all duration-200">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">{activity.action}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</p>
                    </div>
                    <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{activity.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
