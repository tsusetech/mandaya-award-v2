'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, 
  ArrowRight, 
  ClipboardList, 
  Clock, 
  Users, 
  Award,
  Target,
  TrendingUp,
  Activity,
  Star,
  Zap,
  BookOpen,
  CheckCircle,
  Play,
  BarChart3
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

export default function GroupsPage() {
  const router = useRouter()
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)

  const fetchGroups = async () => {
    try {
      setLoading(true)
      // Get user's assigned groups
      const res = await api.get('/groups/my-groups')
      console.log('Groups response:', res.data)
      const userGroups = Array.isArray(res.data) ? res.data : res.data?.groups || []
      setGroups(userGroups)
    } catch (err) {
      console.error('Error fetching groups:', err)
      toast.error('Gagal memuat kelompok')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  const handleStartAssessment = async (groupId: number) => {
    try {
      // Get or create assessment session
      const res = await api.get(`/assessments/session/${groupId}`)
      router.push(`/peserta/assessment/${groupId}`)
    } catch (err) {
      console.error('Error starting assessment:', err)
      toast.error('Gagal memulai penilaian')
    }
  }

  if (loading) {
    return (
      <AuthenticatedLayout allowedRoles={['PESERTA']}>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div className="p-6 space-y-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
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
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.push('/peserta')}
                  className="flex items-center space-x-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-yellow-200/50 dark:border-yellow-800/50 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-all duration-200"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Kembali ke Beranda</span>
                </Button>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg border-2 border-yellow-400/50 relative">
                    <Users className="h-8 w-8 text-white" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-400 bg-clip-text text-transparent">
                      Kelompok Saya
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      Lihat dan selesaikan penilaian kelompok Anda
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 px-4 py-2 rounded-full backdrop-blur-sm border border-yellow-200/50 dark:border-yellow-800/50">
                  <Zap className="h-4 w-4 text-green-500" />
                  <span className="font-medium">{groups.length} Kelompok</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {groups.length === 0 ? (
            <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 to-gray-600/5"></div>
              <CardContent className="relative z-10 py-16">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 to-gray-700 flex items-center justify-center">
                    <ClipboardList className="h-16 w-16 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Belum ada kelompok yang ditugaskan</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6 text-lg">Anda akan diberitahu ketika ditugaskan ke sebuah kelompok</p>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse delay-150"></div>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse delay-300"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Stats Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Kelompok</CardTitle>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 group-hover:from-blue-200 dark:group-hover:from-blue-900/60 group-hover:to-blue-300 dark:group-hover:to-blue-800/60 transition-all duration-300 transform group-hover:scale-110">
                      <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{groups.length}</div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-blue-500 animate-pulse" />
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Ditugaskan kepada Anda</p>
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
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {groups.filter(g => g.responseSession && g.responseSession.status !== 'submitted').length}
                    </div>
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
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {groups.filter(g => g.responseSession && g.responseSession.status === 'submitted').length}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-green-500 animate-pulse" />
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Penilaian selesai</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Groups List */}
              <div className="space-y-6">
                {Array.isArray(groups) ? groups.map((group) => (
                  <Card key={group.id} className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-yellow-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardContent className="relative z-10 p-8">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 group-hover:from-blue-200 dark:group-hover:from-blue-900/60 group-hover:to-blue-300 dark:group-hover:to-blue-800/60 transition-all duration-300 transform group-hover:scale-110">
                            <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="space-y-3">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{group.groupName}</h2>
                            {group.description && (
                              <p className="text-gray-600 dark:text-gray-300 text-lg">{group.description}</p>
                            )}
                            {group.responseSession && (
                              <div className="flex items-center space-x-6">
                                <div className="flex items-center space-x-2">
                                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                  <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                                    Kemajuan: {group.responseSession.progressPercentage}%
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                  <span className="text-sm text-gray-600 dark:text-gray-300 font-medium capitalize">
                                    Status: {group.responseSession.status.replace('_', ' ')}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <BarChart3 className="h-4 w-4 text-purple-500" />
                                  <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                                    Penilaian Aktif
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          {group.responseSession && (
                            <div className="text-right">
                              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Kemajuan</div>
                              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {group.responseSession.progressPercentage}%
                              </div>
                            </div>
                          )}
                          <Button
                            onClick={() => handleStartAssessment(group.id)}
                            className="flex items-center space-x-2 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 transition-all duration-200 transform hover:scale-105 px-6 py-3"
                          >
                            {group.responseSession ? (
                              <>
                                <Clock className="h-5 w-5" />
                                <span className="font-semibold">Lanjutkan</span>
                              </>
                            ) : (
                              <>
                                <Play className="h-5 w-5" />
                                <span className="font-semibold">Mulai Penilaian</span>
                              </>
                            )}
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
