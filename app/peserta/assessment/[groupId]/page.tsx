'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight, Save, Send, AlertTriangle, CheckCircle, XCircle, Clock, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { QuestionInput } from '../components/QuestionTypes'
import { PdfModal } from '@/components/ui/pdf-modal'
import api from '@/lib/api'
import { getAssessmentStatus, getStatusBadge, type AssessmentStatus } from '@/lib/utils'
import { getProfile } from '@/lib/auth'
import { isPdfUrl } from '@/lib/upload'

interface Question {
  id: number
  questionText: string
  description?: string
  inputType: string
  isRequired: boolean
  options?: {
    id: number
    optionText: string
    optionValue: string
    isCorrect?: boolean
  }[]
  sectionTitle: string
  subsection: string
  orderNumber: number
  response?: any
  isAnswered?: boolean
  isSkipped?: boolean
  reviewComments?: any[]
}

interface QuestionResponse {
  id: number
  sessionId: number
  questionId: number
  groupQuestionId: number
  textValue?: string
  numericValue?: number
  booleanValue?: boolean
  arrayValue?: any
  isDraft: boolean
  isComplete: boolean
  isSkipped: boolean
  autoSaveVersion: number
  timeSpentSeconds: number
  lastModifiedAt: Date
  firstAnsweredAt?: Date
  finalizedAt?: Date
  validationErrors?: any
  metadata?: any
}

interface AssessmentSession {
  id: number
  userId: number
  groupId: number
  groupName: string
  status: string
  finalStatus?: string
  combinedStatus?: string
  currentQuestionId?: number
  progressPercentage: number
  autoSaveEnabled: boolean
  startedAt: Date
  lastAutoSaveAt?: Date
  lastActivityAt: Date
  completedAt?: Date
  submittedAt?: Date
  questions?: Question[]
  feedback?: string
  review?: {
    status: string;
    stage: string;
  };
}

