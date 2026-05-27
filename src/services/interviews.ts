import api from './api'

export interface InterviewSession {
  id: string
  companyId: string
  candidateId?: string
  candidateName: string
  role: string
  status: 'pending' | 'in_progress' | 'completed' | 'terminated' | 'cancelled'
  overallScore?: number
  recommendation: 'HIRE' | 'CONSIDER' | 'FAIL' | 'PENDING'
  questions?: string[]
  answers?: string[]
  evaluations?: Array<{
    score: number
    feedback: string
    strength: string
    improvement: string
  }>
  violationCount: number
  riskScore: number
  completedAt?: string
  createdAt: string
  report?: {
    executiveSummary: string
    strengths: string[]
    weaknesses: string[]
    categories: Array<{ name: string; score: number; justification: string }>
    recommendation: 'HIRE' | 'CONSIDER' | 'FAIL'
    justification: string
  }
}

export const interviewsService = {
  list: async (params?: { page?: number; limit?: number }): Promise<{
    data: InterviewSession[]
    total: number
  }> => {
    const res = await api.get('/interviews', { params })
    const [data, total] = res.data
    return { data, total }
  },

  get: async (id: string): Promise<InterviewSession> => {
    const res = await api.get(`/interviews/${id}`)
    return res.data
  },

  updateResults: async (id: string, data: any): Promise<InterviewSession> => {
    const res = await api.put(`/interviews/${id}/results`, data)
    return res.data
  }
}
