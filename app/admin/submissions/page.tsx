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
  Trophy
} from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'

interface Submission {
  id: number
  groupId: number
  groupName: string
  userName: string
  userEmail: string
  status: 'draft' | 'in_progress' | 'submitted' | 'pending_review' | 'under_review' | 'needs_revision' | 'resubmitted' | 'approved' | 'rejected' | 'passed_to_jury' | 'jury_scoring' | 'jury_deliberation' | 'final_decision' | 'completed'
  combinedStatus: 'draft' | 'in_progress' | 'submitted' | 'pending_review' | 'under_review' | 'needs_revision' | 'resubmitted' | 'approved' | 'rejected' | 'passed_to_jury' | 'jury_scoring' | 'jury_deliberation' | 'final_decision' | 'completed'
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
      toast.error('Failed to load submissions')
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
      case 'draft':
        return 'text-gray-500 bg-gray-50'
      case 'in_progress':
        return 'text-yellow-500 bg-yellow-50'
      case 'submitted':
        return 'text-blue-500 bg-blue-50'
      case 'pending_review':
        return 'text-orange-500 bg-orange-50'
      case 'under_review':
        return 'text-purple-500 bg-purple-50'
      case 'needs_revision':
        return 'text-red-500 bg-red-50'
      case 'resubmitted':
        return 'text-blue-500 bg-blue-50'
      case 'approved':
        return 'text-green-500 bg-green-50'
      case 'rejected':
        return 'text-red-500 bg-red-50'
      case 'passed_to_jury':
        return 'text-indigo-500 bg-indigo-50'
      case 'jury_scoring':
        return 'text-purple-500 bg-purple-50'
      case 'jury_deliberation':
        return 'text-indigo-500 bg-indigo-50'
      case 'final_decision':
        return 'text-amber-500 bg-amber-50'
      case 'completed':
        return 'text-green-500 bg-green-50'
      default:
        return 'text-gray-500 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <FileText className="h-5 w-5" />
      case 'in_progress':
        return <Clock className="h-5 w-5" />
      case 'submitted':
        return <FileText className="h-5 w-5" />
      case 'pending_review':
        return <Clock className="h-5 w-5" />
      case 'under_review':
        return <Search className="h-5 w-5" />
      case 'needs_revision':
        return <AlertTriangle className="h-5 w-5" />
      case 'resubmitted':
        return <RefreshCw className="h-5 w-5" />
      case 'approved':
        return <CheckCircle className="h-5 w-5" />
      case 'rejected':
        return <XCircle className="h-5 w-5" />
      case 'passed_to_jury':
        return <Users className="h-5 w-5" />
      case 'jury_scoring':
        return <BarChart3 className="h-5 w-5" />
      case 'jury_deliberation':
        return <Brain className="h-5 w-5" />
      case 'final_decision':
        return <Target className="h-5 w-5" />
      case 'completed':
        return <Trophy className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Draft'
      case 'in_progress':
        return 'In Progress'
      case 'submitted':
        return 'Submitted'
      case 'pending_review':
        return 'Pending Review'
      case 'under_review':
        return 'Under Review'
      case 'needs_revision':
        return 'Needs Revision'
      case 'resubmitted':
        return 'Resubmitted'
      case 'approved':
        return 'Approved'
      case 'rejected':
        return 'Rejected'
      case 'passed_to_jury':
        return 'Passed to Jury'
      case 'jury_scoring':
        return 'Jury Scoring'
      case 'jury_deliberation':
        return 'Jury Deliberation'
      case 'final_decision':
        return 'Final Decision'
      case 'completed':
        return 'Completed'
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 py-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.push('/admin')}
                  className="flex items-center space-x-2 w-fit"
                >
                  <span>Back to Dashboard</span>
                </Button>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Assessment Submissions</h1>
                  <p className="text-sm sm:text-base text-gray-600">Review and manage assessment submissions</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchSubmissions}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
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
                  placeholder="Search by group name, user name, or email..."
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
                  Drafts
                </Button>
                <Button
                  variant={statusFilter === 'in_progress' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusFilter('in_progress')}
                >
                  In Progress
                </Button>
                <Button
                  variant={statusFilter === 'submitted' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusFilter('submitted')}
                >
                  Submitted
                </Button>
                <Button
                  variant={statusFilter === 'pending_review' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusFilter('pending_review')}
                >
                  Pending Review
                </Button>
                <Button
                  variant={statusFilter === 'under_review' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusFilter('under_review')}
                >
                  Under Review
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
                  Approved
                </Button>
                <Button
                  variant={statusFilter === 'rejected' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusFilter('rejected')}
                >
                  Rejected
                </Button>
                <Button
                  variant={statusFilter === 'passed_to_jury' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusFilter('passed_to_jury')}
                >
                  Passed to Jury
                </Button>
                <Button
                  variant={statusFilter === 'jury_scoring' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusFilter('jury_scoring')}
                >
                  Jury Scoring
                </Button>
                <Button
                  variant={statusFilter === 'jury_deliberation' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusFilter('jury_deliberation')}
                >
                  Jury Deliberation
                </Button>
                <Button
                  variant={statusFilter === 'final_decision' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusFilter('final_decision')}
                >
                  Final Decision
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
                      : 'No submissions have been submitted yet'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredSubmissions.map((submission) => (
              <Card key={submission.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col space-y-4">
                    <div className="flex-1">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg flex-shrink-0 ${getStatusColor(submission.combinedStatus)}`}>
                          {getStatusIcon(submission.combinedStatus)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                            {submission.groupName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Submitted by {submission.userName} ({submission.userEmail})
                          </p>
                          <p className="text-sm text-gray-500">
                            Submitted on {new Date(submission.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-4">
                        <Badge variant="outline" className={getStatusColor(submission.combinedStatus)}>
                          {getStatusLabel(submission.combinedStatus)}
                        </Badge>
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
                            <MessageSquare className="h-4 w-4 text-orange-500 flex-shrink-0" />
                            <span className="text-sm font-medium text-orange-700">Feedback:</span>
                          </div>
                          <p className="text-sm text-orange-600 mt-1 break-words">{submission.feedback}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-end">
                                             <Button
                         variant="outline"
                         onClick={() => router.push(`/admin/submissions/${submission.id}`)}
                         className="flex items-center space-x-2 w-full sm:w-auto"
                       >
                         <Eye className="h-4 w-4" />
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
    </div>
  )
}
