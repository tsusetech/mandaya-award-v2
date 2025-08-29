'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Star, Send, Save } from 'lucide-react'
import { toast } from 'sonner'

interface FeedbackFormProps {
  submissionId: number
  onSubmit: (feedback: FeedbackData) => Promise<void>
  onSaveDraft?: (feedback: FeedbackData) => Promise<void>
  initialData?: Partial<FeedbackData>
  isReadOnly?: boolean
}

export interface FeedbackData {
  submissionId: number
  overallScore: number
  technicalScore: number
  creativityScore: number
  presentationScore: number
  strengths: string
  weaknesses: string
  suggestions: string
  comments: string
  status: 'draft' | 'submitted'
}

const SCORE_CRITERIA = [
  { name: 'overallScore', label: 'Overall Score', description: 'Overall assessment of the submission' },
  { name: 'technicalScore', label: 'Technical Quality', description: 'Technical implementation and quality' },
  { name: 'creativityScore', label: 'Creativity & Innovation', description: 'Originality and creative approach' },
  { name: 'presentationScore', label: 'Presentation', description: 'Clarity and presentation quality' }
]

export default function FeedbackForm({
  submissionId,
  onSubmit,
  onSaveDraft,
  initialData,
  isReadOnly = false
}: FeedbackFormProps) {
  const [formData, setFormData] = useState<FeedbackData>({
    submissionId,
    overallScore: initialData?.overallScore || 0,
    technicalScore: initialData?.technicalScore || 0,
    creativityScore: initialData?.creativityScore || 0,
    presentationScore: initialData?.presentationScore || 0,
    strengths: initialData?.strengths || '',
    weaknesses: initialData?.weaknesses || '',
    suggestions: initialData?.suggestions || '',
    comments: initialData?.comments || '',
    status: initialData?.status || 'draft'
  })

  const [loading, setLoading] = useState(false)

  const handleScoreChange = (criteria: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [criteria]: parseInt(value)
    }))
  }

  const handleTextChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async () => {
    if (!formData.strengths.trim() || !formData.weaknesses.trim()) {
      toast.error('Harap isi semua field yang wajib')
      return
    }

    setLoading(true)
    try {
      await onSubmit({ ...formData, status: 'submitted' })
      toast.success('Umpan balik berhasil dikirim')
    } catch (err) {
      console.error('Error submitting feedback:', err)
      toast.error('Gagal mengirim umpan balik')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDraft = async () => {
    setLoading(true)
    try {
      if (onSaveDraft) {
        await onSaveDraft({ ...formData, status: 'draft' })
        toast.success('Draft berhasil disimpan')
      }
    } catch (err) {
      console.error('Error saving draft:', err)
      toast.error('Gagal menyimpan draft')
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (score: number, criteria: string) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={isReadOnly}
            onClick={() => handleScoreChange(criteria, star.toString())}
            className={`p-1 transition-colors ${
              star <= score ? 'text-yellow-400' : 'text-gray-300'
            } ${!isReadOnly ? 'hover:text-yellow-400' : ''}`}
          >
            <Star className="h-5 w-5 fill-current" />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">({score}/5)</span>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Send className="h-5 w-5" />
          <span>Umpan Balik Pengajuan</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Scoring Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Penilaian</h3>
          {SCORE_CRITERIA.map((criteria) => (
            <div key={criteria.name} className="space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <Label className="text-sm font-medium">{criteria.label}</Label>
                  <p className="text-xs text-gray-500">{criteria.description}</p>
                </div>
                {renderStars(formData[criteria.name as keyof FeedbackData] as number, criteria.name)}
              </div>
            </div>
          ))}
        </div>

        {/* Written Feedback Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Umpan Balik Tertulis</h3>
          
          <div className="space-y-2">
            <Label htmlFor="strengths" className="text-sm font-medium">
              Kekuatan <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="strengths"
              placeholder="Apa kekuatan utama dari pengajuan ini?"
              value={formData.strengths}
              onChange={(e) => handleTextChange('strengths', e.target.value)}
              disabled={isReadOnly}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weaknesses" className="text-sm font-medium">
              Area Perbaikan <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="weaknesses"
              placeholder="Area mana yang bisa diperbaiki?"
              value={formData.weaknesses}
              onChange={(e) => handleTextChange('weaknesses', e.target.value)}
              disabled={isReadOnly}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="suggestions" className="text-sm font-medium">
              Saran
            </Label>
            <Textarea
              id="suggestions"
              placeholder="Saran untuk perbaikan di masa depan?"
              value={formData.suggestions}
              onChange={(e) => handleTextChange('suggestions', e.target.value)}
              disabled={isReadOnly}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments" className="text-sm font-medium">
              Komentar Tambahan
            </Label>
            <Textarea
              id="comments"
              placeholder="Komentar atau observasi tambahan?"
              value={formData.comments}
              onChange={(e) => handleTextChange('comments', e.target.value)}
              disabled={isReadOnly}
              className="min-h-[100px]"
            />
          </div>
        </div>

        {/* Action Buttons */}
        {!isReadOnly && (
          <div className="flex justify-end space-x-3 pt-4 border-t">
            {onSaveDraft && (
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Simpan Draft</span>
              </Button>
            )}
            <Button
              onClick={handleSubmit}
              disabled={loading || !formData.strengths.trim() || !formData.weaknesses.trim()}
              className="flex items-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>{loading ? 'Mengirim...' : 'Kirim Umpan Balik'}</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
