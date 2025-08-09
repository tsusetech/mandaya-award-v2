'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  AlertTriangle, 
  MessageSquare,
  RefreshCw,
  CheckCircle,
  Clock
} from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'

interface Question {
  id: number
  questionText: string
  description?: string
  inputType: string
  sectionTitle: string
  subsection: string
  orderNumber: number
}

interface Response {
  questionId: number
  textValue?: string
  numericValue?: number
  booleanValue?: boolean
  arrayValue?: any[]
  isComplete: boolean
  feedback?: string
  needsRevision?: boolean
}

interface Submission {
  id: number
  groupId: number
  groupName: string
  status: 'submitted' | 'needs_revision' | 'resubmitted' | 'approved_for_jury' | 'with_jury'
  submittedAt: string
  updatedAt: string
  progressPercentage: number
  feedback?: string
  revisionCount: number
  questions: Question[]
  responses: Response[]
}

export default function SubmissionDetailPage() {
  const router = useRouter()
  const { id } = useParams() as { id: string }
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSubmission = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/peserta/submissions/${id}`)
      const submissionData = res.data
      setSubmission(submissionData)
    } catch (err) {
      console.error('Error fetching submission:', err)
      toast.error('Failed to load submission')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubmission()
  }, [id])

  const handleResubmit = async () => {
    if (!submission) return

    try {
      await api.put(`/peserta/submissions/${id}/resubmit`)
      toast.success('Submission resubmitted successfully')
      router.push('/peserta/submissions')
    } catch (err) {
      console.error('Error resubmitting:', err)
      toast.error('Failed to resubmit')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
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
        return <Clock className="h-5 w-5" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'Submitted'
      case 'needs_revision':
        return 'Needs Revision'
      case 'resubmitted':
        return 'Resubmitted'
      case 'approved_for_jury':
        return 'Approved for Jury'
      case 'with_jury':
        return 'With Jury'
      default:
        return status
    }
  }

  const getResponseValue = (response: Response) => {
    return response.textValue || 
           response.numericValue || 
           response.booleanValue || 
           (response.arrayValue ? response.arrayValue.join(', ') : '')
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
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <p className="text-gray-500">Submission not found</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const sections = Array.from(new Set(submission.questions.map(q => q.sectionTitle)))
  const hasRevisions = submission.responses.some(r => r.needsRevision)
  const canResubmit = submission.status === 'needs_revision'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push('/peserta/submissions')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Submissions</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Submission Details</h1>
                <p className="text-gray-600">{submission.groupName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={getStatusColor(submission.status)}>
                {getStatusLabel(submission.status)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Submission Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Group</p>
                <p className="font-medium">{submission.groupName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <div className="flex items-center space-x-2">
                  <div className={`p-1 rounded ${getStatusColor(submission.status)}`}>
                    {getStatusIcon(submission.status)}
                  </div>
                  <span className="font-medium">{getStatusLabel(submission.status)}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Submitted</p>
                <p className="font-medium">
                  {new Date(submission.submittedAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Progress</p>
                <p className="font-medium">{submission.progressPercentage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* General Feedback */}
        {submission.feedback && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>General Feedback</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-orange-700">{submission.feedback}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Questions Review */}
        {sections.map(section => (
          <Card key={section}>
            <CardHeader>
              <CardTitle>{section}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {submission.questions
                .filter(q => q.sectionTitle === section)
                .map(question => {
                  const response = submission.responses.find(r => r.questionId === question.id)
                  return (
                    <div key={question.id} className="border rounded-lg p-4 space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          {question.questionText}
                        </h4>
                        {question.description && (
                          <p className="text-sm text-gray-600 mb-3">{question.description}</p>
                        )}
                        <div className="bg-gray-50 rounded p-3">
                          <p className="text-sm text-gray-600 mb-1">Your Response:</p>
                          <p className="font-medium">
                            {response ? getResponseValue(response) : 'No response'}
                          </p>
                        </div>
                      </div>

                      {response?.feedback && (
                        <div className="p-3 bg-orange-50 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <MessageSquare className="h-4 w-4 text-orange-500" />
                            <span className="text-sm font-medium text-orange-700">Feedback:</span>
                          </div>
                          <p className="text-sm text-orange-600">{response.feedback}</p>
                        </div>
                      )}

                      {response?.needsRevision && (
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          <span className="text-sm text-orange-600 font-medium">
                            This question needs revision
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
            </CardContent>
          </Card>
        ))}

        {/* Action Buttons */}
        {canResubmit && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <span className="text-orange-700">
                    {submission.responses.filter(r => r.needsRevision).length} questions need revision
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Navigate to the assessment page with the group ID
                      // The submission should have a groupId field
                      if (submission.groupId) {
                        router.push(`/peserta/assessment/${submission.groupId}`)
                      } else {
                        // Fallback: try to get groupId from the submission data
                        // This might be needed if the API doesn't return groupId
                        console.error('Submission data:', submission)
                        toast.error('Unable to determine group ID for this submission. Please contact support.')
                      }
                    }}
                  >
                    Edit Assessment
                  </Button>
                  <Button
                    onClick={handleResubmit}
                    className="flex items-center space-x-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Resubmit</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

