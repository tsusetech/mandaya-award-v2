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
      // For now, we'll assume no questions are assigned since the assignment endpoints
      // might not be implemented yet. This can be updated when the backend provides
      // the assignment endpoints.
      setAssignedQuestions([])
      
      // Uncomment this when the backend provides the endpoint:
      // const response = await api.get(`/question-categories/${category.id}/questions`)
      // setAssignedQuestions(response.data || [])
    } catch (error) {
      console.error('Failed to fetch assigned questions:', error)
      setAssignedQuestions([])
    }
  }

  const fetchAvailableQuestions = async () => {
    try {
      // Use the /groups endpoint which includes groupQuestions
      const response = await api.get('/groups')
      const groups = response.data?.groups || []
      
      // Extract all group questions from all groups
      const allGroupQuestions = groups.flatMap((group: any) => 
        group.groupQuestions?.map((gq: any) => ({
          groupQuestionId: gq.id,
          groupId: group.id,
          groupName: group.groupName,
          questionId: gq.id, // Using gq.id as questionId for now
          questionText: gq.sectionTitle || `Question ${gq.orderNumber}`, // Using sectionTitle as question text
          orderNumber: gq.orderNumber,
          sectionTitle: gq.sectionTitle,
          subsection: gq.subsection,
          createdAt: gq.createdAt,
          updatedAt: gq.updatedAt
        })) || []
      )
      
      const assignedIds = assignedQuestions.map(q => q.groupQuestionId)
      const available = allGroupQuestions.filter((q: any) => !assignedIds.includes(q.groupQuestionId))
      setAvailableQuestions(available)
    } catch (error) {
      console.error('Failed to fetch available questions:', error)
      toast.error('Failed to load available questions')
    }
  }

  const handleAssignQuestion = async (groupQuestionId: number) => {
    try {
      // For now, show a message that this feature is not yet implemented
      toast.info('Question assignment feature is not yet implemented in the backend')
      
      // Uncomment this when the backend provides the endpoint:
      // await api.post(`/question-categories/${category.id}/assign-question`, {
      //   groupQuestionId
      // })
      // toast.success('Question assigned successfully')
      // fetchAssignedQuestions()
      // fetchAvailableQuestions()
      // onUpdate()
    } catch (error) {
      toast.error('Failed to assign question')
    }
  }

  const handleRemoveQuestion = async (groupQuestionId: number) => {
    try {
      // For now, show a message that this feature is not yet implemented
      toast.info('Question removal feature is not yet implemented in the backend')
      
      // Uncomment this when the backend provides the endpoint:
      // await api.delete(`/question-categories/${category.id}/questions/${groupQuestionId}`)
      // toast.success('Question removed successfully')
      // fetchAssignedQuestions()
      // fetchAvailableQuestions()
      // onUpdate()
    } catch (error) {
      toast.error('Failed to remove question')
    }
  }

  const handleBulkAssign = async (questionIds: number[]) => {
    try {
      // For now, show a message that this feature is not yet implemented
      toast.info('Bulk assignment feature is not yet implemented in the backend')
      
      // Uncomment this when the backend provides the endpoint:
      // const assignments = questionIds.map(id => ({
      //   groupQuestionId: id,
      //   categoryId: category.id
      // }))
      // 
      // await api.post('/question-categories/bulk-assign', { assignments })
      // toast.success('Questions assigned successfully')
      // fetchAssignedQuestions()
      // fetchAvailableQuestions()
      // onUpdate()
    } catch (error) {
      toast.error('Failed to assign questions')
    }
  }

  const filteredAvailableQuestions = availableQuestions.filter(question =>
    (question.sectionTitle || question.questionText).toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (question.subsection && question.subsection.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>Manage Questions for</span>
            <Badge variant="secondary">{category.name}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assigned Questions */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Assigned Questions ({assignedQuestions.length})</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {assignedQuestions.map((question) => (
                <Card key={question.groupQuestionId} className="p-3">
                  <CardContent className="p-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-1">{question.sectionTitle || question.questionText}</p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>Group: {question.groupName}</span>
                          {question.subsection && <span>• {question.subsection}</span>}
                          {question.orderNumber && <span>• Order: {question.orderNumber}</span>}
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
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {assignedQuestions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No questions assigned to this category</p>
                </div>
              )}
            </div>
          </div>

          {/* Available Questions */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Available Questions</h3>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredAvailableQuestions.map((question) => (
                <Card key={question.groupQuestionId} className="p-3">
                  <CardContent className="p-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-1">{question.sectionTitle || question.questionText}</p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>Group: {question.groupName}</span>
                          {question.subsection && <span>• {question.subsection}</span>}
                          {question.orderNumber && <span>• Order: {question.orderNumber}</span>}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAssignQuestion(question.groupQuestionId)}
                      >
                        <Link className="h-4 w-4 mr-1" />
                        Assign
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredAvailableQuestions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No available questions found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
