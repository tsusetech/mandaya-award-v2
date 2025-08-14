'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Save, Send, Download, FileText, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'

interface Question {
  id: number
  questionText: string
  description?: string
  inputType: string
  response: {
    textValue?: string
    numericValue?: number
    booleanValue?: boolean
    arrayValue?: any[]
  }
}

interface Review {
  id: number
  status: string
  overallComments?: string
  scores: {
    questionId: number
    score: number
    comments?: string
  }[]
}

export default function ReviewPage() {
  const router = useRouter()
  const { id } = useParams() as { id: string }
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submission, setSubmission] = useState<any>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [review, setReview] = useState<Review | null>(null)
  const [scores, setScores] = useState<Record<number, number>>({})
  const [comments, setComments] = useState<Record<number, string>>({})
  const [overallComments, setOverallComments] = useState('')

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Use the same endpoint as admin and peserta to get detailed session information
      const sessionRes = await api.get(`/assessments/session/${id}/detail`)
      console.log('Juri session detail response:', sessionRes.data)
      
      if (!sessionRes.data) {
        throw new Error('Session not found')
      }
      
      const sessionData = sessionRes.data
      setSubmission(sessionData)
      setQuestions(sessionData.questions || [])
      
      // Check if there's an existing juri review
      if (sessionData.review && sessionData.review.stage === 'juri_scoring') {
        setReview(sessionData.review)
        // Initialize scores and comments from existing review
        const initialScores: Record<number, number> = {}
        const initialComments: Record<number, string> = {}
        
        if (sessionData.review.juriScores) {
          sessionData.review.juriScores.forEach((score: any) => {
            initialScores[score.questionId] = score.score
            if (score.comments) initialComments[score.questionId] = score.comments
          })
        }
        
        setScores(initialScores)
        setComments(initialComments)
        setOverallComments(sessionData.review.overallComments || '')
      }
    } catch (err) {
      console.error('Error fetching review data:', err)
      toast.error('Failed to load submission')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const handleScoreChange = (questionId: number, score: number) => {
    if (score < 0) score = 0
    if (score > 10) score = 10
    setScores(prev => ({ ...prev, [questionId]: score }))
  }

  const handleCommentChange = (questionId: number, comment: string) => {
    setComments(prev => ({ ...prev, [questionId]: comment }))
  }

  const validateScores = () => {
    const missingScores = questions.filter(q => !scores[q.id])
    if (missingScores.length > 0) {
      toast.error('Please provide scores for all questions')
      return false
    }
    return true
  }

  const handleSave = async (asDraft: boolean = true) => {
    if (!asDraft && !validateScores()) return

    try {
      setSaving(true)
      
      // Use the assessment review endpoint for juri scoring
      const reviewPayload = {
        stage: 'juri_scoring',
        decision: asDraft ? 'needs_deliberation' : 'pass_to_jury',
        overallComments: overallComments,
        questionComments: Object.entries(comments).map(([questionId, comment]) => ({
          questionId: parseInt(questionId),
          comment: comment,
          isCritical: false,
          stage: 'juri_scoring'
        })),
        juryScores: Object.entries(scores).map(([questionId, score]) => ({
          questionId: parseInt(questionId),
          score: score,
          comments: comments[parseInt(questionId)] || ''
        })),
        totalScore: Object.values(scores).reduce((sum, score) => sum + score, 0),
        deliberationNotes: '',
        internalNotes: '',
        validationChecklist: [],
        updateExisting: true
      }
      
      console.log('Juri review payload:', reviewPayload)
      
      await api.post(`/assessments/session/${id}/review/batch`, reviewPayload)
      
      toast.success(asDraft ? 'Review saved as draft' : 'Review submitted successfully')
      if (!asDraft) router.push('/juri')
    } catch (err) {
      console.error('Error saving review:', err)
      toast.error('Failed to save review')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AuthenticatedLayout allowedRoles={['JURI', 'SUPERADMIN']}>
        <div className="p-4 sm:p-6 space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="h-32 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
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
              onClick={() => router.push('/juri')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Review Submission</h1>
              <p className="text-sm sm:text-base text-gray-600">Score and provide feedback</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => handleSave(true)}
              disabled={saving}
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving...' : 'Save Draft'}</span>
            </Button>
            <Button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex items-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>{saving ? 'Submitting...' : 'Submit Review'}</span>
            </Button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto space-y-6">
          {/* Submission Info */}
          <Card>
            <CardHeader>
              <CardTitle>Submission Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Title</h3>
                  <p className="mt-1 text-gray-900">{submission.title}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Submitted By</h3>
                  <p className="mt-1 text-gray-900">{submission.user?.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Group</h3>
                  <p className="mt-1 text-gray-900">{submission.group?.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Submitted On</h3>
                  <p className="mt-1 text-gray-900">
                    {new Date(submission.submittedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {submission.files?.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Attached Files</h3>
                  <div className="space-y-2">
                    {submission.files.map((file: any) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-900">{file.name}</span>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={file.url} download>
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Questions and Scoring */}
          {questions.map((question) => (
            <Card key={question.id}>
              <CardHeader>
                <CardTitle className="text-base">{question.questionText}</CardTitle>
                {question.description && (
                  <p className="text-sm text-gray-500">{question.description}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Response */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Response</h4>
                  <div className="text-gray-900">
                    {question.response.textValue ||
                      question.response.numericValue?.toString() ||
                      (Array.isArray(question.response.arrayValue)
                        ? question.response.arrayValue.join(', ')
                        : question.response.arrayValue) ||
                      (question.response.booleanValue ? 'Yes' : 'No')}
                  </div>
                </div>

                {/* Scoring */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Score (0-10)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    value={scores[question.id] || ''}
                    onChange={(e) => handleScoreChange(question.id, parseFloat(e.target.value))}
                    className="w-32"
                  />
                </div>

                {/* Comments */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comments
                  </label>
                  <Textarea
                    value={comments[question.id] || ''}
                    onChange={(e) => handleCommentChange(question.id, e.target.value)}
                    placeholder="Add your comments about this response..."
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Overall Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Overall Comments</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={overallComments}
                onChange={(e) => setOverallComments(e.target.value)}
                placeholder="Provide overall feedback about this submission..."
                className="min-h-[150px]"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
