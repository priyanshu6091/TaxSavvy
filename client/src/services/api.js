import axios from 'axios';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth state and localStorage
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data; // The response is already in the correct format
    } catch (error) {
      console.error('API login error:', error);
      throw error;
    }
  },
  register: (data) => api.post('/auth/register', data).then(res => res.data),
  logout: () => api.post('/auth/logout').then(res => res.data),
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  }
};

export const companyApi = {
  getProfile: () => api.get('/company/profile'),
  updateProfile: (data) => api.put('/company/profile', data)
};

export const erpApi = {
  sync: () => api.post('/erp/sync').then(res => res.data),
  getBalances: () => api.get('/erp/balances').then(res => res.data),
  getTaxReport: () => api.get('/erp/tax-report').then(res => res.data)
};

export const expenseApi = {
  upload: async (formData) => {
    const response = await api.post('/expenses/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/expenses', data);
    return response.data;
  },
  getExpenses: async (queryParams) => {
    const response = await api.get(`/expenses?${queryParams}`);
    return response.data;
  },
  deleteExpense: (id) => api.delete(`/expenses/${id}`),
  updateExpense: (id, data) => api.put(`/expenses/${id}`, data)
};

export default api;
