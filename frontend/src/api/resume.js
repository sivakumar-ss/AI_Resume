import api from './client'

export const resumeApi = {
  analyze(file) {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/resume/analyze', formData).then((response) => response.data)
  },

  analyzeText(text) {
    return api.post('/resume/analyze', { text }).then((response) => response.data)
  },
}
