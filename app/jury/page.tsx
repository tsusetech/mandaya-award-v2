'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, ClipboardList, CheckCircle, Clock, AlertTriangle, Award, FileText, ArrowRight } from 'lucide-react'
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
        return 'text-green-500 bg-green-50'
      case 'in_progress':
        return 'text-blue-500 bg-blue-50'
      case 'pending':
        return 'text-orange-500 bg-orange-50'
      default:
        return 'text-gray-500 bg-gray-50'
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
        <div className="p-4 sm:p-6 space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout allowedRoles={['JURI', 'SUPERADMIN']}>
      <div className="p-4 sm:p-6 space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Juri Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Review and score submissions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Assigned</CardTitle>
              <ClipboardList className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalAssigned}</div>
              <p className="text-xs text-gray-500 mt-1">Submissions to review</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Reviewed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.reviewed}</div>
              <p className="text-xs text-gray-500 mt-1">Completed reviews</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.inProgress}</div>
              <p className="text-xs text-gray-500 mt-1">Reviews in progress</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
              <p className="text-xs text-gray-500 mt-1">Not yet reviewed</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/jury/review')}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-blue-600" />
                <span>Review Submissions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">Review and score assigned submissions</p>
              <Button className="mt-4 w-full" variant="outline">
                Start Reviewing
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/jury/rankings')}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-yellow-600" />
                <span>Award Rankings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">View current award rankings and standings</p>
              <Button className="mt-4 w-full" variant="outline">
                View Rankings
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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
                  className="pl-10"
                />
              </div>
              <div className="text-sm text-gray-500">
                Showing {filteredReviews.length} of {reviews.length} submissions
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Reviews */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Reviews</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/jury/review')}
                className="flex items-center space-x-2"
              >
                <span>View All</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {filteredReviews.length === 0 ? (
              <div className="text-center py-8">
                <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No reviews found</p>
                <p className="text-sm text-gray-400">
                  {searchTerm ? 'Try adjusting your search' : 'You have no reviews assigned yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReviews.slice(0, 5).map((review) => (
                  <div
                    key={review.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/jury/review/${review.sessionId}`)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${getStatusColor(review.status)}`}>
                        {getStatusIcon(review.status)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{review.groupName}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{review.userName}</span>
                          <span>•</span>
                          <span>{review.userEmail}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-500">
                        Submitted {new Date(review.submittedAt).toLocaleDateString()}
                      </div>
                      <Button variant="outline" size="sm">
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
    </AuthenticatedLayout>
  )
}
