import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

let refreshRequest;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    const isAuthActionRequest = /\/auth\/(login|register|refresh|logout)/.test(request?.url || '');

    if (error.response?.status !== 401 || !request || request._retry || isAuthActionRequest) {
      return Promise.reject(error);
    }

    request._retry = true;
    try {
      refreshRequest ||= api.post('/auth/refresh').finally(() => {
        refreshRequest = undefined;
      });
      await refreshRequest;
      return api(request);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  }
);

export function getApiErrorMessage(error, fallback = 'So‘rovni bajarib bo‘lmadi. Qayta urinib ko‘ring.') {
  return error.response?.data?.message || error.response?.data?.error || fallback;
}
