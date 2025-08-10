'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Search, FileText, Clock, CheckCircle, AlertTriangle, RefreshCw, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { getProfile } from '@/lib/auth'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'

interface Submission {
  id: number
  groupId: number
  groupName: string
  status: 'draft' | 'in_progress' | 'submitted' | 'needs_revision' | 'resubmitted' | 'approved_for_jury' | 'with_jury'
  combinedStatus: 'draft' | 'in_progress' | 'submitted' | 'needs_revision' | 'resubmitted' | 'approved_for_jury' | 'with_jury'
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

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      
      let allSubmissions: Submission[] = []
      
      // Try to get user's sessions with review data using the admin endpoint
      
      try {
        // Use the admin endpoint but it will only return current user's sessions
        const sessionsRes = await api.get('/assessments/user-sessions', {
          params: {
            page: 1,
            limit: 50,
            status: statusFilter !== 'all' ? statusFilter : undefined
          }
        })
        console.log('User sessions response:', sessionsRes.data)
        
        if (sessionsRes.data && Array.isArray(sessionsRes.data.data)) {
          // Transform the user sessions data to match our Submission interface
          allSubmissions = sessionsRes.data.data.map((session: any) => ({
            id: session.id,
            groupId: session.groupId,
            groupName: session.groupName || `Group ${session.groupId}`,
            status: session.status,
            combinedStatus: session.combinedStatus || session.status,
            submittedAt: session.submittedAt || session.lastActivityAt,
            updatedAt: session.lastActivityAt,
            progressPercentage: session.progressPercentage || 0,
            feedback: session.reviewComments,
            revisionCount: session.revisionCount || 0
          }))
        } else if (sessionsRes.data && Array.isArray(sessionsRes.data)) {
          allSubmissions = sessionsRes.data.map((session: any) => ({
            id: session.id,
            groupId: session.groupId,
            groupName: session.groupName || `Group ${session.groupId}`,
            status: session.status,
            combinedStatus: session.combinedStatus || session.status,
            submittedAt: session.submittedAt || session.lastActivityAt,
            updatedAt: session.lastActivityAt,
            progressPercentage: session.progressPercentage || 0,
            feedback: session.reviewComments,
            revisionCount: session.revisionCount || 0
          }))
        }
      } catch (error) {
        console.log('Failed to fetch user sessions with review data, falling back to group-based approach:', error)
        
        // Fallback: Get user's assigned groups and fetch individual sessions
        try {
          const groupsRes = await api.get('/groups/my-groups')
          console.log('Groups response:', groupsRes.data)
          const userGroups = Array.isArray(groupsRes.data) ? groupsRes.data : groupsRes.data?.groups || []
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
                  status: session.status,
                  combinedStatus: session.combinedStatus || session.status,
                  submittedAt: session.submittedAt || session.lastActivityAt,
                  updatedAt: session.lastActivityAt,
                  progressPercentage: session.progressPercentage || 0,
                  feedback: session.feedback,
                  revisionCount: session.revisionCount || 0
                }
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
      case 'draft':
        return 'text-gray-500 bg-gray-50'
      case 'in_progress':
        return 'text-yellow-500 bg-yellow-50'
      case 'submitted':
        return 'text-blue-500 bg-blue-50'
      case 'needs_revision':
        return 'text-orange-500 bg-orange-50'
      case 'resubmitted':
        return 'text-purple-500 bg-purple-50'
      case 'approved_for_jury':
        return 'text-green-500 bg-green-50'
      case 'with_jury':
        return 'text-indigo-500 bg-indigo-50'
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
        return <Clock className="h-5 w-5" />
      case 'needs_revision':
        return <AlertTriangle className="h-5 w-5" />
      case 'resubmitted':
        return <RefreshCw className="h-5 w-5" />
      case 'approved_for_jury':
        return <CheckCircle className="h-5 w-5" />
      case 'with_jury':
        return <Clock className="h-5 w-5" />
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
    <AuthenticatedLayout allowedRoles={['PESERTA']}>
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
                    variant={statusFilter === 'approved_for_jury' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusFilter('approved_for_jury')}
                  >
                    Approved
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
