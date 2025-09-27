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
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { PdfModal } from '@/components/ui/pdf-modal'

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
  category?: {
    id: number
    name: string
    description: string
    weight: number
    minValue: number
    maxValue: number
    scoreType: string
  }
  juryScores?: Array<{
    score: number
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
  const [currentSection, setCurrentSection] = useState<string>('')
  const [pdfModalOpen, setPdfModalOpen] = useState(false)
  const [pdfModalUrl, setPdfModalUrl] = useState('')
  const [pdfModalTitle, setPdfModalTitle] = useState('')

  const openPdfModal = (url: string, title: string = 'Document') => {
    setPdfModalUrl(url)
    setPdfModalTitle(title)
    setPdfModalOpen(true)
  }

  const closePdfModal = () => {
    setPdfModalOpen(false)
    setPdfModalUrl('')
    setPdfModalTitle('')
  }

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
         } catch (err: any) {
       console.error('Error fetching submission:', err)
       console.error('Error details:', {
         message: err.message,
         response: err.response?.data,
         status: err.response?.status
       })
               toast.error('Gagal memuat pengajuan')
       
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
          toast.error('Ulasan dibuat tetapi ID tidak ditemukan dalam respons')
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
      
             toast.success('Umpan balik berhasil disimpan')
         } catch (err: any) {
       console.error('Error saving feedback:', err)
       console.log('Error response data:', err.response?.data)
       toast.error('Gagal menyimpan umpan balik')
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
          toast.error('Ulasan dibuat tetapi ID tidak ditemukan dalam respons')
          return
        }
        
        setSubmission(prev => prev ? { 
          ...prev, 
          feedback: generalFeedback,
          reviewId: reviewId,
          status: 'approved' // Update status to reflect approval
        } : prev)
        
                 toast.success('Pengajuan berhasil disetujui dan dikirim ke juri')
        
        // Refresh the page data to get updated information
        setTimeout(() => {
          fetchSubmission()
        }, 1000) // Wait 1 second before refreshing to ensure the API has processed the changes
        
      } catch (err: any) {
        console.error('Error saving general feedback:', err)
        console.log('Error response data:', err.response?.data)
        toast.error('Gagal menyimpan umpan balik umum')
      } finally {
        setSaving(false)
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
          
          return (
            <div key={index} className="space-y-3">
              {/* Answer Text - Following participant assessment page pattern */}
              <div className="flex items-center space-x-3 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex-1">
                  {isError ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-orange-600 dark:text-orange-400 text-sm font-medium">
                        File Uploaded with Warning
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
                    {/* Check if the answer contains a Cloudinary URL and make it clickable */}
                    {fileResponse.answer && fileResponse.answer.includes('cloudinary.com') ? (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-700 dark:text-gray-300 break-words">
                          {fileResponse.answer}
                        </p>
                        <button
                          onClick={() => openPdfModal(fileResponse.answer, 'Uploaded File')}
                          className="inline-flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>View File</span>
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700 dark:text-gray-300 break-words">
                        {fileResponse.answer}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* File Access - Keep existing admin interface style for ALL URLs */}
              {fileResponse.url && (
                <div className="flex items-center space-x-3 p-3 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-blue-800 dark:text-blue-200 text-sm font-medium">
                        Submitted File (Admin View)
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {/* Check if it's a Cloudinary URL for modal display */}
                      {fileResponse.url && fileResponse.url.includes('cloudinary.com') ? (
                        <button
                          onClick={() => openPdfModal(fileResponse.url, 'Uploaded File')}
                          className="inline-flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>View File</span>
                        </button>
                      ) : (
                        <a
                          href={fileResponse.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>View File</span>
                        </a>
                      )}
                      
                      <a
                        href={fileResponse.url}
                        download
                        className="inline-flex items-center space-x-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Download</span>
                      </a>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {fileResponse.url}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="p-6 space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="p-6">
          <Card className="border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
            <CardContent className="py-12">
              <div className="text-center">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/40 mb-4 inline-block">
                  <MessageSquare className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-lg">Pengajuan tidak ditemukan</p>
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
        case 'in_progress':
          return 'text-blue-500 bg-blue-50'
        case 'submitted':
          return 'text-blue-500 bg-blue-50'
        case 'needs_revision':
          return 'text-orange-500 bg-orange-50'
        case 'resubmitted':
          return 'text-purple-500 bg-purple-50'
        case 'completed':
          return 'text-green-500 bg-green-50'
        default:
          return 'text-gray-500 bg-gray-50'
      }
    }
 
         const getStatusLabel = (status: string) => {
    // If status is approved, show approved label regardless of revisions
    if (status === 'approved') {
      return 'Setujui untuk Juri'
    }
    
    // If there are revisions needed, override the status label
    if (hasRevisions) {
      return 'Perlu Revisi'
    }
    
    switch (status) {
      case 'in_progress':
        return 'Sedang Berlangsung'
      case 'submitted':
        return 'Dikirim'
      case 'needs_revision':
        return 'Perlu Revisi'
      case 'resubmitted':
        return 'Dikirim Ulang'
      case 'completed':
        return 'Selesai'
      default:
        return status
    }
  }

  // Helper function to check if submission is in read-only mode (completed status)
  const isReadOnly = submission.status === 'completed'
   
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

   // Navigation functions
   const getCurrentSectionIndex = () => {
     return sections.findIndex(section => section === currentSection)
   }

   const goToNextSection = () => {
     const currentIndex = getCurrentSectionIndex()
     if (currentIndex < sections.length - 1) {
       setCurrentSection(sections[currentIndex + 1])
       // Scroll to top of questions section
       window.scrollTo({ top: 0, behavior: 'smooth' })
     }
   }

   const goToPreviousSection = () => {
     const currentIndex = getCurrentSectionIndex()
     if (currentIndex > 0) {
       setCurrentSection(sections[currentIndex - 1])
       // Scroll to top of questions section
       window.scrollTo({ top: 0, behavior: 'smooth' })
     }
   }

   const isFirstSection = getCurrentSectionIndex() === 0
   const isLastSection = getCurrentSectionIndex() === sections.length - 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-blue-500/5 to-blue-600/5 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-blue-400/5 to-blue-500/5 blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-gradient-to-r from-blue-500/3 to-blue-600/3 blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-blue-500/10 via-blue-600/10 to-blue-500/10 border-b border-blue-200/50 dark:border-blue-800/50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-600/5"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'32\\' height=\\'32\\' viewBox=\\'0 0 32 32\\'><path fill=\\'%233B82F6\\' d=\\'M0 31h32v1H0zM31 0v32h1V0z\\'/></svg>')] opacity-5"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.push('/admin/submissions')}
                  className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-gray-900 dark:text-white backdrop-blur-sm border border-white/20"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Kembali ke Pengajuan</span>
                  <span className="sm:hidden">Kembali</span>
                </Button>
                <Badge variant="outline" className={`${getStatusColor(submission.status)} bg-white/20 backdrop-blur-sm border-white/20`}>
                  {getStatusLabel(submission.status)}
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg border-2 border-blue-400/50">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 bg-clip-text text-transparent">
                  Tinjau Pengajuan
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1 text-lg">
                  {submission.groupName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Submission Info */}
        <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="pt-6 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 group-hover:from-blue-100 dark:group-hover:from-blue-900/30 group-hover:to-blue-200 dark:group-hover:to-blue-800/30 transition-all duration-300">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">Kelompok</p>
                <p className="font-semibold text-gray-900 dark:text-white break-words">{submission.groupName}</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 group-hover:from-green-100 dark:group-hover:from-green-900/30 group-hover:to-green-200 dark:group-hover:to-green-800/30 transition-all duration-300">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">Dikirim</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : 'Belum dikirim'}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 group-hover:from-purple-100 dark:group-hover:from-purple-900/30 group-hover:to-purple-200 dark:group-hover:to-purple-800/30 transition-all duration-300">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">Kemajuan</p>
                <p className="font-semibold text-gray-900 dark:text-white">{submission.progressPercentage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* General Feedback */}
        <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center space-x-3 text-xl">
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40">
                <MessageSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-gray-900 dark:text-white font-bold">Umpan Balik Umum</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            {hasRevisions && submission.status !== 'approved' && !isReadOnly && (
              <div className="flex items-center space-x-2">
                <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                  {submission.responses.filter(r => r.needsRevision).length} pertanyaan perlu revisi
                </Badge>
              </div>
            )}
            {isReadOnly ? (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">Umpan Balik:</p>
                <p className="font-medium break-words text-gray-900 dark:text-white">
                  {generalFeedback || 'Tidak ada umpan balik yang diberikan'}
                </p>
              </div>
            ) : (
              <Textarea
                placeholder="Berikan umpan balik umum untuk pengajuan ini..."
                value={generalFeedback}
                onChange={(e) => setGeneralFeedback(e.target.value)}
                rows={4}
                className="border-gray-300 focus:border-green-500 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-800 dark:focus:border-green-400 transition-all duration-200"
              />
            )}
            <div className="flex justify-end">
              <Button
                onClick={handleApprove}
                disabled={saving || hasRevisions || submission.status === 'approved' || isReadOnly}
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-200"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Setujui untuk Juri</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Section Navigation */}
        <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="pt-6 relative z-10">
            <div className="flex flex-wrap gap-3">
              {sections.map(section => (
                <Button
                  key={section}
                  variant={currentSection === section ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentSection(section)}
                  className={`flex items-center space-x-2 transition-all duration-200 ${
                    currentSection === section 
                      ? 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white shadow-lg shadow-purple-500/25' 
                      : 'bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-purple-200/50 dark:border-purple-800/50 hover:bg-white/70 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <span className="font-medium">{section}</span>
                  <span className="text-xs opacity-75 bg-white/20 dark:bg-black/20 px-2 py-1 rounded-full">
                    {(() => {
                      const sectionQuestions = submission.questions.filter(q => {
                        const questionSection = q.sectionTitle === q.subsection 
                          ? q.sectionTitle 
                          : `${q.sectionTitle} - ${q.subsection}`
                        return questionSection === section
                      })
                      const answeredQuestions = sectionQuestions.filter(q => {
                        const response = submission.responses.find(r => r.questionId === q.id)
                        return response !== undefined && response !== null
                      })
                      return `${answeredQuestions.length}/${sectionQuestions.length}`
                    })()}
                  </span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

                 {/* Questions Review */}
        <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40">
                  <MessageSquare className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <span className="text-gray-900 dark:text-white font-bold">{currentSection}</span>
              </CardTitle>
              <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-full">
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
          <CardContent className="space-y-8 relative z-10">
            {currentSectionQuestions.map(question => {
              const response = submission.responses.find(r => r.questionId === question.id)
              return (
                <div key={question.id} className="group/question border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-6 space-y-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.01] bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-700/30 dark:to-gray-800/30">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 break-words text-lg">
                      {question.questionText}
                    </h4>
                    {question.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 break-words">{question.description}</p>
                    )}
                    {question.category && (
                      <div className="mt-3 mb-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 text-blue-800 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50">
                          {question.category.name} (Bobot: {question.category.weight}, Min: {question.category.minValue}, Max: {question.category.maxValue}, Tipe: {question.category.scoreType})
                        </span>
                      </div>
                    )}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">Jawaban:</p>
                          <div className="font-medium break-words text-gray-900 dark:text-white">
                            {response ? (
                              typeof getResponseValue(response) === 'object' ? 
                                getResponseValue(response) : 
                                <p>{getResponseValue(response)}</p>
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400 italic">
                                Belum ada jawaban. Jawaban akan muncul di sini setelah pengguna mengirimkan penilaian mereka.
                              </span>
                            )}
                          </div>
                        </div>
                        {question.category && response && (() => {
                          const responseValue = response.numericValue !== undefined ? response.numericValue : 
                                               response.textValue !== undefined ? parseFloat(response.textValue) : null
                          if (responseValue !== null && !isNaN(responseValue)) {
                            const { minValue, maxValue } = question.category
                            let resultText = ''
                            let resultColor = ''
                            
                            // Handle cases where minValue > maxValue (inverted range)
                            const actualMin = Math.min(minValue, maxValue)
                            const actualMax = Math.max(minValue, maxValue)
                            
                            if (responseValue < actualMin) {
                              resultText = `Di bawah minimum (${actualMin})`
                              resultColor = 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            } else if (responseValue > actualMax) {
                              resultText = `Di atas maksimum (${actualMax})`
                              resultColor = 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                            } else {
                              resultText = `Dalam rentang (${actualMin}-${actualMax})`
                              resultColor = 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            }
                            
                            return (
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${resultColor} ml-3 flex-shrink-0 border border-current/20`}>
                                {resultText}
                              </span>
                            )
                          }
                          return null
                        })()}
                      </div>
                    </div>
                  </div>

                                                                 <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      {response?.needsRevision && submission.status !== 'approved' && (
                        <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                          Perlu Revisi
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-4">
                      {isReadOnly ? (
                        // Read-only score display for completed submissions
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                          {question.category ? (
                            <div className="space-y-3">
                              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Skor:</p>
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                                  {(() => {
                                    // Check if there are jury scores available
                                    // First try to get jury score from the question's juryScores array
                                    const juryScore = question.juryScores && question.juryScores.length > 0 
                                      ? question.juryScores[0].score 
                                      : null
                                    
                                    if (juryScore !== undefined && juryScore !== null) {
                                      return `${juryScore}`
                                    }
                                    
                                    // Fallback to response value if no jury score
                                    const responseValue = response?.numericValue !== undefined ? response?.numericValue : 
                                      response?.textValue !== undefined ? parseFloat(response?.textValue) : null
                                    if (responseValue !== null && !isNaN(responseValue)) {
                                      return `${responseValue}`
                                    }
                                    return 'N/A'
                                  })()}
                                </span>
                                <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                                  {question.category.name}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Bobot: {question.category.weight}, Rentang: {question.category.minValue}-{question.category.maxValue}
                              </p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">Umpan Balik:</p>
                              <p className="font-medium break-words text-gray-900 dark:text-white">
                                {response?.feedback || 'Tidak ada umpan balik yang diberikan'}
                              </p>
                            </div>
                          )}
                          {response?.needsRevision && (
                            <div className="mt-3">
                              <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                                Perlu Revisi
                              </Badge>
                            </div>
                          )}
                        </div>
                      ) : submission.status === 'approved' ? (
                        // Read-only feedback display for approved submissions
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">Umpan Balik:</p>
                          <p className="font-medium break-words text-gray-900 dark:text-white">
                            {response?.feedback || 'Tidak ada umpan balik yang diberikan'}
                          </p>
                          {response?.needsRevision && (
                            <div className="mt-3">
                              <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                                Perlu Revisi
                              </Badge>
                            </div>
                          )}
                        </div>
                      ) : (
                        // Editable feedback for non-approved submissions
                        <>
                          <Textarea
                            placeholder="Berikan umpan balik untuk pertanyaan ini..."
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
                            className="border-gray-300 focus:border-orange-500 focus:ring-orange-500/20 dark:border-gray-600 dark:bg-gray-800 dark:focus:border-orange-400 transition-all duration-200"
                          />
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
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
                                className="rounded text-orange-600 focus:ring-orange-500"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">Perlu revisi</span>
                            </label>
                            <Button
                              size="sm"
                              onClick={() => handleQuestionFeedback(
                                question.id,
                                response?.feedback || '',
                                response?.needsRevision || false
                              )}
                              disabled={saving}
                              className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-200"
                            >
                              {saving ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

                 {/* Section Navigation Buttons */}
        {sections.length > 1 && (
          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardContent className="pt-6 relative z-10">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={goToPreviousSection}
                  disabled={isFirstSection}
                  className="flex items-center space-x-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-indigo-200/50 dark:border-indigo-800/50 hover:bg-white/70 dark:hover:bg-gray-700/50 transition-all duration-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Bagian Sebelumnya</span>
                </Button>
                
                <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-full">
                  Bagian {getCurrentSectionIndex() + 1} dari {sections.length}
                </div>
                
                <Button
                  variant="outline"
                  onClick={goToNextSection}
                  disabled={isLastSection}
                  className="flex items-center space-x-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-indigo-200/50 dark:border-indigo-800/50 hover:bg-white/70 dark:hover:bg-gray-700/50 transition-all duration-200"
                >
                  <span>Bagian Selanjutnya</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* PDF Modal for Cloudinary files */}
      <PdfModal
        isOpen={pdfModalOpen}
        onClose={closePdfModal}
        pdfUrl={pdfModalUrl}
        title={pdfModalTitle}
      />
    </div>
  )
}
