'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Search, FileText, Clock, CheckCircle, AlertTriangle, RefreshCw, MessageSquare, XCircle, Users, BarChart3, Brain, Target, Trophy } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { getProfile } from '@/lib/auth'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'

interface Submission {
  id: number
  groupId: number
  groupName: string
  status: 'in_progress' | 'submitted' | 'needs_revision' | 'resubmitted' | 'approved' | 'completed'
  combinedStatus: 'in_progress' | 'submitted' | 'needs_revision' | 'resubmitted' | 'approved' | 'completed'
  submittedAt: string
  updatedAt: string
  progressPercentage: number
  feedback?: string
  revisionCount: number
}

export default function SubmissionsPage() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  // Function to fetch review data for a session
  const fetchSessionReviews = async (sessionId: number) => {
    try {
      const reviewsRes = await api.get(`/assessments/session/${sessionId}/reviews`)
      console.log(`Reviews for session ${sessionId}:`, reviewsRes.data)
      return reviewsRes.data
    } catch (error) {
      console.error('Error fetching session reviews:', error)
      return []
    }
  }

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      
      let allSubmissions: Submission[] = []
      let userGroups: any[] = []
      
      // Try to get user's sessions with review data using the admin endpoint
      
      try {
        // Try to get user's sessions - first try the user-sessions endpoint
        let sessionsRes
        try {
          sessionsRes = await api.get('/assessments/user-sessions', {
            params: {
              page: 1,
              limit: 50,
              status: statusFilter !== 'all' ? statusFilter : undefined
            }
          })
        } catch (userSessionsError) {
          console.log('user-sessions endpoint not available, trying alternative approach:', userSessionsError)
          // If user-sessions fails, try to get sessions through groups
          throw new Error('user-sessions endpoint not available')
        }
        console.log('User sessions response:', sessionsRes.data)
        console.log('Response structure:', {
          hasData: !!sessionsRes.data,
          isDataArray: Array.isArray(sessionsRes.data),
          hasDataData: !!sessionsRes.data?.data,
          isDataDataArray: Array.isArray(sessionsRes.data?.data),
          dataLength: sessionsRes.data?.data?.length
        })
        
                 if (sessionsRes.data?.data && Array.isArray(sessionsRes.data.data)) {
           console.log('Starting to map sessions data...')
           // Transform the user sessions data to match our Submission interface
           allSubmissions = await Promise.all(sessionsRes.data.data.map(async (session: any) => {
             // If there's a review, fetch review data
             let sessionReviews = []
             if (session.status === 'needs_revision' || session.reviewStage === 'needs_revision') {
               console.log(`Fetching review data for session ${session.id}...`)
               sessionReviews = await fetchSessionReviews(session.id)
             }
             
             const submission = {
               id: session.id,
               groupId: session.groupId,
               groupName: session.groupName || `Group ${session.groupId}`,
               status: session.status,
               combinedStatus: session.status,
               submittedAt: session.submittedAt || session.lastActivityAt,
               updatedAt: session.lastActivityAt,
               progressPercentage: session.progressPercentage || 0,
               feedback: sessionReviews.length > 0 ? sessionReviews[0]?.overallComments : session.reviewComments,
               revisionCount: 0 // This field might not be available in the current response
             }
             console.log('Created submission with status:', {
               status: session.status,
               finalCombinedStatus: submission.combinedStatus
             })
             console.log('Review data available:', {
               sessionReviews: sessionReviews.length,
               reviews: sessionReviews,
               reviewComments: session.reviewComments,
               finalFeedback: submission.feedback
             })
             return submission
           }))
                  } else if (sessionsRes.data && Array.isArray(sessionsRes.data)) {
           allSubmissions = sessionsRes.data.map((session: any) => {
             const submission = {
               id: session.id,
               groupId: session.groupId,
               groupName: session.groupName || `Group ${session.groupId}`,
               status: session.status,
               combinedStatus: session.status,
               submittedAt: session.submittedAt || session.lastActivityAt,
               updatedAt: session.lastActivityAt,
               progressPercentage: session.progressPercentage || 0,
               feedback: session.reviewComments,
               revisionCount: 0
             }
             console.log('Created submission (array) with status:', {
               status: session.status,
               finalCombinedStatus: submission.combinedStatus
             })
             return submission
           })
         }
      } catch (error) {
        console.log('Failed to fetch user sessions, using group-based approach:', error)
        
        // Use group-based approach to get user's sessions
        try {
          const groupsRes = await api.get('/groups/my-groups')
          console.log('Groups response:', groupsRes.data)
          userGroups = Array.isArray(groupsRes.data) ? groupsRes.data : groupsRes.data?.groups || []
          console.log('User groups:', userGroups)
          
          // Process each group
          for (const userGroup of userGroups) {
            try {
              const groupId = userGroup.id
              console.log(`Fetching session for group ${groupId}...`)
              const res = await api.get(`/assessments/session/${groupId}`)
              const session = res.data
              console.log(`Session data for group ${groupId}:`, session)
              
              if (session) {
                const submission = {
                  id: session.id,
                  groupId: session.groupId,
                  groupName: session.groupName || userGroup.groupName || `Group ${session.groupId}`,
                  status: session.finalStatus || session.status,
                  combinedStatus: session.finalStatus || session.combinedStatus || session.status,
                  submittedAt: session.submittedAt || session.lastActivityAt,
                  updatedAt: session.lastActivityAt,
                  progressPercentage: session.progressPercentage || 0,
                  feedback: session.feedback,
                  revisionCount: session.revisionCount || 0
                }
                console.log('Created submission (fallback) with status:', {
                  finalStatus: session.finalStatus,
                  status: session.status,
                  combinedStatus: session.combinedStatus,
                  finalCombinedStatus: submission.combinedStatus
                })
                console.log(`Created submission object:`, submission)
                allSubmissions.push(submission)
              }
            } catch (error) {
              console.log(`Failed to process group ${userGroup.id}:`, error)
              // Continue with other groups even if one fails
            }
          }
        } catch (groupsError) {
          console.log('Failed to fetch groups:', groupsError)
        }
      }
      
      console.log('All submissions before fallback:', allSubmissions)
      
      // If no sessions found, create placeholder submissions for each group
      if (allSubmissions.length === 0 && userGroups.length > 0) {
        console.log('No sessions found, creating placeholder submissions')
        allSubmissions = userGroups.map((userGroup: any, index: number) => ({
          id: index + 1, // Temporary ID
          groupId: userGroup.id,
          groupName: userGroup.groupName || `Group ${userGroup.id}`,
          status: 'draft' as const,
          combinedStatus: 'draft' as const,
          submittedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          progressPercentage: 0,
          revisionCount: 0
        }))
      }
      
      console.log('Final allSubmissions:', allSubmissions)
      console.log('Final submission statuses:', allSubmissions.map(s => ({
        id: s.id,
        status: s.status,
        combinedStatus: s.combinedStatus
      })))
      setSubmissions(allSubmissions)
      setFilteredSubmissions(allSubmissions)
    } catch (err) {
      console.error('Error fetching submissions:', err)
      toast.error('Failed to load submissions')
      // Set empty array to prevent further errors
      setSubmissions([])
      setFilteredSubmissions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubmissions()
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
        submission.groupName.toLowerCase().includes(term.toLowerCase())
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
        return 'text-blue-500 bg-blue-50'
      case 'submitted':
        return 'text-blue-500 bg-blue-50'
      case 'needs_revision':
        return 'text-red-500 bg-red-50'
      case 'resubmitted':
        return 'text-blue-500 bg-blue-50'
      case 'approved':
        return 'text-green-500 bg-green-50'
      case 'completed':
        return 'text-green-500 bg-green-50'
      default:
        return 'text-gray-500 bg-gray-50'
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
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AuthenticatedLayout allowedRoles={['PESERTA', 'SUPERADMIN']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.push('/peserta')}
                  className="flex items-center space-x-2 w-fit"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Dashboard</span>
                </Button>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Submissions</h1>
                  <p className="text-sm sm:text-base text-gray-600">View and track all your submissions</p>
                </div>
              </div>
              <Button 
                onClick={() => router.push('/peserta/groups')}
                className="flex items-center space-x-2 w-full sm:w-auto"
              >
                <FileText className="h-4 w-4" />
                <span>Start Assessment</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col space-y-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search submissions..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant={statusFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={statusFilter === 'draft' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusFilter('draft')}
                  >
                    Draft
                  </Button>
                  <Button
                    variant={statusFilter === 'submitted' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusFilter('submitted')}
                  >
                    Submitted
                  </Button>
                  <Button
                    variant={statusFilter === 'needs_revision' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusFilter('needs_revision')}
                  >
                    Needs Revision
                  </Button>
                  <Button
                    variant={statusFilter === 'resubmitted' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusFilter('resubmitted')}
                  >
                    Resubmitted
                  </Button>
                  <Button
                    variant={statusFilter === 'approved' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusFilter('approved')}
                  >
                    Approve to Jury
                  </Button>
                  <Button
                    variant={statusFilter === 'completed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusFilter('completed')}
                  >
                    Completed
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submissions List */}
          <div className="space-y-4">
            {filteredSubmissions.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No submissions found</p>
                    <p className="text-sm text-gray-400">
                      {searchTerm || statusFilter !== 'all'
                        ? 'Try adjusting your filters'
                        : 'Create your first submission to get started'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredSubmissions.map((submission) => (
                <Card key={submission.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${getStatusColor(submission.combinedStatus)}`}>
                            {getStatusIcon(submission.combinedStatus)}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {submission.groupName}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Submitted on {new Date(submission.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center space-x-4">
                          <span className="text-sm text-gray-500">
                            Progress: {submission.progressPercentage}%
                          </span>
                          {submission.revisionCount > 0 && (
                            <span className="text-sm text-gray-500">
                              Revisions: {submission.revisionCount}
                            </span>
                          )}
                        </div>
                        {submission.feedback && (
                          <div className="mt-3 p-3 bg-orange-50 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <MessageSquare className="h-4 w-4 text-orange-500" />
                              <span className="text-sm font-medium text-orange-700">Feedback:</span>
                            </div>
                            <p className="text-sm text-orange-600 mt-1">{submission.feedback}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => router.push(`/peserta/assessment/${submission.groupId}`)}
                        >
                          {submission.combinedStatus === 'draft' ? 'Start Assessment' : 'Continue Assessment'}
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
