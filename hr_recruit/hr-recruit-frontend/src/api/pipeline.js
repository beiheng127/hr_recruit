import request from './request'

export function getPipeline(jobId) {
  return request.get(`/api/pipelines/job/${jobId}`)
}

export function createPipeline(data) {
  return request.post('/api/pipelines', data)
}

export function updateStage(id, data) {
  return request.put(`/api/pipelines/${id}`, data)
}

export function deleteStage(id) {
  return request.delete(`/api/pipelines/${id}`)
}

export function getStageRecords(applicationId) {
  return request.get(`/api/pipelines/records/${applicationId}`)
}

export function updateStageStatus(recordId, status, note) {
  return request.put(`/api/pipelines/stages/${recordId}/status`, null, { params: { status, note } })
}

export function switchStage(recordId, targetStageType, jobId) {
  return request.post(`/api/pipelines/stages/switch`, null, { params: { recordId, targetStageType, jobId } })
}
