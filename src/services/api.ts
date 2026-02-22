import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Unauthenticated instance for public endpoints
const publicAxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Network error';
    return Promise.reject(new Error(message));
  }
);

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  department?: string;
}

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('auth_user');
  return userStr ? JSON.parse(userStr) : null;
};

export const api = {
  get: <T>(endpoint: string, requiresAuth = true): Promise<T> => {
    if (!requiresAuth) {
      return publicAxiosInstance.get(endpoint).then(r => r.data);
    }
    return axiosInstance.get(endpoint) as unknown as Promise<T>;
  },
  post: <T>(endpoint: string, data?: unknown): Promise<T> =>
    axiosInstance.post(endpoint, data) as unknown as Promise<T>,
  put: <T>(endpoint: string, data?: unknown): Promise<T> =>
    axiosInstance.put(endpoint, data) as unknown as Promise<T>,
  delete: <T>(endpoint: string): Promise<T> =>
    axiosInstance.delete(endpoint) as unknown as Promise<T>,
};

export default axiosInstance;
