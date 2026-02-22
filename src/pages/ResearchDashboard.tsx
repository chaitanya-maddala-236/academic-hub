import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { researchApi, ResearchItem } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  FolderKanban,
  Activity,
  LayoutGrid,
  Search,
  SlidersHorizontal,
  Eye,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type ActiveTab = "all" | "publication" | "project";

const ITEMS_PER_PAGE = 12;

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div
      className="flex items-center gap-4 rounded-xl p-5"
      style={{
        backgroundColor: "#FFFFFF",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        border: "1px solid #E5E7EB",
      }}
    >
      <div
        className="flex items-center justify-center rounded-xl shrink-0"
        style={{ width: 48, height: 48, backgroundColor: iconBg }}
      >
        <Icon size={22} style={{ color: iconColor }} />
      </div>
      <div>
        <p className="text-2xl font-bold leading-tight" style={{ color: "#111827" }}>
          {value}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
          {label}
        </p>
      </div>
    </div>
  );
}

// ─── Publication Card ────────────────────────────────────────────────────────
function PublicationCard({ item }: { item: ResearchItem }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                style={{ backgroundColor: "#DBEAFE", color: "#2563EB" }}
              >
                Publication
              </span>
              {item.year && (
                <span className="text-xs" style={{ color: "#6B7280" }}>
                  {item.year}
                </span>
              )}
            </div>
            <p className="font-semibold text-sm leading-snug" style={{ color: "#111827" }}>
              {item.title}
            </p>
          </div>
          <Button asChild size="sm" variant="default" className="shrink-0 gap-1 text-xs">
            <Link to={`/research/publication/${item.id}`}>
              <Eye className="h-3 w-3" /> View Details
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 mt-3 text-sm">
          {item.facultyName && (
            <div>
              <p className="text-xs" style={{ color: "#9CA3AF" }}>Faculty</p>
              <p className="font-medium text-xs">{item.facultyName}</p>
            </div>
          )}
          {item.authors && (
            <div>
              <p className="text-xs" style={{ color: "#9CA3AF" }}>Authors</p>
              <p className="font-medium text-xs truncate">{item.authors}</p>
            </div>
          )}
          {item.journal && (
            <div>
              <p className="text-xs" style={{ color: "#9CA3AF" }}>Journal</p>
              <p className="font-medium text-xs truncate">{item.journal}</p>
            </div>
          )}
          {item.department && (
            <div>
              <p className="text-xs" style={{ color: "#9CA3AF" }}>Department</p>
              <p className="font-medium text-xs">{item.department}</p>
            </div>
          )}
        </div>

        <div className="flex items-center flex-wrap gap-2 mt-3">
          {item.indexing?.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {item.doi && (
            <a
              href={`https://doi.org/${item.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs ml-auto"
              style={{ color: "#2563EB" }}
            >
              <ExternalLink className="h-3 w-3" /> DOI
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Project Card ────────────────────────────────────────────────────────────
const statusStyle: Record<string, { bg: string; text: string }> = {
  ongoing: { bg: "#DCFCE7", text: "#16A34A" },
  completed: { bg: "#F3F4F6", text: "#6B7280" },
  upcoming: { bg: "#FEF3C7", text: "#F59E0B" },
};

function ProjectCard({ item }: { item: ResearchItem }) {
  const st = statusStyle[item.status ?? ""] ?? { bg: "#F3F4F6", text: "#6B7280" };
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                style={{ backgroundColor: "#DCFCE7", color: "#16A34A" }}
              >
                Project
              </span>
              {item.status && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                  style={{ backgroundColor: st.bg, color: st.text }}
                >
                  {item.status}
                </span>
              )}
            </div>
            <p className="font-semibold text-sm leading-snug" style={{ color: "#111827" }}>
              {item.title}
            </p>
          </div>
          <Button asChild size="sm" variant="default" className="shrink-0 gap-1 text-xs">
            <Link to={`/research/project/${item.id}`}>
              <Eye className="h-3 w-3" /> View Details
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 mt-3 text-sm">
          {item.agency && (
            <div>
              <p className="text-xs" style={{ color: "#9CA3AF" }}>Agency</p>
              <p className="font-medium text-xs">{item.agency}</p>
            </div>
          )}
          {item.pi && (
            <div>
              <p className="text-xs" style={{ color: "#9CA3AF" }}>PI</p>
              <p className="font-medium text-xs">{item.pi}</p>
            </div>
          )}
          {item.amount != null && (
            <div>
              <p className="text-xs" style={{ color: "#9CA3AF" }}>Amount</p>
              <p className="font-medium text-xs">₹{item.amount.toLocaleString()}</p>
            </div>
          )}
          {item.department && (
            <div>
              <p className="text-xs" style={{ color: "#9CA3AF" }}>Department</p>
              <p className="font-medium text-xs">{item.department}</p>
            </div>
          )}
          {(item.startDate || item.endDate) && (
            <div>
              <p className="text-xs" style={{ color: "#9CA3AF" }}>Duration</p>
              <p className="font-medium text-xs">
                {item.startDate ? new Date(item.startDate).getFullYear() : "?"}–
                {item.endDate ? new Date(item.endDate).getFullYear() : "?"}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Filter Panel ────────────────────────────────────────────────────────────
function FilterPanel({
  items,
  department,
  setDepartment,
  yearFilter,
  setYearFilter,
  statusFilter,
  setStatusFilter,
  indexingFilter,
  setIndexingFilter,
  onClear,
  onClose,
}: {
  items: ResearchItem[];
  department: string;
  setDepartment: (v: string) => void;
  yearFilter: string;
  setYearFilter: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  indexingFilter: string;
  setIndexingFilter: (v: string) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const departments = useMemo(() => {
    const s = new Set<string>();
    items.forEach((i) => { if (i.department) s.add(i.department); });
    return [...s].sort();
  }, [items]);

  const years = useMemo(() => {
    const s = new Set<number>();
    items.forEach((i) => { if (i.year) s.add(i.year); });
    return [...s].sort((a, b) => b - a);
  }, [items]);

  const indexingOptions = useMemo(() => {
    const s = new Set<string>();
    items.forEach((i) => i.indexing?.forEach((x) => s.add(x)));
    return [...s].sort();
  }, [items]);

  return (
    <Card className="sticky top-6 w-64 shrink-0">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Filters</h3>
          <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>

        <FilterSection title="Department">
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full text-sm border rounded-md px-2 py-1.5 outline-none bg-white"
          >
            <option value="">All Departments</option>
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </FilterSection>

        <FilterSection title="Year">
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="w-full text-sm border rounded-md px-2 py-1.5 outline-none bg-white"
          >
            <option value="">All Years</option>
            {years.map((y) => <option key={y} value={String(y)}>{y}</option>)}
          </select>
        </FilterSection>

        <FilterSection title="Project Status">
          {["ongoing", "completed", "upcoming"].map((s) => (
            <label key={s} className="flex items-center gap-2 text-sm capitalize cursor-pointer">
              <input
                type="radio"
                name="status"
                value={s}
                checked={statusFilter === s}
                onChange={() => setStatusFilter(statusFilter === s ? "" : s)}
              />
              {s}
            </label>
          ))}
        </FilterSection>

        {indexingOptions.length > 0 && (
          <FilterSection title="Indexing">
            <select
              value={indexingFilter}
              onChange={(e) => setIndexingFilter(e.target.value)}
              className="w-full text-sm border rounded-md px-2 py-1.5 outline-none bg-white"
            >
              <option value="">All</option>
              {indexingOptions.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </FilterSection>
        )}

        <button className="text-xs text-primary hover:underline w-full text-left" onClick={onClear}>
          Clear Filters
        </button>
      </CardContent>
    </Card>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">{title}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  if (totalPages <= 1) return null;
  // Show up to 7 pages in a sliding window around current page
  const windowSize = 7;
  const half = Math.floor(windowSize / 2);
  let start = Math.max(1, page - half);
  let end = Math.min(totalPages, start + windowSize - 1);
  if (end - start < windowSize - 1) start = Math.max(1, end - windowSize + 1);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <div className="flex items-center justify-center gap-1 py-4">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {start > 1 && <span className="px-2 text-muted-foreground">…</span>}
      {pages.map((p) => (
        <Button
          key={p}
          variant={page === p ? "default" : "outline"}
          size="icon"
          className="h-8 w-8 text-xs"
          onClick={() => onPage(p)}
        >
          {p}
        </Button>
      ))}
      {end < totalPages && <span className="px-2 text-muted-foreground">…</span>}
      <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ResearchDashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("all");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [indexingFilter, setIndexingFilter] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const { data: statsResp } = useQuery({
    queryKey: ["research-stats"],
    queryFn: () => researchApi.getResearchStats(),
  });

  const stats = statsResp?.data;

  // Fetch all items for client-side filtering (limit=1000)
  const { data: researchResp, isLoading } = useQuery({
    queryKey: ["research-all"],
    queryFn: () => researchApi.getResearch({ limit: 1000 }),
  });

  const allItems = researchResp?.data ?? [];

  const filtered = useMemo(() => {
    let items = [...allItems];
    if (activeTab !== "all") items = items.filter((i) => i.recordType === activeTab);
    if (search) {
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
    if (department) items = items.filter((i) => i.department === department);
    if (yearFilter) items = items.filter((i) => String(i.year) === yearFilter);
    if (statusFilter) items = items.filter((i) => i.status === statusFilter);
    if (indexingFilter) items = items.filter((i) => i.indexing?.includes(indexingFilter));
    return items;
  }, [allItems, activeTab, search, department, yearFilter, statusFilter, indexingFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const clearFilters = () => {
    setDepartment("");
    setYearFilter("");
    setStatusFilter("");
    setIndexingFilter("");
    setPage(1);
  };

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const tabs: { key: ActiveTab; label: string; icon: React.ElementType; count?: number }[] = [
    { key: "all", label: "All Research", icon: LayoutGrid, count: allItems.length },
    { key: "publication", label: "Publications", icon: BookOpen, count: allItems.filter((i) => i.recordType === "publication").length },
    { key: "project", label: "Projects", icon: FolderKanban, count: allItems.filter((i) => i.recordType === "project").length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-primary rounded-xl px-6 py-6 text-primary-foreground">
        <h1 className="text-2xl md:text-3xl font-bold tracking-wide uppercase">Research</h1>
        <div className="w-12 h-1 bg-primary-foreground/60 mt-2 rounded" />
        <p className="text-primary-foreground/80 mt-2 text-sm">
          Unified view of Research Publications &amp; Projects
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Publications"
          value={stats?.totalPublications ?? "—"}
          icon={BookOpen}
          iconBg="#DBEAFE"
          iconColor="#2563EB"
        />
        <StatCard
          label="Total Projects"
          value={stats?.totalProjects ?? "—"}
          icon={FolderKanban}
          iconBg="#DCFCE7"
          iconColor="#16A34A"
        />
        <StatCard
          label="Active Projects"
          value={stats?.activeProjects ?? "—"}
          icon={Activity}
          iconBg="#FEF3C7"
          iconColor="#F59E0B"
        />
        <StatCard
          label="Indexed Papers"
          value={stats?.indexedPublications ?? "—"}
          icon={BookOpen}
          iconBg="#EDE9FE"
          iconColor="#7C3AED"
        />
        <StatCard
          label="Departments"
          value={stats?.departments ?? "—"}
          icon={LayoutGrid}
          iconBg="#CFFAFE"
          iconColor="#0891B2"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor: "#E5E7EB" }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
            style={{
              backgroundColor: activeTab === tab.key ? "#2563EB" : "transparent",
              color: activeTab === tab.key ? "#FFFFFF" : "#374151",
            }}
          >
            <tab.icon size={15} />
            {tab.label}
            {tab.count !== undefined && (
              <span
                className="text-xs px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: activeTab === tab.key ? "rgba(255,255,255,0.25)" : "#D1D5DB",
                  color: activeTab === tab.key ? "#FFFFFF" : "#374151",
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search + Filter toggle */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-52">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title, faculty, journal, agency..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Button variant="outline" className="gap-2" onClick={() => setShowFilters(!showFilters)}>
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Summary */}
      <p className="text-sm" style={{ color: "#6B7280" }}>
        Showing <strong>{filtered.length}</strong> result{filtered.length !== 1 ? "s" : ""}
        {activeTab !== "all" ? ` (${activeTab}s)` : ""}
      </p>

      {/* Content + Filter Panel */}
      <div className="flex gap-6 items-start">
        {/* Cards */}
        <div className="flex-1 min-w-0">
          {isLoading && (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 rounded-xl animate-pulse" style={{ backgroundColor: "#E5E7EB" }} />
              ))}
            </div>
          )}
          {!isLoading && paginated.length === 0 && (
            <div className="text-center py-16">
              <LayoutGrid size={40} className="mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">No results found. Try adjusting your filters.</p>
            </div>
          )}
          {!isLoading && paginated.length > 0 && (
            <div className="space-y-4">
              {paginated.map((item) =>
                item.recordType === "publication" ? (
                  <PublicationCard key={`pub-${item.id}`} item={item} />
                ) : (
                  <ProjectCard key={`proj-${item.id}`} item={item} />
                )
              )}
              <Pagination page={page} totalPages={totalPages} onPage={(p) => setPage(p)} />
            </div>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="hidden md:block">
            <FilterPanel
              items={allItems}
              department={department}
              setDepartment={(v) => { setDepartment(v); setPage(1); }}
              yearFilter={yearFilter}
              setYearFilter={(v) => { setYearFilter(v); setPage(1); }}
              statusFilter={statusFilter}
              setStatusFilter={(v) => { setStatusFilter(v); setPage(1); }}
              indexingFilter={indexingFilter}
              setIndexingFilter={(v) => { setIndexingFilter(v); setPage(1); }}
              onClear={clearFilters}
              onClose={() => setShowFilters(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
