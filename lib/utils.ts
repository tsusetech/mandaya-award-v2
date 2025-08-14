import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Assessment Status Mapping and Utilities
export interface AssessmentStatus {
  combinedStatus: string
  description: string
  sessionStatus: string
  reviewStatus: string | null
  reviewStage: string | null
  color: string
  bgColor: string
  textColor: string
  icon: string
  canEdit: boolean
  canSubmit: boolean
  canResubmit: boolean
  showFeedback: boolean
  showProgress: boolean
}

export const ASSESSMENT_STATUSES: Record<string, AssessmentStatus> = {
  draft: {
    combinedStatus: 'draft',
    description: 'Assessment is in draft mode',
    sessionStatus: 'draft',
    reviewStatus: null,
    reviewStage: null,
    color: 'gray',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    icon: '📝',
    canEdit: true,
    canSubmit: true,
    canResubmit: false,
    showFeedback: false,
    showProgress: true
  },
  in_progress: {
    combinedStatus: 'in_progress',
    description: 'Assessment is being worked on',
    sessionStatus: 'in_progress',
    reviewStatus: null,
    reviewStage: null,
    color: 'blue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    icon: '🔄',
    canEdit: true,
    canSubmit: true,
    canResubmit: false,
    showFeedback: false,
    showProgress: true
  },
  submitted: {
    combinedStatus: 'submitted',
    description: 'Assessment submitted, no review yet',
    sessionStatus: 'submitted',
    reviewStatus: null,
    reviewStage: null,
    color: 'yellow',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    icon: '📤',
    canEdit: false,
    canSubmit: false,
    canResubmit: false,
    showFeedback: false,
    showProgress: false
  },
  pending_review: {
    combinedStatus: 'pending_review',
    description: 'Assessment submitted, waiting for review',
    sessionStatus: 'submitted',
    reviewStatus: 'pending',
    reviewStage: null,
    color: 'orange',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    icon: '⏳',
    canEdit: false,
    canSubmit: false,
    canResubmit: false,
    showFeedback: false,
    showProgress: false
  },
  under_review: {
    combinedStatus: 'under_review',
    description: 'Assessment is currently being reviewed',
    sessionStatus: 'submitted',
    reviewStatus: 'under_review',
    reviewStage: null,
    color: 'purple',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    icon: '🔍',
    canEdit: false,
    canSubmit: false,
    canResubmit: false,
    showFeedback: false,
    showProgress: false
  },
  needs_revision: {
    combinedStatus: 'needs_revision',
    description: 'Assessment needs revision',
    sessionStatus: 'submitted',
    reviewStatus: 'needs_revision',
    reviewStage: null,
    color: 'red',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    icon: '⚠️',
    canEdit: true,
    canSubmit: false,
    canResubmit: true,
    showFeedback: true,
    showProgress: true
  },
  resubmitted: {
    combinedStatus: 'resubmitted',
    description: 'Assessment resubmitted after revision',
    sessionStatus: 'resubmitted',
    reviewStatus: null,
    reviewStage: null,
    color: 'blue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    icon: '📝',
    canEdit: false,
    canSubmit: false,
    canResubmit: false,
    showFeedback: false,
    showProgress: false
  },
  approved: {
    combinedStatus: 'approved',
    description: 'Assessment approved',
    sessionStatus: 'submitted',
    reviewStatus: 'approved',
    reviewStage: null,
    color: 'green',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    icon: '✅',
    canEdit: false,
    canSubmit: false,
    canResubmit: false,
    showFeedback: false,
    showProgress: false
  },
  rejected: {
    combinedStatus: 'rejected',
    description: 'Assessment rejected',
    sessionStatus: 'submitted',
    reviewStatus: 'rejected',
    reviewStage: null,
    color: 'red',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    icon: '❌',
    canEdit: false,
    canSubmit: false,
    canResubmit: false,
    showFeedback: true,
    showProgress: false
  },
  passed_to_jury: {
    combinedStatus: 'passed_to_jury',
    description: 'Assessment passed to jury',
    sessionStatus: 'submitted',
    reviewStatus: 'passed_to_jury',
    reviewStage: null,
    color: 'blue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    icon: '👨‍⚖️',
    canEdit: false,
    canSubmit: false,
    canResubmit: false,
    showFeedback: false,
    showProgress: false
  },
  jury_scoring: {
    combinedStatus: 'jury_scoring',
    description: 'Jury is scoring the assessment',
    sessionStatus: 'submitted',
    reviewStatus: null,
    reviewStage: 'jury_scoring',
    color: 'purple',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    icon: '📊',
    canEdit: false,
    canSubmit: false,
    canResubmit: false,
    showFeedback: false,
    showProgress: false
  },
  jury_deliberation: {
    combinedStatus: 'jury_deliberation',
    description: 'Jury is deliberating',
    sessionStatus: 'submitted',
    reviewStatus: null,
    reviewStage: 'jury_deliberation',
    color: 'indigo',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    icon: '🤔',
    canEdit: false,
    canSubmit: false,
    canResubmit: false,
    showFeedback: false,
    showProgress: false
  },
  final_decision: {
    combinedStatus: 'final_decision',
    description: 'Final decision stage',
    sessionStatus: 'submitted',
    reviewStatus: null,
    reviewStage: 'final_decision',
    color: 'amber',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    icon: '🎯',
    canEdit: false,
    canSubmit: false,
    canResubmit: false,
    showFeedback: false,
    showProgress: false
  },
  completed: {
    combinedStatus: 'completed',
    description: 'Assessment process completed',
    sessionStatus: 'submitted',
    reviewStatus: 'completed',
    reviewStage: null,
    color: 'green',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    icon: '🏆',
    canEdit: false,
    canSubmit: false,
    canResubmit: false,
    showFeedback: true,
    showProgress: false
  }
}

export function getAssessmentStatus(sessionStatus: string, reviewStatus?: string | null, reviewStage?: string | null): AssessmentStatus {
  // Determine the combined status based on the status mapping
  let combinedStatus = sessionStatus

  // Handle resubmitted status first (takes priority)
  if (sessionStatus === 'resubmitted') {
    combinedStatus = 'resubmitted'
  } else if (sessionStatus === 'submitted') {
    if (reviewStage === 'jury_scoring') {
      combinedStatus = 'jury_scoring'
    } else if (reviewStage === 'jury_deliberation') {
      combinedStatus = 'jury_deliberation'
    } else if (reviewStage === 'final_decision') {
      combinedStatus = 'final_decision'
    } else if (reviewStatus === 'pending' || reviewStatus === null) {
      combinedStatus = 'pending_review'
    } else if (reviewStatus === 'under_review') {
      combinedStatus = 'under_review'
    } else if (reviewStatus === 'needs_revision') {
      combinedStatus = 'needs_revision'
    } else if (reviewStatus === 'approved') {
      combinedStatus = 'approved'
    } else if (reviewStatus === 'rejected') {
      combinedStatus = 'rejected'
    } else if (reviewStatus === 'passed_to_jury') {
      combinedStatus = 'passed_to_jury'
    } else if (reviewStatus === 'completed') {
      combinedStatus = 'completed'
    }
  }

  return ASSESSMENT_STATUSES[combinedStatus] || ASSESSMENT_STATUSES.draft
}

export function getStatusBadge(status: AssessmentStatus) {
  return {
    className: `${status.bgColor} ${status.textColor} px-2 py-1 rounded-full text-xs font-medium`,
    text: status.description,
    icon: status.icon
  }
}
