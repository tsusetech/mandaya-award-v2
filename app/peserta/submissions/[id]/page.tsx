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
  Clock,
  Trophy
} from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'

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
  status: 'submitted' | 'needs_revision' | 'resubmitted' | 'approved_for_juri' | 'with_juri'
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
      
      // Use the same endpoint as admin review page to get detailed session information
      const sessionRes = await api.get(`/assessments/session/${id}/detail`)
      console.log('Peserta session detail response:', sessionRes.data)
      
      if (!sessionRes.data) {
        throw new Error('Session not found')
      }
      
      const sessionData = sessionRes.data
      
      // Transform the session data to match our Submission interface
      const submissionData: Submission = {
        id: sessionData.id,
        groupId: sessionData.groupId,
        groupName: sessionData.groupName || `Group ${sessionData.groupId}`,
        status: sessionData.status,
        submittedAt: sessionData.submittedAt || sessionData.updatedAt,
        updatedAt: sessionData.updatedAt,
        progressPercentage: sessionData.progressPercentage || 0,
        feedback: sessionData.feedback,
        revisionCount: sessionData.revisionCount || 0,
        questions: sessionData.questions || [],
        responses: (() => {
          // Extract responses directly from questions since they're embedded
          const responsesFromQuestions = sessionData.questions?.map((question: any) => {
            if (question.response !== undefined && question.response !== null && question.response !== '') {
              // Extract feedback from reviewComments if available
              let feedback: string | undefined
              let needsRevision: boolean = false
              
              if (question.reviewComments && Array.isArray(question.reviewComments)) {
                const adminComments = question.reviewComments.filter((comment: any) => 
                  comment.stage === 'admin_validation'
                )
                if (adminComments.length > 0) {
                  feedback = adminComments[0].comment
                  needsRevision = adminComments[0].isCritical || false
                }
              }
              
              // Handle different response types
              if (typeof question.response === 'string') {
                return {
                  questionId: question.id,
                  textValue: question.response,
                  numericValue: undefined,
                  booleanValue: undefined,
                  arrayValue: undefined,
                  isComplete: true,
                  feedback: feedback,
                  needsRevision: needsRevision
                }
              } else if (typeof question.response === 'number') {
                return {
                  questionId: question.id,
                  textValue: undefined,
                  numericValue: question.response,
                  booleanValue: undefined,
                  arrayValue: undefined,
                  isComplete: true,
                  feedback: feedback,
                  needsRevision: needsRevision
                }
              } else if (typeof question.response === 'boolean') {
                return {
                  questionId: question.id,
                  textValue: undefined,
                  numericValue: undefined,
                  booleanValue: question.response,
                  arrayValue: undefined,
                  isComplete: true,
                  feedback: feedback,
                  needsRevision: needsRevision
                }
              } else if (Array.isArray(question.response)) {
                return {
                  questionId: question.id,
                  textValue: undefined,
                  numericValue: undefined,
                  booleanValue: undefined,
                  arrayValue: question.response,
                  isComplete: true,
                  feedback: feedback,
                  needsRevision: needsRevision
                }
              } else if (typeof question.response === 'object' && Object.keys(question.response).length > 0) {
                // Handle object response format
                const response = question.response
                return {
                  questionId: question.id,
                  textValue: response.textValue,
                  numericValue: response.numericValue,
                  booleanValue: response.booleanValue,
                  arrayValue: response.arrayValue,
                  isComplete: response.isComplete || true,
                  feedback: feedback || response.feedback,
                  needsRevision: needsRevision || response.needsRevision || false
                }
              }
            }
            return null
          }).filter(Boolean) || []
          
          console.log('Extracted responses from questions:', responsesFromQuestions)
          return responsesFromQuestions
        })()
      }
      
      console.log('Transformed submission data:', submissionData)
      console.log('Responses with feedback:', submissionData.responses.filter(r => r.feedback))
      console.log('Responses needing revision:', submissionData.responses.filter(r => r.needsRevision))
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
      // Use the assessment session submit endpoint to resubmit
      // submission.id is the session ID, not the group ID
      await api.post(`/assessments/session/${submission.id}/submit`)
      toast.success('Submission resubmitted successfully')
      router.push('/peserta/submissions')
    } catch (err) {
      console.error('Error resubmitting:', err)
      toast.error('Failed to resubmit')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'text-blue-500 bg-blue-50'
      case 'submitted':
        return 'text-blue-500 bg-blue-50'
      case 'needs_revision':
        return 'text-orange-500 bg-orange-50'
      case 'resubmitted':
        return 'text-purple-500 bg-purple-50'
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
        return <Clock className="h-5 w-5" />
      case 'needs_revision':
        return <AlertTriangle className="h-5 w-5" />
      case 'resubmitted':
        return <RefreshCw className="h-5 w-5" />
      case 'approved':
        return <CheckCircle className="h-5 w-5" />
      case 'completed':
        return <Trophy className="h-5 w-5" />
      default:
        return <Clock className="h-5 w-5" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'In Progress'
      case 'submitted':
        return 'Submitted'
      case 'needs_revision':
        return 'Needs Revision'
      case 'resubmitted':
        return 'Resubmitted'
      case 'approved':
        return 'Approve to Jury'
      case 'completed':
        return 'Completed'
      default:
        return status
    }
  }

  const getResponseValue = (response: Response) => {
    if (response.textValue !== undefined && response.textValue !== null) return response.textValue.toString()
    if (response.numericValue !== undefined && response.numericValue !== null) return response.numericValue.toString()
    if (response.booleanValue !== undefined && response.booleanValue !== null) return response.booleanValue ? 'Ya' : 'Tidak'
    if (response.arrayValue && response.arrayValue.length > 0) {
      // Handle file upload responses
      if (response.arrayValue.some((item: any) => typeof item === 'object' && (item.url || item.answer))) {
        return renderFileUploadResponse(response.arrayValue)
      }
      return response.arrayValue.join(', ')
    }
    return 'Tidak ada jawaban'
  }

  const renderFileUploadResponse = (fileResponses: any[]) => {
    return (
      <div className="space-y-3">
        {fileResponses.map((fileResponse: any, index: number) => {
          const isError = fileResponse.answer && fileResponse.answer.includes('Error:')
          const fileName = fileResponse.answer && !isError ? fileResponse.answer : `File ${index + 1}`
          
          return (
            <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="flex-1">
                {isError ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-red-600 dark:text-red-400 text-sm font-medium">
                      Upload Error
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                      File berhasil diunggah
                    </span>
                  </div>
                )}
                
                <div className="mt-2">
                  <p className="text-sm text-gray-700 dark:text-gray-300 break-words">
                    {fileResponse.answer}
                  </p>
                </div>
                
                {fileResponse.url && !isError && (
                  <div className="mt-2">
                    <a
                      href={fileResponse.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>View File</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="relative overflow-hidden -mt-16 pt-16">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
          
          <div className="relative z-10">
            <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-white/20">
              <div className="px-6 py-4">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-48"></div>
                </div>
              </div>
            </div>
            <div className="p-6 max-w-6xl mx-auto">
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
        </div>
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="relative overflow-hidden -mt-16 pt-16">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
          
          <div className="relative z-10">
            <div className="p-6 max-w-6xl mx-auto">
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border-0">
                <CardContent className="py-12">
                  <div className="text-center">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-red-100 to-red-200 mb-4 inline-block">
                      <MessageSquare className="h-8 w-8 text-red-600" />
                    </div>
                    <p className="text-gray-600 text-lg">Pengajuan tidak ditemukan</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const sections = Array.from(new Set(submission.questions.map(q => 
    q.sectionTitle === q.subsection ? q.sectionTitle : `${q.sectionTitle} - ${q.subsection}`
  )))
  const hasRevisions = submission.responses.some(r => r.needsRevision)
  const canResubmit = submission.status === 'needs_revision'

  return (
    <AuthenticatedLayout allowedRoles={['PESERTA', 'SUPERADMIN']}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="relative overflow-hidden -mt-16 pt-16">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
          
          <div className="relative z-10">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-white/20">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => router.push('/peserta/submissions')}
                      className="flex items-center space-x-2 hover:bg-white/50 transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Kembali ke Pengajuan</span>
                    </Button>
                    <div>
                      <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Detail Pengajuan
                      </h1>
                      <p className="text-gray-600">{submission.groupName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={`${getStatusColor(submission.status)} bg-white/20 backdrop-blur-sm border-white/20`}>
                      {getStatusLabel(submission.status)}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Submission Info */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border-0">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-300">
                <p className="text-sm text-gray-600 font-medium mb-2">Kelompok</p>
                <p className="font-semibold text-gray-900 break-words">{submission.groupName}</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all duration-300">
                <p className="text-sm text-gray-600 font-medium mb-2">Status</p>
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-lg ${getStatusColor(submission.status)}`}>
                    {getStatusIcon(submission.status)}
                  </div>
                  <span className="font-semibold text-gray-900">{getStatusLabel(submission.status)}</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-all duration-300">
                <p className="text-sm text-gray-600 font-medium mb-2">Dikirim</p>
                <p className="font-semibold text-gray-900">
                  {new Date(submission.submittedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 transition-all duration-300">
                <p className="text-sm text-gray-600 font-medium mb-2">Kemajuan</p>
                <p className="font-semibold text-gray-900">{submission.progressPercentage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* General Feedback */}
        {submission.feedback && (
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 text-xl">
                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200">
                  <MessageSquare className="h-5 w-5 text-orange-600" />
                </div>
                <span className="text-gray-900 font-bold">Umpan Balik Umum</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                <p className="text-orange-700 font-medium">{submission.feedback}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Questions Review */}
        {sections.map(section => (
          <Card key={section} className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 text-xl">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold">
                  {section}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {submission.questions
                .filter(q => q.sectionTitle === (section.includes(' - ') ? section.split(' - ')[0] : section))
                .map(question => {
                  const response = submission.responses.find(r => r.questionId === question.id)
                  return (
                    <div key={question.id} className="border border-gray-200/50 rounded-xl p-6 space-y-4 bg-gradient-to-r from-gray-50/50 to-gray-100/50 hover:shadow-md transition-all duration-200">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                          {question.questionText}
                        </h4>
                        {question.description && (
                          <p className="text-sm text-gray-600 mb-4">{question.description}</p>
                        )}
                        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                          <p className="text-sm text-gray-600 mb-2 font-medium">Jawaban Anda:</p>
                          <div className="font-medium text-gray-900">
                            {response ? (
                              typeof getResponseValue(response) === 'object' ? 
                                getResponseValue(response) : 
                                <p>{getResponseValue(response)}</p>
                            ) : (
                              <span className="text-gray-500 italic">Tidak ada jawaban</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {response?.feedback && (
                        <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="p-1 bg-orange-100 rounded-full">
                              <MessageSquare className="h-4 w-4 text-orange-600" />
                            </div>
                            <span className="text-sm font-medium text-orange-700">Umpan Balik:</span>
                          </div>
                          <p className="text-sm text-orange-600">{response.feedback}</p>
                        </div>
                      )}

                      {response?.needsRevision && (
                        <div className="flex items-center space-x-2">
                          <div className="p-1 bg-orange-100 rounded-full">
                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                          </div>
                          <span className="text-sm text-orange-600 font-medium">
                            Pertanyaan ini perlu revisi
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
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                  </div>
                  <span className="text-orange-700 font-medium">
                    {submission.responses.filter(r => r.needsRevision).length} pertanyaan perlu revisi
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
                    className="bg-white/50 backdrop-blur-sm border-orange-200/50 hover:bg-white/70 transition-all duration-200"
                  >
                    Edit Assessment
                  </Button>
                  <Button
                    onClick={handleResubmit}
                    className="flex items-center space-x-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-200"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Kirim Ulang</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}