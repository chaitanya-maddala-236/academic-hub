import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  FolderKanban,
  Activity,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatsCard from '../components/StatsCard';
import ResearchTabs from '../components/ResearchTabs';
import SearchBar from '../components/SearchBar';
import ResearchCard from '../components/ResearchCard';
import DepartmentFilter from '../components/DepartmentFilter';
import ProjectDetailModal from '../components/ProjectDetailModal';
import { useResearch } from '../hooks/useResearch';
import { ResearchItem, ResearchProject } from '../services/researchApi';

const MAX_VISIBLE_PAGES = 7;

function PaginationButtons({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  const visible = Math.min(MAX_VISIBLE_PAGES, totalPages);
  const half = Math.floor(visible / 2);
  let start = Math.max(1, page - half);
  const end = Math.min(totalPages, start + visible - 1);
  if (end - start < visible - 1) start = Math.max(1, end - visible + 1);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <>
      {pages.map((p) => (
        <Button
          key={p}
          variant={page === p ? 'default' : 'outline'}
          size="icon"
          className="h-8 w-8 text-xs"
          onClick={() => onPage(p)}
        >
          {p}
        </Button>
      ))}
    </>
  );
}

/** Convert a ResearchItem (project) to the shape ProjectDetailModal expects */
function toResearchProject(item: ResearchItem): ResearchProject {
  return {
    id: item.id,
    title: item.title,
    principal_investigator: item.pi ?? null,
    co_investigators: item.coPi ?? null,
    department: item.department ?? null,
    funding_agency: item.agency ?? null,
    sanction_date: null,
    amount_lakhs: item.amount ?? null,
    duration: null,
    status: (item.status?.toUpperCase() as 'ONGOING' | 'COMPLETED') ?? 'ONGOING',
    created_at: item.createdAt ?? '',
  };
}

export default function ResearchDashboard() {
  const {
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
    setPage,
    totalPages,
    tabCounts,
  } = useResearch();

  const [showFilters, setShowFilters] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ResearchProject | null>(null);

  const handleProjectClick = (item: ResearchItem) => {
    setSelectedProject(toResearchProject(item));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* ── 1. Hero Header ─────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl px-6 py-8"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%)',
          boxShadow: '0 8px 32px rgba(37,99,235,0.25)',
        }}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight uppercase">
          Research
        </h1>
        <div className="w-14 h-1 bg-white/50 mt-2 rounded-full" />
        <p className="text-blue-100 mt-2 text-sm">
          Unified view of Research Publications &amp; Projects
        </p>
      </div>

      {/* ── 2. Stats Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatsCard
          label="Total Publications"
          value={statsLoading ? '—' : (stats?.totalPublications ?? '—')}
          icon={BookOpen}
          iconBg="#DBEAFE"
          iconColor="#2563EB"
        />
        <StatsCard
          label="Total Projects"
          value={statsLoading ? '—' : (stats?.totalProjects ?? '—')}
          icon={FolderKanban}
          iconBg="#DCFCE7"
          iconColor="#16A34A"
        />
        <StatsCard
          label="Active Projects"
          value={statsLoading ? '—' : (stats?.activeProjects ?? '—')}
          icon={Activity}
          iconBg="#FEF3C7"
          iconColor="#F59E0B"
        />
        <StatsCard
          label="Indexed Papers"
          value={statsLoading ? '—' : (stats?.indexedPublications ?? '—')}
          icon={BookOpen}
          iconBg="#EDE9FE"
          iconColor="#7C3AED"
        />
        <StatsCard
          label="Departments"
          value={statsLoading ? '—' : (stats?.departments ?? '—')}
          icon={LayoutGrid}
          iconBg="#CFFAFE"
          iconColor="#0891B2"
        />
      </div>

      {/* ── 3. Tabs ────────────────────────────────────────────────────────── */}
      <ResearchTabs
        activeTab={activeTab}
        onChange={setActiveTab}
        counts={tabCounts}
      />

      {/* ── Department filter ──────────────────────────────────────────────── */}
      <DepartmentFilter active={department} onChange={setDepartment} />

      {/* ── 4. Search & Filter ────────────────────────────────────────────── */}
      <SearchBar
        value={search}
        onChange={setSearch}
        onFiltersToggle={() => setShowFilters((v) => !v)}
        showFilters={showFilters}
      />

      {/* Results summary */}
      <p className="text-sm text-gray-500">
        Showing <strong>{filteredItems.length}</strong> result
        {filteredItems.length !== 1 ? 's' : ''}
        {department ? ` in ${department}` : ''}
      </p>

      {/* ── 5. Results ────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : error ? (
        <div className="text-center py-16 text-red-500">
          <p>{error}</p>
        </div>
      ) : paginated.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <LayoutGrid size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">No results found</p>
          <p className="text-sm mt-1">Try adjusting your filters or search term</p>
        </div>
      ) : (
        <>
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            <AnimatePresence mode="popLayout">
              {paginated.map((item) => (
                <ResearchCard
                  key={`${item.recordType}-${item.id}`}
                  item={item}
                  onProjectClick={handleProjectClick}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <PaginationButtons page={page} totalPages={totalPages} onPage={setPage} />
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Project detail modal */}
      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </motion.div>
  );
}
