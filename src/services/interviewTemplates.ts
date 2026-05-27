import api from './api'

export interface InterviewTemplate {
  id: string
  companyId: string
  title: string
  description?: string
  role: string
  department?: string
  employmentType: 'full-time' | 'internship' | 'contract'
  experienceLevel: 'fresher' | 'junior' | 'mid' | 'senior'
  interviewType: 'technical' | 'hr' | 'behavioral' | 'system_design' | 'ai_mixed'
  difficulty: 'easy' | 'medium' | 'hard' | 'adaptive'
  durationMinutes: number
  numQuestions: number
  language: string
  topics: string[]
  questions: TemplateQuestion[]
  rules: InterviewRules
  status: 'draft' | 'active' | 'archived'
  questionMode: 'ai' | 'manual' | 'hybrid'
  assignedCount: number
  completedCount: number
  createdAt: string
  updatedAt: string
}

export interface TemplateQuestion {
  id: string
  text: string
  type: 'technical' | 'behavioral' | 'situational' | 'custom'
  difficulty: 'easy' | 'medium' | 'hard'
  expectedAnswer?: string
  scoringCriteria?: string
  followupHints?: string
  tags?: string[]
  source: 'ai' | 'manual'
}

export interface InterviewRules {
  cameraRequired: boolean
  microphoneRequired: boolean
  fullscreenRequired: boolean
  tabSwitchAllowed: boolean
  maxTabSwitchWarnings: number
  multipleFaceDetection: boolean
  resumeUploadRequired: boolean
  internetStabilityCheck: boolean
  recordingEnabled: boolean
}

export interface ListResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const interviewTemplatesService = {
  list: async (params?: { page?: number; limit?: number; status?: string }): Promise<ListResponse<InterviewTemplate>> => {
    const res = await api.get('/interview-templates', { params })
    return res.data
  },

  get: async (id: string): Promise<InterviewTemplate> => {
    const res = await api.get(`/interview-templates/${id}`)
    return res.data
  },

  create: async (data: Partial<InterviewTemplate>): Promise<InterviewTemplate> => {
    const res = await api.post('/interview-templates', data)
    return res.data
  },

  update: async (id: string, data: Partial<InterviewTemplate>): Promise<InterviewTemplate> => {
    const res = await api.put(`/interview-templates/${id}`, data)
    return res.data
  },

  duplicate: async (id: string): Promise<InterviewTemplate> => {
    const res = await api.post(`/interview-templates/${id}/duplicate`)
    return res.data
  },

  archive: async (id: string): Promise<InterviewTemplate> => {
    const res = await api.patch(`/interview-templates/${id}/archive`)
    return res.data
  },

  activate: async (id: string): Promise<InterviewTemplate> => {
    const res = await api.patch(`/interview-templates/${id}/activate`)
    return res.data
  },

  remove: async (id: string): Promise<{ success: boolean }> => {
    const res = await api.delete(`/interview-templates/${id}`)
    return res.data
  },
}

export const aiService = {
  generateTopics: async (params: { role: string; description?: string; interviewType?: string }) => {
    const res = await api.post('/ai/generate-topics', params)
    return res.data as { topics: string[]; categories: Record<string, string[]> }
  },

  generateInterviewQuestions: async (params: {
    role: string
    topics: string[]
    difficulty: string
    numQuestions: number
    interviewType: string
  }) => {
    const res = await api.post('/ai/generate-interview-questions', params)
    return res.data as TemplateQuestion[]
  },
}
