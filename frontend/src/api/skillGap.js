import api from './client'

export const skillGapApi = {
  get(generate = false) {
    return api
      .get('/skill-gap', { params: generate ? { generate: true } : {} })
      .then((response) => response.data)
  },
}
