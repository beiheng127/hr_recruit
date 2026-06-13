import request from './request'

export function generateJd(data) {
  return request.post('/api/ai/generate-jd', data)
}

export function matchResumeJob(data) {
  return request.post('/api/ai/match', data)
}

export function generateQuestions(data) {
  return request.post('/api/ai/generate-questions', data)
}

export function aiChat(params) {
  return request.get('/api/ai/chat', { params })
}

export function aiChatPost(data) {
  return request.post('/api/ai/chat', data)
}

export function summarizeEvaluation(interviewId) {
  return request.get(`/api/ai/summary/${interviewId}`)
}
