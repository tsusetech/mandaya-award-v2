'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  ArrowLeft, 
  Search, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  MessageSquare, 
  XCircle, 
  Users, 
  BarChart3, 
  Brain, 
  Target, 
  Trophy,
  Award,
  TrendingUp,
  Activity,
  Star,
  Zap,
  Filter,
  Eye,
  Play
} from 'lucide-react'
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
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/40'
      case 'submitted':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/40'
      case 'needs_revision':
        return 'text-red-600 bg-red-100 dark:bg-red-900/40'
      case 'resubmitted':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/40'
      case 'approved':
        return 'text-green-600 bg-green-100 dark:bg-green-900/40'
      case 'completed':
        return 'text-green-600 bg-green-100 dark:bg-green-900/40'
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/40'
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
      <AuthenticatedLayout allowedRoles={['PESERTA', 'SUPERADMIN']}>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div className="p-6 space-y-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
              <div className="space-y-4">
                <div className="h-12 bg-gray-200 rounded"></div>
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
    <AuthenticatedLayout allowedRoles={['PESERTA', 'SUPERADMIN']}>
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
                  <span>Back to Dashboard</span>
                </Button>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg border-2 border-yellow-400/50 relative">
                    <FileText className="h-8 w-8 text-white" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-400 bg-clip-text text-transparent">
                      My Submissions
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      View and track all your submissions
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  onClick={() => router.push('/peserta/groups')}
                  className="flex items-center space-x-2 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 transition-all duration-200 transform hover:scale-105"
                >
                  <Play className="h-4 w-4" />
                  <span>Start Assessment</span>
                </Button>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 px-4 py-2 rounded-full backdrop-blur-sm border border-yellow-200/50 dark:border-yellow-800/50">
                  <Zap className="h-4 w-4 text-green-500" />
                  <span className="font-medium">{submissions.length} Submissions</span>
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
              <div className="flex flex-col space-y-6">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search submissions by group name..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-12 h-12 border-gray-300 focus:border-yellow-500 focus:ring-yellow-500/20 dark:border-gray-600 dark:bg-gray-800 dark:focus:border-yellow-400 transition-all duration-200"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Filter className="h-4 w-4" />
                    <span>Filter by status:</span>
                  </div>
                  <Button
                    variant={statusFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusFilter('all')}
                    className="bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white border-0 shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 transition-all duration-200"
                  >
                    All
                  </Button>
                  <Button
                    variant={statusFilter === 'draft' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusFilter('draft')}
                    className="border-yellow-200/50 dark:border-yellow-800/50 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                  >
                    Draft
                  </Button>
                  <Button
                    variant={statusFilter === 'submitted' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusFilter('submitted')}
                    className="border-yellow-200/50 dark:border-yellow-800/50 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                  >
                    Submitted
                  </Button>
                  <Button
                    variant={statusFilter === 'needs_revision' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusFilter('needs_revision')}
                    className="border-yellow-200/50 dark:border-yellow-800/50 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                  >
                    Needs Revision
                  </Button>
                  <Button
                    variant={statusFilter === 'resubmitted' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusFilter('resubmitted')}
                    className="border-yellow-200/50 dark:border-yellow-800/50 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                  >
                    Resubmitted
                  </Button>
                  <Button
                    variant={statusFilter === 'approved' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusFilter('approved')}
                    className="border-yellow-200/50 dark:border-yellow-800/50 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                  >
                    Approved
                  </Button>
                  <Button
                    variant={statusFilter === 'completed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusFilter('completed')}
                    className="border-yellow-200/50 dark:border-yellow-800/50 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                  >
                    Completed
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submissions List */}
          <div className="space-y-6">
            {filteredSubmissions.length === 0 ? (
              <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 to-gray-600/5"></div>
                <CardContent className="relative z-10 py-16">
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 to-gray-700 flex items-center justify-center">
                      <FileText className="h-16 w-16 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No submissions found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 text-lg">
                      {searchTerm || statusFilter !== 'all'
                        ? 'Try adjusting your filters'
                        : 'Create your first submission to get started'}
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
              filteredSubmissions.map((submission) => (
                <Card key={submission.id} className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-yellow-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardContent className="relative z-10 p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div className={`p-4 rounded-2xl ${getStatusColor(submission.combinedStatus)} group-hover:scale-110 transition-all duration-300`}>
                            {getStatusIcon(submission.combinedStatus)}
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                              {submission.groupName}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                              Submitted on {new Date(submission.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center space-x-6">
                          <div className="flex items-center space-x-2">
                            <BarChart3 className="h-4 w-4 text-blue-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                              Progress: {submission.progressPercentage}%
                            </span>
                          </div>
                          {submission.revisionCount > 0 && (
                            <div className="flex items-center space-x-2">
                              <RefreshCw className="h-4 w-4 text-orange-500" />
                              <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                                Revisions: {submission.revisionCount}
                              </span>
                            </div>
                          )}
                        </div>
                        {submission.feedback && (
                          <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-200/50 dark:border-orange-800/50">
                            <div className="flex items-center space-x-2 mb-2">
                              <MessageSquare className="h-5 w-5 text-orange-500" />
                              <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">Feedback:</span>
                            </div>
                            <p className="text-sm text-orange-600 dark:text-orange-400">{submission.feedback}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        <Button
                          onClick={() => router.push(`/peserta/assessment/${submission.groupId}`)}
                          className="flex items-center space-x-2 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 transition-all duration-200 transform hover:scale-105 px-6 py-3"
                        >
                          {submission.combinedStatus === 'draft' ? (
                            <>
                              <Play className="h-5 w-5" />
                              <span className="font-semibold">Start Assessment</span>
                            </>
                          ) : (
                            <>
                              <Eye className="h-5 w-5" />
                              <span className="font-semibold">Continue Assessment</span>
                            </>
                          )}
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
