import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { projectsApi } from "@/services/api";
import {
  DollarSign,
  FolderKanban,
  Building2,
  Users,
  Search,
  SlidersHorizontal,
  Plus,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface StatCard {
  value: string;
  label: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

// ─── Static data ─────────────────────────────────────────────────────────────

const TABS = [
  { label: "Project Access", href: "/research-dashboard", active: true },
  { label: "Publications", href: "/publications", active: false },
  { label: "Patents", href: "/patents", active: false },
  { label: "IP Assets", href: "/ip-assets", active: false },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function TabBar() {
  return (
    <div
      className="flex gap-1 p-1 rounded-xl"
      style={{ backgroundColor: "#E5E7EB" }}
    >
      {TABS.map((tab) =>
        tab.active ? (
          <span
            key={tab.label}
            className="px-5 py-2 rounded-lg text-sm font-semibold cursor-default"
            style={{ backgroundColor: "#2563EB", color: "#FFFFFF" }}
          >
            {tab.label}
          </span>
        ) : (
          <Link
            key={tab.label}
            to={tab.href}
            className="px-5 py-2 rounded-lg text-sm font-medium no-underline transition-colors"
            style={{ color: "#374151" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "#FFFFFF";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
            }}
          >
            {tab.label}
          </Link>
        )
      )}
    </div>
  );
}

function SearchFilterBar() {
  const [search, setSearch] = useState("");
  const [filterVal, setFilterVal] = useState("0-140");
  const [sort, setSort] = useState("newest");

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-52">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: "#9CA3AF" }}
        />
        <input
          type="text"
          placeholder="Search Projects"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none border"
          style={{
            border: "1px solid #E5E7EB",
            backgroundColor: "#FFFFFF",
            color: "#111827",
          }}
        />
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-white">
        <SlidersHorizontal size={14} style={{ color: "#6B7280" }} />
        <select
          value={filterVal}
          onChange={(e) => setFilterVal(e.target.value)}
          className="text-sm outline-none bg-transparent"
          style={{ color: "#374151" }}
        >
          <option value="0-140">Filter (0-140)</option>
          <option value="0-50">0-50</option>
          <option value="50-100">50-100</option>
          <option value="100-140">100-140</option>
        </select>
      </div>

      {/* Sort */}
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        className="px-3 py-2 rounded-lg text-sm border bg-white outline-none"
        style={{ border: "1px solid #E5E7EB", color: "#374151" }}
      >
        <option value="newest">Sort: Newest</option>
        <option value="oldest">Sort: Oldest</option>
        <option value="funding">Sort: Funding</option>
      </select>

      {/* Add New Project */}
      <Link
        to="/projects/add"
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white no-underline"
        style={{ backgroundColor: "#2563EB" }}
      >
        <Plus size={15} />
        Add New Project
      </Link>
    </div>
  );
}

function StatCards({ stats }: { stats?: { total: number; totalFunding: number; uniqueAgencies: number; uniqueFaculty: number } }) {
  const cards: StatCard[] = [
    {
      value: stats ? `₹${(stats.totalFunding / 1e7).toFixed(0)}Cr+` : "—",
      label: "Total Funding",
      icon: DollarSign,
      iconBg: "#DBEAFE",
      iconColor: "#2563EB",
    },
    {
      value: stats ? String(stats.total) : "—",
      label: "Projects",
      icon: FolderKanban,
      iconBg: "#DCFCE7",
      iconColor: "#16A34A",
    },
    {
      value: stats ? String(stats.uniqueAgencies) : "—",
      label: "Funding Agencies",
      icon: Building2,
      iconBg: "#FEF3C7",
      iconColor: "#D97706",
    },
    {
      value: stats ? String(stats.uniqueFaculty) : "—",
      label: "Faculty PIs",
      icon: Users,
      iconBg: "#EDE9FE",
      iconColor: "#7C3AED",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex items-center gap-4 rounded-xl p-5"
          style={{
            backgroundColor: "#FFFFFF",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            border: "1px solid #E5E7EB",
          }}
        >
          <div
            className="flex items-center justify-center rounded-xl shrink-0"
            style={{
              width: 48,
              height: 48,
              backgroundColor: card.iconBg,
            }}
          >
            <card.icon size={22} style={{ color: card.iconColor }} />
          </div>
          <div>
            <p
              className="text-2xl font-bold leading-tight"
              style={{ color: "#111827" }}
            >
              {card.value}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
              {card.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function FundingDurationCard({ stats }: { stats?: { totalFunding: number; projectsByYear: { year: number; count: number }[] } }) {
  const fundingFormatted = stats
    ? `₹${stats.totalFunding.toLocaleString()}`
    : "—";
  const sortedYears = [...(stats?.projectsByYear ?? [])].sort((a, b) => a.year - b.year);
  const minYear = sortedYears.length ? sortedYears[0].year : undefined;
  const maxYear = sortedYears.length ? sortedYears[sortedYears.length - 1].year : undefined;
  const yearRange = minYear && maxYear ? `${minYear}–${maxYear}` : "—";

  const fundingDetails = [
    { label: "Total Funding", value: fundingFormatted },
    { label: "Year Range", value: yearRange },
  ];

  return (
    <div
      className="rounded-xl p-6"
      style={{
        backgroundColor: "#FFFFFF",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        border: "1px solid #E5E7EB",
      }}
    >
      <h3 className="font-semibold mb-5" style={{ color: "#111827" }}>
        Funding &amp; Duration
      </h3>
      <div className="space-y-3">
        {fundingDetails.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between text-sm">
            <span style={{ color: "#6B7280" }}>{label}</span>
            <span className="font-medium" style={{ color: "#111827" }}>
              {value}
            </span>
          </div>
        ))}
        {sortedYears.slice(-5).map(({ year, count }) => (
          <div key={year} className="flex items-center justify-between text-sm">
            <span style={{ color: "#6B7280" }}>{year}</span>
            <span className="font-medium" style={{ color: "#111827" }}>{count} project{count !== 1 ? "s" : ""}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Static SVG donut chart
function DonutChart({
  active,
  completed,
}: {
  active: number;
  completed: number;
}) {
  const total = active + completed;
  const r = 60;
  const cx = 80;
  const cy = 80;
  const circumference = 2 * Math.PI * r;
  const activeDash = (active / total) * circumference;
  const completedDash = (completed / total) * circumference;
  // active segment starts at top (-π/2)
  const activeOffset = 0;
  const completedOffset = -activeDash;

  return (
    <svg width={160} height={160} viewBox="0 0 160 160">
      {/* Background circle */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#E5E7EB"
        strokeWidth={20}
      />
      {/* Completed segment (blue) */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#2563EB"
        strokeWidth={20}
        strokeDasharray={`${completedDash} ${circumference}`}
        strokeDashoffset={completedOffset}
        strokeLinecap="butt"
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      {/* Active segment (green) */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#16A34A"
        strokeWidth={20}
        strokeDasharray={`${activeDash} ${circumference}`}
        strokeDashoffset={activeOffset}
        strokeLinecap="butt"
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      {/* Center text */}
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        fontSize={22}
        fontWeight="700"
        fill="#111827"
      >
        {total}
      </text>
      <text
        x={cx}
        y={cy + 14}
        textAnchor="middle"
        fontSize={11}
        fill="#6B7280"
      >
        Total
      </text>
    </svg>
  );
}

function ProjectStatusCard({ stats }: { stats?: { ongoing: number; completed: number } }) {
  const active = stats?.ongoing ?? 0;
  const completed = stats?.completed ?? 0;

  return (
    <div
      className="rounded-xl p-6"
      style={{
        backgroundColor: "#FFFFFF",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        border: "1px solid #E5E7EB",
      }}
    >
      <h3 className="font-semibold mb-5" style={{ color: "#111827" }}>
        Project Status
      </h3>
      <div className="flex items-center justify-around gap-6">
        <DonutChart active={active} completed={completed} />
        <div className="space-y-4">
          {/* Active */}
          <div className="flex items-center gap-3">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: "#16A34A" }}
            />
            <div>
              <p className="text-lg font-bold leading-tight" style={{ color: "#111827" }}>
                {active}
              </p>
              <p className="text-xs" style={{ color: "#6B7280" }}>
                Active
              </p>
            </div>
          </div>
          {/* Completed */}
          <div className="flex items-center gap-3">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: "#2563EB" }}
            />
            <div>
              <p className="text-lg font-bold leading-tight" style={{ color: "#111827" }}>
                {completed}
              </p>
              <p className="text-xs" style={{ color: "#6B7280" }}>
                Completed
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaginationBar({ total }: { total?: number }) {
  const [page, setPage] = useState(1);
  const pageSize = 9;
  const totalProjects = total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalProjects / pageSize));

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalProjects);

  return (
    <div
      className="flex items-center justify-between flex-wrap gap-3 rounded-xl px-5 py-3"
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E5E7EB",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      <span className="text-sm" style={{ color: "#6B7280" }}>
        {start}–{end} &nbsp;·&nbsp; {totalProjects} Projects
      </span>

      <div className="flex items-center gap-1">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="p-2 rounded-lg border disabled:opacity-40"
          style={{ border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF" }}
          aria-label="Previous page"
        >
          <ChevronLeft size={15} />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className="w-8 h-8 rounded-lg text-sm font-medium"
            style={{
              backgroundColor: page === p ? "#2563EB" : "#FFFFFF",
              color: page === p ? "#FFFFFF" : "#374151",
              border: "1px solid #E5E7EB",
            }}
          >
            {p}
          </button>
        ))}

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="p-2 rounded-lg border disabled:opacity-40"
          style={{ border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF" }}
          aria-label="Next page"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ResearchProjectsDashboard() {
  const { data: statsResp } = useQuery({
    queryKey: ["project-stats"],
    queryFn: () => projectsApi.getProjectStats(),
  });

  const stats = statsResp?.data;

  return (
    <div
      className="min-h-screen space-y-6 p-6"
      style={{ backgroundColor: "#F5F6FA" }}
    >
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#111827" }}>
          Research Projects
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>
          Manage and track all funded research projects
        </p>
      </div>

      {/* Tabs */}
      <TabBar />

      {/* Search & Filter */}
      <SearchFilterBar />

      {/* Stat Cards */}
      <StatCards stats={stats} />

      {/* Details Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FundingDurationCard stats={stats} />
        <ProjectStatusCard stats={stats} />
      </div>

      {/* Pagination */}
      <PaginationBar total={stats?.total} />
    </div>
  );
}
