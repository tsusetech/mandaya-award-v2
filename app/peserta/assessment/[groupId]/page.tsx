'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight, Save, Send, AlertTriangle, CheckCircle, XCircle, Clock, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { QuestionInput } from '../components/QuestionTypes'
import api from '@/lib/api'
import { getAssessmentStatus, getStatusBadge, type AssessmentStatus } from '@/lib/utils'
import { getProfile } from '@/lib/auth'

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
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [session, setSession] = useState<AssessmentSession | null>(null)
  const [currentSection, setCurrentSection] = useState<string | null>(null)
  const [responses, setResponses] = useState<Record<number, any>>({})
  const [validationErrors, setValidationErrors] = useState<Record<number, string>>({})
  const [userEmail, setUserEmail] = useState<string>('')
  const autoSaveTimeouts = useRef<Record<number, NodeJS.Timeout>>({})

  // Get the current assessment status
  const currentStatus: AssessmentStatus = session 
    ? getAssessmentStatus(session.status, session.finalStatus || session.review?.status, session.review?.stage)
    : getAssessmentStatus('draft')

  // Function to get current user's email
  const getCurrentUserEmail = async () => {
    try {
      const user = await getProfile()
      return user.email || ''
    } catch (err) {
      console.error('Error fetching user email:', err)
      return ''
    }
  }

  // Function to check if a question is an email field
  const isEmailQuestion = (question: Question) => {
    const questionText = question.questionText.toLowerCase()
    const inputType = question.inputType.toLowerCase()
    
    return inputType === 'email' || 
           questionText.includes('email') || 
           questionText.includes('alamat email') ||
           questionText.includes('e-mail') ||
           questionText.includes('email address') ||
           (inputType === 'text-open' && questionText.includes('email'))
  }

  // Function to pre-fill email fields with authenticated user's email
  const prefillEmailFields = (questions: Question[], userEmail: string, currentResponses: Record<number, any>) => {
    if (!userEmail) return currentResponses

    const emailQuestions = questions.filter(isEmailQuestion)
    const updatedResponses = { ...currentResponses }

    console.log('Pre-filling email fields:', {
      userEmail,
      emailQuestionsCount: emailQuestions.length,
      emailQuestions: emailQuestions.map(q => ({ id: q.id, questionText: q.questionText, inputType: q.inputType }))
    })

    emailQuestions.forEach(question => {
      // Only pre-fill if the field is empty or hasn't been answered yet
      if (!currentResponses[question.id] || currentResponses[question.id] === '') {
        updatedResponses[question.id] = userEmail
        console.log(`Pre-filled email for question ${question.id}: ${question.questionText}`)
      } else {
        console.log(`Question ${question.id} already has a value, skipping pre-fill`)
      }
    })

    return updatedResponses
  }

  // Calculate progress based on completed questions
  const calculateProgress = () => {
    if (!questions.length) return 0
    
    const completedQuestions = questions.filter(question => {
      const response = responses[question.id]
      return response !== undefined && response !== null && response !== ''
    })
    
    const progress = Math.round((completedQuestions.length / questions.length) * 100)
    
    console.log('Progress calculation:', {
      totalQuestions: questions.length,
      completedQuestions: completedQuestions.length,
      progress: progress + '%',
      responses: Object.keys(responses).length
    })
    
    return progress
  }

  // Update session progress in database
  const updateSessionProgress = async (progress: number) => {
    if (!session) return
    
    try {
      console.log('Progress calculated:', progress, '%')
      
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
      
      // Get user email first
      const email = await getCurrentUserEmail()
      setUserEmail(email)
      
      const response = await api.get(`/assessments/session/${groupId}`)
      console.log('Session data:', response.data)
      console.log('Questions with review comments:', response.data?.questions?.map((q: Question) => ({
        questionId: q.id,
        reviewComments: q.reviewComments,
        reviewCommentsLength: q.reviewComments?.length || 0
      })))
      
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
              // For checkboxes, convert boolean to array of selected values
              if (typeof question.response === 'boolean') {
                // If it's a simple boolean, we need to determine which options are selected
                // For now, we'll use an empty array and let the user re-select
                processedValue = []
              } else if (Array.isArray(question.response)) {
                // If it's already an array, use it directly
                processedValue = question.response
              } else {
                // Fallback to empty array
                processedValue = []
              }
            } else if (Array.isArray(question.response)) {
              // For arrays (multiple choice), use the array directly
              processedValue = question.response
                         } else if (typeof question.response === 'object' && question.response !== null) {
               // For object responses, extract the appropriate value
               // Handle combined response structure (answer + url)
               if (question.response.answer !== undefined) {
                 processedValue = question.response.answer
               } else {
                 processedValue = question.response.textValue || 
                                 question.response.numericValue || 
                                 question.response.arrayValue || 
                                 question.response.booleanValue || 
                                 ''
               }
            } else {
              // For simple types (string, number), use directly
              processedValue = question.response
            }
            
            initialResponses[question.id] = processedValue
          }
        })
      }
      setResponses(initialResponses)
      
      // Pre-fill email fields with authenticated user's email
      if (email && sessionData.questions) {
        const responsesWithEmail = prefillEmailFields(sessionData.questions, email, initialResponses)
        setResponses(responsesWithEmail)
      } else {
        setResponses(initialResponses)
      }
      
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
          
          console.log('Sending answer with progress:', {
            questionId: questionId,
            progressPercentage: actualProgress,
            payload: answerPayload
          })
          
          const response = await api.post(`/assessments/session/${session.id}/answer`, answerPayload)
          console.log('Answer save response:', response.data)
          
          console.log('Auto-saved response for question', questionId)
          
          // Update progress after saving answer
          await updateSessionProgress(actualProgress)
          
          // Refresh session data to get updated progress from backend
          try {
            const refreshResponse = await api.get(`/assessments/session/${groupId}`)
            if (refreshResponse.data) {
              setSession(refreshResponse.data)
              setQuestions(refreshResponse.data.questions || [])
              console.log('Session refreshed, new progress:', refreshResponse.data.progressPercentage)
              console.log('Full session data after refresh:', refreshResponse.data)
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
      
      console.log('Sending batch answer with progress:', {
        progressPercentage: actualProgress,
        answersCount: responsesToSave.length,
        payload: batchPayload
      })
      
      const response = await api.post(`/assessments/session/${session?.id}/batch-answer`, batchPayload)
      console.log('Batch answer save response:', response.data)
      
      // Update progress after saving section
      await updateSessionProgress(actualProgress)
      
      // Refresh session data to get updated progress from backend
      try {
        const refreshResponse = await api.get(`/assessments/session/${groupId}`)
        if (refreshResponse.data) {
          setSession(refreshResponse.data)
          setQuestions(refreshResponse.data.questions || [])
          console.log('Session refreshed after section save, new progress:', refreshResponse.data.progressPercentage)
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
      
      console.log('Submitting assessment:', {
        sessionId: session?.id,
        isResubmission,
        hasReviewComments: questions.filter(q => q.reviewComments && q.reviewComments.length > 0).length,
        currentStatus: session?.status,
        currentCombinedStatus: currentStatus.combinedStatus
      })
      
      // Use the same endpoint but include resubmission flag if needed
      const submitPayload = {
        isResubmission: isResubmission
      }
      
      const submitResponse = await api.post(`/assessments/session/${session?.id}/submit`, {
        ...submitPayload,
        progressPercentage: 100
      })
      console.log('Submit response:', submitResponse.data)
      
      // Update progress to 100% when submitted
      await updateSessionProgress(100)
      
      // Force a refresh of the session data to see if status changed
      try {
        const refreshResponse = await api.get(`/assessments/session/${groupId}`)
        console.log('Status after submission:', {
          status: refreshResponse.data.status,
          combinedStatus: getAssessmentStatus(
            refreshResponse.data.status, 
            refreshResponse.data.review?.status, 
            refreshResponse.data.review?.stage
          ).combinedStatus
        })
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
                onClick={() => router.push('/peserta')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Assessment Form</h1>
                <p className="text-gray-600">Complete all sections to submit your assessment</p>
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
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-orange-800 mb-2">Review Feedback</h3>
                  <p className="text-sm text-orange-700 mb-3">
                    Your submission has been reviewed and requires revisions. Please address the feedback below before resubmitting.
                  </p>
                  
                  {/* General feedback */}
                  {session?.feedback && (
                    <div className="mb-3 p-3 bg-orange-100 rounded-lg">
                      <p className="text-sm font-medium text-orange-800 mb-1">General Feedback:</p>
                      <p className="text-sm text-orange-700">{session.feedback}</p>
                    </div>
                  )}
                  
                  {/* Question-specific feedback */}
                  {questions.some(q => q.reviewComments && q.reviewComments.length > 0) && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-orange-800">Question Feedback:</p>
                      {questions
                        .filter(q => q.reviewComments && q.reviewComments.length > 0)
                        .map(question => {
                          const adminComments = question.reviewComments?.filter((comment: any) => 
                            comment.stage === 'admin_validation'
                          ) || []
                          
                          return adminComments.map((comment: any, index: number) => (
                            <div key={`${question.id}-${index}`} className="p-3 bg-orange-100 rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium text-orange-800">
                                  Question {question.orderNumber}: {comment.isCritical ? '(Critical)' : ''}
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
                                  className="text-orange-600 hover:text-orange-800 text-xs"
                                >
                                  Go to Question
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
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-green-800 mb-2">Assessment Approved</h3>
                  <p className="text-sm text-green-700">
                    Congratulations! Your assessment has been approved and will proceed to the next stage.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStatus.combinedStatus === 'rejected' && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-red-800 mb-2">Assessment Rejected</h3>
                  <p className="text-sm text-red-700">
                    Your assessment has been rejected. Please review the feedback below.
                  </p>
                  {session?.feedback && (
                    <div className="mt-3 p-3 bg-red-100 rounded-lg">
                      <p className="text-sm font-medium text-red-800 mb-1">Feedback:</p>
                      <p className="text-sm text-red-700">{session.feedback}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {['submitted'].includes(currentStatus.combinedStatus) && (
          <Card className={`border-${currentStatus.color}-200 ${currentStatus.bgColor}`}>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <Clock className={`h-5 w-5 text-${currentStatus.color}-500 mt-0.5 flex-shrink-0`} />
                <div className="flex-1">
                  <h3 className={`font-medium text-${currentStatus.color}-800 mb-2`}>
                    {currentStatus.description}
                  </h3>
                  <p className={`text-sm text-${currentStatus.color}-700`}>
                    Your assessment is currently being processed. You will be notified when there are updates.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStatus.combinedStatus === 'completed' && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-green-800 mb-2">Assessment Completed</h3>
                  <p className="text-sm text-green-700">
                    Your assessment process has been completed. Thank you for your participation!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

                 {/* Progress - only show if status allows editing */}
         {currentStatus.showProgress && (
           <Card>
             <CardContent className="pt-6">
               <div className="space-y-2">
                 <div className="flex justify-between text-sm text-gray-600">
                   <span>Progress</span>
                   <span>{currentProgress}%</span>
                 </div>
                 <Progress value={currentProgress} />
               </div>
             </CardContent>
           </Card>
         )}

         {/* Time Reminder - only show if status allows editing and session is in draft */}
         {currentStatus.canEdit && session?.status === 'in_progress' && session?.startedAt && (
           <Card className="border-amber-200 bg-amber-50">
             <CardContent className="pt-6">
               <div className="flex items-start space-x-3">
                 <Clock className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                 <div className="flex-1">
                   <h3 className="font-medium text-amber-800 mb-2">⏰ Time Reminder</h3>
                   <p className="text-sm text-amber-700 mb-2">
                     Please complete your assessment within 3 days from when you started.
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
                         <div className="p-3 bg-red-100 border border-red-200 rounded-lg">
                           <p className="text-sm font-medium text-red-800">
                             ⚠️ Time&apos;s up! Please submit your assessment immediately.
                           </p>
                         </div>
                       )
                     } else if (daysLeft <= 1) {
                       return (
                         <div className="p-3 bg-red-100 border border-red-200 rounded-lg">
                           <p className="text-sm font-medium text-red-800">
                             ⚠️ Urgent: Less than 24 hours remaining! ({hoursLeft} hours left)
                           </p>
                         </div>
                       )
                     } else if (daysLeft <= 2) {
                       return (
                         <div className="p-3 bg-orange-100 border border-orange-200 rounded-lg">
                           <p className="text-sm font-medium text-orange-800">
                             ⚠️ Warning: Only {daysLeft} days remaining!
                           </p>
                         </div>
                       )
                     } else {
                       return (
                         <div className="p-3 bg-blue-100 border border-blue-200 rounded-lg">
                           <p className="text-sm font-medium text-blue-800">
                             ℹ️ You have {daysLeft} days remaining to complete this assessment.
                           </p>
                         </div>
                       )
                     }
                   })()}
                   <p className="text-xs text-amber-600 mt-2">
                     Started: {new Date(session.startedAt).toLocaleDateString('id-ID', { 
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
            <Card>
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
                        className="text-xs"
                      >
                        {section} ({completionStatus})
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

                         {/* Current Section */}
             <Card>
               <CardHeader>
                 <div className="flex items-center justify-between">
                   <CardTitle>{currentSection}</CardTitle>
                   <div className="text-sm text-gray-500">
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
                    <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <div className="flex-1">
                          <p className="text-sm text-gray-700 font-medium mb-1">⚠️ Optional Section</p>
                          <p className="text-sm text-gray-600">
                            Questions in this section are optional. You may skip them if they don&apos;t apply to your situation.
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
                           value={responses[question.id]}
                           onChange={(value) => handleResponseChange(question.id, value)}
                           validationError={validationErrors[question.id]}
                           isPrefilledFromAuth={isEmailQuestion(question) && userEmail && responses[question.id] === userEmail}
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
                  )})}
              </CardContent>
            </Card>

                         {/* Navigation Buttons */}
             <div className="flex justify-between">
               <Button
                 variant="outline"
                 onClick={() => setCurrentSection(sections[currentSectionIndex - 1] || null)}
                 disabled={currentSectionIndex === 0}
                 className="flex items-center space-x-2"
               >
                 <ArrowLeft className="h-4 w-4" />
                 <span className="hidden sm:inline">Previous Section</span>
                 <span className="sm:hidden">Previous</span>
               </Button>

               {currentSectionIndex === sections.length - 1 ? (
                 <Button
                   onClick={handleSubmit}
                   disabled={saving || (!currentStatus.canSubmit && !currentStatus.canResubmit)}
                   className="flex items-center space-x-2"
                 >
                   <Send className="h-4 w-4" />
                   <span>
                     {saving 
                       ? 'Submitting...' 
                       : questions.some(q => q.reviewComments && q.reviewComments.length > 0)
                         ? 'Resubmit Assessment'
                         : 'Submit Assessment'
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
                   className="flex items-center space-x-2"
                 >
                   <span className="hidden sm:inline">Next Section</span>
                   <span className="sm:hidden">Next</span>
                   <ArrowRight className="h-4 w-4" />
                 </Button>
               )}
             </div>
          </>
                 ) : (
           /* Read-only view for non-editable statuses */
           <>
             {/* Section Navigation */}
             <Card>
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
                         className="text-xs"
                       >
                         {section} ({completionStatus})
                       </Button>
                     )
                   })}
                 </div>
               </CardContent>
             </Card>

             {/* Current Section Questions */}
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center space-x-2">
                   <Eye className="h-5 w-5" />
                   <span>{currentSection || 'Assessment Review'}</span>
                 </CardTitle>
               </CardHeader>
               <CardContent className="space-y-6">
                 {questions
                   .filter(q => q.sectionTitle === getSectionTitleFromCombined(currentSection || ''))
                   .map((question) => (
                     <div key={question.id} className="p-4 border rounded-lg">
                       {(() => {
                         console.log(`Question ${question.id} response data:`, {
                           questionId: question.id,
                           response: question.response,
                           responseType: typeof question.response,
                           isArray: Array.isArray(question.response)
                         })
                         return null
                       })()}
                       <h3 className="font-medium mb-2">{question.questionText}</h3>
                       <div className="bg-gray-50 p-3 rounded">
                         <p className="text-sm text-gray-700">
                           {(() => {
                             // Handle different response formats
                             if (typeof question.response === 'string') {
                               return question.response
                             } else if (typeof question.response === 'number') {
                               return question.response.toString()
                             } else if (Array.isArray(question.response)) {
                               // Handle checkbox and multiple-choice responses with proper formatting
                               return question.response.map((item: any) => {
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
                                 }
                                 return item
                               }).join(', ')
                             } else if (typeof question.response === 'object' && question.response !== null) {
                               // Handle object response format with URL support
                               const answer = question.response.answer !== undefined ? question.response.answer :
                                             question.response.textValue || 
                                             question.response.numericValue?.toString() || 
                                             (Array.isArray(question.response.arrayValue) 
                                               ? question.response.arrayValue.join(', ') 
                                               : question.response.arrayValue) || 
                                             (question.response.booleanValue ? 'Yes' : 'No') || 
                                             'No response'
                               
                              return answer
                             } else if (question.response === true) {
                               return 'Yes'
                             } else if (question.response === false) {
                               return 'No'
                             } else {
                               return 'No response'
                             }
                           })()}
                         </p>
                         
                         {/* Show URL if it exists in the response */}
                         {(() => {
                           if (typeof question.response === 'object' && question.response !== null && question.response.url) {
                             return (
                               <div className="mt-2 pt-2 border-t border-gray-200">
                                 <p className="text-xs text-gray-500 mb-1">Tautan/Bukti Dukung:</p>
                                 <a 
                                   href={question.response.url} 
                                   target="_blank" 
                                   rel="noopener noreferrer"
                                   className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
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
                   ))}
               </CardContent>
             </Card>
           </>
         )}
      </div>
    </div>
  )
}

