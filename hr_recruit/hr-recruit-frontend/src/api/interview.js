import request from './request'

export function getInterviewList(params) {
  return request.get('/interviews', { params })
}

export function arrangeInterview(data) {
  return request.post('/interviews', data)
}

export function updateInterview(id, data) {
  return request.put(`/interviews/${id}`, data)
}

export function submitEvaluation(interviewId, data) {
  return request.post(`/interviews/${interviewId}/evaluation`, data)
}

export function getInterviewSummary(interviewId) {
  return request.get(`/interviews/${interviewId}/summary`)
}

export function generateInterviewQuestions(data) {
  return request.post('/ai/generate-questions', data)
}
