import request from './request'

export function getResumeList(params) {
  return request.get('/resumes', { params })
}

export function uploadResume(data) {
  return request.post('/resumes/upload', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export function parseResume(id) {
  return request.post(`/resumes/${id}/parse`)
}

export function getResumeDetail(id) {
  return request.get(`/resumes/${id}`)
}

export function updateResume(id, data) {
  return request.put(`/resumes/${id}`, data)
}

export function matchResume(params) {
  return request.get('/ai/match', { params })
}

export function getTalentPool(params) {
  return request.get('/resumes/talent-pool', { params })
}

export function updateTalentStatus(id, status) {
  return request.put(`/resumes/${id}/talent-status`, { status })
}
