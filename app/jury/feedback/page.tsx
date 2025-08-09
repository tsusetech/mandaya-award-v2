'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Search, MessageSquare, Star, Clock, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'

interface Submission {
  id: number
  title: string
  description: string
  status: string
  createdAt: string
  participantName: string
  groupName: string
  feedback?: {
    id: number
    status: 'draft' | 'submitted'
    overallScore: number
    createdAt: string
  }
}

export default function JuryFeedbackPage() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubmissions()
  }, [])

  useEffect(() => {
    filterSubmissions()
  }, [submissions, searchTerm, statusFilter])

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      const response = await api.get('/jury/submissions')
      setSubmissions(response.data.submissions || [])
    } catch (err) {
      console.error('Error fetching submissions:', err)
      toast.error('Failed to load submissions')
    } finally {
      setLoading(false)
    }
  }

  const filterSubmissions = () => {
    let filtered = [...submissions]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(submission =>
        submission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.groupName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(submission => {
        if (statusFilter === 'pending') {
          return !submission.feedback
        } else if (statusFilter === 'draft') {
          return submission.feedback?.status === 'draft'
        } else if (statusFilter === 'completed') {
          return submission.feedback?.status === 'submitted'
        }
        return true
      })
    }

    setFilteredSubmissions(filtered)
  }

  const getStatusBadge = (submission: Submission) => {
    if (!submission.feedback) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending Review</Badge>
    } else if (submission.feedback.status === 'draft') {
      return <Badge variant="outline" className="bg-gray-100 text-gray-800">Draft</Badge>
    } else {
      return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>
    }
  }

  const getAverageScore = (submission: Submission) => {
    if (!submission.feedback) return null
    return submission.feedback.overallScore
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
      <AuthenticatedLayout allowedRoles={['JURY']}>
        <div className="p-6 space-y-6">
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
    <AuthenticatedLayout allowedRoles={['JURY']}>
      <div className="p-6 space-y-6">
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
              <h1 className="text-2xl font-bold text-gray-900">Feedback Management</h1>
              <p className="text-gray-600">Review and provide feedback on submissions</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search submissions, participants, or groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('all')}
            >
              All ({submissions.length})
            </Button>
            <Button
              variant={statusFilter === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('pending')}
            >
              Pending ({submissions.filter(s => !s.feedback).length})
            </Button>
            <Button
              variant={statusFilter === 'draft' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('draft')}
            >
              Draft ({submissions.filter(s => s.feedback?.status === 'draft').length})
            </Button>
            <Button
              variant={statusFilter === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('completed')}
            >
              Completed ({submissions.filter(s => s.feedback?.status === 'submitted').length})
            </Button>
          </div>
        </div>

        {/* Submissions List */}
        <div className="space-y-4">
          {filteredSubmissions.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No submissions found</p>
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
            filteredSubmissions.map((submission) => (
              <Card key={submission.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold">{submission.title}</h3>
                        {getStatusBadge(submission)}
                      </div>
                      <p className="text-gray-600 text-sm">{submission.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Participant: {submission.participantName}</span>
                        <span>Group: {submission.groupName}</span>
                        <span>Submitted: {formatDate(submission.createdAt)}</span>
                      </div>
                      {submission.feedback && (
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400" />
                            <span>Score: {getAverageScore(submission)}/5</span>
                          </div>
                          <span>Reviewed: {formatDate(submission.feedback.createdAt)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/jury/feedback/${submission.id}`)}
                        className="flex items-center space-x-2"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>
                          {submission.feedback ? 'View Feedback' : 'Provide Feedback'}
                        </span>
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
