import api from './api'

export interface UserAdmin {
  id: string
  email: string
  name: string
  role: 'super_admin' | 'company_admin' | 'candidate'
  companyId?: string
  company?: {
    id: string
    name: string
  }
  isActive: boolean
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export interface ListResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const usersAdminService = {
  list: async (params?: { page?: number; limit?: number; search?: string; role?: string }): Promise<ListResponse<UserAdmin>> => {
    const res = await api.get('/users', { params })
    return res.data
  },

  create: async (data: Partial<UserAdmin>): Promise<UserAdmin & { defaultPassword?: string }> => {
    const res = await api.post('/users', data)
    return res.data
  },

  update: async (id: string, data: Partial<UserAdmin>): Promise<UserAdmin> => {
    const res = await api.put(`/users/${id}`, data)
    return res.data
  },

  resetPassword: async (id: string): Promise<{ success: boolean; defaultPassword: string }> => {
    const res = await api.put(`/users/${id}/password-reset`)
    return res.data
  },

  toggleStatus: async (id: string, isActive: boolean): Promise<{ success: boolean; isActive: boolean }> => {
    const res = await api.put(`/users/${id}/status`, { isActive })
    return res.data
  },
}
