'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  CheckCircle, 
  MessageSquare,
  Eye,
  EyeOff
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
  reviewComments?: Array<{
    id: number
    comment: string
    isCritical: boolean
    stage: string
    createdAt: string
    reviewerName?: string
  }>
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
  isResolved?: boolean
}

interface Submission {
  id: number
  groupName: string
  status: 'submitted' | 'needs_revision' | 'resubmitted' | 'approved' | 'rejected' | 'passed_to_jury' | 'jury_scoring' | 'jury_deliberation' | 'final_decision' | 'completed'
  submittedAt: string
  updatedAt: string
  progressPercentage: number
  feedback?: string
  revisionCount: number
  reviewId?: number
  questions: Question[]
  responses: Response[]
}

export default function AdminSubmissionReviewPage() {
  const router = useRouter()
  const { id } = useParams() as { id: string } // This is the sessionId
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generalFeedback, setGeneralFeedback] = useState('')
  const [showFeedback, setShowFeedback] = useState<Record<number, boolean>>({})
  const [currentSection, setCurrentSection] = useState<string>('')

    const fetchSubmission = async () => {
    try {
      setLoading(true)
      
      // Use the new admin endpoint to get detailed session information
      const sessionRes = await api.get(`/assessments/session/${id}/detail`)
      console.log('Admin session detail response:', sessionRes.data)
      console.log('Response structure check:', {
        hasData: !!sessionRes.data,
        hasDataData: !!sessionRes.data?.data,
        dataKeys: sessionRes.data ? Object.keys(sessionRes.data) : [],
        dataDataKeys: sessionRes.data?.data ? Object.keys(sessionRes.data.data) : []
      })
      
      if (!sessionRes.data) {
        throw new Error('Session not found')
      }
      
            // The API response has the structure: { success: true, message: "...", data: {...} }
      const sessionData = sessionRes.data.data || sessionRes.data
      
      console.log('Extracted sessionData:', sessionData)
      console.log('SessionData keys:', sessionData ? Object.keys(sessionData) : [])
      
      if (!sessionData) {
        throw new Error('Session not found')
      }
       
       // Log the full session data structure to understand what fields are available
       console.log('Full session data structure:', {
         id: sessionData.id,
         reviewId: sessionData.reviewId,
         review: sessionData.review,
         hasReviewComments: sessionData.questions?.some((q: any) => q.reviewComments?.length > 0),
         totalReviewComments: sessionData.questions?.reduce((total: number, q: any) => total + (q.reviewComments?.length || 0), 0)
       })
     
      // Check if we have responses in the session data
      if (!sessionData.questions?.some((q: any) => q.response !== undefined && q.response !== null)) {
        console.log('No responses found in session data. This might be because:')
        console.log('1. The session has no responses yet')
        console.log('2. The user has not submitted their assessment')
        console.log('3. The responses are stored differently')
      }
     
             // Extract review information from questions
       let existingReviewId: number | undefined
       const allReviewComments: any[] = []
       
       // First, check if there's a review ID in the session data itself
       if (sessionData.reviewId) {
         existingReviewId = sessionData.reviewId
         console.log('Found review ID in session data:', existingReviewId)
       } else {
         // Try to get review ID from comments
         sessionData.questions?.forEach((question: any) => {
           if (question.reviewComments && Array.isArray(question.reviewComments)) {
             question.reviewComments.forEach((comment: any) => {
               allReviewComments.push({
                 ...comment,
                 questionId: question.id
               })
             })
             // Get review ID from the first comment (they should all belong to the same review)
             if (question.reviewComments.length > 0 && !existingReviewId) {
               // Try different possible fields for review ID
               const comment = question.reviewComments[0]
               existingReviewId = comment.reviewId || comment.review?.id
               console.log('Extracting review ID from comment:', {
                 commentId: comment.id,
                 reviewId: comment.reviewId,
                 reviewObject: comment.review,
                 finalReviewId: existingReviewId
               })
             }
           }
         })
       }
       
       // If we still don't have a review ID, we'll need to create a new review when saving feedback
       if (!existingReviewId && allReviewComments.length > 0) {
         console.log('No review ID found, will create new review when saving feedback')
       }
      
      console.log('Found existing review ID:', existingReviewId)
      console.log('All review comments:', allReviewComments)
     
      // Transform the session data to match our Submission interface
      const submissionData: Submission = {
        id: sessionData.id,
        groupName: sessionData.groupName || `Group ${sessionData.groupId}`,
        status: sessionData.status,
        submittedAt: sessionData.submittedAt || sessionData.lastActivityAt,
        updatedAt: sessionData.lastActivityAt,
        progressPercentage: sessionData.progressPercentage || 0,
        feedback: sessionData.reviewComments,
        revisionCount: 0,
        reviewId: existingReviewId,
        questions: sessionData.questions || [],
                 responses: (() => {
           // Extract responses directly from questions since they're embedded
           const responsesFromQuestions = sessionData.questions?.map((question: any) => {
             if (question.response !== undefined && question.response !== null && question.response !== '') {
                               // Extract feedback from reviewComments if available
                let feedback: string | undefined
                let needsRevision: boolean = false
                let isResolved: boolean = false
                
                if (question.reviewComments && Array.isArray(question.reviewComments)) {
                  const adminComments = question.reviewComments.filter((comment: any) => 
                    comment.stage === 'admin_validation'
                  )
                  if (adminComments.length > 0) {
                    feedback = adminComments[0].comment
                    // Only mark as needing revision if not resolved
                    needsRevision = adminComments[0].isCritical && !adminComments[0].isResolved
                    isResolved = adminComments[0].isResolved || false
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
                    needsRevision: needsRevision,
                    isResolved: isResolved
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
                    needsRevision: needsRevision,
                    isResolved: isResolved
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
                    needsRevision: needsRevision,
                    isResolved: isResolved
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
                    needsRevision: needsRevision,
                    isResolved: isResolved
                  }
               } else if (typeof question.response === 'object' && Object.keys(question.response).length > 0) {
                 // Handle object response format (combined answer + url structure)
                 const response = question.response
                 if (response.answer !== undefined) {
                   // Handle combined response structure { answer: ..., url: ... }
                                       if (typeof response.answer === 'string') {
                      return {
                        questionId: question.id,
                        textValue: response.answer,
                        numericValue: undefined,
                        booleanValue: undefined,
                        arrayValue: undefined,
                        isComplete: true,
                        feedback: feedback,
                        needsRevision: needsRevision,
                        isResolved: isResolved
                      }
                                       } else if (typeof response.answer === 'number') {
                      return {
                        questionId: question.id,
                        textValue: undefined,
                        numericValue: response.answer,
                        booleanValue: undefined,
                        arrayValue: undefined,
                        isComplete: true,
                        feedback: feedback,
                        needsRevision: needsRevision,
                        isResolved: isResolved
                      }
                   }
                                   } else {
                    // Handle old object response format
                    return {
                      questionId: question.id,
                      textValue: response.textValue,
                      numericValue: response.numericValue,
                      booleanValue: response.booleanValue,
                      arrayValue: response.arrayValue,
                      isComplete: response.isComplete || true,
                      feedback: feedback || response.feedback,
                      needsRevision: needsRevision || response.needsRevision || false,
                      isResolved: isResolved || response.isResolved || false
                    }
                 }
               }
             }
             return null
           }).filter(Boolean) || []
           
           console.log('Extracted responses from questions:', responsesFromQuestions)
           return responsesFromQuestions
         })()
      }
      
      console.log('Extracted responses:', submissionData.responses)
      console.log('Final submission data:', {
        id: submissionData.id,
        groupName: submissionData.groupName,
        status: submissionData.status,
        submittedAt: submissionData.submittedAt,
        progressPercentage: submissionData.progressPercentage,
        questionsCount: submissionData.questions.length,
        responsesCount: submissionData.responses.length
      })
      
             console.log('About to set submission data:', {
         id: submissionData.id,
         groupName: submissionData.groupName,
         status: submissionData.status,
         submittedAt: submissionData.submittedAt,
         progressPercentage: submissionData.progressPercentage
       })
       
               setSubmission(submissionData)
        setGeneralFeedback(submissionData.feedback || '')
        
        // Set initial section to "Basic Information" if it exists, otherwise use first section
        if (submissionData.questions && submissionData.questions.length > 0) {
          const basicInfoSection = submissionData.questions.find(q => 
            q.sectionTitle === 'Basic Information' || 
            (q.sectionTitle === q.subsection && q.sectionTitle === 'Basic Information')
          )
          
          if (basicInfoSection) {
            setCurrentSection('Basic Information')
          } else {
            // Fallback to first section if "Basic Information" doesn't exist
            const firstQuestion = submissionData.questions[0]
            const initialSection = firstQuestion.sectionTitle === firstQuestion.subsection 
              ? firstQuestion.sectionTitle 
              : `${firstQuestion.sectionTitle} - ${firstQuestion.subsection}`
            setCurrentSection(initialSection)
          }
        }
         } catch (err) {
       console.error('Error fetching submission:', err)
       console.error('Error details:', {
         message: err.message,
         response: err.response?.data,
         status: err.response?.status
       })
       toast.error('Failed to load submission')
       
       // Fallback to mock data if API fails
      const mockSubmission: Submission = {
        id: parseInt(id),
        groupName: `Sample Organization ${id}`,
        status: 'submitted',
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        progressPercentage: 100,
        feedback: 'Overall assessment looks good, but some areas need improvement.',
        revisionCount: 0,
        questions: [
          {
            id: 1,
            questionText: 'What is your organization name?',
            description: 'Please provide the full legal name',
            inputType: 'text-open',
            sectionTitle: 'Personal Information',
            subsection: 'Basic Info',
            orderNumber: 1
          },
          {
            id: 2,
            questionText: 'Describe your main social impact programs',
            description: 'Provide detailed information about your programs',
            inputType: 'text-open',
            sectionTitle: 'Program Information',
            subsection: 'Impact Programs',
            orderNumber: 2
          },
          {
            id: 3,
            questionText: 'How many people have you helped?',
            description: 'Provide specific numbers',
            inputType: 'numeric',
            sectionTitle: 'Impact Metrics',
            subsection: 'Quantitative Data',
            orderNumber: 3
          }
        ],
        responses: [
          {
            questionId: 1,
            textValue: 'Sample Organization A',
            isComplete: true
          },
          {
            questionId: 2,
            textValue: 'We run various programs including education support, healthcare access, and community development initiatives.',
            isComplete: true
          },
          {
            questionId: 3,
            numericValue: 5000,
            isComplete: true
          }
        ]
      }
      
      setSubmission(mockSubmission)
      setGeneralFeedback(mockSubmission.feedback || '')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubmission()
  }, [id])

  const handleQuestionFeedback = async (questionId: number, feedback: string, needsRevision: boolean) => {
    if (!submission) return

    try {
      setSaving(true)
      
      // Use the review ID from the session data
      let reviewId = submission.reviewId
      
                    // Use the batch assessment review endpoint with updateExisting=true
       console.log('Creating/updating assessment review for session:', submission.id)
       
       // Collect all existing comments from the submission
       const existingComments = submission.questions
         .flatMap(q => (q.reviewComments || []).map(comment => ({
           questionId: q.id,
           comment: comment.comment,
           isCritical: comment.isCritical,
           stage: comment.stage || 'admin_validation'
         })))
       
       // Add the new comment to the collection
       const allComments = [
         ...existingComments,
         {
           questionId: questionId,
           comment: feedback,
           isCritical: needsRevision,
           stage: 'admin_validation'
         }
       ]
       
       console.log('Existing comments:', existingComments)
       console.log('All comments (including new):', allComments)
       
       const reviewPayload = {
         stage: 'admin_validation',
         decision: needsRevision ? 'needs_revision' : 'approve',
         overallComments: generalFeedback || '',
         questionComments: allComments,
         juriScores: [],
         totalScore: 0,
         deliberationNotes: '',
         internalNotes: '',
         validationChecklist: [],
         updateExisting: true
       }
       
       console.log('Review payload:', reviewPayload)
       
       const createReviewRes = await api.post(`/assessments/session/${submission.id}/review/batch`, reviewPayload)
       
       console.log('Create review response:', createReviewRes.data)
       
               // Extract review ID from response
        if (createReviewRes.data?.reviewId) {
          reviewId = createReviewRes.data.reviewId
        } else if (createReviewRes.data?.review?.id) {
          reviewId = createReviewRes.data.review.id
        } else if (createReviewRes.data?.id) {
          reviewId = createReviewRes.data.id
        } else {
          console.error('Unexpected review response structure:', createReviewRes.data)
          toast.error('Review created but ID not found in response')
          return
        }
      
      // Update local state
      setSubmission(prev => {
        if (!prev) return prev
        return {
          ...prev,
          reviewId: reviewId,
          responses: prev.responses.map(response => 
            response.questionId === questionId 
              ? { ...response, feedback, needsRevision }
              : response
          )
        }
      })
      
      toast.success('Feedback saved successfully')
         } catch (err: any) {
       console.error('Error saving feedback:', err)
       console.log('Error response data:', err.response?.data)
       toast.error('Failed to save feedback')
     } finally {
      setSaving(false)
    }
  }



           const handleApprove = async () => {
      if (!submission) return
  
      try {
        setSaving(true)
        
                console.log('Creating/updating assessment review for general feedback, session:', submission.id)
         
         // Collect all existing comments from the submission
         const existingComments = submission.questions
           .flatMap(q => (q.reviewComments || []).map(comment => ({
             questionId: q.id,
             comment: comment.comment,
             isCritical: comment.isCritical,
             stage: comment.stage || 'admin_validation'
           })))
         
         console.log('Preserving existing comments for general feedback:', existingComments)
         
         const reviewPayload = {
            stage: 'admin_validation',
            decision: 'approve',
            overallComments: generalFeedback || '',
            questionComments: existingComments,
            juriScores: [],
            totalScore: 0,
            deliberationNotes: '',
            internalNotes: '',
            validationChecklist: [],
            updateExisting: true
          }
         
         console.log('General feedback review payload:', reviewPayload)
         
         const createReviewRes = await api.post(`/assessments/session/${submission.id}/review/batch`, reviewPayload)
        
        console.log('Create review response:', createReviewRes.data)
        
        // Extract review ID from response
        let reviewId: number
        if (createReviewRes.data?.reviewId) {
          reviewId = createReviewRes.data.reviewId
        } else if (createReviewRes.data?.review?.id) {
          reviewId = createReviewRes.data.review.id
        } else if (createReviewRes.data?.id) {
          reviewId = createReviewRes.data.id
        } else {
          console.error('Unexpected review response structure:', createReviewRes.data)
          toast.error('Review created but ID not found in response')
          return
        }
        
        setSubmission(prev => prev ? { 
          ...prev, 
          feedback: generalFeedback,
          reviewId: reviewId 
        } : prev)
        
        toast.success('General feedback saved successfully')
      } catch (err: any) {
        console.error('Error saving general feedback:', err)
        console.log('Error response data:', err.response?.data)
        toast.error('Failed to save general feedback')
      } finally {
        setSaving(false)
      }
    }





  const getResponseValue = (response: Response) => {
    if (response.textValue !== undefined && response.textValue !== null) return response.textValue.toString()
    if (response.numericValue !== undefined && response.numericValue !== null) return response.numericValue.toString()
    if (response.booleanValue !== undefined && response.booleanValue !== null) return response.booleanValue ? 'Yes' : 'No'
    if (response.arrayValue && response.arrayValue.length > 0) return response.arrayValue.join(', ')
    return 'No response'
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

     const sections = Array.from(new Set(submission.questions.map(q => 
     q.sectionTitle === q.subsection ? q.sectionTitle : `${q.sectionTitle} - ${q.subsection}`
   )))
       const hasRevisions = submission.responses.some(r => r.needsRevision && !r.isResolved)
   
       const getStatusColor = (status: string) => {
      // If status is approved, show approved color regardless of revisions
      if (status === 'approved') {
        return 'text-green-500 bg-green-50'
      }
      
      // If there are revisions needed, override the status color
      if (hasRevisions) {
        return 'text-orange-500 bg-orange-50'
      }
      
      switch (status) {
        case 'submitted':
          return 'text-blue-500 bg-blue-50'
        case 'needs_revision':
          return 'text-orange-500 bg-orange-50'
        case 'resubmitted':
          return 'text-purple-500 bg-purple-50'
        case 'approved_for_juri':
          return 'text-green-500 bg-green-50'
        case 'with_juri':
          return 'text-indigo-500 bg-indigo-50'
        default:
          return 'text-gray-500 bg-gray-50'
      }
    }
 
       const getStatusLabel = (status: string) => {
      // If status is approved, show approved label regardless of revisions
      if (status === 'approved') {
        return 'Approved'
      }
      
      // If there are revisions needed, override the status label
      if (hasRevisions) {
        return 'Needs Revision'
      }
      
      switch (status) {
        case 'submitted':
          return 'Submitted'
        case 'needs_revision':
          return 'Needs Revision'
        case 'resubmitted':
          return 'Resubmitted'
        case 'approved_for_juri':
          return 'Approved for Juri'
        case 'with_juri':
          return 'With Juri'
        default:
          return status
      }
    }
   
   // Helper function to get section title from combined string
   const getSectionTitleFromCombined = (combinedSection: string) => {
     if (combinedSection.includes(' - ')) {
       return combinedSection.split(' - ')[0]
     }
     return combinedSection
   }
   
   // Filter questions for current section
   const currentSectionQuestions = submission.questions.filter(q => {
     const questionSection = q.sectionTitle === q.subsection ? q.sectionTitle : `${q.sectionTitle} - ${q.subsection}`
     return questionSection === currentSection
   })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push('/admin/submissions')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Submissions</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <Badge variant="outline" className={getStatusColor(submission.status)}>
                {getStatusLabel(submission.status)}
              </Badge>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Review Submission</h1>
              <p className="text-sm sm:text-base text-gray-600 truncate">{submission.groupName}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
        {/* Submission Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Group</p>
                <p className="font-medium break-words">{submission.groupName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Submitted</p>
                <p className="font-medium">
                  {submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : 'Not submitted'}
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
         <Card>
           <CardHeader>
             <CardTitle className="flex items-center space-x-2">
               <MessageSquare className="h-5 w-5" />
               <span>General Feedback</span>
             </CardTitle>
           </CardHeader>
                      <CardContent className="space-y-4">
                             {hasRevisions && submission.status !== 'approved' && (
                 <div className="flex items-center space-x-2">
                   <Badge variant="destructive">
                     {submission.responses.filter(r => r.needsRevision).length} questions need revision
                   </Badge>
                 </div>
               )}
              <Textarea
                placeholder="Provide general feedback for this submission..."
                value={generalFeedback}
                onChange={(e) => setGeneralFeedback(e.target.value)}
                rows={4}
              />
                             <div className="flex justify-end">
                                   <Button
                    onClick={handleApprove}
                    disabled={saving || hasRevisions || submission.status === 'approved'}
                    className="flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Approve for Juri</span>
                  </Button>
               </div>
            </CardContent>
         </Card>

                 {/* Section Navigation */}
         <Card>
           <CardContent className="pt-6">
             <div className="flex flex-wrap gap-2">
               {sections.map(section => (
                 <Button
                   key={section}
                   variant={currentSection === section ? 'default' : 'outline'}
                   size="sm"
                   onClick={() => setCurrentSection(section)}
                 >
                   {section}
                 </Button>
               ))}
             </div>
           </CardContent>
         </Card>

         {/* Questions Review */}
         <Card>
           <CardHeader>
             <div className="flex items-center justify-between">
               <CardTitle>{currentSection}</CardTitle>
               <div className="text-sm text-gray-500">
                 {(() => {
                   const answeredQuestions = currentSectionQuestions.filter(q => {
                     const response = submission.responses.find(r => r.questionId === q.id)
                     return response !== undefined && response !== null
                   })
                   return `${answeredQuestions.length}/${currentSectionQuestions.length}`
                 })()}
               </div>
             </div>
           </CardHeader>
           <CardContent className="space-y-6">
             {currentSectionQuestions.map(question => {
                  const response = submission.responses.find(r => r.questionId === question.id)
                  return (
                                         <div key={question.id} className="border rounded-lg p-4 space-y-4">
                       <div>
                         <h4 className="font-medium text-gray-900 mb-2 break-words">
                           {question.questionText}
                         </h4>
                         {question.description && (
                           <p className="text-sm text-gray-600 mb-3 break-words">{question.description}</p>
                         )}
                                                   <div className="bg-gray-50 rounded p-3">
                            <p className="text-sm text-gray-600 mb-1">Response:</p>
                            <p className="font-medium break-words">
                              {response ? getResponseValue(response) : (
                                <span className="text-gray-500 italic">
                                  No response yet. Responses will appear here once the user submits their assessment.
                                </span>
                              )}
                            </p>
                          </div>
                       </div>

                       <div className="space-y-3">
                         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                                                       <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowFeedback(prev => ({ 
                                ...prev, 
                                [question.id]: !prev[question.id] 
                              }))}
                              className="flex items-center space-x-2 w-fit"
                            >
                              {showFeedback[question.id] ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                              <span>{submission.status === 'approved' ? 'View Feedback' : 'Add Feedback'}</span>
                            </Button>
                                                       {response?.needsRevision && submission.status !== 'approved' && (
                              <Badge variant="destructive">Needs Revision</Badge>
                            )}
                         </div>

                                                   {showFeedback[question.id] && (
                            <div className="space-y-3">
                              {submission.status === 'approved' ? (
                                // Read-only feedback display for approved submissions
                                <div className="bg-gray-50 rounded p-3">
                                  <p className="text-sm text-gray-600 mb-1">Feedback:</p>
                                  <p className="font-medium break-words">
                                    {response?.feedback || 'No feedback provided'}
                                  </p>
                                  {response?.needsRevision && (
                                    <div className="mt-2">
                                      <Badge variant="destructive">Needs Revision</Badge>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                // Editable feedback for non-approved submissions
                                <>
                                  <Textarea
                                    placeholder="Provide feedback for this question..."
                                    value={response?.feedback || ''}
                                    onChange={(e) => {
                                      const newFeedback = e.target.value
                                      setSubmission(prev => {
                                        if (!prev) return prev
                                        return {
                                          ...prev,
                                          responses: prev.responses.map(r => 
                                            r.questionId === question.id 
                                              ? { ...r, feedback: newFeedback }
                                              : r
                                          )
                                        }
                                      })
                                    }}
                                    rows={3}
                                  />
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                                    <label className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        checked={response?.needsRevision || false}
                                        onChange={(e) => {
                                          const needsRevision = e.target.checked
                                          setSubmission(prev => {
                                            if (!prev) return prev
                                            return {
                                              ...prev,
                                              responses: prev.responses.map(r => 
                                                r.questionId === question.id 
                                                  ? { ...r, needsRevision }
                                                  : r
                                              )
                                            }
                                          })
                                        }}
                                        className="rounded"
                                      />
                                      <span className="text-sm">Needs revision</span>
                                    </label>
                                    <Button
                                      size="sm"
                                      onClick={() => handleQuestionFeedback(
                                        question.id,
                                        response?.feedback || '',
                                        response?.needsRevision || false
                                      )}
                                      disabled={saving}
                                      className="w-full sm:w-auto"
                                    >
                                      Save
                                    </Button>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                       </div>
                     </div>
                  )
                })}
                         </CardContent>
           </Card>

                 
      </div>
    </div>
  )
}
