import api from './api'

export interface CandidateProfile {
  id: string
  companyId: string
  name: string
  email: string
  phone?: string
  resumeUrl?: string
  position?: string
  notes?: string
  status: 'invited' | 'pending' | 'started' | 'completed' | 'expired' | 'rejected' | 'shortlisted'
  userId?: string
  createdAt: string
  updatedAt: string
  // Returned once on creation only:
  defaultPassword?: string
  loginEmail?: string
}

export interface ListResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const candidateProfilesService = {
  list: async (params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
  }): Promise<ListResponse<CandidateProfile>> => {
    const res = await api.get('/candidate-profiles', { params })
    return res.data
  },

  get: async (id: string): Promise<CandidateProfile> => {
    const res = await api.get(`/candidate-profiles/${id}`)
    return res.data
  },

  create: async (data: Partial<CandidateProfile>): Promise<CandidateProfile> => {
    const res = await api.post('/candidate-profiles', data)
    return res.data
  },

  bulkCreate: async (candidates: Partial<CandidateProfile>[]): Promise<{
    created: number
    skipped: number
    errors: string[]
  }> => {
    const res = await api.post('/candidate-profiles/bulk', { candidates })
    return res.data
  },

  update: async (id: string, data: Partial<CandidateProfile>): Promise<CandidateProfile> => {
    const res = await api.put(`/candidate-profiles/${id}`, data)
    return res.data
  },

  updateStatus: async (id: string, status: CandidateProfile['status']): Promise<CandidateProfile> => {
    const res = await api.put(`/candidate-profiles/${id}/status`, { status })
    return res.data
  },

  remove: async (id: string): Promise<{ success: boolean }> => {
    const res = await api.delete(`/candidate-profiles/${id}`)
    return res.data
  },
}
