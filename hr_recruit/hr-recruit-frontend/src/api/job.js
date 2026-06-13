import request from './request'

export function getJobList(params) {
  return request.get('/jobs', { params })
}

export function createJob(data) {
  return request.post('/jobs', data)
}

export function updateJob(id, data) {
  return request.put(`/jobs/${id}`, data)
}

export function deleteJob(id) {
  return request.delete(`/jobs/${id}`)
}

export function publishJob(id) {
  return request.post(`/jobs/${id}/publish`)
}

export function closeJob(id) {
  return request.post(`/jobs/${id}/close`)
}

export function generateJd(data) {
  return request.post('/ai/generate-jd', data)
}
