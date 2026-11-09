import api from './client'

export const roadmapApi = {
  get(careerId) {
    return api
      .get('/roadmap', { params: careerId ? { career_id: careerId } : {} })
      .then((response) => response.data)
  },

  generate(careerId) {
    return api
      .post('/roadmap/generate', careerId ? { career_id: careerId } : {})
      .then((response) => response.data)
  },

  updateProgress(resourceId, status, progressPercent) {
    return api
      .patch(`/roadmap/progress/${resourceId}`, {
        status,
        progress_percent: progressPercent,
      })
      .then((response) => response.data)
  },
}
