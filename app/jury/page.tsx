'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, ClipboardList, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'

interface Review {
  id: number
  sessionId: number
  stage: string
  status: string
  decision: string
  overallComments?: string
  totalScore?: number
  reviewedAt?: string
  createdAt: string
  updatedAt: string
  session: {
    id: number
    groupId: number
    groupName: string
    userId: number
    status: string
    submittedAt?: string
    user: {
      id: number
      name: string
      email: string
    }
  }
}

interface ReviewStats {
  totalAssigned: number
  reviewed: number
  pending: number
  inProgress: number
}

export default function JuryDashboard() {
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

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Get reviews assigned to current jury member
      const reviewsRes = await api.get('/reviews/my-reviews')
      const reviewsData = reviewsRes.data || []
      
      // Get review statistics
      let statsData = {
        totalAssigned: 0,
        reviewed: 0,
        pending: 0,
        inProgress: 0
      }
      
      try {
        const statsRes = await api.get('/reviews/stats/overview')
        statsData = statsRes.data || statsData
      } catch (statsError) {
        console.log('Failed to fetch stats, using calculated stats')
        // Calculate stats from reviews data
        statsData = {
          totalAssigned: reviewsData.length,
          reviewed: reviewsData.filter((r: Review) => r.status === 'completed').length,
          pending: reviewsData.filter((r: Review) => r.status === 'pending').length,
          inProgress: reviewsData.filter((r: Review) => r.status === 'in_progress').length
        }
      }

      setReviews(reviewsData)
      setFilteredReviews(reviewsData)
      setStats(statsData)
    } catch (err) {
      console.error('Error fetching jury data:', err)
      toast.error('Failed to load dashboard data')
      
      // Use mock data for demonstration
      const mockReviews = [
        {
          id: 1,
          sessionId: 1,
          stage: 'jury_scoring',
          status: 'in_progress',
          decision: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          session: {
            id: 1,
            groupId: 1,
            groupName: 'Sample Organization A',
            userId: 1,
            status: 'approved_for_jury',
            submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            user: {
              id: 1,
              name: 'John Doe',
              email: 'john@example.com'
            }
          }
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
    fetchData()
  }, [])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (!term.trim()) {
      setFilteredReviews(reviews)
      return
    }

    const filtered = reviews.filter(review =>
      review.session.groupName.toLowerCase().includes(term.toLowerCase()) ||
      review.session.user.name.toLowerCase().includes(term.toLowerCase()) ||
      review.session.user.email.toLowerCase().includes(term.toLowerCase())
    )
    setFilteredReviews(filtered)
  }

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
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48"></div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Jury Dashboard</h1>
              <p className="text-gray-600">Review and score submissions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Assigned</CardTitle>
              <ClipboardList className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAssigned}</div>
              <p className="text-xs text-gray-500">Submissions to review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Reviewed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.reviewed}</div>
              <p className="text-xs text-gray-500">Completed reviews</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
              <p className="text-xs text-gray-500">Reviews in progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-gray-500">Not yet reviewed</p>
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
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="text-sm text-gray-500">
                Showing {filteredReviews.length} of {reviews.length} submissions
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submissions List */}
        <Card>
          <CardHeader>
            <CardTitle>Assigned Reviews</CardTitle>
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
                {filteredReviews.map((review) => (
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
                        <h3 className="font-medium text-gray-900">{review.session.groupName}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{review.session.user.name}</span>
                          <span>•</span>
                          <span>{review.session.user.email}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-500">
                        Submitted {new Date(review.session.submittedAt || review.createdAt).toLocaleDateString()}
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
    </div>
  )
}
