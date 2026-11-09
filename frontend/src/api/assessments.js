import api from './client'

export const assessmentsApi = {
  getCategories() {
    return api.get('/assessments/categories').then((response) => response.data)
  },

  getQuestions(category) {
    return api
      .get('/assessments/questions', { params: { category } })
      .then((response) => response.data)
  },

  submit(category, answers, timeTakenSeconds) {
    return api
      .post('/assessments/submit', {
        category,
        answers,
        time_taken_seconds: timeTakenSeconds,
      })
      .then((response) => response.data)
  },

  getResults() {
    return api.get('/assessments/results').then((response) => response.data)
  },
}
