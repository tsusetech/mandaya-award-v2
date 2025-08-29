'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Eye,
  MessageSquare,
  RefreshCw,
  XCircle,
  Users,
  BarChart3,
  Brain,
  Target,
  Trophy,
  ArrowLeft,
  TrendingUp,
  Star,
  Crown,
  Filter,
  Download
} from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'

interface Submission {
  id: number
  groupId: number
  groupName: string
  userName: string
  userEmail: string
  status: 'in_progress' | 'submitted' | 'needs_revision' | 'resubmitted' | 'approved' | 'completed'
  combinedStatus: 'in_progress' | 'submitted' | 'needs_revision' | 'resubmitted' | 'approved' | 'completed'
  submittedAt: string
  updatedAt: string
  progressPercentage: number
  feedback?: string
  revisionCount: number
}

export default function AdminSubmissionsPage() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      
      // Try to get all user assessment sessions
      let sessionsRes
      try {
        sessionsRes = await api.get('/assessments/user-sessions', {
          params: {
            page: 1,
            limit: 50,
            status: statusFilter !== 'all' ? statusFilter : undefined
          }
        })
        console.log('User sessions response:', sessionsRes.data)
      } catch (userSessionsError) {
        console.log('user-sessions endpoint not available, using mock data:', userSessionsError)
        // If the endpoint doesn't exist, we'll use mock data
        sessionsRes = { data: null }
      }
      
      let allSubmissions: Submission[] = []
      
      if (sessionsRes.data?.data?.data && Array.isArray(sessionsRes.data.data.data)) {
        console.log('Processing sessions data:', sessionsRes.data.data.data)
        // Transform the user sessions data to match our Submission interface
        allSubmissions = sessionsRes.data.data.data.map((session: any) => {
          const submission = {
            id: session.id,
            groupId: session.groupId,
            groupName: session.groupName,
            userName: session.userName || 'Unknown User',
            userEmail: session.userEmail || 'unknown@example.com',
            status: session.status,
            combinedStatus: session.status,
            submittedAt: session.submittedAt || session.lastActivityAt,
            updatedAt: session.lastActivityAt,
            progressPercentage: session.progressPercentage || 0,
            feedback: session.reviewComments,
            revisionCount: 0
          }
          console.log('Created submission:', submission)
          return submission
        })
        console.log('Total submissions created:', allSubmissions.length)
      } else if (sessionsRes.data && Array.isArray(sessionsRes.data)) {
        allSubmissions = sessionsRes.data.map((session: any) => ({
          id: session.id,
          groupId: session.groupId,
          groupName: session.groupName,
          userName: session.userName || 'Unknown User',
          userEmail: session.userEmail || 'unknown@example.com',
          status: session.status,
          combinedStatus: session.status,
          submittedAt: session.submittedAt || session.lastActivityAt,
          updatedAt: session.lastActivityAt,
          progressPercentage: session.progressPercentage || 0,
          feedback: session.reviewComments,
          revisionCount: 0
        }))
      } else {
        console.log('Unexpected user-sessions response structure:', sessionsRes.data)
      }
      
      // If no submissions found (either endpoint failed or returned no data), use mock data for demonstration
      console.log('Final allSubmissions length:', allSubmissions.length)
      if (allSubmissions.length === 0) {
        console.log('No submissions found, using mock data for demonstration')
        allSubmissions = [
          {
            id: 1,
            groupId: 1,
            groupName: 'Sample Organization A',
            userName: 'John Doe',
            userEmail: 'john@example.com',
            status: 'submitted' as const,
            combinedStatus: 'submitted' as const,
            submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
            progressPercentage: 100,
            feedback: undefined,
            revisionCount: 0
          },
          {
            id: 2,
            groupId: 2,
            groupName: 'Sample Organization B',
            userName: 'Jane Smith',
            userEmail: 'jane@example.com',
            status: 'needs_revision' as const,
            combinedStatus: 'needs_revision' as const,
            submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
            progressPercentage: 85,
            feedback: 'Please provide more details about your social impact programs.',
            revisionCount: 1
          },
          {
            id: 3,
            groupId: 3,
            groupName: 'Sample Organization C',
            userName: 'Bob Wilson',
            userEmail: 'bob@example.com',
            status: 'approved' as const,
            combinedStatus: 'approved' as const,
            submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
            progressPercentage: 100,
            feedback: undefined,
            revisionCount: 0
          }
        ]
      }
      
      setSubmissions(allSubmissions)
      setFilteredSubmissions(allSubmissions)
    } catch (err) {
      console.error('Error fetching submissions:', err)
      toast.error('Gagal memuat pengajuan')
      setSubmissions([])
      setFilteredSubmissions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubmissions()
  }, [])

  // Add refresh functionality when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchSubmissions()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    filterSubmissions(term, statusFilter)
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    filterSubmissions(searchTerm, status)
  }

  const filterSubmissions = (term: string, status: string) => {
    let filtered = [...submissions]

    // Apply search filter
    if (term) {
      filtered = filtered.filter(submission =>
        submission.groupName.toLowerCase().includes(term.toLowerCase()) ||
        submission.userName.toLowerCase().includes(term.toLowerCase()) ||
        submission.userEmail.toLowerCase().includes(term.toLowerCase())
      )
    }

    // Apply status filter
    if (status !== 'all') {
      filtered = filtered.filter(submission => submission.combinedStatus === status)
    }

    setFilteredSubmissions(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'text-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300'
      case 'submitted':
        return 'text-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300'
      case 'needs_revision':
        return 'text-red-500 bg-red-50 dark:bg-red-900/30 dark:text-red-300'
      case 'resubmitted':
        return 'text-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300'
      case 'approved':
        return 'text-green-500 bg-green-50 dark:bg-green-900/30 dark:text-green-300'
      case 'completed':
        return 'text-green-500 bg-green-50 dark:bg-green-900/30 dark:text-green-300'
      default:
        return 'text-gray-500 bg-gray-50 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_progress':
        return <Clock className="h-5 w-5" />
      case 'submitted':
        return <FileText className="h-5 w-5" />
      case 'needs_revision':
        return <AlertTriangle className="h-5 w-5" />
      case 'resubmitted':
        return <RefreshCw className="h-5 w-5" />
      case 'approved':
        return <CheckCircle className="h-5 w-5" />
      case 'completed':
        return <Trophy className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Draf'
      case 'in_progress':
        return 'Sedang Berlangsung'
      case 'submitted':
        return 'Dikirim'
      case 'pending_review':
        return 'Menunggu Tinjauan'
      case 'under_review':
        return 'Sedang Ditinjau'
      case 'needs_revision':
        return 'Perlu Revisi'
      case 'resubmitted':
        return 'Dikirim Ulang'
      case 'approved':
        return 'Disetujui'
      case 'rejected':
        return 'Ditolak'
      case 'passed_to_jury':
        return 'Diteruskan ke Juri'
      case 'jury_scoring':
        return 'Penilaian Juri'
      case 'jury_deliberation':
        return 'Deliberasi Juri'
      case 'final_decision':
        return 'Keputusan Akhir'
      case 'completed':
        return 'Selesai'
      default:
        return status
    }
  }

  const getStats = () => {
    const total = submissions.length
    const submitted = submissions.filter(s => s.combinedStatus === 'submitted').length
    const needsRevision = submissions.filter(s => s.combinedStatus === 'needs_revision').length
    const approved = submissions.filter(s => s.combinedStatus === 'approved').length
    const completed = submissions.filter(s => s.combinedStatus === 'completed').length
    const inProgress = submissions.filter(s => s.combinedStatus === 'in_progress').length

    return { total, submitted, needsRevision, approved, completed, inProgress }
  }

  if (loading) {
    return (
      <AuthenticatedLayout allowedRoles={['ADMIN', 'SUPERADMIN']}>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div className="p-6 space-y-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

  const stats = getStats()

  return (
    <AuthenticatedLayout allowedRoles={['ADMIN', 'SUPERADMIN']}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-orange-500/5 to-orange-600/5 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-orange-400/5 to-orange-500/5 blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-gradient-to-r from-orange-500/3 to-orange-600/3 blur-2xl animate-pulse delay-500"></div>
        </div>

        {/* Header Section */}
        <div className="relative bg-gradient-to-r from-orange-500/10 via-orange-600/10 to-orange-500/10 border-b border-orange-200/50 dark:border-orange-800/50 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-orange-600/5"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'32\\' height=\\'32\\' viewBox=\\'0 0 32 32\\'><path fill=\\'%23EA580C\\' d=\\'M0 31h32v1H0zM31 0v32h1V0z\\'/></svg>')] opacity-5"></div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.push('/admin')}
                  className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-gray-900 dark:text-white backdrop-blur-sm border border-white/20"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Kembali ke Beranda</span>
                </Button>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg border-2 border-orange-400/50">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 bg-clip-text text-transparent">
                      Pengajuan Penilaian
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      Tinjau dan kelola pengajuan penilaian dengan pembaruan real-time
                    </p>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchSubmissions}
                disabled={loading}
                className="flex items-center space-x-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-orange-200/50 dark:border-orange-800/50 hover:bg-white/70 dark:hover:bg-gray-700/50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Segarkan</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pengajuan</CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 group-hover:from-blue-200 dark:group-hover:from-blue-900/60 group-hover:to-blue-300 dark:group-hover:to-blue-800/60 transition-all duration-300 transform group-hover:scale-110">
                  <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{stats.total}</div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-500 animate-pulse" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Semua pengajuan</p>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Dikirim</CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 group-hover:from-green-200 dark:group-hover:from-green-900/60 group-hover:to-green-300 dark:group-hover:to-green-800/60 transition-all duration-300 transform group-hover:scale-110">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{stats.submitted}</div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-green-500 animate-pulse" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Siap untuk ditinjau</p>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Perlu Revisi</CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/40 group-hover:from-red-200 dark:group-hover:from-red-900/60 group-hover:to-red-300 dark:group-hover:to-red-800/60 transition-all duration-300 transform group-hover:scale-110">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{stats.needsRevision}</div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-red-500 animate-pulse" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Memerlukan pembaruan</p>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Disetujui</CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 group-hover:from-orange-200 dark:group-hover:from-orange-900/60 group-hover:to-orange-300 dark:group-hover:to-orange-800/60 transition-all duration-300 transform group-hover:scale-110">
                  <Trophy className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{stats.approved + stats.completed}</div>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-orange-500 animate-pulse" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Diteruskan ke juri</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-500 mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 to-gray-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardContent className="pt-6 relative z-10">
              <div className="flex flex-col space-y-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Cari berdasarkan nama kelompok, nama pengguna, atau email..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-12 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500/20 dark:border-gray-600 dark:bg-gray-800 dark:focus:border-orange-400 transition-all duration-200"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant={statusFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusFilter('all')}
                    className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-200"
                  >
                    Semua
                  </Button>

                  <Button
                    variant={statusFilter === 'draft' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusFilter('draft')}
                  >
                    Draf
                  </Button>
                  <Button
                    variant={statusFilter === 'submitted' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusFilter('submitted')}
                  >
                    Dikirim
                  </Button>

                  <Button
                    variant={statusFilter === 'needs_revision' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusFilter('needs_revision')}
                  >
                    Perlu Revisi
                  </Button>
                  <Button
                    variant={statusFilter === 'resubmitted' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusFilter('resubmitted')}
                  >
                    Dikirim Ulang
                  </Button>
                  <Button
                    variant={statusFilter === 'approved' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusFilter('approved')}
                  >
                    Setujui ke Juri
                  </Button>

                  <Button
                    variant={statusFilter === 'completed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusFilter('completed')}
                  >
                    Selesai
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submissions List */}
          <div className="space-y-6">
            {filteredSubmissions.length === 0 ? (
              <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 to-gray-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardContent className="py-12 relative z-10">
                  <div className="text-center">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 mb-4 mx-auto w-fit">
                      <FileText className="h-12 w-12 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Tidak ada pengajuan ditemukan</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-center">
                      {searchTerm || statusFilter !== 'all'
                        ? 'Coba sesuaikan filter Anda'
                        : 'Belum ada pengajuan yang dikirim'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredSubmissions.map((submission) => (
                <Card key={submission.id} className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex flex-col space-y-4">
                      <div className="flex-1">
                        <div className="flex items-start space-x-4">
                          <div className={`p-3 rounded-xl flex-shrink-0 ${getStatusColor(submission.combinedStatus)}`}>
                            {getStatusIcon(submission.combinedStatus)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                              {submission.groupName}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Dikirim oleh {submission.userName} ({submission.userEmail})
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Dikirim pada {new Date(submission.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <Badge variant="outline" className={`${getStatusColor(submission.combinedStatus)}`}>
                            {getStatusLabel(submission.combinedStatus)}
                          </Badge>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              Kemajuan: {submission.progressPercentage}%
                            </span>
                          </div>
                          {submission.revisionCount > 0 && (
                            <div className="flex items-center space-x-2">
                              <RefreshCw className="h-4 w-4 text-orange-500" />
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                Revisi: {submission.revisionCount}
                              </span>
                            </div>
                          )}
                        </div>

                        {submission.feedback && (
                          <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                            <div className="flex items-center space-x-2">
                              <MessageSquare className="h-4 w-4 text-orange-500 flex-shrink-0" />
                              <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Umpan Balik:</span>
                            </div>
                            <p className="text-sm text-orange-600 dark:text-orange-400 mt-1 break-words">{submission.feedback}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          onClick={() => router.push(`/admin/submissions/${submission.id}`)}
                          className="flex items-center space-x-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white border-orange-600 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-200"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Tinjau</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
