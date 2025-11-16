import axios from 'axios';

// Use proxy in development, direct URL in production
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? '' // Empty string will use the proxy
  : (process.env.REACT_APP_API_URL || 'http://localhost:5000');

console.log('🔗 API Configuration:');
console.log('   NODE_ENV:', process.env.NODE_ENV);
console.log('   API_BASE_URL:', API_BASE_URL);
console.log('   REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add request interceptor
api.interceptors.request.use((config) => {
  console.log(`🚀 Making ${config.method?.toUpperCase()} request to: ${config.url}`);
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response received:', response.status);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      url: error.config?.url
    });
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (userData: { username: string; email: string; password: string }) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },
};

export const tasksAPI = {
  getTasks: async () => {
    const response = await api.get('/api/tasks');
    return response.data;
  },

  createTask: async (taskData: any) => {
    const response = await api.post('/api/tasks', taskData);
    return response.data;
  },

  updateTask: async (id: string, taskData: any) => {
    const response = await api.put(`/api/tasks/${id}`, taskData);
    return response.data;
  },

  deleteTask: async (id: string) => {
    await api.delete(`/api/tasks/${id}`);
  },
};

export default api;