'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight, Save, Send } from 'lucide-react'
import { toast } from 'sonner'
import { QuestionInput } from '../components/QuestionTypes'
import api from '@/lib/api'

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
  currentQuestionId?: number
  progressPercentage: number
  autoSaveEnabled: boolean
  startedAt: Date
  lastAutoSaveAt?: Date
  lastActivityAt: Date
  completedAt?: Date
  submittedAt?: Date
  questions?: Question[]
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
  const autoSaveTimeouts = useRef<Record<number, NodeJS.Timeout>>({})

  // Calculate progress based on completed questions
  const calculateProgress = () => {
    if (!questions.length) return 0
    
    const completedQuestions = questions.filter(question => {
      const response = responses[question.id]
      return response !== undefined && response !== null && response !== ''
    })
    
    return Math.round((completedQuestions.length / questions.length) * 100)
  }

    // Function to fetch session data
  const fetchSessionData = async () => {
    try {
      setLoading(true)
      // Get assessment session and questions in one call
      const assessmentRes = await api.get(`/assessments/session/${groupId}`)
      console.log('Assessment response:', assessmentRes.data)

      const sessionData = assessmentRes.data
      const questionsData = assessmentRes.data.questions || []
      
      setSession(sessionData)
      setQuestions(questionsData)

      // Initialize responses from questions data
      const initialResponses: Record<number, any> = {}
      questionsData.forEach((question: any) => {
        console.log('Question:', question.id, 'Response:', question.response)
        if (question.response !== undefined && question.response !== null) {
          // Handle both object and primitive response formats
          let responseValue = null
          
          if (typeof question.response === 'object' && Object.keys(question.response).length > 0) {
            // Response is an object with textValue, numericValue, etc.
            const response = question.response
            if (response.textValue !== undefined && response.textValue !== null) {
              responseValue = response.textValue
            } else if (response.numericValue !== undefined && response.numericValue !== null) {
              responseValue = response.numericValue
            } else if (response.booleanValue !== undefined && response.booleanValue !== null) {
              responseValue = response.booleanValue
            } else if (response.arrayValue !== undefined && response.arrayValue !== null) {
              responseValue = response.arrayValue
            } else if (response.value !== undefined && response.value !== null) {
              responseValue = response.value
            }
          } else if (question.response !== '' && question.response !== null) {
            // Response is a primitive value (string, number, boolean, array)
            responseValue = question.response
          }
          
          if (responseValue !== null) {
            initialResponses[question.id] = responseValue
          }
        }
      })
      console.log('Initial responses:', initialResponses)
      setResponses(initialResponses)

      // Set initial section from first question's section
      if (questionsData && questionsData.length > 0) {
        setCurrentSection(questionsData[0].sectionTitle)
      }
    } catch (err) {
      console.error('Error fetching assessment data:', err)
      toast.error('Failed to load assessment')
    } finally {
      setLoading(false)
    }
  }

  // Fetch questions and session data
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
          // Use the correct auto-save endpoint
          await api.post(`/assessments/session/${session.id}/answer`, {
            questionId: questionId,
            value: value,
            isDraft: true,
            isComplete: false,
            timeSpent: 0
          })
          
          console.log('Auto-saved response for question', questionId)
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
      if (question.isRequired && !responses[question.id]) {
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
    const sectionQuestions = questions.filter(q => q.sectionTitle === currentSection)
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

      await api.post(`/assessments/session/${session?.id}/batch-answer`, {
        answers: responsesToSave
      })
      
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
      await api.post(`/assessments/session/${session?.id}/submit`)
      toast.success('Assessment submitted successfully! It will be reviewed by admin.')
      router.push('/peserta/submissions')
    } catch (err) {
      console.error('Error submitting assessment:', err)
      toast.error('Failed to submit assessment')
    } finally {
      setSaving(false)
    }
  }

  const sections = Array.from(new Set(questions.map(q => q.sectionTitle)))
  const currentSectionIndex = sections.indexOf(currentSection || '')
  const currentProgress = calculateProgress()

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
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
        {/* Progress */}
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

        {/* Section Navigation */}
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          {sections.map((section, index) => (
            <Button
              key={section}
              variant={currentSection === section ? 'default' : 'outline'}
              size="sm"
              onClick={() => section && setCurrentSection(section)}
              className="whitespace-nowrap flex-shrink-0"
            >
              {section}
            </Button>
          ))}
        </div>

        {/* Questions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">{currentSection}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 sm:space-y-8">
            {questions
              .filter(q => q.sectionTitle === currentSection)
              .map((question) => (
                <QuestionInput
                  key={question.id}
                  {...question}
                  value={responses[question.id]}
                  onChange={(value) => handleResponseChange(question.id, value)}
                  validationError={validationErrors[question.id]}
                />
              ))}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex flex-col space-y-3">
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
                disabled={saving}
                className="flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>{saving ? 'Submitting...' : 'Submit Assessment'}</span>
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentSection(sections[currentSectionIndex + 1] || null)}
                className="flex items-center space-x-2"
              >
                <span className="hidden sm:inline">Next Section</span>
                <span className="sm:hidden">Next</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={handleSaveSection}
              disabled={saving}
              className="flex items-center space-x-2 w-full sm:w-auto"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving...' : 'Save Progress'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

