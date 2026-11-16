import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message =
      err.response?.data?.message ||
      err.response?.data?.errors?.[0] ||
      err.message ||
      'Network error';
    return Promise.reject(new Error(message));
  }
);

export const roomAPI = {
  createRoom: (data) => api.post('/rooms/create', data),
  joinRoom: (data) => api.post('/rooms/join', data),
  getRoomInfo: (code) => api.get(`/rooms/${code}`),
  startGame: (code, hostToken) =>
    api.post(`/rooms/${code}/start`, { hostToken }),
  callNumber: (code, hostToken) =>
    api.post(`/rooms/${code}/call`, { hostToken }),
  claimWin: (data) => api.post('/rooms/claim', data),
};

export default api;
