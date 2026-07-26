import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export const resumeAPI = {
  parse: (formData) => api.post('/resume/parse', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
}

export const testAPI = {
  generate:  (data)                  => api.post('/test/generate', data),
  getSession: (sessionId)            => api.get(`/test/${sessionId}`),
  submit:    (sessionId, data)       => api.post(`/test/${sessionId}/submit`, data),
  getStatus: (sessionId)             => api.get(`/test/${sessionId}/status`),
}

export const resultsAPI = {
  get: (sessionId) => api.get(`/results/${sessionId}`),
}
