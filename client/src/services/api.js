import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const interviewService = {
  create: (data) => api.post('/interviews', data),
  getById: (id) => api.get(`/interviews/${id}`),
  getAll: (params) => api.get('/interviews', { params }),
  submitAnswer: (id, data) => api.post(`/interviews/${id}/answer`, data),
  complete: (id, data) => api.post(`/interviews/${id}/complete`, data),
  abandon: (id) => api.post(`/interviews/${id}/abandon`),
};

export const reportService = {
  getByInterviewId: (interviewId) => api.get(`/reports/${interviewId}`),
  getAll: () => api.get('/reports'),
};

export const resumeService = {
  analyze: (formData) => api.post('/resume/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getInterviews: () => api.get('/admin/interviews'),
};

export default api;
