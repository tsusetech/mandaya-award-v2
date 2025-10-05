'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Search, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Star, 
  RefreshCw,
  TrendingUp,
  Activity,
  Zap,
  Users,
  BarChart3,
  Eye,
  Play,
  Target,
  Trophy,
  Brain,
  Filter,
  Award,
  MessageSquare
} from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'

interface Review {
  id: number
  sessionId: number
  groupName: string
  userName: string
  userEmail: string
  submittedAt: string
  status: string
  progressPercentage: number
  decision: string
  stage: string
}

interface ReviewsData {
  submissions: Review[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  filters: {
    all: number
    pending: number
    inProgress: number
    completed: number
  }
}

export default function JuriReviewPage() {
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchReviews('', 'all', 1, true)
  }, [])

  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
    }
  }, [searchTimeout])

  const fetchReviews = async (search = '', filter = 'all', page = 1, showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true)
      }
      
      // Build query parameters
      const params = new URLSearchParams()
      if (search.trim()) params.append('search', search.trim())
      if (filter !== 'all') params.append('filter', filter)
      if (page > 1) params.append('page', page.toString())
      params.append('limit', '10')
      
      // Use the new jury reviews endpoint
      const response = await api.get(`/assessments/jury/reviews?${params.toString()}`)
      const reviewsData: ReviewsData = response.data?.data || {
        submissions: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 0, hasNext: false, hasPrev: false },
        filters: { all: 0, pending: 0, inProgress: 0, completed: 0 }
      }
      
      setReviews(reviewsData.submissions)
      setFilteredReviews(reviewsData.submissions)
    } catch (err) {
      console.error('Error fetching reviews:', err)
      toast.error('Gagal memuat tinjauan')
      
      // Use mock data for demonstration
      const mockReviews = [
        {
          id: 1,
          sessionId: 1,
          groupName: 'Sample Organization A',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'in_progress',
          progressPercentage: 50,
          decision: 'pending',
          stage: 'admin_validation'
        }
      ]
      
      setReviews(mockReviews)
      setFilteredReviews(mockReviews)
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">Selesai</Badge>
      case 'in_progress':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">Sedang Berlangsung</Badge>
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">Menunggu</Badge>
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">Disetujui admin</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-600" />
      case 'pending':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      default:
        return <FileText className="h-5 w-5 text-gray-600" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <AuthenticatedLayout allowedRoles={['JURI', 'SUPERADMIN']}>
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
    <AuthenticatedLayout allowedRoles={['JURI', 'SUPERADMIN']}>
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
                  onClick={() => router.push('/jury')}
                  className="flex items-center space-x-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-yellow-200/50 dark:border-yellow-800/50 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-all duration-200"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Kembali ke Beranda</span>
                </Button>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg border-2 border-yellow-400/50 relative">
                    <Award className="h-8 w-8 text-white" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-400 bg-clip-text text-transparent">
                      Tinjau Pengajuan
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      Tinjau dan nilai pengajuan yang ditetapkan dengan keahlian
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchReviews(searchTerm, statusFilter, 1, true)}
                  className="flex items-center space-x-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-yellow-200/50 dark:border-yellow-800/50 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-all duration-200"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Segarkan</span>
                </Button>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 px-4 py-2 rounded-full backdrop-blur-sm border border-yellow-200/50 dark:border-yellow-800/50">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">{reviews.length} Tinjauan</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filters */}
          <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 to-gray-600/5"></div>
            <CardContent className="relative z-10 pt-8">
              <div className="space-y-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Cari berdasarkan nama kelompok, nama pengguna, atau email..."
                    value={searchTerm}
                    onChange={(e) => {
                      const value = e.target.value
                      setSearchTerm(value)
                      
                      // Clear existing timeout
                      if (searchTimeout) {
                        clearTimeout(searchTimeout)
                      }
                      
                      // Set new timeout for debounced search
                      const timeoutId = setTimeout(() => {
                        fetchReviews(value, statusFilter, 1, false)
                      }, 500)
                      setSearchTimeout(timeoutId)
                    }}
                    className="pl-12 h-12 border-gray-300 focus:border-yellow-500 focus:ring-yellow-500/20 dark:border-gray-600 dark:bg-gray-800 dark:focus:border-yellow-400 transition-all duration-200"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Filter className="h-4 w-4" />
                    <span>Filter berdasarkan status:</span>
                  </div>
                  <Button
                    variant={statusFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setStatusFilter('all')
                      fetchReviews(searchTerm, 'all', 1, false)
                    }}
                    className="bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white border-0 shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 transition-all duration-200"
                  >
                    Semua
                  </Button>
                  <Button
                    variant={statusFilter === 'pending' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setStatusFilter('pending')
                      fetchReviews(searchTerm, 'pending', 1, false)
                    }}
                    className="border-yellow-200/50 dark:border-yellow-800/50 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                  >
                    Menunggu
                  </Button>
                  <Button
                    variant={statusFilter === 'in_progress' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setStatusFilter('in_progress')
                      fetchReviews(searchTerm, 'in_progress', 1, false)
                    }}
                    className="border-yellow-200/50 dark:border-yellow-800/50 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                  >
                    Sedang Berlangsung
                  </Button>
                  <Button
                    variant={statusFilter === 'completed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setStatusFilter('completed')
                      fetchReviews(searchTerm, 'completed', 1, false)
                    }}
                    className="border-yellow-200/50 dark:border-yellow-800/50 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                  >
                    Selesai
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviews List */}
          <div className="space-y-6">
            {filteredReviews.length === 0 ? (
              <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 to-gray-600/5"></div>
                <CardContent className="relative z-10 py-16">
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 to-gray-700 flex items-center justify-center">
                      <FileText className="h-16 w-16 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Tidak ada tinjauan ditemukan</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 text-lg">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'Coba sesuaikan pencarian atau filter Anda' 
                        : 'Tidak ada pengajuan yang tersedia untuk ditinjau'
                      }
                    </p>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse delay-150"></div>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse delay-300"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredReviews.map((review) => (
                <Card key={review.id} className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-yellow-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardContent className="relative z-10 p-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className={`p-4 rounded-2xl ${getStatusIcon(review.status).props.className.includes('text-green') ? 'bg-green-100 dark:bg-green-900/40' : getStatusIcon(review.status).props.className.includes('text-blue') ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-yellow-100 dark:bg-yellow-900/40'} group-hover:scale-110 transition-all duration-300`}>
                          {getStatusIcon(review.status)}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{review.groupName}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300 mb-2">
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4" />
                              <span>Dikirim oleh {review.userName}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MessageSquare className="h-4 w-4" />
                              <span>{review.userEmail}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Dikirim pada {formatDate(review.submittedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {getStatusBadge(review.status)}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push('/jury/judgment')}
                          className="flex items-center space-x-2 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white border-0 shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 transition-all duration-200 transform hover:scale-105 px-6 py-3"
                        >
                          <Eye className="h-5 w-5" />
                          <span className="font-semibold">Tinjau</span>
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
