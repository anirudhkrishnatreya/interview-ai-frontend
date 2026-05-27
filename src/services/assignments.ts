import api from './api'
import type { InterviewTemplate } from './interviewTemplates'
import type { CandidateProfile } from './candidateProfiles'

export interface InterviewAssignment {
  id: string
  companyId: string
  templateId: string
  template: InterviewTemplate
  candidateProfileId: string
  candidateProfile: CandidateProfile
  token: string
  status: 'pending' | 'started' | 'completed' | 'expired'
  attemptLimit: number
  attemptsUsed: number
  expiryDate?: string
  scheduledAt?: string
  startedAt?: string
  completedAt?: string
  score?: number
  sessionId?: string
  createdAt: string
  updatedAt: string
}

export const assignmentsService = {
  list: async (params?: { page?: number; limit?: number }): Promise<{
    data: InterviewAssignment[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> => {
    const res = await api.get('/interview-assignments', { params })
    return res.data
  },

  listByTemplate: async (templateId: string, params?: { page?: number; limit?: number }) => {
    const res = await api.get(`/interview-assignments/template/${templateId}`, { params })
    return res.data
  },

  listByCandidate: async (candidateProfileId: string): Promise<InterviewAssignment[]> => {
    const res = await api.get(`/interview-assignments/candidate/${candidateProfileId}`)
    return res.data
  },

  getByToken: async (token: string): Promise<InterviewAssignment> => {
    const res = await api.get(`/interview-assignments/token/${token}`)
    return res.data
  },

  create: async (data: {
    templateId: string
    candidateProfileId: string
    expiryDate?: string
    scheduledAt?: string
    attemptLimit?: number
  }): Promise<InterviewAssignment> => {
    const res = await api.post('/interview-assignments', data)
    return res.data
  },

  startByToken: async (token: string): Promise<InterviewAssignment> => {
    const res = await api.post(`/interview-assignments/token/${token}/start`)
    return res.data
  },

  complete: async (
    id: string,
    sessionId: string,
    score: number,
    details?: {
      questions: string[]
      answers: string[]
      evaluations: any[]
      violationCount: number
      riskScore: number
    }
  ): Promise<InterviewAssignment> => {
    const res = await api.put(`/interview-assignments/${id}/complete`, { sessionId, score, ...details })
    return res.data
  },

  /** Candidate-side: fetch all interviews assigned to the currently logged-in candidate */
  getMyAssignments: async (): Promise<InterviewAssignment[]> => {
    const res = await api.get('/interview-assignments/my')
    return res.data
  },
}
