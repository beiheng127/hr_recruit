import request from './request'

export function getDashboardStats() {
  return request.get('/dashboard/stats')
}

export function getRecruitmentFunnel(params) {
  return request.get('/dashboard/funnel', { params })
}

export function getChannelStats(params) {
  return request.get('/dashboard/channel-stats', { params })
}
