import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import DepartmentFilter from '../components/DepartmentFilter';
import ProjectCard from '../components/ProjectCard';
import ProjectDetailModal from '../components/ProjectDetailModal';
import { useProjects } from '../hooks/useProjects';
import { ResearchProject } from '../services/researchApi';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'ONGOING', label: 'Ongoing' },
  { value: 'COMPLETED', label: 'Completed' },
];

export default function ResearchPage() {
  const [selectedDept, setSelectedDept] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ONGOING' | 'COMPLETED' | ''>('');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [selectedProject, setSelectedProject] = useState<ResearchProject | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { projects, total, page, totalPages, loading, error, setPage, setParams } = useProjects({
    limit: 12,
    sort: 'newest',
  });

  // Apply client-side department filter (not sent to server since schema has general dept field)
  const filteredProjects = useMemo(() => {
    if (!selectedDept) return projects;
    return projects.filter((p) => p.department === selectedDept);
  }, [projects, selectedDept]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setParams({ search: value, status: statusFilter, sort });
  };

  const handleStatus = (value: string) => {
    const s = value as 'ONGOING' | 'COMPLETED' | '';
    setStatusFilter(s);
    setParams({ search, status: s, sort });
  };

  const handleSort = (value: string) => {
    const s = value as 'newest' | 'oldest';
    setSort(s);
    setParams({ search, status: statusFilter, sort: s });
  };

  const handleDeptChange = (dept: string) => {
    setSelectedDept(dept);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Hero Header */}
      <div
        className="rounded-2xl px-6 py-8"
        style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 60%, #3b82f6 100%)' }}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Research</h1>
        <div className="w-14 h-1 bg-white/50 mt-2 rounded-full" />
        <p className="text-blue-100 mt-2 text-sm">
          Explore funded research projects across all departments
        </p>
      </div>

      {/* Department Filter */}
      <DepartmentFilter active={selectedDept} onChange={handleDeptChange} />

      {/* Search + Filters Bar */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-52">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title, PI, agency..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Filter Dropdowns */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            key="filters"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex gap-3 flex-wrap pt-1">
              <select
                value={statusFilter}
                onChange={(e) => handleStatus(e.target.value)}
                className="text-sm border rounded-md px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <select
                value={sort}
                onChange={(e) => handleSort(e.target.value)}
                className="text-sm border rounded-md px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results summary */}
      <p className="text-sm text-gray-500">
        Showing <strong>{filteredProjects.length}</strong> of <strong>{total}</strong> project{total !== 1 ? 's' : ''}
        {selectedDept ? ` in ${selectedDept}` : ''}
      </p>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="text-center py-16 text-red-500">
          <p>{error}</p>
        </div>
      )}

      {/* Project Cards Grid */}
      {!loading && !error && (
        <>
          {filteredProjects.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg font-medium">No projects found</p>
              <p className="text-sm mt-1">Try adjusting your filters or search term</p>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onClick={setSelectedProject}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

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
              {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                const half = Math.floor(Math.min(7, totalPages) / 2);
                let start = Math.max(1, page - half);
                const end = Math.min(totalPages, start + Math.min(7, totalPages) - 1);
                if (end - start < Math.min(7, totalPages) - 1) start = Math.max(1, end - Math.min(7, totalPages) + 1);
                return start + i;
              }).map((p) => (
                <Button
                  key={p}
                  variant={page === p ? 'default' : 'outline'}
                  size="icon"
                  className="h-8 w-8 text-xs"
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              ))}
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

      {/* Project Detail Modal */}
      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </motion.div>
  );
}
