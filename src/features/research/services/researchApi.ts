import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/';

const http = axios.create({ baseURL: API_BASE_URL });

http.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(new Error(err.response?.data?.message || err.message || 'Network error'))
);

export interface ResearchProject {
  id: number;
  title: string;
  principal_investigator: string | null;
  co_investigators: string | null;
  department: string | null;
  funding_agency: string | null;
  sanction_date: string | null;
  amount_lakhs: number | null;
  duration: string | null;
  status: 'ONGOING' | 'COMPLETED';
  created_at: string;
}

export interface ProjectsResponse {
  total: number;
  page: number;
  totalPages: number;
  data: ResearchProject[];
}

export interface DashboardStats {
  totalProjects: number;
  totalFunding: number;
  activeProjects: number;
  completedProjects: number;
  fundingAgencyCount: number;
  facultyCount: number;
}

export interface ProjectsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'ONGOING' | 'COMPLETED' | '';
  sort?: 'newest' | 'oldest';
}

export const researchProjectsApi = {
  getProjects: (params?: ProjectsQueryParams): Promise<ProjectsResponse> => {
    const qs = params
      ? new URLSearchParams(
          Object.fromEntries(
            Object.entries(params)
              .filter(([, v]) => v !== undefined && v !== '')
              .map(([k, v]) => [k, String(v)])
          )
        ).toString()
      : '';
    return http.get(`projects${qs ? '?' + qs : ''}`) as unknown as Promise<ProjectsResponse>;
  },

  getProjectById: (id: number): Promise<{ success: boolean; data: ResearchProject }> =>
    http.get(`projects/${id}`) as unknown as Promise<{ success: boolean; data: ResearchProject }>,

  getDashboardStats: (): Promise<DashboardStats> =>
    http.get('dashboard/stats') as unknown as Promise<DashboardStats>,
};
