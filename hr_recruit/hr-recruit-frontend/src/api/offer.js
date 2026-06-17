import request from './request'

export function getOfferList(params) {
  return request.get('/offers', { params })
}

export function getOfferDetail(id) {
  return request.get(`/offers/${id}`)
}

<<<<<<< HEAD
export function getOfferByApplication(applicationId) {
  return request.get(`/offers/by-application/${applicationId}`)
}

=======
>>>>>>> 1a1d158e371191531b75389502f38fd6b00454a3
export function createOffer(data) {
  return request.post('/offers', data)
}

export function sendOffer(id) {
  return request.post(`/offers/${id}/send`)
}

export function updateOffer(id, data) {
  return request.put(`/offers/${id}`, data)
}
<<<<<<< HEAD

export function acceptOffer(id) {
  return request.post(`/offers/${id}/accept`)
}
=======
>>>>>>> 1a1d158e371191531b75389502f38fd6b00454a3
