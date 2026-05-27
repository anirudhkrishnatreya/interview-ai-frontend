import api from './api'

export interface Company {
  id: string
  name: string
  plan: string
  isActive: boolean
  createdAt: string
}

export const companiesService = {
  list: async (params?: { page?: number; limit?: number }): Promise<{ data: Company[]; total: number; page: number; limit: number }> => {
    const res = await api.get('/companies', { params })
    // The backend's findAndCount returns an array: [data, total]
    if (Array.isArray(res.data)) {
      return { 
        data: res.data[0] || [], 
        total: res.data[1] || 0, 
        page: params?.page || 1, 
        limit: params?.limit || 20 
      }
    }
    return res.data
  },
}
