'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Search, FileText, Clock, CheckCircle, AlertTriangle, Star, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'

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

export default function JuriReviewPage() {
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReviews()
  }, [])

  useEffect(() => {
    filterReviews()
  }, [reviews, searchTerm, statusFilter])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      
      // Get reviews assigned to current juri member
      const response = await api.get('/reviews/my-reviews')
      const reviewsData = response.data || []
      
      setReviews(reviewsData)
      setFilteredReviews(reviewsData)
    } catch (err) {
      console.error('Error fetching reviews:', err)
      toast.error('Failed to load reviews')
      
      // Use mock data for demonstration
      const mockReviews = [
        {
          id: 1,
          sessionId: 1,
          stage: 'juri_scoring',
          status: 'in_progress',
          decision: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          session: {
            id: 1,
            groupId: 1,
            groupName: 'Sample Organization A',
            userId: 1,
            status: 'approved_for_juri',
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
    } finally {
      setLoading(false)
    }
  }

  const filterReviews = () => {
    let filtered = [...reviews]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(review =>
        review.session.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.session.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.session.user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(review => review.status === statusFilter)
    }

    setFilteredReviews(filtered)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>
      case 'in_progress':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">In Progress</Badge>
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>
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
        <div className="p-4 sm:p-6 space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout allowedRoles={['JURI', 'SUPERADMIN']}>
      <div className="p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push('/jury')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Review Submissions</h1>
              <p className="text-sm sm:text-base text-gray-600">Review and score assigned submissions</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchReviews}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by group name, user name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === 'pending' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('pending')}
                >
                  Pending
                </Button>
                <Button
                  variant={statusFilter === 'in_progress' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('in_progress')}
                >
                  In Progress
                </Button>
                <Button
                  variant={statusFilter === 'completed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('completed')}
                >
                  Completed
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredReviews.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No reviews found</p>
                  <p className="text-sm text-gray-400">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filters' 
                      : 'No submissions are available for review'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredReviews.map((review) => (
              <Card key={review.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-full ${getStatusIcon(review.status).props.className.includes('text-green') ? 'bg-green-100' : getStatusIcon(review.status).props.className.includes('text-blue') ? 'bg-blue-100' : 'bg-yellow-100'}`}>
                        {getStatusIcon(review.status)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{review.session.groupName}</h3>
                        <p className="text-sm text-gray-600">
                          Submitted by {review.session.user.name} ({review.session.user.email})
                        </p>
                        <p className="text-sm text-gray-500">
                          Submitted on {formatDate(review.session.submittedAt || review.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {getStatusBadge(review.status)}
                      <div className="text-sm text-gray-500">
                        Progress: {review.status === 'completed' ? '100%' : review.status === 'in_progress' ? '50%' : '0%'}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/jury/review/${review.sessionId}`)}
                        className="flex items-center space-x-2"
                      >
                        <FileText className="h-4 w-4" />
                        <span>Review</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
