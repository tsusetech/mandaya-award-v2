'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link, Search, X } from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'sonner'

interface QuestionCategory {
  id: number
  name: string
  description: string
  weight: number
  minValue: number
  maxValue: number
  scoreType: string
}

interface GroupQuestion {
  groupQuestionId: number
  categoryId?: number
  categoryName?: string
  groupId: number
  groupName: string
  questionId: number
  questionText: string
  orderNumber?: number
  sectionTitle?: string
  subsection?: string
  createdAt?: string
  updatedAt?: string
  assignedAt?: string
}

interface QuestionAssignmentModalProps {
  category: QuestionCategory
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: () => void
}

interface AssignedQuestionData {
  groupQuestionId?: number
  id?: number
  groupId?: number
  group?: {
    id: number
    groupName: string
  }
  groupName?: string
  questionId: number
  question?: {
    questionText: string
  }
  questionText?: string
  orderNumber: number
  sectionTitle: string
  subsection: string
  createdAt: string
  updatedAt: string
}

interface GroupData {
  id: number
  groupName: string
  groupQuestions?: Array<{
    id: number
    questionId: number
    question?: {
      questionText: string
    }
    orderNumber: number
    sectionTitle: string
    subsection: string
  }>
}

export default function QuestionAssignmentModal({
  category,
  isOpen,
  onOpenChange,
  onUpdate
}: QuestionAssignmentModalProps) {
  const [assignedQuestions, setAssignedQuestions] = useState<GroupQuestion[]>([])
  const [availableQuestions, setAvailableQuestions] = useState<GroupQuestion[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchAssignedQuestions()
      fetchAvailableQuestions()
    }
  }, [isOpen, category.id])

  const fetchAssignedQuestions = async () => {
    try {
      const response = await api.get(`/question-categories/${category.id}/questions`)
      console.log('Assigned questions response:', response.data)
      
      // Handle different possible response structures
      let assignedQuestionsData = []
      if (Array.isArray(response.data)) {
        assignedQuestionsData = response.data
      } else if (response.data && Array.isArray(response.data.questions)) {
        assignedQuestionsData = response.data.questions
      } else if (response.data && Array.isArray(response.data.data)) {
        assignedQuestionsData = response.data.data
      } else {
        console.warn('Unexpected response structure for assigned questions:', response.data)
        assignedQuestionsData = []
      }
      
             // Transform the data to match our interface
       const transformedQuestions = assignedQuestionsData.map((aq: AssignedQuestionData, index: number) => {
         console.log('Processing assigned question:', aq)
         
         // The assigned questions API returns a different structure
         // It has groupQuestionId, questionId, categoryId, etc.
         const groupQuestionId = aq.groupQuestionId || aq.id || `assigned-${index}`
         
         return {
           groupQuestionId,
           groupId: aq.groupId || aq.group?.id,
           groupName: aq.group?.groupName || aq.groupName || 'Unknown Group',
           questionId: aq.questionId,
           questionText: aq.question?.questionText || aq.questionText || aq.sectionTitle || `Question ${aq.orderNumber}`,
           orderNumber: aq.orderNumber,
           sectionTitle: aq.sectionTitle,
           subsection: aq.subsection,
           assignedAt: aq.createdAt,
           createdAt: aq.createdAt,
           updatedAt: aq.updatedAt
         }
       })
      
             // If we have assigned questions but missing question details, try to enrich them
       if (transformedQuestions.length > 0) {
         const enrichedQuestions = await enrichAssignedQuestions(transformedQuestions)
         setAssignedQuestions(enrichedQuestions)
       } else {
         setAssignedQuestions(transformedQuestions)
       }
     } catch (error) {
       console.error('Failed to fetch assigned questions:', error)
       setAssignedQuestions([])
     }
   }

   const enrichAssignedQuestions = async (questions: GroupQuestion[]) => {
     try {
       // Get all available questions to match with assigned questions
       const response = await api.get('/groups')
       const groups = response.data?.groups || []
       const allGroupQuestions = groups.flatMap((group: GroupData) => 
         group.groupQuestions?.map((gq) => ({
           groupQuestionId: gq.id,
           groupId: group.id,
           groupName: group.groupName,
           questionId: gq.questionId,
           questionText: gq.question?.questionText || gq.sectionTitle || `Question ${gq.orderNumber}`,
           orderNumber: gq.orderNumber,
           sectionTitle: gq.sectionTitle,
           subsection: gq.subsection,
         })) || []
       )

       // Enrich assigned questions with details from available questions
       return questions.map(assignedQ => {
         const matchingQuestion = allGroupQuestions.find((aq: { groupQuestionId: number | string }) => aq.groupQuestionId === assignedQ.groupQuestionId)
         if (matchingQuestion) {
           return {
             ...assignedQ,
             questionText: assignedQ.questionText || matchingQuestion.questionText,
             groupName: assignedQ.groupName || matchingQuestion.groupName,
             sectionTitle: assignedQ.sectionTitle || matchingQuestion.sectionTitle,
             subsection: assignedQ.subsection || matchingQuestion.subsection,
             orderNumber: assignedQ.orderNumber || matchingQuestion.orderNumber,
           }
         }
         return assignedQ
       })
     } catch (error) {
       console.error('Failed to enrich assigned questions:', error)
       return questions
     }
   }

  const fetchAvailableQuestions = async () => {
    try {
      // Use the /groups endpoint which includes groupQuestions
      const response = await api.get('/groups')
      console.log('Groups response:', response.data)
      
      const groups = response.data?.groups || []
      
      // Extract all group questions from all groups
      const allGroupQuestions = groups.flatMap((group: GroupData) => {
        console.log('Group:', group.groupName, 'GroupQuestions:', group.groupQuestions)
                 return group.groupQuestions?.map((gq, qIndex: number) => {
           const groupQuestionId = gq.id || `group-${group.id}-question-${qIndex}`
           return {
             groupQuestionId,
             groupId: group.id,
             groupName: group.groupName,
             questionId: gq.questionId,
             questionText: gq.question?.questionText || gq.sectionTitle || `Question ${gq.orderNumber}`,
             orderNumber: gq.orderNumber,
             sectionTitle: gq.sectionTitle,
             subsection: gq.subsection,
             createdAt: new Date().toISOString(),
             updatedAt: new Date().toISOString()
           }
         }) || []
      })
      
             console.log('All group questions:', allGroupQuestions)
       
       // Check for duplicate groupQuestionId values
       const groupQuestionIds = allGroupQuestions.map((q: GroupQuestion) => q.groupQuestionId)
       const duplicateIds = groupQuestionIds.filter((id: number | string, index: number) => groupQuestionIds.indexOf(id) !== index)
       if (duplicateIds.length > 0) {
         console.warn('Duplicate groupQuestionId values found:', duplicateIds)
       }
      
      // For now, show all questions as available since we'll filter them in the UI
      // The assigned questions will be fetched separately and filtered in the render
      setAvailableQuestions(allGroupQuestions)
    } catch (error) {
      console.error('Failed to fetch available questions:', error)
      toast.error('Gagal memuat pertanyaan yang tersedia')
    }
  }

  const handleAssignQuestion = async (groupQuestionId: number) => {
    try {
      setLoading(true)
      await api.post(`/question-categories/${category.id}/assign-question`, {
        groupQuestionId
      })
      toast.success('Pertanyaan berhasil ditetapkan')
      fetchAssignedQuestions()
      fetchAvailableQuestions()
      onUpdate()
    } catch (error) {
      console.error('Failed to assign question:', error)
      toast.error('Gagal menetapkan pertanyaan')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveQuestion = async (groupQuestionId: number) => {
    try {
      setLoading(true)
      await api.delete(`/question-categories/${category.id}/questions/${groupQuestionId}`)
      toast.success('Pertanyaan berhasil dihapus')
      fetchAssignedQuestions()
      fetchAvailableQuestions()
      onUpdate()
    } catch (error) {
      console.error('Failed to remove question:', error)
      toast.error('Gagal menghapus pertanyaan')
    } finally {
      setLoading(false)
    }
  }

  const handleBulkAssign = async (questionIds: number[]) => {
    try {
      setLoading(true)
      const assignments = questionIds.map(id => ({
        groupQuestionId: id,
        categoryId: category.id
      }))
      
      await api.post('/question-categories/bulk-assign', { assignments })
      toast.success('Pertanyaan berhasil ditetapkan')
      fetchAssignedQuestions()
      fetchAvailableQuestions()
      onUpdate()
    } catch (error) {
      console.error('Failed to assign questions:', error)
      toast.error('Gagal menetapkan pertanyaan')
    } finally {
      setLoading(false)
    }
  }

  const filteredAvailableQuestions = availableQuestions.filter(question => {
    // First filter by search term
    const matchesSearch = question.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (question.sectionTitle && question.sectionTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      question.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (question.subsection && question.subsection.toLowerCase().includes(searchTerm.toLowerCase()))
    
    // Then filter out already assigned questions
    const isNotAssigned = !assignedQuestions.some(aq => aq.groupQuestionId === question.groupQuestionId)
    
    return matchesSearch && isNotAssigned
  })

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>Kelola Pertanyaan untuk</span>
            <Badge variant="secondary">{category.name}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assigned Questions */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Pertanyaan yang Ditetapkan ({assignedQuestions.length})</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
                             {assignedQuestions.map((question, index) => (
                 <Card key={`assigned-${question.groupQuestionId}-${index}`} className="p-3">
                  <CardContent className="p-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-1">{question.questionText}</p>
                        {question.sectionTitle && question.sectionTitle !== question.questionText && (
                          <p className="text-xs text-gray-600 mb-1">{question.sectionTitle}</p>
                        )}
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>Kelompok: {question.groupName}</span>
                          {question.subsection && <span>• {question.subsection}</span>}
                          {question.orderNumber && <span>• Urutan: {question.orderNumber}</span>}
                          {question.assignedAt && (
                            <span>• {new Date(question.assignedAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                                             <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => handleRemoveQuestion(question.groupQuestionId)}
                         className="text-red-600 hover:text-red-700"
                         disabled={loading}
                       >
                         <X className="h-4 w-4" />
                       </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {assignedQuestions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>Tidak ada pertanyaan yang ditetapkan untuk kategori ini</p>
                </div>
              )}
            </div>
          </div>

          {/* Available Questions */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Pertanyaan yang Tersedia</h3>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari pertanyaan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
                             {filteredAvailableQuestions.map((question, index) => (
                 <Card key={`available-${question.groupQuestionId}-${index}`} className="p-3">
                  <CardContent className="p-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-1">{question.questionText}</p>
                        {question.sectionTitle && question.sectionTitle !== question.questionText && (
                          <p className="text-xs text-gray-600 mb-1">{question.sectionTitle}</p>
                        )}
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>Kelompok: {question.groupName}</span>
                          {question.subsection && <span>• {question.subsection}</span>}
                          {question.orderNumber && <span>• Urutan: {question.orderNumber}</span>}
                        </div>
                      </div>
                                             <Button
                         variant="outline"
                         size="sm"
                         onClick={() => handleAssignQuestion(question.groupQuestionId)}
                         disabled={loading}
                       >
                         <Link className="h-4 w-4 mr-1" />
                         {loading ? 'Menetapkan...' : 'Tetapkan'}
                       </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredAvailableQuestions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>Tidak ada pertanyaan yang tersedia</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
