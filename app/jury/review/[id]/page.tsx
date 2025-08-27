'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Save, Send, Download, FileText, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import { getProfile } from '@/lib/auth'

interface Question {
  id: number
  questionText: string
  description?: string
  inputType: string
  isRequired: boolean
  orderNumber: number
  sectionTitle: string
  subsection: string
  isGrouped: boolean
  options: any[]
  response: any
  isAnswered: boolean
  isSkipped: boolean
  reviewComments: ReviewComment[]
  juryScores?: JuryScore[]
  category?: {
    id: number
    name: string
    description: string
    weight: number
    minValue: number
    maxValue: number
    scoreType: string
  }
}

interface JuryScore {
  id: number
  questionId: number
  score: number
  comments: string
  createdAt: string
}

interface ReviewComment {
  id: number
  comment: string
  isCritical: boolean
  stage: string
  createdAt: string
  reviewerName: string
  isResolved: boolean
}

interface SessionData {
  id: number
  userId: number
  groupId: number
  groupName: string
  status: string
  progressPercentage: number
  autoSaveEnabled: boolean
  questions: Question[]
  startedAt: string
  lastActivityAt: string
  submittedAt: string
  reviewStage: string
  reviewDecision: string
  reviewScore: number
  reviewedAt: string
  reviewerName: string
  reviewComments: string
}

