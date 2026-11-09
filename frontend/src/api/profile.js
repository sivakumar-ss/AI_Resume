import api from './client'

export const profileApi = {
  get() {
    return api.get('/profile').then((response) => response.data)
  },

  update(payload) {
    return api.patch('/profile', payload).then((response) => response.data)
  },

  listSkills() {
    return api.get('/profile/skills').then((response) => response.data)
  },

  addSkill(payload) {
    return api.post('/profile/skills', payload).then((response) => response.data)
  },

  updateSkill(studentSkillId, payload) {
    return api
      .patch(`/profile/skills/${studentSkillId}`, payload)
      .then((response) => response.data)
  },

  deleteSkill(studentSkillId) {
    return api
      .delete(`/profile/skills/${studentSkillId}`)
      .then((response) => response.data)
  },
}
