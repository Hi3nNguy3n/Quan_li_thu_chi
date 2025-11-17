import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  withCredentials: true
});

let accessToken: string | null =
  typeof window !== 'undefined'
    ? localStorage.getItem('qlct_token')
    : null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('qlct_token', token);
  } else {
    localStorage.removeItem('qlct_token');
  }
};

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export default api;
