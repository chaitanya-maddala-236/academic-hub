import { useState, useEffect, useMemo } from 'react';
import { unifiedResearchApi, ResearchItem, ResearchStats } from '../services/researchApi';

export type ActiveTab = 'all' | 'ongoing' | 'completed';

const ITEMS_PER_PAGE = 12;

interface UseResearchResult {
  allItems: ResearchItem[];
  filteredItems: ResearchItem[];
  paginated: ResearchItem[];
  stats: ResearchStats | null;
  loading: boolean;
  statsLoading: boolean;
  error: string | null;
  search: string;
  setSearch: (s: string) => void;
  activeTab: ActiveTab;
  setActiveTab: (t: ActiveTab) => void;
  department: string;
  setDepartment: (d: string) => void;
  page: number;
  setPage: (p: number) => void;
  totalPages: number;
  tabCounts: { all: number; ongoing: number; completed: number };
}

export function useResearch(): UseResearchResult {
  const [allItems, setAllItems] = useState<ResearchItem[]>([]);
  const [stats, setStats] = useState<ResearchStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearchState] = useState('');
  const [activeTab, setActiveTabState] = useState<ActiveTab>('all');
  const [department, setDepartmentState] = useState('');
  const [page, setPageState] = useState(1);

  // Fetch all items once (limit=1000 for client-side filtering)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    unifiedResearchApi
      .getResearch({ limit: 1000 })
      .then((res) => {
        if (!cancelled) setAllItems(res.data ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load data');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Fetch stats
  useEffect(() => {
    let cancelled = false;
    setStatsLoading(true);
    unifiedResearchApi
      .getResearchStats()
      .then((res) => {
        if (!cancelled) setStats(res.data);
      })
      .catch(() => {/* stats failure is non-critical */})
      .finally(() => {
        if (!cancelled) setStatsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Compute tab counts from all items
  const tabCounts = useMemo(() => ({
    all: allItems.length,
    ongoing: allItems.filter((i) => i.status?.toLowerCase() === 'ongoing').length,
    completed: allItems.filter((i) => i.status?.toLowerCase() === 'completed').length,
  }), [allItems]);

  // Apply filters client-side
  const filteredItems = useMemo(() => {
    let items = [...allItems];

    if (activeTab === 'ongoing') {
      items = items.filter((i) => i.status?.toLowerCase() === 'ongoing');
    } else if (activeTab === 'completed') {
      items = items.filter((i) => i.status?.toLowerCase() === 'completed');
    }

    if (department) {
      items = items.filter((i) => i.department === department);
    }

    if (search.trim()) {
      const s = search.toLowerCase();
      items = items.filter(
        (i) =>
          i.title?.toLowerCase().includes(s) ||
          i.facultyName?.toLowerCase().includes(s) ||
          i.authors?.toLowerCase().includes(s) ||
          i.journal?.toLowerCase().includes(s) ||
          i.pi?.toLowerCase().includes(s) ||
          i.agency?.toLowerCase().includes(s)
      );
    }

    return items;
  }, [allItems, activeTab, department, search]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));

  const paginated = useMemo(
    () => filteredItems.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE),
    [filteredItems, page]
  );

  const setSearch = (s: string) => { setSearchState(s); setPageState(1); };
  const setActiveTab = (t: ActiveTab) => { setActiveTabState(t); setPageState(1); };
  const setDepartment = (d: string) => { setDepartmentState(d); setPageState(1); };

  return {
    allItems,
    filteredItems,
    paginated,
    stats,
    loading,
    statsLoading,
    error,
    search,
    setSearch,
    activeTab,
    setActiveTab,
    department,
    setDepartment,
    page,
    setPage: setPageState,
    totalPages,
    tabCounts,
  };
}
