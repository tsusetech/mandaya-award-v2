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
  juryComments?: string
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
      

      
      toast.success('Pertanyaan berhasil disimpan')
    } catch (err) {
      console.error('Error saving question:', err)
      toast.error('Gagal menyimpan pertanyaan')
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden -mt-16 pt-16">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-yellow-500/5 to-yellow-600/5 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-yellow-400/5 to-yellow-500/5 blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-gradient-to-r from-yellow-500/3 to-yellow-600/3 blur-2xl animate-pulse delay-500"></div>
        </div>

        {/* Header Section */}
        <div className="relative bg-gradient-to-r from-yellow-500/10 via-yellow-600/10 to-yellow-500/10 border-b border-yellow-200/50 dark:border-yellow-800/50 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-yellow-600/5"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'32\\' height=\\'32\\' viewBox=\\'0 0 32 32\\'><path fill=\\'%23EAB308\\' d=\\'M0 31h32v1H0zM31 0v32h1V0z\\'/></svg>')] opacity-5"></div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.push('/jury')}
                  className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-gray-900 dark:text-white backdrop-blur-sm border border-white/20"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Kembali ke Beranda</span>
                </Button>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg border-2 border-yellow-400/50">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-400 bg-clip-text text-transparent">
                      Tinjau Pengajuan
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      Nilai dan berikan umpan balik dengan keahlian juri
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {isCompleted ? (
                  <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900/40 px-4 py-2 rounded-full">
                    <span className="text-sm text-green-700 dark:text-green-300 font-medium">Tinjauan Selesai</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                ) : (
                  <Button
                    onClick={handleCompleteReview}
                    disabled={saving}
                    className="flex items-center space-x-2 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 transition-all duration-200"
                  >
                    <Send className="h-4 w-4" />
                    <span>{saving ? 'Mengirim...' : 'Selesaikan Tinjauan'}</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-5xl mx-auto space-y-6">
          {/* Read-only Notice */}
          {isReadOnly && (
            <Card className="border-0 shadow-xl bg-green-50/90 dark:bg-green-900/20 backdrop-blur-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="pt-6 relative z-10">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <h3 className="text-sm font-medium text-green-800 dark:text-green-300">Tinjauan Selesai</h3>
                    <p className="text-sm text-green-600 dark:text-green-400">Pengajuan ini telah ditinjau dan selesai. Semua field bersifat read-only.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

                     {/* Submission Info */}
            <Card className="border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-gray-900 dark:text-white font-bold">Detail Pengajuan</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                     <div>
                     <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Nama Kelompok</h3>
                     <p className="mt-1 text-gray-900 dark:text-white font-medium">{submission?.groupName || 'N/A'}</p>
                   </div>
                   <div>
                     <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h3>
                     <p className="mt-1 text-gray-900 dark:text-white capitalize font-medium">{submission?.status || 'N/A'}</p>
                   </div>
                   
                   <div>
                     <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Dikirim Pada</h3>
                     <p className="mt-1 text-gray-900 dark:text-white">
                       {submission?.submittedAt ? new Date(submission.submittedAt).toLocaleString() : 'Tanggal Tidak Valid'}
                     </p>
                   </div>
                                     {isCompleted && submission?.reviewScore !== undefined && (
                     <div>
                       <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Skor Tinjauan</h3>
                       <p className="mt-1 text-gray-900 dark:text-white font-semibold text-lg">{submission.reviewScore}</p>
                     </div>
                   )}
                </div>
              </CardContent>
            </Card>

                       {/* Overall Comments (Readonly) */}
            <Card className="border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40">
                    <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-gray-900 dark:text-white font-bold">Komentar Admin</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg min-h-[150px] border border-gray-200 dark:border-gray-600">
                  {overallComments ? (
                    <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{overallComments}</p>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">Tidak ada komentar admin</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Jury Comments */}
            <Card className="border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-yellow-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/40 dark:to-yellow-800/40">
                    <MessageSquare className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <span className="text-gray-900 dark:text-white font-bold">Komentar Juri</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                {isReadOnly ? (
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg min-h-[150px] border border-gray-200 dark:border-gray-600">
                    {juryComments ? (
                      <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{juryComments}</p>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 italic">Tidak ada komentar juri</p>
                    )}
                  </div>
                ) : (
                  <Textarea
                    value={juryComments}
                    onChange={(e) => setJuryComments(e.target.value)}
                    placeholder="Berikan umpan balik dan komentar juri Anda tentang pengajuan ini..."
                    className="min-h-[150px] border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:border-yellow-500 focus:ring-yellow-500/20"
                  />
                )}
              </CardContent>
            </Card>

                     {/* Subsection Filters */}
           {subsections.length > 0 && (
             <Card className="border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
               <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
               <CardContent className="pt-6 relative z-10">
                 <div className="flex flex-wrap gap-2">
                   {subsections.map((subsection) => (
                     <Button
                       key={subsection}
                       variant={activeSubsection === subsection ? 'default' : 'outline'}
                       size="sm"
                       onClick={() => setActiveSubsection(subsection)}
                       className={`flex items-center space-x-2 ${
                         activeSubsection === subsection 
                           ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40' 
                           : 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                       } transition-all duration-200`}
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
               <Card className="border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                 <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                 <CardHeader className="relative z-10">
                   <CardTitle className="flex items-center space-x-3 text-xl">
                     <div className="p-2 rounded-lg bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40">
                       <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                     </div>
                     <span className="text-gray-900 dark:text-white font-bold">{activeSubsection}</span>
                     {shouldShowScoreCount(activeSubsection) && (
                       <div className="flex items-center space-x-2">
                         <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                         <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                           {getQuestionCount(activeSubsection)} pertanyaan dinilai
                         </p>
                       </div>
                     )}
                   </CardTitle>
                 </CardHeader>
               </Card>
               {getQuestionsBySubsection(activeSubsection).map((question) => (
            <Card key={question.id} className="border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-gray-900 dark:text-white font-bold">{question.questionText}</CardTitle>
                </div>
                {question.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{question.description}</p>
                )}
                {question.category && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                      {question.category.name} (Bobot: {question.category.weight}, Min: {question.category.minValue}, Max: {question.category.maxValue}, Tipe: {question.category.scoreType})
                    </span>
                  </div>
                )}
              </CardHeader>
               <CardContent className="space-y-4">
                 {/* Response */}
                 <div className="bg-gray-50 p-4 rounded-lg">
                   <div className="flex items-start justify-between">
                     <div className="flex-1">
                       <h4 className="text-sm font-medium text-gray-500 mb-2">Jawaban</h4>
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
                           resultText = `Di bawah minimum (${actualMin})`
                           resultColor = 'bg-red-100 text-red-800'
                         } else if (responseValue > actualMax) {
                           resultText = `Di atas maksimum (${actualMax})`
                           resultColor = 'bg-orange-100 text-orange-800'
                         } else {
                           resultText = `Dalam rentang (${actualMin}-${actualMax})`
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
                     <h4 className="text-sm font-medium text-yellow-800 mb-2">Komentar Tinjauan</h4>
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
                               Kritis
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
                           Skor (0-10)
                         </label>
                         {isReadOnly ? (
                           <div className="bg-gray-50 p-3 rounded border w-32">
                             <span className="text-gray-900">{scores[question.id] || 'Belum dinilai'}</span>
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
                          Komentar
                        </label>
                        {isReadOnly ? (
                          <div className="bg-gray-50 p-4 rounded-lg min-h-[100px]">
                            {comments[question.id] ? (
                              <p className="text-gray-900 whitespace-pre-wrap">{comments[question.id]}</p>
                            ) : (
                              <p className="text-gray-500 italic">Tidak ada komentar</p>
                            )}
                          </div>
                        ) : (
                          <Textarea
                            value={comments[question.id] || ''}
                            onChange={(e) => handleCommentChange(question.id, e.target.value)}
                            placeholder="Tambahkan komentar Anda tentang jawaban ini..."
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
                            <span>{saving ? 'Menyimpan...' : 'Simpan'}</span>
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
                     <span>Bagian Sebelumnya</span>
                   </Button>
                   
                   <div className="text-sm text-gray-500">
                     Bagian {getCurrentSubsectionIndex() + 1} dari {subsections.length}
                   </div>
                   
                   <Button
                     variant="outline"
                     onClick={goToNextSubsection}
                     disabled={isLastSubsection}
                     className="flex items-center space-x-2"
                   >
                     <span>Bagian Selanjutnya</span>
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
      </div>
    </AuthenticatedLayout>
  )
}
