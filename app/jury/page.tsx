'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  ClipboardList, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Award, 
  FileText, 
  ArrowRight,
  TrendingUp,
  Activity,
  Star,
  Zap,
  Users,
  BarChart3,
  Eye,
  Play,
  Target,
  Trophy,
  Brain,
  Filter
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
}

interface ReviewStats {
  totalAssigned: number
  reviewed: number
  pending: number
  inProgress: number
}

interface DashboardData {
  statistics: ReviewStats
  recentReviews: Review[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export default function JuriDashboard() {
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats>({
    totalAssigned: 0,
    reviewed: 0,
    pending: 0,
    inProgress: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  const fetchData = async (page = 1, search = '') => {
    try {
      setLoading(true)
      
      // Build query parameters
      const params = new URLSearchParams()
      if (page > 1) params.append('page', page.toString())
      if (search.trim()) params.append('search', search.trim())
      params.append('limit', pageSize.toString())
      
      // Get jury dashboard data from new endpoint
      const dashboardRes = await api.get(`/assessments/jury/dashboard?${params.toString()}`)
      const dashboardData: DashboardData = dashboardRes.data.data || {
        statistics: { totalAssigned: 0, reviewed: 0, pending: 0, inProgress: 0 },
        recentReviews: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 0, hasNext: false, hasPrev: false }
      }

      setReviews(dashboardData.recentReviews)
      setFilteredReviews(dashboardData.recentReviews)
      setStats(dashboardData.statistics)
      setCurrentPage(dashboardData.pagination.page)
    } catch (err) {
      console.error('Error fetching juri data:', err)
      toast.error('Failed to load dashboard data')
      
      // Use mock data for demonstration
      const mockReviews = [
        {
          id: 1,
          sessionId: 1,
          groupName: 'Sample Organization A',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'approved',
          progressPercentage: 100
        }
      ]
      
      setReviews(mockReviews)
      setFilteredReviews(mockReviews)
      setStats({
        totalAssigned: 1,
        reviewed: 0,
        pending: 0,
        inProgress: 1
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(1, '')
  }, [])

  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
    }
  }, [searchTimeout])

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term)
    // Reset to page 1 when searching
    setCurrentPage(1)
    // Fetch data with search term
    fetchData(1, term)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 dark:bg-green-900/40'
      case 'in_progress':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/40'
      case 'pending':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/40'
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/40'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5" />
      case 'in_progress':
        return <Clock className="h-5 w-5" />
      case 'pending':
        return <AlertTriangle className="h-5 w-5" />
      default:
        return <ClipboardList className="h-5 w-5" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'in_progress':
        return 'In Progress'
      case 'pending':
        return 'Pending'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <AuthenticatedLayout allowedRoles={['JURI', 'SUPERADMIN']}>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div className="p-6 space-y-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
              <div className="h-64 bg-gray-200 rounded-lg"></div>
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
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg border-2 border-yellow-400/50 relative">
                    <Award className="h-8 w-8 text-white" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-400 bg-clip-text text-transparent">
                      Jury Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      Review and score submissions with expertise
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 px-4 py-2 rounded-full backdrop-blur-sm border border-yellow-200/50 dark:border-yellow-800/50">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">Expert Jury Panel</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="relative z-10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                    <ClipboardList className="h-6 w-6 text-white" />
                  </div>
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stats.totalAssigned}</div>
                <p className="text-gray-600 dark:text-gray-300 font-medium">Total Assigned</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Submissions to review</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="relative z-10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <Activity className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stats.reviewed}</div>
                <p className="text-gray-600 dark:text-gray-300 font-medium">Reviewed</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Completed reviews</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="relative z-10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <BarChart3 className="h-5 w-5 text-orange-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stats.inProgress}</div>
                <p className="text-gray-600 dark:text-gray-300 font-medium">In Progress</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Reviews in progress</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="relative z-10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <Target className="h-5 w-5 text-red-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stats.pending}</div>
                <p className="text-gray-600 dark:text-gray-300 font-medium">Pending</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Not yet reviewed</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="group cursor-pointer hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden" onClick={() => router.push('/jury/review')}>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="relative z-10 p-6">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg mb-4">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Review Submissions</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Review and score assigned submissions with expert evaluation</p>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 transform hover:scale-105">
                  <Eye className="h-4 w-4 mr-2" />
                  Start Reviewing
                </Button>
              </CardContent>
            </Card>

            <Card className="group cursor-pointer hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden" onClick={() => router.push('/jury/rankings')}>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-yellow-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="relative z-10 p-6">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg mb-4">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Award Rankings</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">View current award rankings and standings</p>
                <Button className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 transition-all duration-200 transform hover:scale-105">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Rankings
                </Button>
              </CardContent>
            </Card>

            <Card className="group cursor-pointer hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="relative z-10 p-6">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg mb-4">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Expert Insights</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Access evaluation criteria and scoring guidelines</p>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-200 transform hover:scale-105">
                  <Star className="h-4 w-4 mr-2" />
                  View Guidelines
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 to-gray-600/5"></div>
            <CardContent className="relative z-10 pt-8">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search reviews by group name, participant, or email..."
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
                        handleSearch(value)
                      }, 500)
                      setSearchTimeout(timeoutId)
                    }}
                    className="pl-12 h-12 border-gray-300 focus:border-yellow-500 focus:ring-yellow-500/20 dark:border-gray-600 dark:bg-gray-800 dark:focus:border-yellow-400 transition-all duration-200"
                  />
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 px-4 py-2 rounded-full backdrop-blur-sm border border-yellow-200/50 dark:border-yellow-800/50">
                  <Filter className="h-4 w-4" />
                  <span className="font-medium">{filteredReviews.length} of {reviews.length} submissions</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Reviews */}
          <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 to-gray-600/5"></div>
            <CardHeader className="relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Recent Reviews</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/jury/review')}
                  className="flex items-center space-x-2 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white border-0 shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 transition-all duration-200"
                >
                  <span>View All</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              {filteredReviews.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 to-gray-700 flex items-center justify-center">
                    <ClipboardList className="h-16 w-16 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No reviews found</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6 text-lg">
                    {searchTerm ? 'Try adjusting your search' : 'You have no reviews assigned yet'}
                  </p>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse delay-150"></div>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse delay-300"></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredReviews.slice(0, 5).map((review) => (
                    <div
                      key={review.id}
                      className="group flex items-center justify-between p-6 border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gradient-to-r hover:from-yellow-50/50 hover:to-yellow-100/50 dark:hover:from-yellow-900/20 dark:hover:to-yellow-800/20 cursor-pointer transition-all duration-300 transform hover:scale-[1.01]"
                      onClick={() => router.push(`/jury/review/${review.sessionId}`)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-4 rounded-2xl ${getStatusColor(review.status)} group-hover:scale-110 transition-all duration-300`}>
                          {getStatusIcon(review.status)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{review.groupName}</h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 mt-1">
                            <Users className="h-4 w-4" />
                            <span>{review.userName}</span>
                            <span>•</span>
                            <span>{review.userEmail}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Submitted {new Date(review.submittedAt).toLocaleDateString()}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white border-0 shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 transition-all duration-200 transform hover:scale-105"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
