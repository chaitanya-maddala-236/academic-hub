import { useState, useEffect, useCallback } from 'react';
import { researchProjectsApi, ResearchProject, ProjectsQueryParams } from '../services/researchApi';

interface UseProjectsResult {
  projects: ResearchProject[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  setPage: (page: number) => void;
  setParams: (params: Partial<ProjectsQueryParams>) => void;
  params: ProjectsQueryParams;
}

export const useProjects = (initialParams?: ProjectsQueryParams): UseProjectsResult => {
  const [params, setParamsState] = useState<ProjectsQueryParams>({
    page: 1,
    limit: 12,
    search: '',
    status: '',
    sort: 'newest',
    ...initialParams,
  });

  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await researchProjectsApi.getProjects(params);
      setProjects(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const setPage = useCallback((page: number) => {
    setParamsState((prev) => ({ ...prev, page }));
  }, []);

  const setParams = useCallback((newParams: Partial<ProjectsQueryParams>) => {
    setParamsState((prev) => ({ ...prev, ...newParams, page: 1 }));
  }, []);

  return { projects, total, page: params.page ?? 1, totalPages, loading, error, setPage, setParams, params };
};
