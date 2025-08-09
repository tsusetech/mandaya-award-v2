'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, MessageSquare, Calendar, User } from 'lucide-react'
import { FeedbackData } from './FeedbackForm'

interface FeedbackDisplayProps {
  feedback: FeedbackData & {
    id: number
    reviewerName?: string
    createdAt: string
    updatedAt: string
  }
  showReviewerInfo?: boolean
}

const SCORE_CRITERIA = [
  { name: 'overallScore', label: 'Overall Score', color: 'bg-blue-100 text-blue-800' },
  { name: 'technicalScore', label: 'Technical Quality', color: 'bg-green-100 text-green-800' },
  { name: 'creativityScore', label: 'Creativity & Innovation', color: 'bg-purple-100 text-purple-800' },
  { name: 'presentationScore', label: 'Presentation', color: 'bg-orange-100 text-orange-800' }
]

export default function FeedbackDisplay({ feedback, showReviewerInfo = true }: FeedbackDisplayProps) {
  const renderStars = (score: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= score ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">({score}/5)</span>
      </div>
    )
  }

  const getAverageScore = () => {
    const scores = [
      feedback.overallScore,
      feedback.technicalScore,
      feedback.creativityScore,
      feedback.presentationScore
    ]
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Feedback</span>
            <Badge variant={feedback.status === 'submitted' ? 'default' : 'secondary'}>
              {feedback.status === 'submitted' ? 'Submitted' : 'Draft'}
            </Badge>
          </CardTitle>
          {showReviewerInfo && feedback.reviewerName && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>Reviewed by {feedback.reviewerName}</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>Created: {formatDate(feedback.createdAt)}</span>
          </div>
          {feedback.updatedAt !== feedback.createdAt && (
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>Updated: {formatDate(feedback.updatedAt)}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Score Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SCORE_CRITERIA.map((criteria) => (
              <div key={criteria.name} className="text-center">
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${criteria.color}`}>
                  {criteria.label}
                </div>
                <div className="mt-2">
                  {renderStars(feedback[criteria.name as keyof FeedbackData] as number)}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Average Score</span>
              <div className="flex items-center space-x-2">
                {renderStars(getAverageScore())}
                <span className="text-lg font-bold text-gray-900">
                  {getAverageScore()}/5
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Written Feedback */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Detailed Feedback</h3>
          
          {feedback.strengths && (
            <div className="space-y-2">
              <h4 className="font-medium text-green-700">Strengths</h4>
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-sm text-green-800 whitespace-pre-wrap">{feedback.strengths}</p>
              </div>
            </div>
          )}

          {feedback.weaknesses && (
            <div className="space-y-2">
              <h4 className="font-medium text-orange-700">Areas for Improvement</h4>
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                <p className="text-sm text-orange-800 whitespace-pre-wrap">{feedback.weaknesses}</p>
              </div>
            </div>
          )}

          {feedback.suggestions && (
            <div className="space-y-2">
              <h4 className="font-medium text-blue-700">Suggestions</h4>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 whitespace-pre-wrap">{feedback.suggestions}</p>
              </div>
            </div>
          )}

          {feedback.comments && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Additional Comments</h4>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{feedback.comments}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
