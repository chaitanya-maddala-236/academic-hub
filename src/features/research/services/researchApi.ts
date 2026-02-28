import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const http = axios.create({ baseURL: API_BASE_URL });

http.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(new Error(err.response?.data?.message || err.message || 'Network error'))
);

// ── Types shared across the feature ─────────────────────────────────────────

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

export interface ResearchItem {
  recordType: 'publication' | 'project';
  id: string | number;
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

export interface ResearchStats {
  totalPublications: number;
  indexedPublications: number;
  totalProjects: number;
  activeProjects: number;
  departments: number;
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

// ── Unified Research API (v1) ────────────────────────────────────────────────

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

export const unifiedResearchApi = {
  /** GET /api/v1/research — combined publications + projects */
  getResearch: (params?: ResearchListParams): Promise<{ success: boolean; data: ResearchItem[]; meta: { page: number; limit: number; total: number } }> => {
    const qs = params
      ? new URLSearchParams(
          Object.fromEntries(
            Object.entries(params)
              .filter(([, v]) => v !== undefined && v !== '')
              .map(([k, v]) => [k, String(v)])
          )
        ).toString()
      : '';
    return http.get(`v1/research${qs ? '?' + qs : ''}`) as unknown as ReturnType<typeof unifiedResearchApi.getResearch>;
  },

  /** GET /api/v1/research/stats */
  getResearchStats: (): Promise<{ success: boolean; data: ResearchStats }> =>
    http.get('v1/research/stats') as unknown as Promise<{ success: boolean; data: ResearchStats }>,
};

// ── Projects CRUD API ────────────────────────────────────────────────────────

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