export default function AssessmentPage() {
  const router = useRouter()
  const { groupId } = useParams() as { groupId: string }
  
  // Helper function to safely extract values for rendering
  const safeValue = (val: any): any => {
    if (val === null || val === undefined) return val
    if (typeof val === 'object' && val.url !== undefined) {
      // This is a combined response object, pass it as-is to QuestionInput
      return val
    }
    return val
  }
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [session, setSession] = useState<AssessmentSession | null>(null)
  const [currentSection, setCurrentSection] = useState<string | null>(null)
  const [responses, setResponses] = useState<Record<number, any>>({})
  const [validationErrors, setValidationErrors] = useState<Record<number, string>>({})
  const [pdfModalOpen, setPdfModalOpen] = useState(false)
  const [pdfModalUrl, setPdfModalUrl] = useState('')
  const [pdfModalTitle, setPdfModalTitle] = useState('')
  const autoSaveTimeouts = useRef<Record<number, NodeJS.Timeout>>({})

  // Get the current assessment status
  const currentStatus: AssessmentStatus = session
    ? getAssessmentStatus(session.status, session.finalStatus || session.review?.status, session.review?.stage)
    : getAssessmentStatus('draft')



  // Function to open PDF modal
  const openPdfModal = (url: string, title: string) => {
    setPdfModalUrl(url)
    setPdfModalTitle(title)
    setPdfModalOpen(true)
  }


  // Calculate progress based on completed questions
  const calculateProgress = () => {
    if (!questions.length) return 0

    const completedQuestions = questions.filter(question => {
      const response = responses[question.id]
      return response !== undefined && response !== null && response !== ''
    })

    const progress = Math.round((completedQuestions.length / questions.length) * 100)


    return progress
  }

  // Update session progress in database
  const updateSessionProgress = async (progress: number) => {
    if (!session) return

    try {

      // Update local session state to reflect the new progress
      setSession(prev => prev ? { ...prev, progressPercentage: progress } : null)
    } catch (err) {
      console.error('Error updating session progress:', err)
    }
  }

  // Function to fetch session data
  const fetchSessionData = async () => {
    try {
      setLoading(true)


      const response = await api.get(`/assessments/session/${groupId}`)

      if (!response.data) {
        throw new Error('Session not found')
      }

      const sessionData = response.data
      setSession(sessionData)
      setQuestions(sessionData.questions || [])

      // Initialize responses from existing data
      const initialResponses: Record<number, any> = {}
      if (sessionData.questions) {
        sessionData.questions.forEach((question: Question) => {
          if (question.response !== undefined && question.response !== null) {
            // Process the response data based on input type
            let processedValue: any

            if (question.inputType === 'file-upload' && Array.isArray(question.response)) {
              // For file uploads, use the first file URL or empty string
              processedValue = question.response.length > 0 ? question.response[0] : ''
            } else if (question.inputType === 'checkbox') {
              // For checkboxes, handle both array and object responses
              if (Array.isArray(question.response)) {
                processedValue = question.response
              } else if (typeof question.response === 'object' && question.response !== null) {
                // Handle the combined structure {answer: [...], url: "..."}
                if (question.response.answer !== undefined && Array.isArray(question.response.answer)) {
                  processedValue = question.response
                } else {
                  // If it's not the expected structure, convert to empty array
                  processedValue = []
                }
              } else {
                // If it's not an array or object, convert to empty array
                processedValue = []
              }
            } else if (question.inputType === 'multiple-choice') {
              // For multiple-choice, handle both array and single values
              if (Array.isArray(question.response)) {
                // If it's an array, take the first value (single selection)
                processedValue = question.response.length > 0 ? question.response[0] : ''
              } else {
                // If it's already a single value, use it directly
                processedValue = question.response
              }
            } else if (typeof question.response === 'object' && question.response !== null) {
              // For object responses, check if it's a combined structure (answer + url)
              if (question.response.answer !== undefined && question.response.url !== undefined) {
                // This is a combined response structure - keep the whole object
                processedValue = question.response
              } else if (question.response.answer !== undefined) {
                // If answer is also an object, extract the string value
                if (typeof question.response.answer === 'object' && question.response.answer !== null) {
                  processedValue = question.response.answer.answer || 
                    question.response.answer.textValue || 
                    question.response.answer.numericValue?.toString() ||
                    JSON.stringify(question.response.answer)
                } else {
                  processedValue = question.response.answer
                }
              } else {
                // Handle the new structure where data is in specific fields and URL is in metadata
                let mainValue = question.response.textValue ||
                  question.response.numericValue ||
                  question.response.arrayValue ||
                  question.response.booleanValue ||
                  ''
                
                // If there's a URL in metadata, combine it with the main value
                if (question.response.metadata && question.response.metadata.url) {
                  processedValue = {
                    answer: mainValue,
                    url: question.response.metadata.url
                  }
                } else {
                  processedValue = mainValue
                }
              }
            } else {
              // For simple types (string, number), use directly
              processedValue = question.response
            }

            initialResponses[question.id] = processedValue
          }
        })
      }

      // Email fields are no longer pre-filled - users must input their email manually
      setResponses(initialResponses)

      // Set current section to first section if not set
      if (!currentSection && sessionData.questions && sessionData.questions.length > 0) {
        const firstQuestion = sessionData.questions[0]
        const sectionDisplay = firstQuestion.sectionTitle === firstQuestion.subsection
          ? firstQuestion.sectionTitle
          : `${firstQuestion.sectionTitle} - ${firstQuestion.subsection}`
        setCurrentSection(sectionDisplay)
      }

    } catch (err) {
      console.error('Error fetching session data:', err)
      toast.error('Failed to load assessment')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessionData()
  }, [groupId])

  const handleResponseChange = async (questionId: number, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }))

    // Clear validation error when user starts typing
    if (validationErrors[questionId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[questionId]
        return newErrors
      })
    }

    // Clear existing timeout for this question
    if (autoSaveTimeouts.current[questionId]) {
      clearTimeout(autoSaveTimeouts.current[questionId])
    }

    // Auto-save after 1 second of no typing
    if (session) {
      autoSaveTimeouts.current[questionId] = setTimeout(async () => {
        try {
          // Calculate the actual overall progress based on all completed questions
          const actualProgress = calculateProgress()
          const answerPayload = {
            questionId: questionId,
            value: value,
            inputType: questions.find(q => q.id === questionId)?.inputType || 'text-open',
            isDraft: false,
            isComplete: true,
            isSkipped: false,
            timeSpent: 0,
            progressPercentage: actualProgress,
            sessionProgress: actualProgress // Add this as an additional field
          }


          const response = await api.post(`/assessments/session/${session.id}/answer`, answerPayload)

          // Update progress after saving answer
          await updateSessionProgress(actualProgress)

          // Refresh session data to get updated progress from backend
          try {
            const refreshResponse = await api.get(`/assessments/session/${groupId}`)
            if (refreshResponse.data) {
              setSession(refreshResponse.data)
              setQuestions(refreshResponse.data.questions || [])
            }
          } catch (refreshErr) {
            console.error('Error refreshing session data:', refreshErr)
          }
        } catch (err) {
          console.error('Error auto-saving:', err)
        }
      }, 1000)
    }
  }

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(autoSaveTimeouts.current).forEach(timeout => {
        clearTimeout(timeout)
      })
    }
  }, [])

  const validateResponses = (questionsToValidate: Question[]) => {
    const errors: Record<number, string> = {}

    questionsToValidate.forEach(question => {
      // Check if this question belongs to the "Pengusulan Individu/Tokoh" section
      const isPengusulanSection = question.sectionTitle?.startsWith('Pengusulan Individu/Tokoh yang berperan besar pada pemberdayaan masyarakat') ||
        question.subsection?.startsWith('Pengusulan Individu/Tokoh yang berperan besar pada pemberdayaan masyarakat')

      // Only validate as required if it's not in the Pengusulan section
      if (!isPengusulanSection && question.isRequired && !responses[question.id]) {
        errors[question.id] = 'This question is required'
      }

      // Add more validation rules based on inputType
      if (question.inputType === 'numeric' && responses[question.id]) {
        const value = responses[question.id]
        if (isNaN(value)) {
          errors[question.id] = 'Please enter a valid number'
        }
      }
    })

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveSection = async () => {
    const sectionQuestions = questions.filter(q => q.sectionTitle === getSectionTitleFromCombined(currentSection || ''))
    if (!validateResponses(sectionQuestions)) {
      toast.error('Please fill in all required questions')
      return
    }

    try {
      setSaving(true)

      // Use batch auto-save for section
      const responsesToSave = sectionQuestions.map(q => ({
        questionId: q.id,
        value: responses[q.id],
        isDraft: false,
        isComplete: true,
        timeSpent: 0
      }))

      const actualProgress = calculateProgress()
      const batchPayload = {
        answers: responsesToSave.map(answer => ({
          ...answer,
          inputType: questions.find(q => q.id === answer.questionId)?.inputType || 'text-open',
          isSkipped: false,
          progressPercentage: actualProgress,
          sessionProgress: actualProgress // Add this as an additional field
        })),
        currentQuestionId: questions.find(q => q.sectionTitle === getSectionTitleFromCombined(currentSection || ''))?.id || questions[0]?.id,
        progressPercentage: actualProgress,
        sessionProgress: actualProgress // Add this as an additional field
      }


      const response = await api.post(`/assessments/session/${session?.id}/batch-answer`, batchPayload)

      // Update progress after saving section
      await updateSessionProgress(actualProgress)

      // Refresh session data to get updated progress from backend
      try {
        const refreshResponse = await api.get(`/assessments/session/${groupId}`)
        if (refreshResponse.data) {
          setSession(refreshResponse.data)
          setQuestions(refreshResponse.data.questions || [])
        }
      } catch (refreshErr) {
        console.error('Error refreshing session data:', refreshErr)
      }

      toast.success('Section saved successfully')
    } catch (err) {
      console.error('Error saving section:', err)
      toast.error('Failed to save section')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async () => {
    if (!validateResponses(questions)) {
      toast.error('Please fill in all required questions')
      return
    }

    try {
      setSaving(true)

      // Check if this is a resubmission (has review comments)
      const isResubmission = questions.some(q => q.reviewComments && q.reviewComments.length > 0)


      // Use the same endpoint but include resubmission flag if needed
      const submitPayload = {
        isResubmission: isResubmission
      }

      const submitResponse = await api.post(`/assessments/session/${session?.id}/submit`, {
        ...submitPayload,
        progressPercentage: 100
      })

      // Update progress to 100% when submitted
      await updateSessionProgress(100)

      // Force a refresh of the session data to see if status changed
      try {
        const refreshResponse = await api.get(`/assessments/session/${groupId}`)
      } catch (refreshErr) {
        console.error('Error refreshing session data:', refreshErr)
      }

      const successMessage = isResubmission
        ? 'Assessment resubmitted successfully! It will be reviewed by admin.'
        : 'Assessment submitted successfully! It will be reviewed by admin.'

      toast.success(successMessage)
      router.push('/peserta/submissions')
    } catch (err) {
      console.error('Error submitting assessment:', err)
      toast.error('Failed to submit assessment')
    } finally {
      setSaving(false)
    }
  }

  const sections = Array.from(new Set(questions.map(q =>
    q.sectionTitle === q.subsection ? q.sectionTitle : `${q.sectionTitle} - ${q.subsection}`
  )))
  const currentSectionIndex = sections.indexOf(currentSection || '')
  const currentProgress = calculateProgress()
  const statusBadge = getStatusBadge(currentStatus)

  // Helper function to extract sectionTitle from combined format
  const getSectionTitleFromCombined = (combinedSection: string) => {
    // If it contains ' - ', split and get the first part
    if (combinedSection.includes(' - ')) {
      return combinedSection.split(' - ')[0]
    }
    // Otherwise, it's just the section title
    return combinedSection
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
            <div className="p-6 max-w-4xl mx-auto">
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

  return (
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
                    onClick={() => router.push('/peserta')}
                    className="flex items-center space-x-2 hover:bg-white/50 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Kembali ke Beranda</span>
                  </Button>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Form Penilaian
                    </h1>
                    <p className="text-gray-600">Lengkapi semua bagian untuk mengirimkan penilaian Anda</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{statusBadge.icon}</span>
                  <div className={statusBadge.className}>
                    {statusBadge.text}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
            {/* Status-specific alerts */}
            {currentStatus.combinedStatus === 'needs_revision' && (
              <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-orange-100 rounded-full">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-orange-800 mb-2 text-lg">Umpan Balik Tinjauan</h3>
                      <p className="text-sm text-orange-700 mb-3">
                        Pengajuan Anda telah ditinjau dan memerlukan revisi. Silakan perbaiki umpan balik di bawah sebelum mengirimkan ulang.
                      </p>

                      {/* General feedback */}
                      {session?.feedback && (
                        <div className="mb-3 p-4 bg-gradient-to-r from-orange-100 to-amber-100 rounded-lg border border-orange-200">
                          <p className="text-sm font-medium text-orange-800 mb-1">Umpan Balik Umum:</p>
                          <p className="text-sm text-orange-700">{session.feedback}</p>
                        </div>
                      )}

                      {/* Question-specific feedback */}
                      {questions.some(q => q.reviewComments && q.reviewComments.length > 0) && (
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-orange-800">Umpan Balik Pertanyaan:</p>
                          {questions
                            .filter(q => q.reviewComments && q.reviewComments.length > 0)
                            .map(question => {
                              const adminComments = question.reviewComments?.filter((comment: any) =>
                                comment.stage === 'admin_validation'
                              ) || []

                              return adminComments.map((comment: any, index: number) => (
                                <div key={`${question.id}-${index}`} className="p-4 bg-gradient-to-r from-orange-100 to-amber-100 rounded-lg border border-orange-200 hover:shadow-md transition-shadow">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium text-orange-800">
                                      Pertanyaan {question.orderNumber}: {comment.isCritical ? '(Kritis)' : ''}
                                    </p>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const sectionDisplay = question.sectionTitle === question.subsection
                                          ? question.sectionTitle
                                          : `${question.sectionTitle} - ${question.subsection}`
                                        setCurrentSection(sectionDisplay)
                                        // Scroll to question after section change
                                        setTimeout(() => {
                                          const questionElement = document.getElementById(`question-${question.id}`)
                                          if (questionElement) {
                                            questionElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                          }
                                        }, 100)
                                      }}
                                      className="text-orange-600 hover:text-orange-800 text-xs hover:bg-orange-100"
                                    >
                                      Lihat Pertanyaan
                                    </Button>
                                  </div>
                                  <p className="text-sm text-orange-700">{comment.comment}</p>
                                </div>
                              ))
                            })}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStatus.combinedStatus === 'approved' && (
              <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-800 mb-2 text-lg">Penilaian Disetujui</h3>
                      <p className="text-sm text-green-700">
                        Selamat! Penilaian Anda telah disetujui dan akan melanjutkan ke tahap berikutnya.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStatus.combinedStatus === 'rejected' && (
              <Card className="border-red-200 bg-gradient-to-r from-red-50 to-pink-50 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-red-100 rounded-full">
                      <XCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-red-800 mb-2 text-lg">Penilaian Ditolak</h3>
                      <p className="text-sm text-red-700">
                        Penilaian Anda telah ditolak. Silakan tinjau umpan balik di bawah.
                      </p>
                      {session?.feedback && (
                        <div className="mt-3 p-4 bg-gradient-to-r from-red-100 to-pink-100 rounded-lg border border-red-200">
                          <p className="text-sm font-medium text-red-800 mb-1">Umpan Balik:</p>
                          <p className="text-sm text-red-700">{session.feedback}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {['submitted'].includes(currentStatus.combinedStatus) && (
              <Card className={`border-${currentStatus.color}-200 bg-gradient-to-r from-${currentStatus.color}-50 to-${currentStatus.color === 'blue' ? 'indigo' : currentStatus.color}-50 shadow-lg hover:shadow-xl transition-all duration-300`}>
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 bg-${currentStatus.color}-100 rounded-full`}>
                      <Clock className={`h-5 w-5 text-${currentStatus.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold text-${currentStatus.color}-800 mb-2 text-lg`}>
                        {currentStatus.description}
                      </h3>
                      <p className={`text-sm text-${currentStatus.color}-700`}>
                        Penilaian Anda sedang diproses. Anda akan diberitahu ketika ada pembaruan.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStatus.combinedStatus === 'completed' && (
              <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-800 mb-2 text-lg">Penilaian Selesai</h3>
                      <p className="text-sm text-green-700">
                        Proses penilaian Anda telah selesai. Terima kasih atas partisipasi Anda!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Progress - only show if status allows editing */}
            {currentStatus.showProgress && (
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border-0">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Kemajuan</span>
                      <span className="text-sm font-semibold text-blue-600">{currentProgress}%</span>
                    </div>
                    <div className="relative">
                      <Progress value={currentProgress} className="h-3" />
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full opacity-20"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Time Reminder - only show if status allows editing and session is in draft */}
            {currentStatus.canEdit && session?.status === 'in_progress' && session?.startedAt && (
              <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-amber-100 rounded-full">
                      <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-amber-800 mb-2 text-lg">⏰ Pengingat Waktu</h3>
                      <p className="text-sm text-amber-700 mb-3">
                        Silakan selesaikan penilaian Anda dalam waktu 3 hari sejak Anda memulai.
                      </p>
                      {(() => {
                        const startDate = new Date(session.startedAt)
                        const deadline = new Date(startDate.getTime() + (3 * 24 * 60 * 60 * 1000)) // 3 days
                        const now = new Date()
                        const timeLeft = deadline.getTime() - now.getTime()
                        const daysLeft = Math.ceil(timeLeft / (24 * 60 * 60 * 1000))
                        const hoursLeft = Math.ceil(timeLeft / (60 * 60 * 1000))

                        if (timeLeft <= 0) {
                          return (
                            <div className="p-4 bg-gradient-to-r from-red-100 to-pink-100 border border-red-200 rounded-lg">
                              <p className="text-sm font-medium text-red-800">
                                ⚠️ Waktu habis! Silakan kirimkan penilaian Anda segera.
                              </p>
                            </div>
                          )
                        } else if (daysLeft <= 1) {
                          return (
                            <div className="p-4 bg-gradient-to-r from-red-100 to-pink-100 border border-red-200 rounded-lg">
                              <p className="text-sm font-medium text-red-800">
                                ⚠️ Mendesak: Kurang dari 24 jam tersisa! ({hoursLeft} jam tersisa)
                              </p>
                            </div>
                          )
                        } else if (daysLeft <= 2) {
                          return (
                            <div className="p-4 bg-gradient-to-r from-orange-100 to-amber-100 border border-orange-200 rounded-lg">
                              <p className="text-sm font-medium text-orange-800">
                                ⚠️ Peringatan: Hanya {daysLeft} hari tersisa!
                              </p>
                            </div>
                          )
                        } else {
                          return (
                            <div className="p-4 bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200 rounded-lg">
                              <p className="text-sm font-medium text-blue-800">
                                ℹ️ Anda memiliki {daysLeft} hari tersisa untuk menyelesaikan penilaian ini.
                              </p>
                            </div>
                          )
                        }
                      })()}
                      <p className="text-xs text-amber-600 mt-3">
                        Dimulai: {new Date(session.startedAt).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Assessment Form - only show if status allows editing */}
            {currentStatus.canEdit ? (
              <>
                {/* Section Navigation */}
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border-0">
                  <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-2">
                      {sections.map((section, index) => {
                        const sectionQuestions = questions.filter(q =>
                          q.sectionTitle === getSectionTitleFromCombined(section)
                        )
                        const answeredQuestions = sectionQuestions.filter(q => {
                          const response = responses[q.id]
                          return response !== undefined && response !== null && response !== ''
                        })
                        const completionStatus = `${answeredQuestions.length}/${sectionQuestions.length}`

                        return (
                          <Button
                            key={section}
                            variant={currentSection === section ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentSection(section)}
                            className={`text-xs transition-all duration-200 ${currentSection === section
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                                : 'hover:bg-gray-50'
                              }`}
                          >
                            {section} ({completionStatus})
                          </Button>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Current Section */}
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border-0">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <CardTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold flex-1 min-w-0 break-words leading-relaxed pb-1">
                        {currentSection}
                      </CardTitle>
                      <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full flex-shrink-0">
                        {(() => {
                          const currentSectionQuestions = questions.filter(q =>
                            q.sectionTitle === getSectionTitleFromCombined(currentSection || '')
                          )
                          const answeredQuestions = currentSectionQuestions.filter(q => {
                            const response = responses[q.id]
                            return response !== undefined && response !== null && response !== ''
                          })
                          return `${answeredQuestions.length}/${currentSectionQuestions.length}`
                        })()}
                      </div>
                    </div>
                    {/* Disclaimer for Pengusulan Individu/Tokoh section */}
                    {currentSection?.startsWith('Pengusulan Individu/Tokoh yang berperan besar pada pemberdayaan masyarakat') && (
                      <div className="mt-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <div className="flex-1">
                            <p className="text-sm text-gray-700 font-medium mb-1">⚠️ Bagian Opsional</p>
                            <p className="text-sm text-gray-600">
                              Pertanyaan dalam bagian ini bersifat opsional. Anda dapat melewatinya jika tidak berlaku untuk situasi Anda.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {questions
                      .filter(q => q.sectionTitle === getSectionTitleFromCombined(currentSection || ''))
                      .map((question) => {
                        // Check if this question belongs to the "Pengusulan Individu/Tokoh" section
                        const isPengusulanSection = question.sectionTitle?.startsWith('Pengusulan Individu/Tokoh yang berperan besar pada pemberdayaan masyarakat') ||
                          question.subsection?.startsWith('Pengusulan Individu/Tokoh yang berperan besar pada pemberdayaan masyarakat')

                        return (
                          <div key={question.id} id={`question-${question.id}`}>
                            <QuestionInput
                              {...question}
                              isRequired={isPengusulanSection ? false : question.isRequired}
                              value={safeValue(responses[question.id])}
                              onChange={(value) => handleResponseChange(question.id, value)}
                              validationError={validationErrors[question.id]}
                            />

                            {/* Show feedback for this question if it exists */}
                            {question.reviewComments && question.reviewComments.length > 0 && (
                              <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                <div className="flex items-start space-x-2">
                                  <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <h4 className="text-sm font-medium text-orange-800 mb-2">
                                      Review Feedback {question.reviewComments.some((c: any) => c.isCritical) && '(Critical)'}
                                    </h4>
                                    {question.reviewComments
                                      .filter((comment: any) => comment.stage === 'admin_validation')
                                      .map((comment: any, index: number) => (
                                        <div key={index} className="mb-2 last:mb-0">
                                          <p className="text-sm text-orange-700">{comment.comment}</p>
                                          {comment.reviewerName && (
                                            <p className="text-xs text-orange-600 mt-1">
                                              — {comment.reviewerName}
                                            </p>
                                          )}
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                  </CardContent>
                </Card>

                {/* Navigation Buttons */}
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentSection(sections[currentSectionIndex - 1] || null)}
                    disabled={currentSectionIndex === 0}
                    className="flex items-center space-x-2 hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Bagian Sebelumnya</span>
                    <span className="sm:hidden">Sebelumnya</span>
                  </Button>

                  {currentSectionIndex === sections.length - 1 ? (
                    <Button
                      onClick={handleSubmit}
                      disabled={saving || (!currentStatus.canSubmit && !currentStatus.canResubmit)}
                      className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <Send className="h-4 w-4" />
                      <span>
                        {saving
                          ? 'Mengirimkan...'
                          : questions.some(q => q.reviewComments && q.reviewComments.length > 0)
                            ? 'Kirim Ulang Penilaian'
                            : 'Kirim Penilaian'
                        }
                      </span>
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        setCurrentSection(sections[currentSectionIndex + 1] || null)
                        // Scroll to top after section change
                        setTimeout(() => {
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }, 100)
                      }}
                      className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <span className="hidden sm:inline">Bagian Berikutnya</span>
                      <span className="sm:hidden">Berikutnya</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </>
            ) : (
              /* Read-only view for non-editable statuses */
              <>
                {/* Section Navigation */}
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border-0">
                  <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-2">
                      {sections.map((section, index) => {
                        const sectionQuestions = questions.filter(q =>
                          q.sectionTitle === getSectionTitleFromCombined(section)
                        )
                        const answeredQuestions = sectionQuestions.filter(q => {
                          const response = responses[q.id]
                          return response !== undefined && response !== null && response !== ''
                        })
                        const completionStatus = `${answeredQuestions.length}/${sectionQuestions.length}`

                        return (
                          <Button
                            key={section}
                            variant={currentSection === section ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentSection(section)}
                            className={`text-xs transition-all duration-200 ${currentSection === section
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                                : 'hover:bg-gray-50'
                              }`}
                          >
                            {section} ({completionStatus})
                          </Button>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Current Section Questions */}
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border-0">
                  <CardHeader>
                    <CardTitle className="flex items-start space-x-2">
                      <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
                        <Eye className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold flex-1 min-w-0 break-words leading-relaxed pb-1">
                        {currentSection || 'Tinjauan Penilaian'}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {questions
                      .filter(q => q.sectionTitle === getSectionTitleFromCombined(currentSection || ''))
                      .map((question) => (
                        <div key={question.id} className="p-6 border border-gray-200 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 hover:shadow-md transition-all duration-200">
                          <h3 className="font-semibold mb-3 text-gray-800">{question.questionText}</h3>
                          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            {(() => {
                              // Handle different response formats
                              if (typeof question.response === 'string') {
                                // Check if it's a file upload response (URL)
                                if (question.response.startsWith('http') && isPdfUrl(question.response)) {
                                  return (
                                    <div className="space-y-2">
                                      <div className="flex items-center space-x-2">
                                        <div className="p-1 bg-green-100 rounded-full">
                                          <span className="text-green-600 text-xs">✓</span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">PDF Document uploaded</span>
                                      </div>
                                      <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => openPdfModal(question.response, question.questionText)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
                                      >
                                        📄 View PDF
                                      </Button>
                                    </div>
                                  )
                                } else if (question.response.startsWith('http')) {
                                  return (
                                    <div className="space-y-2">
                                      <div className="flex items-center space-x-2">
                                        <div className="p-1 bg-green-100 rounded-full">
                                          <span className="text-green-600 text-xs">✓</span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">File uploaded</span>
                                      </div>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(question.response, '_blank', 'noopener,noreferrer')}
                                        className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                                      >
                                        📄 View File
                                      </Button>
                                    </div>
                                  )
                                } else {
                                  // Ensure we convert to string to avoid object rendering issues
                                  return <p className="text-sm text-gray-700">{String(question.response)}</p>
                                }
                              } else if (typeof question.response === 'number') {
                                return <p className="text-sm text-gray-700">{question.response.toString()}</p>
                              } else if (Array.isArray(question.response)) {
                                // Handle checkbox and multiple-choice responses with proper formatting
                                const formattedResponse = question.response.map((item: any) => {
                                  if (typeof item === 'string') {
                                    // For multiple-choice questions, find the optionText that matches the optionValue
                                    if (question.options && question.options.length > 0) {
                                      const matchingOption = question.options.find((option: any) => option.optionValue === item)
                                      if (matchingOption) {
                                        return matchingOption.optionText
                                      }
                                    }
                                    return item
                                  } else if (typeof item === 'object' && item.value === 'other' && item.otherText) {
                                    return item.otherText
                                  } else if (typeof item === 'object' && item !== null) {
                                    // Handle other object types by converting to string
                                    return JSON.stringify(item)
                                  }
                                  return String(item)
                                }).join(', ')
                                return <p className="text-sm text-gray-700">{formattedResponse}</p>
                              } else if (typeof question.response === 'object' && question.response !== null) {
                                // Handle object response format with URL support
                                let answer = question.response.answer !== undefined ? question.response.answer :
                                  question.response.textValue ||
                                  question.response.numericValue?.toString() ||
                                  (Array.isArray(question.response.arrayValue)
                                    ? question.response.arrayValue.join(', ')
                                    : question.response.arrayValue) ||
                                  (question.response.booleanValue ? 'Ya' : 'Tidak') ||
                                  'Tidak ada jawaban'

                                // Handle checkbox arrays specially
                                if (Array.isArray(answer)) {
                                  // For checkbox arrays, format them properly
                                  const formattedResponse = answer.map((item: any) => {
                                    if (typeof item === 'string') {
                                      // For checkbox questions, find the optionText that matches the optionValue
                                      if (question.options && question.options.length > 0) {
                                        const matchingOption = question.options.find((option: any) => option.optionValue === item)
                                        if (matchingOption) {
                                          return matchingOption.optionText
                                        }
                                      }
                                      return item
                                    } else if (typeof item === 'object' && item.value === 'other' && item.otherText) {
                                      return item.otherText
                                    } else if (typeof item === 'object' && item !== null) {
                                      // Handle other object types by converting to string
                                      return JSON.stringify(item)
                                    }
                                    return String(item)
                                  }).join(', ')
                                  return <p className="text-sm text-gray-700">{formattedResponse}</p>
                                }

                                // Ensure we return a string, not an object
                                if (typeof answer === 'object' && answer !== null) {
                                  // If answer is an object, try to extract a meaningful string value
                                  if (answer.answer !== undefined) {
                                    answer = answer.answer
                                  } else if (answer.textValue !== undefined) {
                                    answer = answer.textValue
                                  } else if (answer.numericValue !== undefined) {
                                    answer = answer.numericValue.toString()
                                  } else if (answer.url !== undefined) {
                                    // If it's just a URL object, extract the URL string
                                    answer = answer.url
                                  } else {
                                    answer = JSON.stringify(answer)
                                  }
                                }
                                
                                // Final safety check - ensure answer is a string and not null/undefined
                                if (typeof answer !== 'string') {
                                  answer = answer !== null && answer !== undefined ? String(answer) : 'Tidak ada jawaban'
                                }
                                
                                // Additional check for empty strings
                                if (answer === '' || answer === 'undefined' || answer === 'null') {
                                  answer = 'Tidak ada jawaban'
                                }
                                
                                return <p className="text-sm text-gray-700">{answer}</p>
                              } else if (question.response === true) {
                                return <p className="text-sm text-gray-700">Ya</p>
                              } else if (question.response === false) {
                                return <p className="text-sm text-gray-700">Tidak</p>
                              } else {
                                // Handle any other type by converting to string
                                if (question.response !== null && question.response !== undefined) {
                                  return <p className="text-sm text-gray-700">{String(question.response)}</p>
                                }
                                return <p className="text-sm text-gray-700">Tidak ada jawaban</p>
                              }
                            })()}

                            {/* Show URL if it exists in the response */}
                            {(() => {
                              if (typeof question.response === 'object' && question.response !== null && question.response.url) {
                                return (
                                  <div className="mt-3 pt-3 border-t border-gray-200">
                                    <p className="text-xs text-gray-500 mb-1 font-medium">Tautan/Bukti Dukung:</p>
                                    <a
                                      href={question.response.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm text-blue-600 hover:text-blue-800 underline break-all hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                    >
                                      {question.response.url}
                                    </a>
                                  </div>
                                )
                              }
                              return null
                            })()}
                          </div>

                          {/* Show feedback for this question if it exists */}
                          {question.reviewComments && question.reviewComments.length > 0 && (
                            <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg">
                              <div className="flex items-start space-x-2">
                                <div className="p-1 bg-orange-100 rounded-full">
                                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-sm font-medium text-orange-800 mb-2">
                                    Umpan Balik Tinjauan {question.reviewComments.some((c: any) => c.isCritical) && '(Kritis)'}
                                  </h4>
                                  {question.reviewComments
                                    .filter((comment: any) => comment.stage === 'admin_validation')
                                    .map((comment: any, index: number) => (
                                      <div key={index} className="mb-2 last:mb-0">
                                        <p className="text-sm text-orange-700">{comment.comment}</p>
                                        {comment.reviewerName && (
                                          <p className="text-xs text-orange-600 mt-1">
                                            — {comment.reviewerName}
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>

      {/* PDF Modal for read-only view */}
      <PdfModal
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        pdfUrl={pdfModalUrl}
        title={pdfModalTitle}
      />
    </div>
  )
}

