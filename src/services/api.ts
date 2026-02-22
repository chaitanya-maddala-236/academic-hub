import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
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
      return publicAxiosInstance.get<T>(endpoint).then(r => r.data);
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

// ─── Project API ─────────────────────────────────────────────────────────────

export interface Project {
  id: number;
  title: string;
  abstract?: string;
  department?: string;
  fundingAgency?: string;
  agencyScientist?: string;
  fileNumber?: string;
  sanctionedAmount?: number;
  startDate?: string;
  endDate?: string;
  principalInvestigator?: string;
  coPrincipalInvestigator?: string;
  teamMembers?: { name?: string; role?: string }[] | null;
  deliverables?: string;
  outcomes?: string;
  attachments?: { name?: string; url?: string }[] | null;
  status?: string;
}

export interface ProjectListParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  status?: string;
  agency?: string;
  year?: string | number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProjectListResponse {
  success: boolean;
  data: Project[];
  meta: { page: number; limit: number; total: number };
}

export interface ProjectStatsResponse {
  success: boolean;
  data: {
    total: number;
    ongoing: number;
    completed: number;
    totalFunding: number;
    uniqueAgencies: number;
    uniqueFaculty: number;
    topFaculty: { name: string; count: number }[];
    projectsByYear: { year: number; count: number }[];
    departmentChart: { department: string; count: number }[];
    statusDistribution: { name: string; value: number; color: string }[];
  };
}

// ─── Research API (merged Publications + Projects) ───────────────────────────

export interface ResearchItem {
  recordType: 'publication' | 'project';
  id: number;
  title: string;
  department?: string | null;
  year?: number | null;
  // Publication fields
  authors?: string | null;
  journal?: string | null;
  publicationType?: string | null;
  indexing?: string[];
  doi?: string | null;
  abstract?: string | null;
  scope?: string | null;
  facultyName?: string | null;
  pdfUrl?: string | null;
  // Project fields
  agency?: string | null;
  pi?: string | null;
  coPi?: string | null;
  amount?: number | null;
  status?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  outcomes?: string | null;
  deliverables?: string | null;
  teamMembers?: { name?: string; role?: string }[] | null;
  createdAt?: string | null;
}

export interface ResearchListParams {
  type?: 'all' | 'publication' | 'project';
  department?: string;
  year?: number | string;
  status?: string;
  indexing?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ResearchListResponse {
  success: boolean;
  data: ResearchItem[];
  meta: { page: number; limit: number; total: number };
}

export interface ResearchStatsResponse {
  success: boolean;
  data: {
    totalPublications: number;
    indexedPublications: number;
    totalProjects: number;
    activeProjects: number;
    departments: number;
  };
}

export const researchApi = {
  getResearch: (params?: ResearchListParams): Promise<ResearchListResponse> => {
    const qs = params
      ? new URLSearchParams(
          Object.fromEntries(
            Object.entries(params)
              .filter(([, v]) => v !== undefined && v !== '')
              .map(([k, v]) => [k, String(v)])
          )
        ).toString()
      : '';
    return axiosInstance.get(`/research${qs ? '?' + qs : ''}`) as unknown as Promise<ResearchListResponse>;
  },
  getResearchStats: (): Promise<ResearchStatsResponse> =>
    axiosInstance.get('/research/stats') as unknown as Promise<ResearchStatsResponse>,
};

export const projectsApi = {
  getProjects: (params?: ProjectListParams): Promise<ProjectListResponse> => {
    const qs = params
      ? new URLSearchParams(
          Object.fromEntries(
            Object.entries(params)
              .filter(([, v]) => v !== undefined && v !== '')
              .map(([k, v]) => [k, String(v)])
          )
        ).toString()
      : '';
    return axiosInstance.get(`/projects${qs ? '?' + qs : ''}`) as unknown as Promise<ProjectListResponse>;
  },
  getProjectById: (id: number | string): Promise<{ success: boolean; data: Project }> =>
    axiosInstance.get(`/projects/${id}`) as unknown as Promise<{ success: boolean; data: Project }>,
  getProjectStats: (): Promise<ProjectStatsResponse> =>
    axiosInstance.get('/projects/dashboard') as unknown as Promise<ProjectStatsResponse>,
};

export default axiosInstance;
