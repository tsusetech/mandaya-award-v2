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
  in_progress: {
    combinedStatus: 'in_progress',
    description: 'In Progress',
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
    description: 'Approve to Jury',
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
    if (reviewStatus === 'needs_revision') {
      combinedStatus = 'needs_revision'
    } else if (reviewStatus === 'approved') {
      combinedStatus = 'approved'
    } else if (reviewStatus === 'completed') {
      combinedStatus = 'completed'
    }
  }

  return ASSESSMENT_STATUSES[combinedStatus] || ASSESSMENT_STATUSES.in_progress
}

export function getStatusBadge(status: AssessmentStatus) {
  return {
    className: `${status.bgColor} ${status.textColor} px-2 py-1 rounded-full text-xs font-medium`,
    text: status.description,
    icon: status.icon
  }
}
