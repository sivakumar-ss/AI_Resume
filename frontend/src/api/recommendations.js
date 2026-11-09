import api from './client'

export const recommendationsApi = {
  generate() {
    return api.post('/recommendations').then((response) => response.data)
  },

  getLatest() {
    return api.get('/recommendations').then((response) => response.data)
  },
}
