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

/** 获取面试官列表 */
export function getInterviewerList() {
  return request.get('/interviews/interviewers')
}

/** 搜索候选人（供新建面试下拉用） */
export function searchCandidates(keyword) {
  return request.get('/interviews/candidates', { params: { keyword } })
}
