import request from './request'

export function getNotifications(params) {
  return request.get('/notifications', { params })
}

export function readNotification(id) {
  return request.put(`/notifications/${id}/read`)
}

export function readAll() {
  return request.put('/notifications/read-all')
}
