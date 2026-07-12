import axios from 'axios'

const api = axios.create({ baseURL: '/api/v1' })

export const getDashboard       = ()       => api.get('/environment/dashboard')
export const getTransactions    = ()       => api.get('/carbon-transactions')
export const getGoals           = ()       => api.get('/environmental-goals')
export const getDepartments     = ()       => api.get('/departments')
export const uploadInvoice      = (file)   => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/environment/ai-import', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
