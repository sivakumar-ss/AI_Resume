import api from './client'

export const adminApi = {
  getStats() {
    return api.get('/admin/stats').then((response) => response.data)
  },
}

export const healthApi = {
  getStatus() {
    return api.get('/health').then((response) => response.data)
  },

  getDatabaseStatus() {
    return api.get('/health/db', { params: { verbose: true } }).then((response) => response.data)
  },
}
