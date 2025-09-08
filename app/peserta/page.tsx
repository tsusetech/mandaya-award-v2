'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  ArrowRight, 
  Clock, 
  CheckCircle, 
  Users, 
  ClipboardList, 
  FileText,
  Award,
  Target,
  TrendingUp,
  Activity,
  Star,
  Zap,
  BookOpen,
  UserCheck,
  BarChart3,
  HelpCircle
} from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'

interface Group {
  id: number
  groupName: string
  description?: string
  responseSession?: {
    id: number
    status: string
    progressPercentage: number
  }
}

interface DashboardStats {
  totalGroups: number
  activeAssessments: number
  completedAssessments: number
  totalSubmissions: number
  draftSubmissions: number
  submittedSubmissions: number
  reviewedSubmissions: number
}

export default function PesertaDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalGroups: 0,
    activeAssessments: 0,
    completedAssessments: 0,
    totalSubmissions: 0,
    draftSubmissions: 0,
    submittedSubmissions: 0,
    reviewedSubmissions: 0
  })
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      // Get user's assigned groups
      const groupsRes = await api.get('/groups/my-groups')

      // Get user groups - handle different response structures
      const userGroups = Array.isArray(groupsRes.data) ? groupsRes.data : groupsRes.data?.groups || []
      setGroups(userGroups)
      
      // Calculate stats based only on groups
      const activeAssessments = userGroups.filter((g: Group) => g.responseSession && g.responseSession.status !== 'submitted').length
      const completedAssessments = userGroups.filter((g: Group) => g.responseSession && g.responseSession.status === 'submitted').length
      
      setStats({
        totalGroups: userGroups.length,
        activeAssessments,
        completedAssessments,
        totalSubmissions: 0, // No submissions endpoint available
        draftSubmissions: 0,
        submittedSubmissions: 0,
        reviewedSubmissions: 0
      })

    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      toast.error('Gagal memuat data beranda')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <AuthenticatedLayout allowedRoles={['PESERTA']}>
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
    <AuthenticatedLayout allowedRoles={['PESERTA']}>
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
                    <Award className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-400 bg-clip-text text-transparent">
                      Beranda Peserta
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      Kelola kelompok penilaian Anda dan pantau kemajuannya
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 px-4 py-2 rounded-full backdrop-blur-sm border border-yellow-200/50 dark:border-yellow-800/50">
                  <Zap className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Peserta Aktif</span>
                </div>
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
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Kelompok Saya</CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 group-hover:from-blue-200 dark:group-hover:from-blue-900/60 group-hover:to-blue-300 dark:group-hover:to-blue-800/60 transition-all duration-300 transform group-hover:scale-110">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{stats.totalGroups}</div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-blue-500 animate-pulse" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Kelompok yang ditugaskan</p>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Penilaian Aktif</CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 group-hover:from-orange-200 dark:group-hover:from-orange-900/60 group-hover:to-orange-300 dark:group-hover:to-orange-800/60 transition-all duration-300 transform group-hover:scale-110">
                  <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{stats.activeAssessments}</div>
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-orange-500 animate-pulse" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Sedang berlangsung</p>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Selesai</CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 group-hover:from-green-200 dark:group-hover:from-green-900/60 group-hover:to-green-300 dark:group-hover:to-green-800/60 transition-all duration-300 transform group-hover:scale-110">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{stats.completedAssessments}</div>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-green-500 animate-pulse" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Penilaian selesai</p>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Penilaian</CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 group-hover:from-purple-200 dark:group-hover:from-purple-900/60 group-hover:to-purple-300 dark:group-hover:to-purple-800/60 transition-all duration-300 transform group-hover:scale-110">
                  <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{stats.totalGroups}</div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-purple-500 animate-pulse" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Semua penilaian</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* My Groups Section */}
          <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden group hover:shadow-3xl transition-all duration-500 mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 to-gray-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900/40 dark:to-gray-800/40 group-hover:from-gray-200 dark:group-hover:from-gray-900/60 group-hover:to-gray-300 dark:group-hover:to-gray-800/60 transition-all duration-300 transform group-hover:scale-110">
                    <BookOpen className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Kelompok Penilaian Saya</CardTitle>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/peserta/groups')}
                  className="flex items-center space-x-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-yellow-200/50 dark:border-yellow-800/50 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                >
                  <span>Lihat Semua</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              {groups.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 to-gray-700 flex items-center justify-center">
                    <ClipboardList className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Belum ada kelompok yang ditugaskan</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">Anda akan diberitahu ketika ditugaskan ke sebuah kelompok</p>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse mx-auto"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.isArray(groups) ? groups.slice(0, 3).map((group) => (
                    <div
                      key={group.id}
                      className="group/item flex items-center justify-between p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 dark:hover:from-yellow-900/10 dark:hover:to-orange-900/10 cursor-pointer transition-all duration-300 transform hover:scale-[1.02]"
                      onClick={() => router.push(`/peserta/assessment/${group.id}`)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 group-hover/item:from-blue-200 dark:group-hover/item:from-blue-900/60 group-hover/item:to-blue-300 dark:group-hover/item:to-blue-800/60 transition-all duration-300 transform group-hover/item:scale-110">
                          <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white text-lg">{group.groupName}</p>
                          {group.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{group.description}</p>
                          )}
                          {group.responseSession && (
                            <div className="flex items-center space-x-4 mt-2">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                  Kemajuan: {group.responseSession.progressPercentage}%
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                  Status: {group.responseSession.status.replace('_', ' ')}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/peserta/assessment/${group.id}`)
                        }}
                        className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-yellow-200/50 dark:border-yellow-800/50 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-all duration-200"
                      >
                        {group.responseSession ? 'Lanjutkan' : 'Mulai'}
                      </Button>
                    </div>
                  )) : null}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden cursor-pointer" onClick={() => router.push('/peserta/groups')}>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 group-hover:from-blue-200 dark:group-hover:from-blue-900/60 group-hover:to-blue-300 dark:group-hover:to-blue-800/60 transition-all duration-300 transform group-hover:scale-110">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Kelompok Saya</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Lihat dan selesaikan penilaian untuk semua kelompok yang ditugaskan dengan pelacakan yang komprehensif.
                </p>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 transform hover:scale-105">
                  <Users className="h-4 w-4 mr-2" />
                  Lihat Kelompok
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden cursor-pointer" onClick={() => router.push('/peserta/submissions')}>
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 group-hover:from-green-200 dark:group-hover:from-green-900/60 group-hover:to-green-300 dark:group-hover:to-green-800/60 transition-all duration-300 transform group-hover:scale-110">
                    <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Pengajuan Saya</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Pantau dan tinjau semua penilaian yang telah diajukan dengan umpan balik dan kemajuan yang detail.
                </p>
                <Button className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-200 transform hover:scale-105">
                  <FileText className="h-4 w-4 mr-2" />
                  Lihat Pengajuan
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden cursor-pointer" onClick={() => router.push('/peserta/tutorial')}>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-200 dark:from-indigo-900/40 dark:to-purple-800/40 group-hover:from-indigo-200 dark:group-hover:from-indigo-900/60 group-hover:to-purple-300 dark:group-hover:to-purple-800/60 transition-all duration-300 transform group-hover:scale-110">
                    <BookOpen className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Tutorial</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Panduan lengkap step-by-step untuk menyelesaikan assessment dengan mudah dan benar.
                </p>
                <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 transform hover:scale-105">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Lihat Tutorial
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden cursor-pointer" onClick={() => router.push('/peserta/faq')}>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-rose-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-pink-100 to-rose-200 dark:from-pink-900/40 dark:to-rose-800/40 group-hover:from-pink-200 dark:group-hover:from-pink-900/60 group-hover:to-rose-300 dark:group-hover:to-rose-800/60 transition-all duration-300 transform group-hover:scale-110">
                    <HelpCircle className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">FAQ</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Pertanyaan yang sering diajukan beserta jawabannya untuk membantu menyelesaikan masalah.
                </p>
                <Button className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all duration-200 transform hover:scale-105">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Lihat FAQ
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden cursor-pointer" onClick={() => router.push('/peserta/profile')}>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 group-hover:from-purple-200 dark:group-hover:from-purple-900/60 group-hover:to-purple-300 dark:group-hover:to-purple-800/60 transition-all duration-300 transform group-hover:scale-110">
                    <UserCheck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Profil</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Kelola profil pribadi, preferensi, dan pengaturan akun Anda dengan mudah.
                </p>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-200 transform hover:scale-105">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Lihat Profil
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}

