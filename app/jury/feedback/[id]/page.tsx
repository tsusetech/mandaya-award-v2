'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, User, Calendar, FileText, Star } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import FeedbackForm, { FeedbackData } from '@/components/FeedbackSystem/FeedbackForm'
import FeedbackDisplay from '@/components/FeedbackSystem/FeedbackDisplay'
import CommentsSection from '@/components/FeedbackSystem/CommentsSection'
import { getProfile } from '@/lib/auth'

interface Submission {
  id: number
  title: string
  description: string
  status: string
  createdAt: string
  participantName: string
  groupName: string
  content?: string
  files?: {
    id: number
    name: string
    url: string
  }[]
}

interface ExistingFeedback {
  id: number
  submissionId: number
  overallScore: number
  technicalScore: number
  creativityScore: number
  presentationScore: number
  strengths: string
  weaknesses: string
  suggestions: string
  comments: string
  status: 'draft' | 'submitted'
  reviewerName?: string
  createdAt: string
  updatedAt: string
}

export default function SubmissionFeedbackPage() {
  const router = useRouter()
  const { id } = useParams() as { id: string }
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [existingFeedback, setExistingFeedback] = useState<ExistingFeedback | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Use the same endpoint as other pages to get detailed session information
      const sessionRes = await api.get(`/assessments/session/${id}/detail`)
      console.log('Juri feedback session detail response:', sessionRes.data)
      
      if (!sessionRes.data) {
        throw new Error('Session not found')
      }
      
      const sessionData = sessionRes.data
      
      // Transform session data to match Submission interface
      const submissionData = {
        id: sessionData.id,
        title: sessionData.groupName || `Assessment ${sessionData.id}`,
        description: sessionData.review?.overallComments || 'No description available',
        content: sessionData.questions?.map((q: any) => 
          `${q.questionText}: ${q.response || 'No response'}`
        ).join('\n\n'),
        files: [], // No files in current implementation
        createdAt: sessionData.submittedAt || sessionData.createdAt,
        participantName: sessionData.user?.name || 'Unknown',
        groupName: sessionData.groupName || 'Unknown Group'
      }
      
      setSubmission(submissionData)
      
      // Check for existing juri feedback
      if (sessionData.review && sessionData.review.stage === 'juri_scoring') {
        setExistingFeedback({
          id: sessionData.review.id,
          status: sessionData.review.status,
          scores: sessionData.review.juryScores || [],
          overallComments: sessionData.review.overallComments || '',
          createdAt: sessionData.review.createdAt,
          updatedAt: sessionData.review.updatedAt
        })
      } else {
        setExistingFeedback(null)
      }
      
      const profile = await getProfile()
      setCurrentUser(profile)
    } catch (err) {
      console.error('Error fetching submission data:', err)
      toast.error('Failed to load submission')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitFeedback = async (feedback: FeedbackData) => {
    try {
      // Use the assessment review endpoint for juri feedback
      const reviewPayload = {
        stage: 'juri_scoring',
        decision: 'pass_to_jury',
        overallComments: feedback.overallComments || '',
        questionComments: feedback.scores?.map(score => ({
          questionId: score.questionId,
          comment: score.comments || '',
          isCritical: false,
          stage: 'juri_scoring'
        })) || [],
        juryScores: feedback.scores?.map(score => ({
          questionId: score.questionId,
          score: score.score,
          comments: score.comments || ''
        })) || [],
        totalScore: feedback.scores?.reduce((sum, score) => sum + score.score, 0) || 0,
        deliberationNotes: '',
        internalNotes: '',
        validationChecklist: [],
        updateExisting: true
      }
      
      console.log('Juri feedback payload:', reviewPayload)
      
      const response = await api.post(`/assessments/session/${id}/review/batch`, reviewPayload)
      
      // Update existing feedback with the response
      setExistingFeedback({
        id: response.data.reviewId || response.data.id,
        status: 'completed',
        scores: feedback.scores || [],
        overallComments: feedback.overallComments || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      
      setShowFeedbackForm(false)
      toast.success('Feedback submitted successfully')
    } catch (err) {
      console.error('Error submitting feedback:', err)
      toast.error('Failed to submit feedback')
      throw err
    }
  }

  const handleSaveDraft = async (feedback: FeedbackData) => {
    try {
      const response = await api.post(`/submissions/${id}/feedback/draft`, feedback)
      setExistingFeedback(response.data.feedback)
      toast.success('Draft saved successfully')
    } catch (err) {
      console.error('Error saving draft:', err)
      toast.error('Failed to save draft')
      throw err
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <AuthenticatedLayout allowedRoles={['JURI', 'SUPERADMIN']}>
        <div className="p-4 sm:p-6 space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="space-y-4">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    )
  }

  if (!submission) {
    return (
      <AuthenticatedLayout allowedRoles={['JURI', 'SUPERADMIN']}>
        <div className="p-4 sm:p-6">
          <div className="text-center">
            <p className="text-gray-500">Submission not found</p>
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
              onClick={() => router.push('/juri/feedback')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Feedback</span>
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Submission Review</h1>
              <p className="text-sm sm:text-base text-gray-600">Provide feedback for: {submission.title}</p>
            </div>
          </div>
          {!existingFeedback && !showFeedbackForm && (
            <Button
              onClick={() => setShowFeedbackForm(true)}
              className="flex items-center space-x-2"
            >
              <Star className="h-4 w-4" />
              <span>Provide Feedback</span>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submission Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Submission Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Submission Details</span>
                  <Badge variant={submission.status === 'submitted' ? 'default' : 'secondary'}>
                    {submission.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{submission.title}</h3>
                  <p className="text-gray-600 mt-2">{submission.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>Participant: {submission.participantName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span>Group: {submission.groupName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>Submitted: {formatDate(submission.createdAt)}</span>
                  </div>
                </div>

                {submission.content && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Content</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{submission.content}</p>
                    </div>
                  </div>
                )}

                {submission.files && submission.files.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Attached Files</h4>
                    <div className="space-y-2">
                      {submission.files.map((file) => (
                        <div key={file.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{file.name}</span>
                          <Button variant="outline" size="sm" asChild>
                            <a href={file.url} target="_blank" rel="noopener noreferrer">
                              View
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Feedback Form or Display */}
            {showFeedbackForm ? (
              <FeedbackForm
                submissionId={submission.id}
                onSubmit={handleSubmitFeedback}
                onSaveDraft={handleSaveDraft}
                initialData={existingFeedback || undefined}
              />
            ) : existingFeedback ? (
              <FeedbackDisplay
                feedback={existingFeedback}
                showReviewerInfo={false}
              />
            ) : null}

            {/* Comments Section */}
            {currentUser && (
              <CommentsSection
                submissionId={submission.id}
                currentUserRole={currentUser.userRoles?.[0]?.role?.name || 'JURI'}
                currentUserName={currentUser.name || currentUser.username}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!existingFeedback && !showFeedbackForm && (
                  <Button
                    onClick={() => setShowFeedbackForm(true)}
                    className="w-full"
                  >
                    Start Review
                  </Button>
                )}
                {existingFeedback && existingFeedback.status === 'draft' && (
                  <Button
                    onClick={() => setShowFeedbackForm(true)}
                    variant="outline"
                    className="w-full"
                  >
                    Continue Draft
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => router.push('/juri/feedback')}
                  className="w-full"
                >
                  Back to List
                </Button>
              </CardContent>
            </Card>

            {/* Review Status */}
            <Card>
              <CardHeader>
                <CardTitle>Review Status</CardTitle>
              </CardHeader>
              <CardContent>
                {!existingFeedback ? (
                  <div className="text-center py-4">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Pending Review</p>
                  </div>
                ) : existingFeedback.status === 'draft' ? (
                  <div className="text-center py-4">
                    <div className="w-3 h-3 bg-gray-400 rounded-full mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Draft Saved</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Last updated: {formatDate(existingFeedback.updatedAt)}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-3 h-3 bg-green-400 rounded-full mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Review Completed</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Submitted: {formatDate(existingFeedback.createdAt)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