export default function ReviewPage() {
  const router = useRouter()
  const { id } = useParams() as { id: string }
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submission, setSubmission] = useState<SessionData | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [scores, setScores] = useState<Record<number, number>>({})
  const [comments, setComments] = useState<Record<number, string>>({})
  const [overallComments, setOverallComments] = useState('')
  const [juryComments, setJuryComments] = useState('')
  const [activeSubsection, setActiveSubsection] = useState<string>('')
  const [subsections, setSubsections] = useState<string[]>([])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Use the detail endpoint to get session information
      const sessionRes = await api.get(`/assessments/session/${id}/detail`)
      console.log('Juri session detail response:', sessionRes.data)
      
      if (!sessionRes.data?.data) {
        throw new Error('Session not found')
      }
      
             const sessionData: SessionData = sessionRes.data.data
       setSubmission(sessionData)
       setQuestions(sessionData.questions || [])
       
       // Extract unique subsections and set the first one as active
       const uniqueSubsections = [...new Set(sessionData.questions?.map(q => q.subsection) || [])]
       setSubsections(uniqueSubsections)
       if (uniqueSubsections.length > 0) {
         setActiveSubsection(uniqueSubsections[0])
       }
       
       // Initialize overall comments from existing review comments
       if (sessionData.reviewComments) {
         setOverallComments(sessionData.reviewComments)
       }
       
       // Initialize jury comments from existing jury review comments
       if (sessionData.juryComments) {
         setJuryComments(sessionData.juryComments)
       }
       
       // Initialize existing scores and comments from questions
       const existingScores: Record<number, number> = {}
       const existingComments: Record<number, string> = {}
       
               sessionData.questions?.forEach(question => {
          if (question.juryScores && question.juryScores.length > 0) {
            // Get the latest score
            const latestScore = question.juryScores[question.juryScores.length - 1]
            existingScores[question.id] = latestScore.score
            existingComments[question.id] = latestScore.comments || ''
          }
        })
        
        setScores(existingScores)
        setComments(existingComments)
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

  const getQuestionsBySubsection = (subsection: string) => {
    return questions.filter(q => q.subsection === subsection)
  }

  const getQuestionCount = (subsection: string) => {
    const subsectionQuestions = getQuestionsBySubsection(subsection)
    const scoredCount = subsectionQuestions.filter(q => q.juryScores && q.juryScores.length > 0).length
    return `${scoredCount}/${subsectionQuestions.length}`
  }

  const shouldShowScoreCount = (subsection: string) => {
    // Don't show score count for Basic Information section
    return subsection.toLowerCase() !== 'basic information'
  }

  // Navigation functions
  const getCurrentSubsectionIndex = () => {
    return subsections.findIndex(subsection => subsection === activeSubsection)
  }

  const goToNextSubsection = () => {
    const currentIndex = getCurrentSubsectionIndex()
    if (currentIndex < subsections.length - 1) {
      setActiveSubsection(subsections[currentIndex + 1])
      // Scroll to top of questions section
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goToPreviousSubsection = () => {
    const currentIndex = getCurrentSubsectionIndex()
    if (currentIndex > 0) {
      setActiveSubsection(subsections[currentIndex - 1])
      // Scroll to top of questions section
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const isFirstSubsection = getCurrentSubsectionIndex() === 0
  const isLastSubsection = getCurrentSubsectionIndex() === subsections.length - 1

  // Check if the submission is completed and should be read-only
  const isCompleted = submission?.status?.toLowerCase() === 'completed'
  const isReadOnly = isCompleted

  const renderResponse = (response: any, inputType: string, options?: any[]) => {
    if (!response) return 'No response'
    
    switch (inputType) {
      case 'text-open':
        return typeof response === 'string' ? response : response.answer || response
      case 'numeric-open':
        return typeof response === 'string' ? response : response.answer || response
      case 'multiple-choice':
        if (Array.isArray(response)) {
          return response.map((item: any) => {
            const responseValue = typeof item === 'string' ? item : item.value || item
            // Find the matching option and return its text
            const option = options?.find(opt => opt.optionValue === responseValue)
            return option ? option.optionText : responseValue
          }).join(', ')
        } else {
          const responseValue = typeof response === 'string' ? response : response.value || response
          // Find the matching option and return its text
          const option = options?.find(opt => opt.optionValue === responseValue)
          return option ? option.optionText : responseValue
        }
      case 'checkbox':
        if (Array.isArray(response)) {
          return response.map((item: any) => {
            const responseValue = typeof item === 'string' ? item : item.value || item
            // Find the matching option and return its text
            const option = options?.find(opt => opt.optionValue === responseValue)
            return option ? option.optionText : responseValue
          }).join(', ')
        } else {
          const responseValue = typeof response === 'string' ? response : response.value || response
          // Find the matching option and return its text
          const option = options?.find(opt => opt.optionValue === responseValue)
          return option ? option.optionText : responseValue
        }
      case 'file-upload':
        if (Array.isArray(response)) {
          return (
            <div className="space-y-2">
              {response.map((url: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    View File {index + 1}
                  </a>
                </div>
              ))}
            </div>
          )
        }
        return response
      default:
        return typeof response === 'string' ? response : JSON.stringify(response)
    }
  }

  const handleCompleteReview = async () => {
    try {
      setSaving(true)
      
      // Get current user profile to get jury ID
      const currentUser = await getProfile()
      const juryId = currentUser.id
      
      // Prepare the payload for completing the assessment
      const questionScoresArray = Object.entries(scores).map(([questionId, score]) => {
        const question = questions.find(q => q.id === parseInt(questionId))
        const comment = comments[parseInt(questionId)] || ''
        const weight = question?.category?.weight || 1
        const scoreResult = Math.round((score * weight) * 100) / 100 // Round to 2 decimal places
        
        return {
          questionId: parseInt(questionId),
          comment: comment,
          score: score,
          weight: weight,
          scoreResult: scoreResult
        }
      })

      const reviewPayload = {
        stage: 'jury_scoring',
        decision: 'completed',
        sessionId: parseInt(id),
        juryId: juryId,
        overallComments: overallComments,
        juryComments: juryComments,
        questionScores: questionScoresArray,
        totalScore: Math.round(questionScoresArray.reduce((sum, question) => sum + question.scoreResult, 0)),
        validationChecklist: [],
        updateExisting: true
      }
      
      // Call the API to complete the review
      await api.post(`/assessments/jury/${id}/complete`, reviewPayload)
      
      toast.success('Review completed successfully')
      router.push('/jury')
    } catch (err) {
      console.error('Error completing review:', err)
      toast.error('Failed to complete review')
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async (asDraft: boolean = true) => {
    try {
      setSaving(true)
      
      // Prepare the payload for saving as draft
      const reviewPayload = {
        stage: 'jury_scoring',
        decision: 'needs_deliberation',
        overallComments: overallComments,
        juryComments: juryComments,
        questionComments: Object.entries(comments).map(([questionId, comment]) => ({
          questionId: parseInt(questionId),
          comment: comment,
          isCritical: false,
          stage: 'jury_scoring'
        })),
        juryScores: Object.entries(scores).map(([questionId, score]) => ({
          questionId: parseInt(questionId),
          score: score,
          comments: comments[parseInt(questionId)] || ''
        })),
        totalScore: Object.values(scores).reduce((sum, score) => sum + score, 0),
        validationChecklist: [],
        updateExisting: true
      }
      
      console.log('=== SAVE DRAFT PAYLOAD ===')
      console.log('Submission ID:', id)
      console.log('Payload:', JSON.stringify(reviewPayload, null, 2))
      console.log('=====================================')
      
      // Call the API to save as draft
      await api.post(`/assessments/jury/${id}/review`, reviewPayload)
      
      toast.success('Review saved as draft')
    } catch (err) {
      console.error('Error saving draft:', err)
      toast.error('Failed to save draft')
    } finally {
      setSaving(false)
    }
  }

    const handleSaveQuestion = async (questionId: number) => {
    try {
      setSaving(true)
      
      // Create a payload with just this question's data
      const questionScore = scores[questionId] || 0
      const questionComment = comments[questionId] || ''
      
      const reviewPayload = {
        stage: 'jury_scoring',
        decision: 'needs_deliberation',
        overallComments: overallComments,
        juryComments: juryComments,
        questionComments: questionComment ? [{
          questionId: questionId,
          comment: questionComment,
          isCritical: false,
          stage: 'jury_scoring'
        }] : [],
        juryScores: [{
          questionId: questionId,
          score: questionScore,
          comments: questionComment
        }],
        totalScore: questionScore,
        validationChecklist: [],
        updateExisting: true
      }
      
      console.log('Saving individual question:', questionId, reviewPayload)
      
      await api.post(`/assessments/jury/${id}/review`, reviewPayload)
      
      // Update the question's juryScores in the local state to reflect the save
      setQuestions(prevQuestions => 
        prevQuestions.map(question => {
          if (question.id === questionId) {
            const newJuryScore = {
              id: Date.now(), // Temporary ID for local state
              questionId: questionId,
              score: questionScore,
              comments: questionComment,
              createdAt: new Date().toISOString()
            }
            
            // Replace existing scores or add new one
            const existingScores = question.juryScores || []
            const updatedScores = [...existingScores, newJuryScore]
            
            return {
              ...question,
              juryScores: updatedScores
            }
          }
          return question
        })
      )
      

      
      toast.success('Question saved successfully')
    } catch (err) {
      console.error('Error saving question:', err)
      toast.error('Failed to save question')
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
                              onClick={() => router.push('/jury')}
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
            {isCompleted ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Review Completed</span>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            ) : (
              <Button
                onClick={handleCompleteReview}
                disabled={saving}
                className="flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>{saving ? 'Submitting...' : 'Complete Review'}</span>
              </Button>
            )}
          </div>
        </div>

        <div className="max-w-5xl mx-auto space-y-6">
          {/* Read-only Notice */}
          {isReadOnly && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <h3 className="text-sm font-medium text-green-800">Review Completed</h3>
                    <p className="text-sm text-green-600">This submission has been reviewed and completed. All fields are read-only.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submission Info */}
           <Card>
             <CardHeader>
               <CardTitle>Submission Details</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <h3 className="text-sm font-medium text-gray-500">Group Name</h3>
                   <p className="mt-1 text-gray-900">{submission.groupName}</p>
                 </div>
                 <div>
                   <h3 className="text-sm font-medium text-gray-500">Status</h3>
                   <p className="mt-1 text-gray-900 capitalize">{submission.status}</p>
                 </div>
                 
                 <div>
                   <h3 className="text-sm font-medium text-gray-500">Submitted On</h3>
                   <p className="mt-1 text-gray-900">
                     {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : 'Invalid Date'}
                   </p>
                 </div>
                 {isCompleted && submission.reviewScore !== undefined && (
                   <div>
                     <h3 className="text-sm font-medium text-gray-500">Review Score</h3>
                     <p className="mt-1 text-gray-900 font-semibold text-lg">{submission.reviewScore}</p>
                   </div>
                 )}
               </div>
             </CardContent>
           </Card>

           {/* Overall Comments (Readonly) */}
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center space-x-2">
                 <MessageSquare className="h-5 w-5" />
                 <span>Admin Comments</span>
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="bg-gray-50 p-4 rounded-lg min-h-[150px]">
                 {overallComments ? (
                   <p className="text-gray-900 whitespace-pre-wrap">{overallComments}</p>
                 ) : (
                   <p className="text-gray-500 italic">No admin comments provided</p>
                 )}
               </div>
             </CardContent>
           </Card>

           {/* Jury Comments */}
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center space-x-2">
                 <MessageSquare className="h-5 w-5" />
                 <span>Jury Comments</span>
               </CardTitle>
             </CardHeader>
             <CardContent>
               {isReadOnly ? (
                 <div className="bg-gray-50 p-4 rounded-lg min-h-[150px]">
                   {juryComments ? (
                     <p className="text-gray-900 whitespace-pre-wrap">{juryComments}</p>
                   ) : (
                     <p className="text-gray-500 italic">No jury comments provided</p>
                   )}
                 </div>
               ) : (
                 <Textarea
                   value={juryComments}
                   onChange={(e) => setJuryComments(e.target.value)}
                   placeholder="Provide your jury feedback and comments about this submission..."
                   className="min-h-[150px]"
                 />
               )}
             </CardContent>
           </Card>

                     {/* Subsection Filters */}
           {subsections.length > 0 && (
             <Card>
               <CardContent className="pt-6">
                 <div className="flex flex-wrap gap-2">
                   {subsections.map((subsection) => (
                     <Button
                       key={subsection}
                       variant={activeSubsection === subsection ? 'default' : 'outline'}
                       size="sm"
                       onClick={() => setActiveSubsection(subsection)}
                       className="flex items-center space-x-2"
                     >
                       <span>{subsection}</span>
                                               {shouldShowScoreCount(subsection) && (
                          <span className="text-xs opacity-75">({getQuestionCount(subsection)} scored)</span>
                        )}
                     </Button>
                   ))}
                 </div>
               </CardContent>
             </Card>
           )}

           {/* Questions and Scoring */}
           {activeSubsection && (
             <>
               <Card>
                 <CardHeader>
                   <CardTitle className="text-lg">{activeSubsection}</CardTitle>
                                       {shouldShowScoreCount(activeSubsection) && (
                      <p className="text-sm text-gray-500">
                        {getQuestionCount(activeSubsection)} questions scored
                      </p>
                    )}
                 </CardHeader>
               </Card>
               {getQuestionsBySubsection(activeSubsection).map((question) => (
            <Card key={question.id}>
                             <CardHeader>
                                   <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{question.questionText}</CardTitle>
                  </div>
                 {question.description && (
                   <p className="text-sm text-gray-500">{question.description}</p>
                 )}
                 {question.category && (
                   <div className="mt-2">
                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                       {question.category.name} (Weight: {question.category.weight}, Min: {question.category.minValue}, Max: {question.category.maxValue}, Type: {question.category.scoreType})
                     </span>
                   </div>
                 )}
               </CardHeader>
               <CardContent className="space-y-4">
                 {/* Response */}
                 <div className="bg-gray-50 p-4 rounded-lg">
                   <div className="flex items-start justify-between">
                     <div className="flex-1">
                       <h4 className="text-sm font-medium text-gray-500 mb-2">Response</h4>
                       <div className="text-gray-900">
                         {renderResponse(question.response, question.inputType, question.options)}
                       </div>
                     </div>
                     {question.category && question.response && (() => {
                       const responseValue = typeof question.response === 'number' ? question.response :
                                            typeof question.response === 'string' ? parseFloat(question.response) :
                                            question.response.answer !== undefined ? parseFloat(question.response.answer) : null
                       if (responseValue !== null && !isNaN(responseValue)) {
                         const { minValue, maxValue } = question.category
                         let resultText = ''
                         let resultColor = ''
                         
                         // Handle cases where minValue > maxValue (inverted range)
                         const actualMin = Math.min(minValue, maxValue)
                         const actualMax = Math.max(minValue, maxValue)
                         
                         if (responseValue < actualMin) {
                           resultText = `Under minimum (${actualMin})`
                           resultColor = 'bg-red-100 text-red-800'
                         } else if (responseValue > actualMax) {
                           resultText = `Above maximum (${actualMax})`
                           resultColor = 'bg-orange-100 text-orange-800'
                         } else {
                           resultText = `In range (${actualMin}-${actualMax})`
                           resultColor = 'bg-green-100 text-green-800'
                         }
                         
                         return (
                           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${resultColor} ml-3 flex-shrink-0`}>
                             {resultText}
                           </span>
                         )
                       }
                       return null
                     })()}
                   </div>
                 </div>

                                 {/* Review Comments */}
                 {question.reviewComments && question.reviewComments.length > 0 && (
                   <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                     <h4 className="text-sm font-medium text-yellow-800 mb-2">Review Comments</h4>
                     <div className="space-y-2">
                       {question.reviewComments.map((comment) => (
                         <div key={comment.id} className="text-sm">
                           <div className="flex items-center justify-between">
                             <span className="font-medium text-yellow-800">{comment.reviewerName}</span>
                             <span className="text-yellow-600 text-xs">
                               {new Date(comment.createdAt).toLocaleDateString()}
                             </span>
                           </div>
                           <p className="text-yellow-700 mt-1">{comment.comment}</p>
                           {comment.isCritical && (
                             <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
                               Critical
                             </span>
                           )}
                         </div>
                       ))}
                     </div>
                   </div>
                 )}

                 

                                                                   {/* Scoring - Only show for non-Basic Information questions */}
                  {activeSubsection !== 'Basic Information' && (
                    <>
                                             <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">
                           Score (0-10)
                         </label>
                         {isReadOnly ? (
                           <div className="bg-gray-50 p-3 rounded border w-32">
                             <span className="text-gray-900">{scores[question.id] || 'Not scored'}</span>
                           </div>
                         ) : (
                           <Input
                             type="number"
                             min={0}
                             max={10}
                             value={scores[question.id] || ''}
                             onChange={(e) => handleScoreChange(question.id, parseFloat(e.target.value))}
                             className="w-32"
                           />
                         )}
                       </div>

                      {/* Comments */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Comments
                        </label>
                        {isReadOnly ? (
                          <div className="bg-gray-50 p-4 rounded-lg min-h-[100px]">
                            {comments[question.id] ? (
                              <p className="text-gray-900 whitespace-pre-wrap">{comments[question.id]}</p>
                            ) : (
                              <p className="text-gray-500 italic">No comments provided</p>
                            )}
                          </div>
                        ) : (
                          <Textarea
                            value={comments[question.id] || ''}
                            onChange={(e) => handleCommentChange(question.id, e.target.value)}
                            placeholder="Add your comments about this response..."
                            className="min-h-[100px]"
                          />
                        )}
                      </div>

                      {/* Save Button for Individual Question */}
                      {!isReadOnly && (
                        <div className="flex justify-end">
                          <Button
                            onClick={() => handleSaveQuestion(question.id)}
                            disabled={saving}
                            size="sm"
                            className="flex items-center space-x-2"
                          >
                            <Save className="h-4 w-4" />
                            <span>{saving ? 'Saving...' : 'Save'}</span>
                          </Button>
                        </div>
                      )}
                    </>
                  )}
               </CardContent>
             </Card>
           ))}

           {/* Subsection Navigation Buttons */}
           {subsections.length > 1 && (
             <Card>
               <CardContent className="pt-6">
                 <div className="flex items-center justify-between">
                   <Button
                     variant="outline"
                     onClick={goToPreviousSubsection}
                     disabled={isFirstSubsection}
                     className="flex items-center space-x-2"
                   >
                     <ChevronLeft className="h-4 w-4" />
                     <span>Previous Section</span>
                   </Button>
                   
                   <div className="text-sm text-gray-500">
                     Section {getCurrentSubsectionIndex() + 1} of {subsections.length}
                   </div>
                   
                   <Button
                     variant="outline"
                     onClick={goToNextSubsection}
                     disabled={isLastSubsection}
                     className="flex items-center space-x-2"
                   >
                     <span>Next Section</span>
                     <ChevronRight className="h-4 w-4" />
                   </Button>
                 </div>
               </CardContent>
             </Card>
           )}
                          </>
           )}
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
